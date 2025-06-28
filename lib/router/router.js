module.exports = function registerRoutes(app, routesObject) {
  // Loop over all URL paths
  for (const path in routesObject) {
    const routeInfo = routesObject[path];
    const handlers = routeInfo.handlers;

    // Loop over each HTTP method
    for (const method in handlers) {
      const handler = handlers[method];

      // Register with .route()
      app.route(method, path, handler);

      console.log(`Registered ${method.toUpperCase()} ${path}`);
    }
  }
};
