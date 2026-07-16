import { Request, Response } from "express";
import { Item } from "../models/Item";

export async function listItems(_req: Request, res: Response): Promise<void> {
  const items = await Item.find().sort({ name: 1 });
  res.json(items);
}

export async function createItem(req: Request, res: Response): Promise<void> {
  const { name, ...rest } = req.body;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "El campo 'name' es requerido" });
    return;
  }
  const item = await Item.create({ name, ...rest });
  res.status(201).json(item);
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const { quantity } = req.body;
  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
    res.status(400).json({ error: "El campo 'quantity' debe ser un entero >= 0" });
    return;
  }

  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ error: "Ítem no encontrado" });
    return;
  }
  res.json(item);
}

export async function deleteItem(req: Request, res: Response): Promise<void> {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Ítem no encontrado" });
    return;
  }
  res.status(204).send();
}
