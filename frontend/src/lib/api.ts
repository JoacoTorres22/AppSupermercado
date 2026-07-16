import { Item, ShoppingTrip } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL || !API_KEY) {
    throw new Error('Faltan EXPO_PUBLIC_API_URL o EXPO_PUBLIC_API_KEY en el .env');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status} en ${path}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function getItems(): Promise<Item[]> {
  return request<Item[]>('/api/items');
}

export function createItem(name: string): Promise<Item> {
  return request<Item>('/api/items', { method: 'POST', body: JSON.stringify({ name }) });
}

export function updateItem(id: string, patch: Partial<Pick<Item, 'status' | 'name'>>): Promise<Item> {
  return request<Item>(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function deleteItem(id: string): Promise<void> {
  return request<void>(`/api/items/${id}`, { method: 'DELETE' });
}

export function getTrips(): Promise<ShoppingTrip[]> {
  return request<ShoppingTrip[]>('/api/trips');
}

export function closeTrip(total: number): Promise<ShoppingTrip> {
  return request<ShoppingTrip>('/api/trips', { method: 'POST', body: JSON.stringify({ total }) });
}
