import { Schema, model } from "mongoose";

export interface IShoppingTrip {
  date: Date;
  total: number;
  items: string[];
}

const shoppingTripSchema = new Schema<IShoppingTrip>(
  {
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    items: { type: [String], default: [] },
  },
  { timestamps: true, strict: false }
);

export const ShoppingTrip = model<IShoppingTrip>("ShoppingTrip", shoppingTripSchema);
