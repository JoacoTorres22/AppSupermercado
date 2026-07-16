import { Router } from "express";
import { closeTrip, listTrips } from "../controllers/trips.controller";

const router = Router();

router.get("/", listTrips);
router.post("/", closeTrip);

export default router;
