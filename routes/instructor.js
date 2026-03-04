import express from 'express';
import {dashboard, createCourseForm, instructorCreate,uploadVideoForm, uploadVideo, addQuizForm, addQuiz,earningsPage, analysisPage} from '../controller/instructor.js';
import { upload } from '../middleware/instructorUpload.js';


const router = express.Router();


router.get('/instructorDashboard', dashboard);
router.get('/instructorCreate', createCourseForm);

router.post( "/instructorCreate",upload.single("coverImage"),instructorCreate);
router.get('/instructorUploadvideo/:courseId/video/upload', uploadVideoForm);
// router.post("/instructorUploadvideo/:courseId/video/upload",upload.single("video"),uploadVideo);
router.post( "/instructorUploadVideo/:courseId",upload.single("video"),uploadVideo);

router.get("/instructorAddquiz/:courseId/quiz/add", addQuizForm);
router.post("/instructorAddquiz/:courseId/quiz/add", addQuiz);

router.get('/instructorEarnings', earningsPage);
router.get('/instructorAnalysis', analysisPage);


export default router;