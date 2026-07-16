import { Router } from "express";
import { createItem, deleteItem, listItems, updateItem } from "../controllers/items.controller";

const router = Router();

router.get("/", listItems);
router.post("/", createItem);
router.patch("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
