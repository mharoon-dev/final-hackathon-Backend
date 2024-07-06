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

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { teacherName, email, phoneNumber, teacherOf } = req.body;

  try {
    if (!teacherName || !email || !phoneNumber || !teacherOf) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
      // .send("Missing Fields");
    } else {
      const checkEmail = await Teacher.findOne({ Email: email });
      if (checkEmail) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
          );
      }
      const checkPhoneNumber = await Teacher.findOne({
        PhoneNumber: phoneNumber,
      });
      if (checkPhoneNumber) {
        return res
          .status(ALREADYEXISTS)
          .send(
            sendError({ status: false, message: responseMessages.PHONE_EXISTS })
          );
      }

      const obj = {
        TeacherName: teacherName,
        Email: email,
        PhoneNumber: phoneNumber,
        TeacherOf: teacherOf,
      };

      const teacher = new Teacher(obj);

      const data = await teacher.save();
      res.status(OK);
      res.json({
        status: true,
        message: "Teacher added successfully",
        data: data,
      });
    }
  } catch (error) {
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );

    console.log(error);
  }
};

export const update = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { teacherName, email, phoneNumber, teacherOf } = req.body;

  try {
    const checkEmail = await Teacher.findOne({ Email: req.body.email });
    if (checkEmail) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.EMAIL_EXISTS })
        );
    }
    const checkPhoneNumber = await Teacher.findOne({
      PhoneNumber: req.body.phoneNumber,
    });
    if (checkPhoneNumber) {
      return res
        .status(ALREADYEXISTS)
        .send(
          sendError({ status: false, message: responseMessages.PHONE_EXISTS })
        );
    }

    const data = {
      TeacherName: teacherName && teacherName,
      Email: email && email,
      PhoneNumber: phoneNumber && phoneNumber,
      TeacherOf: teacherOf && teacherOf,
    };

    const updated = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      data,
      { new: true }
    );
    res.status(OK);
    res.json({
      status: true,
      message: "Teacher updated successfully",
      data: updated,
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

export const deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete({ _id: req.params.id });
    res.status(OK);
    res.json({
      status: true,
      message: "Teacher deleted successfully",
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

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(OK);
    res.json({
      status: true,
      message: "Teachers fetched successfully",
      data: teachers,
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
