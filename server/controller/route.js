import express from "express";
import { updateCategory, saveTimeData, toggleWebsiteCategory, getWebsiteHistory } from "./controller.js";
const router = express.Router();

router.post("/category", updateCategory);

router.post("/updateCategory", toggleWebsiteCategory);

router.post("/updateData", saveTimeData);

router.post("/userdata", getWebsiteHistory);

export default router;