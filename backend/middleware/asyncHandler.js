// Wraps an object of async route handlers so any rejected promise is forwarded
// to Express's error-handling middleware (Express 4 does not do this natively).
const wrap = (handlers) => {
  const wrapped = {};
  for (const [name, fn] of Object.entries(handlers)) {
    wrapped[name] = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  }
  return wrapped;
};

module.exports = wrap;
