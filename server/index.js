import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
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

app.use(cors({
  origin: function (origin, callback) {
    // allow Postman / server-to-server (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ IMPORTANT: handle preflight requests
app.options("*", cors());

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// ✅ root route (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDb();
});