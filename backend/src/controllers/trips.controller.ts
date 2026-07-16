import { Request, Response } from "express";
import { Item } from "../models/Item";
import { ShoppingTrip } from "../models/ShoppingTrip";

export async function listTrips(_req: Request, res: Response): Promise<void> {
  const trips = await ShoppingTrip.find().sort({ date: -1 });
  res.json(trips);
}

// Cierra la compra: registra el gasto total junto con los ítems marcados como
// "checked" (con su cantidad) y los resetea a quantity 0 / checked false. Los
// ítems que quedaron sin marcar mantienen su cantidad para la próxima vez.
export async function closeTrip(req: Request, res: Response): Promise<void> {
  const { total } = req.body;
  if (typeof total !== "number" || total < 0) {
    res.status(400).json({ error: "El campo 'total' es requerido y debe ser un número" });
    return;
  }

  const checkedItems = await Item.find({ quantity: { $gt: 0 }, checked: true });
  const trip = await ShoppingTrip.create({
    total,
    items: checkedItems.map((item) => ({ name: item.name, quantity: item.quantity })),
  });

  await Item.updateMany(
    { quantity: { $gt: 0 }, checked: true },
    { quantity: 0, checked: false }
  );

  res.status(201).json(trip);
}

export async function deleteTrip(req: Request, res: Response): Promise<void> {
  const trip = await ShoppingTrip.findByIdAndDelete(req.params.id);
  if (!trip) {
    res.status(404).json({ error: "Compra no encontrada" });
    return;
  }
  res.status(204).send();
}
