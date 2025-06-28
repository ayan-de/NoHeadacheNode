const fs = require("node:fs");
const path = require("node:path");

// Show where we're running
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);

// Absolute path to your /routes folder
const routesFolderPath = path.join(__dirname, "routes");

// All routes will be stored here
const routes = {};

// If /routes dir exists in root folder
if (fs.existsSync(routesFolderPath)) {
  // This function will populate the routes{} object
  function listFiles(currentFolderPath) {
    const entries = fs.readdirSync(currentFolderPath);

    entries.forEach((entry) => {
      const entryAbsolutePath = path.join(currentFolderPath, entry);

      if (fs.lstatSync(entryAbsolutePath).isFile() && entry === "index.js") {
        // Compute URL path by getting relative folder path
        const relativeDir = path.relative(routesFolderPath, currentFolderPath);
        const urlPath =
          "/" + (relativeDir === "" ? "" : relativeDir).replace(/\\/g, "/");

        // Dynamically require the file
        const handlerModule = require(entryAbsolutePath);

        // Collect only function exports named after HTTP methods
        const allowedMethods = ["get", "post", "put", "delete", "patch"];
        const handlers = {};

        allowedMethods.forEach((method) => {
          if (typeof handlerModule[method] === "function") {
            handlers[method] = handlerModule[method];
          }
        });

        routes[urlPath] = {
          filepath: entryAbsolutePath,
          exports: handlers,
        };
      } else if (fs.lstatSync(entryAbsolutePath).isDirectory()) {
        // Recurse into subdirectory
        listFiles(entryAbsolutePath);
      }
    });
  }

  // Start populating from /routes dir
  listFiles(routesFolderPath);

  console.log("Routes mapping:", routes);
} else {
  console.log("/routes folder not found.", routesFolderPath);
}
