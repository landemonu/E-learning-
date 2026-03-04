import express from "express";
 import { reg, login, regSubmit, loginSubmit, logout,getProfile, updateProfile,coursesPage} from "../controller/user.js";
import upload from "../middleware/fileHandler.js";
const router = express.Router();

router.get("/reg",reg);
router.post("/reg",upload.single("profile"),regSubmit);

router.get("/login",login);
router.post("/login",loginSubmit);

router.get("/logout",logout);

// profile routes
router.get("/profile", getProfile);
router.get("/courses", coursesPage);
router.post("/profile", upload.single("profile"), updateProfile);



// COURSES
// router.get("/courses", allCourses);                // /courses
// router.get("/courses/tag/:tagName", coursesByTag); // /courses/tag/:tagName

// BUY
// router.get("/buy/:courseId", buyCourse);
export default router;