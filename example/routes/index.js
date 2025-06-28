exports.get = (req, res) => {
  res.json({ message: "routes GET / working!" });
};

exports.post = (req, res) => {
  res.json({ message: "routes POST / working!" });
};
