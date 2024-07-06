import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./config/default.js";
import { authRoutes } from "./routes/auth.js";
import { teacherRoutes } from "./routes/teacher.js";
import { batchRoutes } from "./routes/batch.js";
import { slotRoutes } from "./routes/slot.js";

const app = express();

dotenv.config();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 15 minutes
//   limit: 4, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//   message: "Too many requests, please try again later.",
// });

//////////////////

// app.use(limiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/slot", slotRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running at http://localhost:${process.env.PORT}`);
});
