import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import admintRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoutes.js";
import dotenv from 'dotenv';
dotenv.config();


// app config
const app = express();
const port = process.env.PORT || 4000;

// connect DB + Cloudinary
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "token", "atoken","dtoken"], // 👈 added atoken here
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// api endpoints
app.use("/api/admin", admintRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// health check
app.get("/", (req, res) => {
  res.send("API WORKING GREAT");
});

app.listen(port, () => {
  console.log("✅ Server Started on port", port);
});
