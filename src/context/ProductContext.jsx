import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ── Context ───────────────────────────────────────────────────────────────
export const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Load all products from server on mount ───────────────────────────
  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── CRUD helpers — optimistic UI + server sync ───────────────────────
  const addProduct = (productData) => {
    // Show immediately with a temporary id
    const tempId = `tmp_${Date.now()}`;
    setProducts((prev) => [{ ...productData, id: tempId }, ...prev]);

    fetch(`${API}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
      .then((r) => r.json())
      .then((saved) => {
        // Replace temp entry with server-assigned id
        setProducts((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
      });
  };

  const updateProduct = (id, data) => {
    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    fetch(`${API}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((saved) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? saved : p)));
      });
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    fetch(`${API}/api/products/${id}`, { method: "DELETE" });
  };

  // ── Derive per-category list ─────────────────────────────────────────
  const getByCategory = (categoryKey, limit = Infinity) => {
    const filtered = products.filter((p) => p.category === categoryKey);
    return limit === Infinity ? filtered : filtered.slice(0, limit);
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, addProduct, updateProduct, deleteProduct, getByCategory }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// ── Convenience hook ──────────────────────────────────────────────────────
export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductProvider>");
  return ctx;
}
