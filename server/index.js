import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

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
  "https://ai-interview-dijf5ogn7-amanverma420s-projects.vercel.app",
  "https://ai-interview-1nid7swrj-amanverma420s-projects.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.options("*", cors()); // ✅ REQUIRED

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