import { Schema, model } from "mongoose";

export type ItemStatus = "to_buy" | "purchased";

export interface IItem {
  name: string;
  status: ItemStatus;
}

// strict: false permite agregar atributos futuros (marca, cantidad, categoría, etc.)
// sin necesidad de migrar el esquema, según lo definido en el ADR de MongoDB.
const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    status: { type: String, enum: ["to_buy", "purchased"], default: "to_buy" },
  },
  { timestamps: true, strict: false }
);

export const Item = model<IItem>("Item", itemSchema);
