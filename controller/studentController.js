import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  OK,
} from "../constants/httpStatus.js";
import { responseMessages } from "../constants/responseMessages.js";
import Teacher from "../models/Teacher.js";
import pkg from "jsonwebtoken";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import Slot from "../models/Slot.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
  } = req.body;
  
 console.log(fullName, email, fatherEmail, phoneNumber, courseName, batchNumber, slotId);
  try {
    // Check for missing fields
    if (!fullName || !email || !fatherEmail || !phoneNumber || !courseName || !batchNumber || !slotId) {
      return res.status(BADREQUEST).send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
    }

    // Check if student email already exists
    const checkEmail = await Student.findOne({ Email: email });
    if (checkEmail) {
      return res.status(ALREADYEXISTS).send(sendError({ status: false, message: responseMessages.EMAIL_EXISTS }));
    }

    // Check if student father's email already exists
    const checkFatherEmail = await Student.findOne({ FatherEmail: fatherEmail });
    if (checkFatherEmail) {
      return res.status(ALREADYEXISTS).send(sendError({ status: false, message: responseMessages.FATHER_EMAIL_EXISTS }));
    }

    // Check if student phone number already exists
    const checkPhoneNumber = await Student.findOne({ PhoneNumber: phoneNumber });
    if (checkPhoneNumber) {
      return res.status(ALREADYEXISTS).send(sendError({ status: false, message: responseMessages.PHONE_EXISTS }));
    }

    // Validate batch existence and validity
    const checkBatch = await Batch.findOne({})

    console.log(checkBatch);


    if (!checkBatch) {
      console.log("Invalid Batch", { batchNumber, courseName }); // Log for debugging
      return res.status(BADREQUEST).send(sendError({ status: false, message: responseMessages.INVALID_BATCH }));
    }

    // Check if batch has expired
    const checkExpiry = new Date(checkBatch.EndDate);
    if (checkExpiry < new Date()) {
      return res.status(BADREQUEST).send(sendError({ status: false, message: responseMessages.EXPIRED_BATCH }));
    }

    // Validate slot existence and course match
    const checkSlot = await Slot.findOne({ _id: slotId });
    if (!checkSlot) {
      return res.status(BADREQUEST).send(sendError({ status: false, message: responseMessages.INVALID_SLOT }));
    }
    if (checkSlot.CourseName !== courseName) {
      return res.status(BADREQUEST).send(sendError({ status: false, message: "This slot is not for this course" }));
    }

    // Generate roll number
    const rollNumber = Math.floor(100000 + Math.random() * 900000);

    // Create new student object
    const obj = {
      FullName: fullName,
      Email: email,
      FatherEmail: fatherEmail,
      PhoneNumber: phoneNumber,
      CourseName: courseName,
      BatchNumber: batchNumber,
      SlotId: slotId,
      RollNumber: rollNumber,
    };
    console.log(obj);
    const student = new Student(obj);
    const data = await student.save();

    // Update slot's StudentsId array
    await Slot.findByIdAndUpdate(
      slotId,
      { $push: { StudentsId: data._id } },
      { new: true }
    );

    // Respond with success message
    res.status(CREATED).json({
      status: true,
      message: responseMessages.STUDENT_ADDED,
      data: data,
    });
  } catch (error) {
    console.error(error); // Log any unexpected errors
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
      })
    );
  }
};
export const update = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    fatherEmail,
    phoneNumber,
    courseName,
    batchNumber,
    slotId,
  } = req.body;

  try {
    const checkId = await Student.findOne({ _id: id });
    if (!checkId) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.INVALID_ID,
        })
      );
    }

    // check if email already exists
    const checkEmail = await Student.findOne({
      Email: email,
      _id: { $ne: id },
    });
    if (checkEmail) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.EMAIL_EXISTS,
        })
      );
    }

    const checkFatherEmail = await Student.findOne({
      FatherEmail: fatherEmail,
      _id: { $ne: id },
    });
    if (checkFatherEmail) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.FATHER_EMAIL_EXISTS,
        })
      );
    }

    // check if phone number already exists
    const checkPhoneNumber = await Student.findOne({
      PhoneNumber: phoneNumber,
      _id: { $ne: id },
    });
    if (checkPhoneNumber) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.PHONE_EXISTS,
        })
      );
    }

    // check if batch is valid and not expired
    const checkBatch = await Batch.findOne({
      BatchNumber: batchNumber || checkId.BatchNumber,
      CourseName: courseName || checkId.CourseName,
    });
    if (!checkBatch) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.INVALID_BATCH,
        })
      );
    } else {
      const checkExpiry = new Date(checkBatch.Expiry);
      if (checkExpiry < new Date()) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.EXPIRED_BATCH,
          })
        );
      }
    }

    if (slotId) {
      const checkSlot = await Slot.findOne({ _id: slotId || checkId.SlotId });
      if (!checkSlot) {
        return res.status(BADREQUEST).send(
          sendError({
            status: false,
            message: responseMessages.INVALID_SLOT,
          })
        );
      } else if (slotId && courseName) {
        if (checkSlot.CourseName !== courseName) {
          return res.status(BADREQUEST).send(
            sendError({
              status: false,
              message: "This slot is not for this course",
            })
          );
        }
      }
    }

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        FullName: fullName || checkId.FullName,
        Email: email || checkId.Email,
        FatherEmail: fatherEmail || checkId.FatherEmail,
        PhoneNumber: phoneNumber || checkId.PhoneNumber,
        CourseName: courseName || checkId.CourseName,
        BatchNumber: batchNumber || checkId.BatchNumber,
        SlotId: slotId || checkId.SlotId,
      },
      { new: true }
    );

    // Update the slot's StudentsId array if slotId has changed
    if (slotId) {
      const slot = await Slot.findById(slotId);
      if (slot) {
        const updated = [...slot.StudentsId, updatedStudent._id];
        await Slot.updateOne({ _id: slotId }, { StudentsId: updated });

        // Remove the student from the old slot's StudentsId array
        const oldSlot = await Slot.findById(checkId.SlotId);
        if (oldSlot) {
          const oldUpdated = oldSlot.StudentsId.filter(
            (studentId) =>
              studentId.toString() !== updatedStudent._id.toString()
          );
          await Slot.updateOne(
            { _id: checkId.SlotId },
            { StudentsId: oldUpdated }
          );
        }
      }
    }

    res.status(OK).json({
      status: true,
      message: responseMessages.STUDENT_UPDATED,
      data: updatedStudent,
    });
  } catch (error) {
    console.log(error);
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Student not found",
        })
      );
    } else {
      const deleted = await Student.findByIdAndDelete(req.params.id);

      // update the slot student array
      const slot = await Slot.findOne({ _id: student.SlotId });
      if (slot) {
        const updated = slot.StudentsId.filter(
          (studentId) => studentId.toString() !== deleted._id.toString()
        );
        await Slot.updateOne({ _id: slot._id }, { StudentsId: updated });
      }
      res.status(OK);
      res.json({
        status: true,
        message: "Student deleted successfully",
      });
    }
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

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Students fetched successfully",
      data: students,
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

export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Student not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Student fetched successfully",
      data: student,
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
