import mongoose from 'mongoose';
const { Schema } = mongoose;


const CourseSchema = new Schema({
instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
title: { type: String, required: true },
description: { type: String },
category: { type: String },
price: { type: Number, default: 0 },
coverImage: { type: String },
videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Course', CourseSchema);