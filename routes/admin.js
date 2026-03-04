import express from "express";
import {
  adminDashboard,
  adminUsers,
  adminCourses,
  adminReports,
  deleteUser,
  deleteCourse
} from "../controller/admin.js";

import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/adminDashboard", isAdmin, adminDashboard);
router.get("/adminUsers", isAdmin, adminUsers);
router.get("/adminCourses", isAdmin, adminCourses);
router.get("/adminReports", isAdmin, adminReports);

// router.post("/delete-user/:id", isAdmin, deleteUser);
router.post("/admin/delete-user/:id", isAdmin, deleteUser);
router.post("/admin/delete-course/:id", isAdmin, deleteCourse);

export default router;
