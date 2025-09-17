import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    req.user = {
      email: token_decode.email,
      userId: token_decode.userId || null,
    };

    next();
  } catch (error) {
    console.log("Admin auth middleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authAdmin;
