import type { Product, StoreProduct } from "../types";
import { STORE_CATEGORIES } from "../constants/categories";

export function isStoreProduct(product: Product): product is StoreProduct {
  return (
    product.category !== null &&
    (STORE_CATEGORIES as readonly string[]).includes(product.category)
  );
}