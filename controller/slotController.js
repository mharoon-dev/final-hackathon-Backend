import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  NOTALLOWED,
  NOTFOUND,
  OK,
} from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessages.js";
import pkg from "jsonwebtoken";
import mongoose from 'mongoose';
import Teacher from "../models/Teacher.js";
import Slot from "../models/Slot.js";
import Batch from "../models/Batch.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  const {
    courseName,
    batchNumber,
    startTime,
    endTime,
    days,
    teacherName,
    teacherId,
  } = req.body;

  console.log("Received request:", req.body);

  try {
    // Check if all required fields are provided
    if (
      !courseName ||
      !batchNumber ||
      !startTime ||
      !endTime ||
      !days ||
      !teacherId ||
      !teacherName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the teacher by teacherId
    const teacher = await Teacher.findOne({ TeacherId: parseInt(teacherId) });

    if (!teacher) {
      console.log(`Teacher not found for TeacherId: ${teacherId}`);
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if the teacher is assigned to the specified course
    if (teacher.TeacherOf !== courseName) {
      console.log(`Teacher ${teacher.TeacherName} is not assigned to course ${courseName}`);
      return res.status(403).json({
        error: "This Teacher is not assigned to this Course!",
      });
    }

    // Proceed to create the slot
    const newSlot = new Slot({
      CourseName: courseName,
      BatchNumber: batchNumber,
      StartTime: new Date(startTime),
      EndTime: new Date(endTime),
      Days: days,
      TeacherId: teacher.TeacherId,
      TeacherName: teacher.TeacherName,
    });

    const savedSlot = await newSlot.save();

    // Update the teacher's Slots array
    await Teacher.findByIdAndUpdate(
      teacher._id,
      { $push: { Slots: savedSlot._id } },
      { new: true }
    );

    // Update the batch's Slots array
    await Batch.findOneAndUpdate(
      { CourseName: courseName, BatchNumber: batchNumber },
      { $push: { Slots: savedSlot._id } },
      { new: true }
    );

    return res.status(201).json({ message: "Slot added successfully", data: savedSlot });
  } catch (error) {
    console.error("Error adding slot:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Slot not found",
        })
      );
    }

    // Update the teacher's slots array
    await Teacher.findByIdAndUpdate(
      slot.TeacherId,
      { $pull: { Slots: slot._id } },
      { new: true }
    );

    // Update the batch's slots array
    await Batch.findOneAndUpdate(
      { CourseName: slot.CourseName, BatchNumber: slot.BatchNumber },
      { $pull: { Slots: slot._id } },
      { new: true }
    );

    // Delete the slot itself
    await Slot.findByIdAndDelete(req.params.id);

    // Send success response
    res.status(OK).json({
      status: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

export const getSlots = async (req, res) => {
  try {
    const batches = await Slot.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Batches fetched successfully",
      data: batches,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};

export const getSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Slot not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Slot fetched successfully",
      data: slot,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};


// update slot 

export const updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Slot not found",
        })
      );
    }

    const updatedSlot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(OK);
    res.json({
      status: true,
      message: "Slot updated successfully", 
      data: updatedSlot
    });


  } catch (error) {
    console.log(error);
  }
}