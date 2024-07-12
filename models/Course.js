import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
  CourseName: {
    type: String,
    required: true,
  },
  Batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
});

export default mongoose.model("Course", courseSchema);
