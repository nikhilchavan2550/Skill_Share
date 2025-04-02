import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      default: "I'd like to connect with you!"
    },
    status: {
      type: String,
      enum: ["Pending", "Rejected", "Connected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const Request = mongoose.model("Request", requestSchema);
