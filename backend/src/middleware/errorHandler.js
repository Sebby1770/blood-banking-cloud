// Centralised error handler. Wrap async route handlers in try/catch and
// pass errors through with `next(err)` for consistent JSON responses.
module.exports = function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
};
