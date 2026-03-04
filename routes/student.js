import express from "express";

import {
  dashboard,
  myCourses,
  courseDetails,
//   videoPlayer,
  quiz,
  certificatePage,
  generateCertificate,
  editProfile,
  updateProgress,
  viewCourse,
  checkoutPage,
  createOrder,
  paymentSuccess,
  watchVideo,
  startQuiz,
  submitQuiz
} from "../controller/student.js";

import { isStudentAuth } from "../middleware/isStudentAuth.js";


const router = express.Router();


/* ===============================
   STUDENT DASHBOARD
================================ */

router.get("/studentDashboard", isStudentAuth, dashboard);


/* ===============================
   COURSES
================================ */

router.get("/studentCourseDetails/:id", isStudentAuth, courseDetails);

router.get("/studentMycourses", isStudentAuth, myCourses);

router.get("/studentCourse/:courseId", isStudentAuth, viewCourse);

router.get("/studentViewCourse/:courseId", isStudentAuth, viewCourse);


/* ===============================
   VIDEO
================================ */

// router.get("/studentVideo", isStudentAuth, videoPlayer);

router.get("/watchVideo/:videoId", isStudentAuth, watchVideo);


/* ===============================
   QUIZ
================================ */

router.get("/studentQuiz/:courseId", isStudentAuth, quiz);

router.post("/studentQuiz/start", isStudentAuth, startQuiz);

router.post("/studentQuiz/submit", isStudentAuth, submitQuiz);


/* ===============================
   CERTIFICATE
================================ */
// Certificate list page
router.get(
  "/studentCertificate",
  isStudentAuth,
  certificatePage
);

// Download certificate
router.get(
  "/studentCertificate/:courseId",
  isStudentAuth,
  generateCertificate
);

/* ===============================
   PROFILE
================================ */

router.get("/studentEditprofile", isStudentAuth, editProfile);


/* ===============================
   PROGRESS
================================ */

router.post( "/course/:courseId/video-complete",isStudentAuth, updateProgress);


/* ===============================
   PAYMENT
================================ */

router.get("/checkout/:courseId", isStudentAuth, checkoutPage);

router.post("/checkout/create-order", isStudentAuth, createOrder);

router.post("/checkout/payment/success", isStudentAuth, paymentSuccess);


export default router;
