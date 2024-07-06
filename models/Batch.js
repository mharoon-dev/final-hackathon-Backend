import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    CourseName: {
      type: String,
      required: true,
    },
    BatchNumber: {
      type: Number,
      required: true,
    },
    StartedFrom: {
      type: Date,
      required: true,
    },
    Duration: {
      type: String,
      required: true,
    },
    Expiry: {
      type: Date,
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

export default mongoose.model("Batch", batchSchema);
