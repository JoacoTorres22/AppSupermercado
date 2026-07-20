import { Request, Response } from "express";
import { IPriceHistoryEntry, Item } from "../models/Item";

interface RequestedItem {
  itemId: string;
  quantity: number;
}

interface RecommendationResult {
  supermarket: string;
  estimatedTotal: number;
  missingItemsCount: number;
}

// Reduce el historial de precios de un ítem al último precio conocido por
// supermercado (la entrada de fecha más reciente para cada supermercado).
function latestPricesBySupermarket(priceHistory: IPriceHistoryEntry[]): Map<string, number> {
  const latest = new Map<string, { price: number; date: Date }>();
  for (const entry of priceHistory) {
    const current = latest.get(entry.supermarket);
    if (!current || entry.date > current.date) {
      latest.set(entry.supermarket, { price: entry.price, date: entry.date });
    }
  }
  return new Map([...latest].map(([supermarket, { price }]) => [supermarket, price]));
}

// Calcula, para cada supermercado con precios cargados, el gasto estimado de
// la lista de ítems recibida (cantidad × último precio conocido ahí), y
// devuelve el ranking de más barato a más caro. Un supermercado entra al
// ranking aunque le falte el precio de algún ítem: solo suma lo que tiene y
// reporta cuántos ítems le faltan, en vez de exigir datos completos.
export async function getRecommendation(req: Request, res: Response): Promise<void> {
  const { items } = req.body as { items?: RequestedItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "El campo 'items' es requerido y debe ser un array no vacío" });
    return;
  }

  const itemDocs = await Item.find({ _id: { $in: items.map((i) => i.itemId) } });
  const latestPricesByItemId = new Map<string, Map<string, number>>();
  const supermarkets = new Set<string>();
  for (const doc of itemDocs) {
    const latest = latestPricesBySupermarket(doc.priceHistory);
    latestPricesByItemId.set(doc._id.toString(), latest);
    for (const supermarket of latest.keys()) supermarkets.add(supermarket);
  }

  const ranking: RecommendationResult[] = [...supermarkets]
    .map((supermarket) => {
      let estimatedTotal = 0;
      let missingItemsCount = 0;
      for (const { itemId, quantity } of items) {
        const price = latestPricesByItemId.get(itemId)?.get(supermarket);
        if (price === undefined) {
          missingItemsCount += 1;
          continue;
        }
        estimatedTotal += price * quantity;
      }
      return { supermarket, estimatedTotal, missingItemsCount };
    })
    .sort((a, b) => a.estimatedTotal - b.estimatedTotal);

  res.json(ranking);
}
