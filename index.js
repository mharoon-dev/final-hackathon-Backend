import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/default.js";
import { authRoutes } from "./routes/auth.js";
import { teacherRoutes } from "./routes/teacher.js";
import { batchRoutes } from "./routes/batch.js";
import { slotRoutes } from "./routes/slot.js";
import { studentRoutes } from "./routes/student.js";

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


connectDB();
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/slot", slotRoutes);
app.use("/api/student", studentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running at http://localhost:${process.env.PORT}`);
});
