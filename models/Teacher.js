import mongoose from "mongoose";
// import validator from 'validator';

const teacher = mongoose.Schema(
  {
    TeacherName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    Email: {
      type: String,
      required: [true, "Please Add Email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    PhoneNumber: {
      type: Number,
      required: true,
    },
    TeacherOf: {
      type: String,
      required: true,
    },
    Slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Teacher", teacher);
