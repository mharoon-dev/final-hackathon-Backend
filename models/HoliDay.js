import mongoose from "mongoose";

const { Schema } = mongoose;

const holidaySchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  // Add more fields as needed
});

export default mongoose.model("Holiday", holidaySchema);
