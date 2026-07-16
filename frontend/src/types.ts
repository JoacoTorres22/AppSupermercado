export interface Item {
  _id: string;
  name: string;
  quantity: number;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingTripItem {
  name: string;
  quantity: number;
}

export interface ShoppingTrip {
  _id: string;
  date: string;
  total: number;
  items: ShoppingTripItem[];
  createdAt: string;
  updatedAt: string;
}
