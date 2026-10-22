import { useCallback, useEffect, useState } from "react";
import type { StoreProduct } from "../types";
import { getProducts } from "../services/productService";
import { getErrorMessage } from "../services/api";
import { isStoreProduct } from "../utils/isStoreProduct";

export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data.filter(isStoreProduct));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const refetch = () => {
    setLoading(true);
    void loadProducts();
  };

  return { products, loading, error, refetch };
}