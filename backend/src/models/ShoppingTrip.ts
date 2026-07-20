import { Schema, model } from "mongoose";

export interface IShoppingTripItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface IShoppingTrip {
  date: Date;
  total: number;
  supermarket: string;
  items: IShoppingTripItem[];
}

const shoppingTripItemSchema = new Schema<IShoppingTripItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, min: 0 },
  },
  { _id: false }
);

const shoppingTripSchema = new Schema<IShoppingTrip>(
  {
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    supermarket: { type: String, required: true, trim: true },
    items: { type: [shoppingTripItemSchema], default: [] },
  },
  { timestamps: true, strict: false }
);

export const ShoppingTrip = model<IShoppingTrip>("ShoppingTrip", shoppingTripSchema);
