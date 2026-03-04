import express from "express";
import{about} from "../controller/about.js"

const router=express.Router();

router .get("/about",about);

export default router;

