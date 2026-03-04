import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Razorpay Order ID
    orderId: {
      type: String,
      required: true,
      unique: true
    },

    // Student who purchased
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Purchased Course
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },

    // Amount paid (₹)
    amount: {
      type: Number
    },

    // Razorpay Payment ID
    paymentId: {
      type: String
    },

    // Order status
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Order", orderSchema);
