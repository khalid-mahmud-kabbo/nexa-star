require('dotenv').config();
const createApp = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
