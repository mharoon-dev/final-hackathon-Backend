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
    Time: {
      type: String,
      required: true,
    },
    Days: {
      type: Array,
      required: true,
    },
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
