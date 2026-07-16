export type ItemStatus = 'to_buy' | 'purchased';

export interface Item {
  _id: string;
  name: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingTrip {
  _id: string;
  date: string;
  total: number;
  items: string[];
  createdAt: string;
  updatedAt: string;
}
