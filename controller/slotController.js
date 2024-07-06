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
import Teacher from "../models/teacher.js";
import Slot from "../models/slot.js";
import Batch from "../models/batch.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  const { courseName, batchNumber, time, days, teacherName, teacherId } =
    req.body;
  console.log(req.body, "===>>> req.body");

  if (
    !courseName ||
    !batchNumber ||
    !time ||
    !days ||
    !teacherId ||
    !teacherName
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ error: "Teacher not found" });
  } else {
    console.log(teacher, "===>>> teacher");
  }

  const batch = await Batch.findOne({
    CourseName: courseName,
    BatchNumber: batchNumber,
  });
  if (!batch) {
    return res.status(403).json({ error: "Batch not Found!" });
  } else {
    console.log(batch, "===>>> batch");
  }

  const teacherSlots = teacher.Slots || [];
  console.log(teacherSlots, "===>>> teacherSlots");

  for (const id of teacherSlots) {
    const teacherSlot = await Slot.findById(id);
    if (
      teacherSlot &&
      teacherSlot.Time === time &&
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
    Time: time,
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

// export const update = async (req, res) => {
//   const { id } = req.params;
//   const selectedSlot = await Slot.findById(id);
//   const oldTeacherId = selectedSlot.TeacherId;
//   const { courseName, batchNumber, time, days, teacherName, teacherId } =
//     req.body;
//   let NewId;

//   if (teacherId) {
//     const teacher = await Teacher.findById(teacherId || selectedSlot.TeacherId);
//     if (!teacher) {
//       return res.status(404).json({ error: "Teacher not found" });
//     } else {
//       console.log(teacher, "===>>> teacher");
//       NewId = teacherId;
//     }

//     const teacherSlots = teacher.Slots || [];
//     console.log(teacherSlots, "===>>> teacherSlots");

//     for (const id of teacherSlots) {
//       const teacherSlot = await Slot.findById(id);
//       if (
//         teacherSlot &&
//         teacherSlot.Time === time &&
//         teacherSlot.Days.toString() === days.toString()
//       ) {
//         const existingBatch = await Batch.findOne({
//           CourseName: teacherSlot.CourseName,
//           BatchNumber: teacherSlot.BatchNumber,
//         });

//         if (existingBatch && existingBatch.Expiry > new Date()) {
//           return res.status(409).json({
//             error:
//               "Teacher already has a slot at this time and days with an unexpired batch",
//           });
//         }
//       }
//     }

//     if (batchNumber || courseName) {
//       const batch = await Batch.findOne({
//         CourseName: courseName || selectedSlot.CourseName,
//         BatchNumber: batchNumber || selectedSlot.BatchNumber,
//       });
//       if (!batch) {
//         return res.status(403).json({ error: "Batch not Found!" });
//       } else {
//         console.log(batch, "===>>> batch");
//       }
//     }

//     const updatedSlot = await Slot.findByIdAndUpdate(
//       id,
//       {
//         CourseName: courseName || selectedSlot.CourseName,
//         BatchNumber: batchNumber || selectedSlot.BatchNumber,
//         Time: time || selectedSlot.Time,
//         Days: days || selectedSlot.Days,
//         TeacherId: NewId || oldTeacherId,
//         TeacherName: teacherName || selectedSlot.TeacherName,
//       },
//       { new: true }
//     );

//     if (!updatedSlot) {
//       return res.status(404).json({ error: "Slot not found" });
//     }

//     if (oldTeacherId !== teacherId) {
//       await Teacher.findByIdAndUpdate(
//         oldTeacherId,
//         { $pull: { Slots: id } },
//         { new: true }
//       );

//       await Teacher.findByIdAndUpdate(
//         teacherId,
//         { $push: { Slots: id } },
//         { new: true }
//       );
//     }

//     return res
//       .status(200)
//       .json({ message: "Slot updated successfully", data: updatedSlot });
//   }
// };

export const deleteSlot = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete({ _id: req.params.id });
    res.status(OK);
    res.json({
      status: true,
      message: "slot deleted successfully",
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
