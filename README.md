# Nexa Star — Referral Dashboard + API Plans (MERN + Tailwind)

A legitimate affiliate/referral platform: users get a referral link and earn a
commission when people they refer buy a subscription plan. Each plan grants a
daily quota of **real product API requests** (via `x-api-key`), enforced
server-side. Plan purchases are paid through **ZiniPay** (bKash / Nagad /
Rocket / Upay).

## Stack (true MERN)
- **M** — MongoDB (Mongoose)
- **E** — Express.js API
- **R** — React 18 (Vite, React Router, Tailwind CSS)
- **N** — Node.js

## Project structure
```
affiliate-platform/
  server/                 Express API (layered architecture)
    server.js               entry point: loads env, connects DB, starts listening
    src/
      app.js                 Express app assembly (middleware, routes, error handling)
      config/                 db connection + plan definitions
        db.js
        plans.js
      models/                  Mongoose schemas
        User.js
        Transaction.js
        ApiKey.js
      routes/                   thin route definitions -> controllers
        index.js                 aggregates all routers under /api
        auth.routes.js
        dashboard.routes.js
        plans.routes.js
        payment.routes.js
        apiKeys.routes.js
        productApi.routes.js
      controllers/               parse req -> call service -> send res (no business logic)
        auth.controller.js
        dashboard.controller.js
        plans.controller.js
        payment.controller.js
        apiKeys.controller.js
        productApi.controller.js
      services/                   business logic, throws ApiError on failure
        auth.service.js
        dashboard.service.js
        payment.service.js         checkout, webhook, fulfillment
        referral.service.js         commission crediting (used by payment.service)
        apiKey.service.js
        plans.service.js
      middleware/
        auth.middleware.js          JWT bearer auth guard
        apiUsage.middleware.js       x-api-key + daily quota guard
        errorHandler.middleware.js   404 handler + centralized error handler
      utils/
        ApiError.js                 HTTP-aware error class
        asyncHandler.js             wraps async controllers for the error middleware
        jwt.js                      sign/verify helpers
        date.js                     todayUTC() for daily usage resets
        zinipay.js                  ZiniPay client (create/verify invoice)
  client-react/            React frontend (Vite)
    src/
      api/client.js           fetch wrapper (auth header, JSON, errors)
      context/AuthContext.jsx  token/user state (login/register/logout)
      context/ToastContext.jsx notifications
      components/
        ProtectedRoute.jsx
        NavBar.jsx              pill icon nav (Home/API Keys/History/Profile/Plans/Logout)
      pages/
        Login.jsx
        Register.jsx           supports ?ref=CODE
        Dashboard.jsx           stats + referral link (Home)
        ApiKeys.jsx              named API keys ("add a key per app/server", revoke)
        History.jsx               purchase history + referred users tabs
        Profile.jsx                edit name, change password
        Plans.jsx                pricing cards -> ZiniPay checkout
        PaymentResult.jsx         post-checkout redirect target, polls status
      App.jsx                  routes
      main.jsx                 entry
      index.css                dark-purple theme (Tailwind)
```

## Backend architecture

Requests flow **routes → controllers → services → models**:
- **routes/** only wire an HTTP verb + path to a controller function (plus which middleware guards it).
- **controllers/** parse `req`, call exactly one service function, shape the response. No business logic lives here.
- **services/** hold the actual logic (validation, DB writes, calling ZiniPay, crediting referrals) and throw `ApiError(statusCode, message)` on failure — they never touch `req`/`res`.
- **middleware/** cross-cutting concerns (auth, quota checks, error handling) shared across routes.
- **utils/** small stateless helpers (`ApiError`, `asyncHandler`, JWT sign/verify, date helpers, the ZiniPay HTTP client).

Every controller is wrapped in `asyncHandler`, so thrown/rejected errors — including `ApiError`s from the service layer — flow to `middleware/errorHandler.middleware.js`, which is the single place that turns errors into HTTP responses. Controllers and services never call `res.status(...)` themselves for error cases.

## 1. Backend setup
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — where the React app runs, e.g. `http://localhost:5173`
  (used to build referral links and for CORS)
- `ZINIPAY_API_KEY` — from ZiniPay dashboard → Brands → Brand Key / API Key
  (https://dash.zinipay.com)
- `ZINIPAY_REDIRECT_URL` / `ZINIPAY_CANCEL_URL` — point at the React app's
  `/payment-result` route, on the same domain registered for your ZiniPay brand
- `ZINIPAY_WEBHOOK_URL` — a publicly reachable URL for `/api/payment/webhook`
  (use ngrok or similar in local development)

Run it:
```bash
npm run dev      # or: npm start
```
Server boots on `http://localhost:5000`.

## 2. Frontend setup (React)
```bash
cd client-react
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:5173` by default. `VITE_API_BASE_URL` in `.env`
points it at the Express API.

Production build:
```bash
npm run build     # outputs static files to dist/
npm run preview   # sanity-check the build locally
```
Deploy `dist/` to any static host (Vercel, Netlify, S3, nginx, etc.) — just
make sure your host rewrites unknown paths to `index.html` since this is a
client-side-routed single-page app (React Router).

## 3. How the pieces fit together

**Referral flow**
1. Every user gets a unique `referralCode` and a link like
   `https://yoursite.com/register?ref=CODE`.
2. New users who sign up through that link are stored with `referredBy`
   (`Register.jsx` reads `ref` via `useSearchParams`).
3. When a referred user's plan purchase is confirmed paid, the referrer is
   credited `REFERRAL_COMMISSION_PERCENT` (default 10%) of the purchase price
   — recorded as its own `referral_commission` transaction, visible in their
   History tab.

**Plans + ZiniPay checkout**
1. `GET /api/plans` returns the four tiers (Day/Week/Month/Year) defined in
   `server/config/plans.js` — edit prices/limits/durations there.
2. `POST /api/payment/checkout` creates a `pending` Transaction, calls
   ZiniPay's Create Invoice API, and returns `payment_url`; the React app
   redirects the browser there (`Plans.jsx`).
3. ZiniPay calls your `webhook_url` when payment status changes; the backend
   re-verifies with ZiniPay's Verify Invoice API (never trusts the webhook
   body blindly) before activating the plan.
4. `PaymentResult.jsx` also actively polls `GET /api/payment/status/:id` as a
   fallback in case the webhook is delayed, so the UI updates either way.

**API usage quota ("Daily Hits" → real API requests)**
1. Each user creates one or more named API keys on the API Keys page (e.g.
   "Production server", "Mobile app") — this replaces any notion of spoofed
   device identifiers; a key is just a labeled credential you generate and
   revoke yourself.
2. Any request to `/api/v1/*` must include header `x-api-key: <key>`.
3. `middleware/apiUsage.js` looks up the key, checks the owning account has
   an active plan, and enforces that plan's `dailyLimit` (shared across all
   of that account's keys, tracked per-key too for visibility), resetting
   per UTC day. Swap `routes/productApi.js`'s sample `/ping` endpoint for
   your real product endpoints — every one of them should sit behind
   `requireApiKey`.

## Notes on ZiniPay
- Confirm the exact field names ZiniPay's `verify` response uses for payment
  status against your live sandbox response before going to production —
  `server/utils/zinipay.js`'s `isPaid()` is written defensively but you should
  tighten it to match the exact response shape you see in your dashboard.
- Set `webhook_url` in your ZiniPay Brand settings to match `ZINIPAY_WEBHOOK_URL`.
- `redirect_url` / `cancel_url` domains must match your registered brand
  website domain, per ZiniPay's docs.
