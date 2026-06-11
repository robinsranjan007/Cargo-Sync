import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// connect DB
connectDB();

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.json({ status: "Auth service is running" });
});

// routes
app.use("/api/auth", authRoutes);

// start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});