const NoHeadacheNode = require("../lib/noheadachenode");
// const registerRoutes = require("../lib/router/router");
// const loadedRoutes = require("../lib/router/dynamicLoader");

const app = new NoHeadacheNode();

// registerRoutes(app, loadedRoutes);

// 1. Add middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// 2. Add routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome!" });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const { include } = req.query;

  res.json({
    user: { id, name: `User ${id}` },
    include: include,
  });
});

app.post("/users", (req, res) => {
  const userData = req.body;
  // Save to database...
  res.status(201).json({ id: Date.now(), ...userData });
});

// 3. Start server
app.listen(3000, () => {
  console.log("NoHeadacheNode server running!");
});
