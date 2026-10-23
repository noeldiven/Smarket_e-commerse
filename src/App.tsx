import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { STORE_CATEGORIES } from "./constants/categories";
import type { StoreCategory } from "./constants/categories";
import type { Product, StoreProduct, UserRole } from "./types";
import { isStoreProduct } from "./utils/isStoreProduct";
import "./App.css";
import { Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: StoreCategory;
  image_url: string;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Agua mineral",
    description: "Agua mineral natural de 625 ml.",
    price: "2.50",
    stock: 35,
    category: "Smarket-Bebidas",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
  {
    id: 2,
    name: "Leche evaporada",
    description: "Leche evaporada entera, lata de 400 g.",
    price: "4.80",
    stock: 18,
    category: "Smarket-Lácteos",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
  {
    id: 3,
    name: "Galletas de chocolate",
    description: "Galletas crocantes ideales para compartir.",
    price: "3.90",
    stock: 24,
    category: "Smarket-Snacks",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
  {
    id: 4,
    name: "Pan integral",
    description: "Pan integral fresco, elaborado diariamente.",
    price: "6.50",
    stock: 12,
    category: "Smarket-Panadería",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
  {
    id: 5,
    name: "Arroz extra",
    description: "Arroz de grano seleccionado, bolsa de 1 kg.",
    price: "4.20",
    stock: 0,
    category: "Smarket-Almacén",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
  {
    id: 6,
    name: "Detergente",
    description: "Detergente para el cuidado de tu ropa.",
    price: "8.90",
    stock: 15,
    category: "Smarket-Limpieza",
    image_url: "",
    created_at: "2026-10-22T10:00:00Z",
  },
];

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category: STORE_CATEGORIES[0],
  image_url: "",
};

const CATEGORY_ICONS: Record<StoreCategory, string> = {
  "Smarket-Bebidas": "🥤",
  "Smarket-Almacén": "🛒",
  "Smarket-Lácteos": "🥛",
  "Smarket-Panadería": "🥖",
  "Smarket-Fiambrería": "🧀",
  "Smarket-Limpieza": "🧼",
  "Smarket-Snacks": "🍪",
};

function formatCategory(category: StoreCategory) {
  return category.replace("Smarket-", "");
}

function App() {
  // Selector temporal para revisar ambas interfaces.
  // No representa una autenticación real.
  const [viewRole, setViewRole] = useState<UserRole>("cliente");

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState<"store" | "login">("store");
  const [category, setCategory] = useState<StoreCategory | "todas">("todas");
  const [availability, setAvailability] = useState("todos");
  const [cartCount, setCartCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(
    null,
  );
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [notice, setNotice] = useState("");

  const isAdmin = viewRole === "admin";

  const storeProducts = useMemo(
    () => products.filter(isStoreProduct),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return storeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "todas" || product.category === category;

      const matchesAvailability =
        availability === "todos" ||
        (availability === "disponibles" && product.stock > 0) ||
        (availability === "agotados" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [storeProducts, search, category, availability]);

  const totalUnits = storeProducts.reduce(
    (total, product) => total + product.stock,
    0,
  );

  function openCreateModal() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(product: StoreProduct) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: String(product.stock),
      category: product.category,
      image_url: product.image_url ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  }

  function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setNotice("Revisa el nombre, el precio y el stock ingresados.");
      return;
    }

    if (editingProduct) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: form.name.trim(),
                description: form.description.trim() || null,
                price: String(price),
                stock,
                category: form.category,
                image_url: form.image_url.trim() || null,
              }
            : product,
        ),
      );
      setNotice("Producto actualizado en la vista de demostración.");
    } else {
      const newProduct: StoreProduct = {
        id: Math.max(0, ...products.map((product) => product.id)) + 1,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: String(price),
        stock,
        category: form.category,
        image_url: form.image_url.trim() || null,
        created_at: new Date().toISOString(),
      };

      setProducts((current) => [...current, newProduct]);
      setNotice("Producto agregado a la vista de demostración.");
    }

    closeModal();
  }

  function handleDelete(product: StoreProduct) {
    const confirmed = window.confirm(
      `¿Deseas eliminar "${product.name}" de la vista de demostración?`,
    );

    if (!confirmed) return;

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice("Producto eliminado de la vista de demostración.");
  }

  function handleStockChange(product: StoreProduct, amount: number) {
    const newStock = Math.max(0, product.stock + amount);

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, stock: newStock } : item,
      ),
    );
    setNotice("Stock actualizado en la vista de demostración.");
  }

  function handleBuy(product: StoreProduct) {
    if (product.stock <= 0) return;

    setCartCount((current) => current + 1);
    setNotice(`${product.name} agregado a tu selección de compra.`);
    
    
  }
  if (currentView === "login") {
    return <LoginPage onBack={() => setCurrentView("store")} />; 
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white shadow-lg shadow-indigo-200">
              S
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight">
                Smarket<span className="text-indigo-600">.</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Tu tienda, más cerca
              </span>
            </span>
          </a>

          <div className="hidden max-w-md flex-1 md:block">
            <label className="relative block">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                ⌕
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="¿Qué producto estás buscando?"
                aria-label="Buscar productos"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">Vista de demostración</p>
              <p className="text-sm font-semibold">
                {isAdmin ? "Administrador" : "Cliente"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewRole(isAdmin ? "cliente" : "admin")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-indigo-300 hover:bg-indigo-50 sm:px-4 sm:text-sm"
            >
              Ver como {isAdmin ? "cliente" : "admin"}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("login")}
              className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-sm shadow-sm"
            >
              Iniciar sesión
            </button>
            {!isAdmin && (
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-700"
                aria-label={`Selección de compra: ${cartCount} productos`}
                title="Selección de compra de demostración"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 md:hidden lg:px-8">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-9 text-white sm:px-10 sm:py-12">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide">
              {isAdmin ? "PANEL DE GESTIÓN" : "BIENVENIDO A SMARKET"}
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              {isAdmin
                ? "Gestiona tu tienda con facilidad."
                : "Todo lo que necesitas, en un solo lugar."}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              {isAdmin
                ? "Administra tus productos, controla las existencias y mantén actualizado tu catálogo."
                : "Explora nuestro catálogo, encuentra tus productos favoritos y descubre todo lo que tenemos para ti."}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                + Agregar producto
              </button>
            )}
          </div>
          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10 sm:right-12 sm:top-0" />
          <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-violet-400/20 blur-2xl" />
          <span className="pointer-events-none absolute bottom-5 right-8 hidden text-8xl opacity-20 lg:block">
            🛍️
          </span>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Productos"
            value={String(storeProducts.length)}
            icon="📦"
            color="indigo"
          />
          <MetricCard
            label="Categorías"
            value={String(STORE_CATEGORIES.length)}
            icon="🏷️"
            color="violet"
          />
          <MetricCard
            label="Unidades en stock"
            value={String(totalUnits)}
            icon="📊"
            color="emerald"
          />
          <MetricCard
            label="Sin existencias"
            value={String(storeProducts.filter((p) => p.stock === 0).length)}
            icon="⚠️"
            color="amber"
          />
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Explora la tienda
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {isAdmin ? "Catálogo de productos" : "Nuestros productos"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isAdmin
                  ? "Consulta y administra los productos de Smarket."
                  : "Productos seleccionados para acompañarte todos los días."}
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
              >
                + Nuevo producto
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryButton
              active={category === "todas"}
              onClick={() => setCategory("todas")}
            >
              ✨ Todas
            </CategoryButton>
            {STORE_CATEGORIES.map((item) => (
              <CategoryButton
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {CATEGORY_ICONS[item]} {formatCategory(item)}
              </CategoryButton>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-bold text-slate-800">
                {filteredProducts.length}
              </span>{" "}
              de {storeProducts.length} productos
            </p>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              aria-label="Filtrar por disponibilidad"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="todos">Todas las existencias</option>
              <option value="disponibles">Disponibles</option>
              <option value="agotados">Agotados</option>
            </select>
          </div>

          {notice && (
            <div
              role="status"
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                className="shrink-0 font-bold"
                aria-label="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onBuy={handleBuy}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onStockChange={handleStockChange}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <span className="text-5xl">🔎</span>
              <h3 className="mt-4 text-lg font-bold">
                No encontramos productos
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Prueba otra búsqueda o selecciona una categoría diferente.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("todas");
                  setAvailability("todos");
                }}
                className="mt-5 font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          © 2026 Smarket · Tu tienda, más cerca.
        </footer>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Administración
                </p>
                <h2
                  id="product-form-title"
                  className="mt-2 text-2xl font-black"
                >
                  {editingProduct ? "Editar producto" : "Nuevo producto"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Completa los datos del producto.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar formulario"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
              <FormField label="Nombre del producto">
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ej. Café molido"
                  className="form-input"
                />
              </FormField>

              <FormField label="Descripción">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe brevemente el producto..."
                  className="form-input resize-y"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Precio (S/)">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="0.00"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Stock">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({ ...form, stock: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Categoría">
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value as StoreCategory,
                    })
                  }
                  className="form-input"
                >
                  {STORE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {formatCategory(item)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="URL de imagen (opcional)">
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(event) =>
                    setForm({ ...form, image_url: event.target.value })
                  }
                  placeholder="https://..."
                  className="form-input"
                />
              </FormField>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  {editingProduct ? "Guardar cambios" : "Agregar producto"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  icon: string;
  color: "indigo" | "violet" | "emerald" | "amber";
};

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${colors[color]}`}
        >
          {icon}
        </span>
        <span className="text-2xl font-black tracking-tight">{value}</span>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>
    </article>
  );
}

type CategoryButtonProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function CategoryButton({ active, onClick, children }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      {children}
    </button>
  );
}

type ProductCardProps = {
  product: StoreProduct;
  isAdmin: boolean;
  onBuy: (product: StoreProduct) => void;
  onEdit: (product: StoreProduct) => void;
  onDelete: (product: StoreProduct) => void;
  onStockChange: (product: StoreProduct, amount: number) => void;
};

function ProductCard({
  product,
  isAdmin,
  onBuy,
  onEdit,
  onDelete,
  onStockChange,
}: ProductCardProps) {
  const categoryIcon = CATEGORY_ICONS[product.category];
  const hasStock = product.stock > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl shadow-sm">
            {categoryIcon}
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
            hasStock
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {hasStock ? "Disponible" : "Agotado"}
        </span>

        {isAdmin && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
            ID: {product.id}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-xs font-semibold text-indigo-600">
          {formatCategory(product.category)}
        </span>
        <h3 className="mt-2 line-clamp-1 text-base font-bold text-slate-800">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {product.description || "Un producto pensado para ti."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Precio
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              S/ {Number(product.price).toFixed(2)}
            </p>
          </div>
          <p className="text-right text-xs text-slate-500">
            Stock
            <span
              className={`mt-1 block font-bold ${
                hasStock ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {product.stock} und.
            </span>
          </p>
        </div>

        {isAdmin ? (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Ajustar stock
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStockChange(product, -1)}
                  disabled={product.stock === 0}
                  aria-label={`Reducir stock de ${product.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span className="min-w-5 text-center text-sm font-bold">
                  {product.stock}
                </span>
                <button
                  type="button"
                  onClick={() => onStockChange(product, 1)}
                  aria-label={`Aumentar stock de ${product.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 font-bold hover:bg-indigo-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="rounded-xl bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                ✎ Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBuy(product)}
            disabled={!hasStock}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            <span>🛒</span>
            {hasStock ? "Agregar a mi compra" : "Sin existencias"}
          </button>
        )}
      </div>
    </article>
  );
}

type FormFieldProps = {
  label: string;
  children: ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default App;
