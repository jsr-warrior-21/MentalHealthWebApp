import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    let dtoken = req.headers["dtoken"] || req.headers["authorization"];
    if (!dtoken) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    if (dtoken.startsWith("Bearer ")) {
      dtoken = dtoken.split(" ")[1];
    }
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }
    req.docId = decoded.id;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authDoctor;
