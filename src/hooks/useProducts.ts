import { useEffect, useState } from "react";
import type { StoreProduct } from "../types";
import { getProducts } from "../services/productService";
import { getErrorMessage } from "../services/api";
import { isStoreProduct } from "../utils/isStoreProduct";

export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cada vez que cambia, el efecto vuelve a pedir los productos
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Evita actualizar el estado si el componente se desmontó antes de la respuesta
    let cancelled = false;

    getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data.filter(isStoreProduct)); // solo los nuestros
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  return { products, loading, error, refetch };
}
