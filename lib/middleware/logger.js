module.exports = function loggerMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
      );
    });

    next();
  };
};
