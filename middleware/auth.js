const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(400).send({ message: "No user found" });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(400).send({ message: "Not Authorized" });
  }
};

module.exports = authMiddleware;
