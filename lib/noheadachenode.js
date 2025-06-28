const http = require("node:http");
const fs = require("node:fs/promises");
const url = require("node:url");
const querystring = require("node:querystring");

class NoHeadacheNode {
  constructor() {
    this.server = http.createServer();
    this.routes = {};
    this.middleware = [];
    /*
     * our routes will look like this

     * {
     *   "get/": () => handlerFunction,
     *   "post/upload": () => handlerFunction
     * }
     *
     * this.route["get/"]()
     */

    //  Request: POST /users/123?active=true
    //
    // 1. Parses: req.pathname = "/users/123", req.query = {active: "true"}
    // 2. Parses request body into req.body
    // 3. Runs middleware (logging, CORS, etc.)
    // 4. Matches route pattern "/users/:id"
    // 5. Sets req.params = {id: "123"}
    // 6. Calls your route handler function
    this.server.on("request", async (req, res) => {
      try {
        // Parse URL and query parameters
        const parsedUrl = url.parse(req.url, true);
        req.pathname = parsedUrl.pathname;
        req.query = parsedUrl.query;

        // Parse request body for POST/PUT/PATCH requests
        if (["POST", "PUT", "PATCH"].includes(req.method)) {
          req.body = await this.parseBody(req);
        }

        // Enhanced response methods
        this.enhanceResponse(res);

        // Run middleware
        await this.runMiddleware(req, res);

        // Route matching with dynamic parameters
        const route = this.matchRoute(req.method.toLowerCase(), req.pathname);

        if (!route) {
          return res.status(404).json({
            error: `Cannot ${req.method} ${req.pathname}`,
            suggestion:
              "Add a route for this path under routes/ directory with index.js file or use the route method to register it.",
            timestamp: new Date().toISOString(),
          });
        }

        // Set route parameters
        req.params = route.params;

        // Call the route handler
        await route.handler(req, res);
      } catch (error) {
        console.error("Request error:", error);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Internal Server Error",
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  }

  // Parse request body
  async parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        try {
          const contentType = req.headers["content-type"] || "";

          if (contentType.includes("application/json")) {
            resolve(JSON.parse(body));
          } else if (
            contentType.includes("application/x-www-form-urlencoded")
          ) {
            resolve(querystring.parse(body));
          } else {
            resolve(body);
          }
        } catch (error) {
          reject(error);
        }
      });
      req.on("error", reject);
    });
  }

  // Enhanced response methods
  enhanceResponse(res) {
    // Send file with better error handling
    res.sendFile = async (filePath, mimeType = "text/plain") => {
      try {
        const fileHandle = await fs.open(filePath, "r");
        const fileStream = fileHandle.createReadStream();

        res.setHeader("Content-Type", mimeType);
        fileStream.pipe(res);

        fileStream.on("end", () => fileHandle.close());
        fileStream.on("error", (error) => {
          fileHandle.close();
          if (!res.headersSent) {
            res.status(500).json({ error: "File read error" });
          }
        });
      } catch (error) {
        if (!res.headersSent) {
          res.status(404).json({ error: "File not found" });
        }
      }
    };

    // Chain-able status method
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    // Enhanced JSON response
    res.json = (data) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data, null, 2));
      return res;
    };

    // Send plain text
    res.send = (data) => {
      if (typeof data === "object") {
        return res.json(data);
      }
      res.setHeader("Content-Type", "text/plain");
      res.end(String(data));
      return res;
    };

    // Redirect method
    res.redirect = (statusCode, url) => {
      if (typeof statusCode === "string") {
        url = statusCode;
        statusCode = 302;
      }
      res.statusCode = statusCode;
      res.setHeader("Location", url);
      res.end();
      return res;
    };
  }

  // Middleware support
  use(middleware) {
    this.middleware.push(middleware);
  }

  async runMiddleware(req, res) {
    for (const middleware of this.middleware) {
      await new Promise((resolve, reject) => {
        middleware(req, res, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  }

  // Enhanced route matching with dynamic parameters
  //First tries exact match: get/users/123
  // Then tries dynamic patterns: get/users/:id
  // Returns handler function + extracted parameters
  matchRoute(method, pathname) {
    const routeKey = method + pathname;

    // Exact match first
    if (this.routes[routeKey]) {
      return { handler: this.routes[routeKey], params: {} };
    }

    // Dynamic parameter matching
    for (const key in this.routes) {
      if (!key.startsWith(method)) continue;

      const routePath = key.substring(method.length);
      const match = this.matchDynamicRoute(routePath, pathname);

      if (match) {
        return { handler: this.routes[key], params: match.params };
      }
    }

    return null;
  }

  // Match dynamic routes like /users/:id
  // Route Pattern: /users/:id/posts/:postId
  // Request URL:   /users/123/posts/456
  // Matches! Returns: { params: { id: "123", postId: "456" } }
  matchDynamicRoute(routePath, requestPath) {
    const routeSegments = routePath.split("/").filter(Boolean);
    const requestSegments = requestPath.split("/").filter(Boolean);

    if (routeSegments.length !== requestSegments.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const requestSegment = requestSegments[i];

      if (routeSegment.startsWith(":")) {
        // Dynamic parameter
        const paramName = routeSegment.substring(1);
        params[paramName] = decodeURIComponent(requestSegment);
      } else if (routeSegment !== requestSegment) {
        // Static segment doesn't match
        return null;
      }
    }

    return { params };
  }

  //after calling route function which each function
  //taking method path and callback(cb) we add that into the routes object
  // Register route
  route(method, path, handler) {
    this.routes[method.toLowerCase() + path] = handler;
  }

  // HTTP method shortcuts
  get(path, handler) {
    this.route("get", path, handler);
  }

  post(path, handler) {
    this.route("post", path, handler);
  }

  put(path, handler) {
    this.route("put", path, handler);
  }

  delete(path, handler) {
    this.route("delete", path, handler);
  }

  patch(path, handler) {
    this.route("patch", path, handler);
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }
}

module.exports = NoHeadacheNode;
