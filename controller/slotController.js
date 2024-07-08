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
  console.log(req.body, "===>>> req.body");

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

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  } else if (teacher) {
    const checkTeacherOf = teacher.TeacherOf;
    console.log(checkTeacherOf, "===>>> checkTeacherOf");
    if (checkTeacherOf !== courseName) {
      return res.status(403).json({
        error: "This Teacher is not for this Course!",
      });
    }
  } else {
    console.log(teacher, "===>>> teacher");
  }

  const batch = await Batch.findOne({
    CourseName: courseName,
    BatchNumber: batchNumber,
  });
  if (!batch) {
    return res.status(403).json({ error: "Batch not Found!" });
  } else if (batch) {
    const expiry = new Date(batch.Expiry);
    console.log(expiry, "===>>> expiry");
    if (expiry < new Date()) {
      return res.status(409).json({
        error: "Batch has already expired",
      });
    }
  } else {
    console.log(batch, "===>>> batch");
  }

  const teacherSlots = teacher.Slots || [];
  console.log(teacherSlots, "===>>> teacherSlots");

  for (const id of teacherSlots) {
    const teacherSlot = await Slot.findById(id);
    if (
      teacherSlot &&
      teacherSlot.StartTime === startTime &&
      teacherSlot.EndTime === endTime &&
      teacherSlot.Days.toString() === days.toString()
    ) {
      const existingBatch = await Batch.findOne({
        CourseName: teacherSlot.CourseName,
        BatchNumber: teacherSlot.BatchNumber,
      });

      if (existingBatch && existingBatch.Expiry > new Date()) {
        return res.status(409).json({
          error:
            "Teacher already has a slot at this time and days with an unexpired batch",
        });
      }
    }
  }

  const newSlot = new Slot({
    CourseName: courseName,
    BatchNumber: batchNumber,
    StartTime: startTime,
    EndTime: endTime,
    Days: days,
    TeacherId: teacherId,
    TeacherName: teacher.TeacherName,
  });

  const savedSlot = await newSlot.save();

  await Teacher.findByIdAndUpdate(
    teacherId,
    { $push: { Slots: savedSlot._id } },
    { new: true }
  );

  await Batch.findOneAndUpdate(
    { CourseName: courseName, BatchNumber: batchNumber },
    { $push: { Slots: savedSlot._id } },
    { new: true }
  );

  return res
    .status(201)
    .json({ message: "Slot added successfully", data: savedSlot });
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
