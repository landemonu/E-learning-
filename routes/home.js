import express from "express";
import { home,index } from "../controller/home.js";

const router = express.Router();

router.get("/home",home);
router.get("/",index);

export default router;



