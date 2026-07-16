import { Request, Response } from "express";
import { Item } from "../models/Item";
import { ShoppingTrip } from "../models/ShoppingTrip";

export async function listTrips(_req: Request, res: Response): Promise<void> {
  const trips = await ShoppingTrip.find().sort({ date: -1 });
  res.json(trips);
}

// Cierra la compra: registra el gasto total junto con los ítems marcados como
// "purchased" y resetea su estado a "to_buy" para el próximo viaje.
export async function closeTrip(req: Request, res: Response): Promise<void> {
  const { total } = req.body;
  if (typeof total !== "number" || total < 0) {
    res.status(400).json({ error: "El campo 'total' es requerido y debe ser un número" });
    return;
  }

  const purchasedItems = await Item.find({ status: "purchased" });
  const trip = await ShoppingTrip.create({
    total,
    items: purchasedItems.map((item) => item.name),
  });

  await Item.updateMany({ status: "purchased" }, { status: "to_buy" });

  res.status(201).json(trip);
}
