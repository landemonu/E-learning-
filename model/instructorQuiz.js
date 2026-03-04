import mongoose from 'mongoose';
const { Schema } = mongoose;


const QuestionSchema = new Schema({
text: { type: String, required: true },
options: [{ type: String }],
correctIndex: { type: Number, required: true }
});


const QuizSchema = new Schema({
course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
title: { type: String, required: true },
questions: [QuestionSchema],
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Quiz', QuizSchema);