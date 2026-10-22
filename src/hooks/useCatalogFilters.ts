import { useMemo, useState } from "react";
import type { CatalogFilters, StoreProduct } from "../types";

const initialFilters: CatalogFilters = {
  search: "",
  category: null,
  minPrice: null,
  maxPrice: null,
  onlyInStock: false,
};

export function useCatalogFilters(products: StoreProduct[]) {
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.price);
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.minPrice !== null && price < filters.minPrice) return false;
      if (filters.maxPrice !== null && price > filters.maxPrice) return false;
      if (filters.onlyInStock && p.stock === 0) return false;
      return true;
    });
  }, [products, filters]);

  const updateFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return { filters, filteredProducts, updateFilter, resetFilters };
}