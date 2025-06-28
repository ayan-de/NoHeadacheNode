module.exports = function corsMiddleware(options = {}) {
  const {
    origin = "*",
    methods = "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders = "Content-Type,Authorization",
    credentials = false,
  } = options;

  return (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", methods);
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);

    if (credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    next();
  };
};
