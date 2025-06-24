const http = require("node:http");
const fs = require("node:fs/promises");

class NoHeadacheNode {
  constructor() {
    this.server = http.createServer();

    /*
     * our routes will look like this

     * {
     *   "get/": () => {...},
     *   "post/upload": () => {...}
     * }
     *
     * this.route["get/"]()
     */

    this.routes = {};

    this.server.on("request", (req, res) => {
      //send a file back to the client
      res.sendFile = async (path, mine) => {
        const fileHandle = await fs.open(path, "r");
        const fileStream = fileHandle.createReadStream();

        res.setHeader("Content-Type", mine);

        fileStream.pipe(res);
      };

      //set the status code of the response
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      //send a json data back to the client(for small json data, less than highwatermark value)
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      //if the route object does not have a key of req.method+req.url, return 404
      if (!this.routes[req.method.toLowerCase() + req.url]) {
        return res
          .status(404)
          .json({ error: `Cannot ${req.method} ${req.url}` });
      }
      //getting the key and call the function we received by req,res parameter
      this.routes[req.method.toLowerCase() + req.url](req, res);
    });
  }
  //after calling route function which each function
  //taking method path and callback(cb) we add that into the routes object
  route(method, path, cb) {
    this.routes[method + path] = cb;
  }

  listen(port, cb) {
    this.server.listen(port, () => {
      cb();
    });
  }
}

module.exports = NoHeadacheNode;
