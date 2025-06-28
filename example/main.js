const NoHeadacheNode = require("../lib/noheadachenode");
const registerRoutes = require("../lib/router/router");
const loadedRoutes = require("../lib/router/dynamicLoader");

const app = new NoHeadacheNode();

registerRoutes(app, loadedRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
