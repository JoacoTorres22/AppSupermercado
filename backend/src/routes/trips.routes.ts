import { Router } from "express";
import { closeTrip, deleteTrip, listTrips } from "../controllers/trips.controller";

const router = Router();

router.get("/", listTrips);
router.post("/", closeTrip);
router.delete("/:id", deleteTrip);

export default router;
