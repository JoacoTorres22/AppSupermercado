export interface PriceHistoryEntry {
  supermarket: string;
  price: number;
  date: string;
}

export interface Item {
  _id: string;
  name: string;
  quantity: number;
  checked: boolean;
  priceHistory: PriceHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingTripItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface ShoppingTrip {
  _id: string;
  date: string;
  total: number;
  supermarket: string;
  items: ShoppingTripItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationResult {
  supermarket: string;
  estimatedTotal: number;
  missingItemsCount: number;
}
