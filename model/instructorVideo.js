import mongoose from 'mongoose';
const { Schema } = mongoose;

const VideoSchema = new Schema({
course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
title: { type: String, required: true },
description: { type: String },
path: { type: String, required: true }, // local path or cloud URL
duration: { type: Number },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Video', VideoSchema);