import { sendError, sendSuccess } from "../utils/responses.js";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  INTERNALERROR,
  OK,
} from "../constants/httpStatus.js";

import { responseMessages } from "../constants/responseMessages.js";
import pkg from "jsonwebtoken";
import Batch from "../models/Batch.js";

const { verify, decode, sign } = pkg;

export const add = async (req, res) => {
  console.log(req.body, "===>>> req.body");

  const { courseName, batchNumber, startedFrom, endDate, expiry } = req.body;

  try {
    if (!courseName || !batchNumber || !startedFrom || !endDate || !expiry) {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
      // .send("Missing Fields");
    } else {
      const checkBatch = await Batch.findOne({
        BatchNumber: req.body.batchNumber,
        CourseName: req.body.courseName,
      });
      if (checkBatch) {
        return res.status(ALREADYEXISTS).send(
          sendError({
            status: false,
            message: responseMessages.BATCH_AND_COURSE_EXISTS,
          })
        );
      } else {
        const newBatch = new Batch({
          CourseName: courseName && courseName,
          BatchNumber: batchNumber && batchNumber,
          StartedFrom: startedFrom && startedFrom,
          EndDate: endDate && endDate,
          Expiry: expiry && expiry,
        });
        const data = await newBatch.save();
        return res.status(CREATED).send(
          sendSuccess({
            status: true,
            message: responseMessages.GET_SUCCESS_MESSAGES,
            data: data,
          })
        );
      }
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

export const update = async (req, res) => {
  console.log(req.body, "===>>> req.body");
  try {
    // Retrieve existing batch data
    const singleBatchData = await Batch.findById(req.params.id);

    const { courseName, batchNumber, startedFrom, endDate, expiry } = req.body;

    // Check if the combination of courseName and batchNumber already exists in another document
    const checkBatch = await Batch.findOne({
      CourseName: courseName || singleBatchData.CourseName,
      BatchNumber: batchNumber || singleBatchData.BatchNumber,
      _id: { $ne: req.params.id }, // Exclude the current document
    });

    console.log(checkBatch, "===>>> checkBatch");
    if (checkBatch) {
      return res.status(ALREADYEXISTS).send(
        sendError({
          status: false,
          message: responseMessages.BATCH_AND_COURSE_EXISTS,
        })
      );
    }

    // Prepare data for update
    const data = {
      CourseName: courseName || singleBatchData.CourseName,
      BatchNumber: batchNumber || singleBatchData.BatchNumber,
      StartedFrom: new Date(startedFrom || singleBatchData.StartedFrom),
      EndDate: endDate || singleBatchData.EndDate,
      Expiry: new Date(expiry || singleBatchData.Expiry),
    };

    // Update the batch
    const updated = await Batch.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.status(OK).json({
      status: true,
      message: "Batch updated successfully",
      data: updated,
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

export const deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete({ _id: req.params.id });
    res.status(OK);
    res.json({
      status: true,
      message: "Batch deleted successfully",
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

export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
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

export const getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(NOTFOUND).send(
        sendError({
          status: false,
          message: "Batch not found",
        })
      );
    }
    res.status(OK);
    res.json({
      status: true,
      message: "Batch fetched successfully",
      data: batch,
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
