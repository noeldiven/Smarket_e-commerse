export const STORE_CATEGORIES = [
  "Smarket-Bebidas",
  "Smarket-Almacén",
  "Smarket-Lácteos",
  "Smarket-Panadería",
  "Smarket-Fiambrería",
  "Smarket-Limpieza",
  "Smarket-Snacks",
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export const CATEGORY_PREFIX = "Smarket-";