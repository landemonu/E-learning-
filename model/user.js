import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: Number, required: true },
    profile: { type: String, required: true },
    otp: { type: String },
    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        required: true
    },

    // 🔥 COURSE PROGRESS STRUCTURE
    courses: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
                required: true
            },
            progress: {
                type: Number,
                default: 0
            },
            completed: {
                type: Boolean,
                default: false
            },
            quizPassed: {
                type: Boolean,
                default: false
             },
            watchedVideos: { type: mongoose.Schema.Types.ObjectId },
            score: Number,
            total: Number,
            certificateIssued: { type: Boolean,default: false}
        }
    ]

}, { timestamps: true });
const userHandler = mongoose.model("User", userSchema);

export default userHandler;
