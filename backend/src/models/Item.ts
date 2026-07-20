import { Schema, model } from "mongoose";

export interface IPriceHistoryEntry {
  supermarket: string;
  price: number;
  date: Date;
}

export interface IItem {
  name: string;
  quantity: number;
  checked: boolean;
  priceHistory: IPriceHistoryEntry[];
}

// Log append-only: cada cierre de compra con precio cargado agrega una
// entrada nueva (nunca pisa una existente). El "último precio conocido" en
// un supermercado se calcula tomando la entrada de fecha más reciente para
// ese supermercado (ver recommendation.controller.ts).
const priceHistorySchema = new Schema<IPriceHistoryEntry>(
  {
    supermarket: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

// strict: false permite agregar atributos futuros (marca, categoría, etc.)
// sin necesidad de migrar el esquema, según lo definido en el ADR de MongoDB.
const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    quantity: { type: Number, default: 0, min: 0 },
    checked: { type: Boolean, default: false },
    priceHistory: { type: [priceHistorySchema], default: [] },
  },
  { timestamps: true, strict: false }
);

export const Item = model<IItem>("Item", itemSchema);
