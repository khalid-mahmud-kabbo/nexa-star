const ApiError = require('../utils/ApiError');

/** 404 handler for unmatched routes - placed after all route mounts. */
function notFound(req, res, next) {
  next(new ApiError(404, 'Not found.'));
}

/** Centralized error handler - every controller/service throws ApiError (or lets unexpected errors bubble up here). */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details || undefined });
  }

  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
