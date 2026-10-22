import { api } from "./api";
import type { Product, ProductCreate, ProductUpdate } from "../types";

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/products/");
  return data;
}

export async function createProduct(product: ProductCreate): Promise<Product> {
  const { data } = await api.post<Product>("/products/", product);
  return data;
}

export async function updateProduct(id: number, changes: ProductUpdate): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, changes);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}