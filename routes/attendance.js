import express from "express";
import {
  markAttendance,
  viewAttendance,
  markAbsentStudents,
} from "../controller/attendanceController.js";

const attendanceRoutes = express.Router();

// Mark Attendance
// POST http://localhost:9000/api/attendance/markattendance
// Public
attendanceRoutes.post("/markattendance", markAttendance);

// View Attendance
// GET http://localhost:9000/api/attendance/view
// Public
attendanceRoutes.get("/view", viewAttendance);

// mark absent
// post http://localhost:9000/api/attendance/markabsent
// Public
attendanceRoutes.post("/markabsent", markAbsentStudents);

export default attendanceRoutes;
