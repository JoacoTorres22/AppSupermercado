import { Schema, model } from "mongoose";

export interface IShoppingTripItem {
  name: string;
  quantity: number;
}

export interface IShoppingTrip {
  date: Date;
  total: number;
  items: IShoppingTripItem[];
}

const shoppingTripItemSchema = new Schema<IShoppingTripItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const shoppingTripSchema = new Schema<IShoppingTrip>(
  {
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    items: { type: [shoppingTripItemSchema], default: [] },
  },
  { timestamps: true, strict: false }
);

export const ShoppingTrip = model<IShoppingTrip>("ShoppingTrip", shoppingTripSchema);
