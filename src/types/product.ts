import type { StoreCategory } from "../constants/categories";

// Lo que LLEGA de la API (productos de todos los grupos)
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string | null;
  image_url: string | null;
  created_at: string;
}

// Un producto que ya sabemos que es de nuestra tienda
export interface StoreProduct extends Omit<Product, "category"> {
  category: StoreCategory;
}

// Body de POST /products/ (admin)
export interface ProductCreate {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  category: StoreCategory;
  image_url?: string;
}

// Body de PUT /products/:id (admin)
export type ProductUpdate = Partial<ProductCreate>;

// Estado de los filtros en pantalla
export interface CatalogFilters {
  search: string;
  category: StoreCategory | null;
  minPrice: number | null;
  maxPrice: number | null;
  onlyInStock: boolean;
}