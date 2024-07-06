import mongoose from "mongoose";
// import validator from 'validator';

const register = mongoose.Schema(
  {
    Email: {
      type: String,
      required: [true, "Please Add Email"],
      unique: true,
      trim: true,
      lowercase: true,
      // validate: [validator.isEmail, 'Please provide a valid email'],
    },
    Password: {
      type: String,
      required: [true, "Please Add Password"],
      minlength: 8,
      trim: true,
    },
    otp: {
      type: String,
    },
    expiresIn: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", register);
