import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import express from "express";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

/* ================= CORS CONFIG ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-interview-psi-six.vercel.app",
  "https://ai-interview-dijf5ogn7-amanverma420s-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ================= MIDDLEWARE ================= */

app.use(express.json());   // ✅ ADD THIS (VERY IMPORTANT)
app.use(cookieParser());

/* ================= ROUTES ================= */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDb();
});