import express from "express";
import { contact } from "../controller/contact.js";

const router = express.Router();

router.get("/contact",contact);

export default router;



