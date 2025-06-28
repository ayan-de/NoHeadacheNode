module.exports = function registerRoutes(instance, routesObject) {
  // Loop over all URL paths
  for (const path in routesObject) {
    const handlers = routesObject[path].exports;

    // Loop over each HTTP method
    for (const method in handlers) {
      const handler = handlers[method];

      // Register with .route()
      instance.route(method, path, handler);

      console.log(`Registered ${method.toUpperCase()} ${path}`);
    }
  }
};
