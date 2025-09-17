import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    let token = req.headers["token"] || req.headers["authorization"];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
