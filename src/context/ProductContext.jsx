import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config/api";

// ── Context ───────────────────────────────────────────────────────────────
export const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Get token from sessionStorage (set by AuthContext)
  const getAuthToken = () => sessionStorage.getItem("inout_admin_token");

  // ── Load all products from server on mount ───────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    fetch(`${API_BASE}/products`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timeoutId);
        // Ensure all products have required fields
        const validated = Array.isArray(data) ? data.map(p => ({
          ...p,
          name: p.name || "Unnamed",
          category: p.category || "other",
          price: p.price || 0,
          soldOut: p.soldOut || false
        })) : [];
        setProducts(validated);
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error("Failed to load products:", err.message);
        setLoading(false);
      });
    
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  // ── CRUD helpers — optimistic UI + server sync ───────────────────────
  const addProduct = (productData) => {
    // Show immediately with a temporary id
    const tempId = `tmp_${Date.now()}`;
    const tempProduct = { ...productData, id: tempId, name: productData.name || "Unnamed" };
    setProducts((prev) => [tempProduct, ...prev]);

    const token = getAuthToken();
    if (!token) {
      console.error("Not authenticated");
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      return;
    }

    fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productData),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((saved) => {
        // Replace temp entry with server-assigned id
        setProducts((prev) => prev.map((p) => (p.id === tempId ? { ...saved, name: saved.name || "Unnamed", soldOut: saved.soldOut || false } : p)));
      })
      .catch((err) => {
        console.error("Add product error:", err);
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
      });
  };

  const updateProduct = (id, data) => {
    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    const token = getAuthToken();
    if (!token) {
      console.error("Not authenticated");
      return;
    }

    fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((saved) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...saved, name: saved.name || "Unnamed", soldOut: saved.soldOut || false } : p)));
      })
      .catch((err) => {
        console.error("Update product error:", err);
        // Reload to sync state
        window.location.reload();
      });
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    
    const token = getAuthToken();
    if (!token) {
      console.error("Not authenticated");
      return;
    }

    fetch(`${API_BASE}/products/${id}`, { 
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
      })
      .catch((err) => {
        console.error("Delete product error:", err);
        // Reload to sync state
        window.location.reload();
      });
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
