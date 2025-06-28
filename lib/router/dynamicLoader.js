const fs = require("node:fs");
const path = require("node:path");

console.log("Loading routes from:", process.cwd());

const routesFolderPath = path.join(process.cwd(), "routes");
const routes = {};

function loadRoutes() {
  if (!fs.existsSync(routesFolderPath)) {
    console.log("Routes folder not found:", routesFolderPath);
    return routes;
  }

  function scanDirectory(currentPath, urlPrefix = "") {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Handle nested directories
        const nestedUrlPrefix = path.posix.join(urlPrefix, entry.name);
        scanDirectory(entryPath, nestedUrlPrefix);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        let routePath;

        if (entry.name === "index.js") {
          // index.js maps to the directory path
          routePath = urlPrefix || "/";
        } else {
          // other files map to /filename (without .js)
          const filename = path.basename(entry.name, ".js");
          routePath = path.posix.join(urlPrefix, filename);
        }

        // Ensure route starts with /
        if (!routePath.startsWith("/")) {
          routePath = "/" + routePath;
        }

        try {
          // Clear require cache for hot reloading during development
          delete require.cache[require.resolve(entryPath)];

          const moduleExports = require(entryPath);
          const allowedMethods = [
            "get",
            "post",
            "put",
            "delete",
            "patch",
            "head",
            "options",
          ];
          const handlers = {};

          // Extract HTTP method handlers
          allowedMethods.forEach((method) => {
            if (typeof moduleExports[method] === "function") {
              handlers[method] = moduleExports[method];
            }
          });

          // Also check for default export
          if (typeof moduleExports.default === "function") {
            handlers.get = moduleExports.default;
          }

          if (Object.keys(handlers).length > 0) {
            routes[routePath] = {
              filepath: entryPath,
              handlers: handlers,
            };
            console.log(`Loaded route: ${routePath} from ${entryPath}`);
          }
        } catch (error) {
          console.error(
            `Error loading route from ${entryPath}:`,
            error.message
          );
        }
      }
    });
  }

  scanDirectory(routesFolderPath);
  console.log("Routes loaded:", Object.keys(routes));
  return routes;
}

module.exports = loadRoutes();
