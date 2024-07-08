import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    CourseName: {
      type: String,
      required: true,
    },
    BatchNumber: {
      type: Number,
      required: true,
    },
    StartTime: {
      type: Date,
      required: true,
    },
    EndTime: {
      type: Date,
      required: true,
    },
    Days: [
      {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
    ],
    TeacherName: {
      type: String,
      required: true,
    },
    TeacherId: {
      type: String,
      required: true,
    },
    StudentsId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Slot = mongoose.models.Slot || mongoose.model("Slot", slotSchema);
export default Slot;
