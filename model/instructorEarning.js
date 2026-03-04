import mongoose from "mongoose";

const earningSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Earning", earningSchema);
