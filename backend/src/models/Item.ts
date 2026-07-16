import { Schema, model } from "mongoose";

export interface IItem {
  name: string;
  quantity: number;
  checked: boolean;
}

// strict: false permite agregar atributos futuros (marca, categoría, etc.)
// sin necesidad de migrar el esquema, según lo definido en el ADR de MongoDB.
const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    quantity: { type: Number, default: 0, min: 0 },
    checked: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
);

export const Item = model<IItem>("Item", itemSchema);
