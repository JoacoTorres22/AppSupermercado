import { Router } from "express";
import { getRecommendation } from "../controllers/recommendation.controller";

const router = Router();

router.post("/", getRecommendation);

export default router;
