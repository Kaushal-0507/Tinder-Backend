const adminAuth = (req, res, next) => {
  const token = "abc";
  console.log("auth is getting checked");
  const isAuthorized = token === "abc";
  if (!isAuthorized) {
    res.status(401).send("Unauthorized access");
  } else {
    next();
  }
};

module.exports = {
  adminAuth,
};
