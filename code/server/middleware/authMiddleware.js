const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = protect;