import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/products";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import PageTransition from "../components/PageTransition";

const CATEGORY_OPTIONS = categories.map((c) => ({ key: c.key, label: c.label }));

const EMPTY_FORM = {
  name: "",
  category: CATEGORY_OPTIONS[0]?.key || "",
  price: "",
  quantity: "",
  images: [],
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { products: items, addProduct, updateProduct, deleteProduct } = useProducts();
  const [view, setView]           = useState("list"); // "list" | "form" | "password" | "settings"
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId]         = useState(null);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [bulkConfirm, setBulkConfirm]   = useState(false);
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("all");
  const [errors, setErrors]             = useState({});

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  // Auth guard
  if (!isLoggedIn) {
    navigate("/login", { replace: true });
    return null;
  }

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch("/api/upload-image", { method: "POST", body: formData });
          if (!res.ok) throw new Error(await res.text());
          const { imageUrl } = await res.json();
          return imageUrl;
        })
      );
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
      console.error("[Upload]", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  // ── Derived list ────────────────────────────────────────────────────────
  const visible = items.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Form helpers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setView("form");
  };

  const openEdit = (product) => {
    setForm({
      name:     product.name,
      category: product.category,
      price:    product.price,
      quantity: product.quantity,
      images:   product.images || (product.image ? [product.image] : []),
    });
    setEditingId(product.id);
    setErrors({});
    setView("form");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name     = "Name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
                                  e.price    = "Enter a valid price";
    if (!form.quantity.trim())    e.quantity = "Quantity / MOQ is required";
    if (form.images.length === 0) e.images   = "At least one image is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (editingId !== null) {
      updateProduct(editingId, { ...form, price: Number(form.price) });
    } else {
      addProduct({ ...form, price: Number(form.price) });
    }
    setView("list");
  };

  const confirmDelete = () => {
    deleteProduct(deleteId);
    setDeleteId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    visible.length > 0 && visible.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map((p) => p.id)));
    }
  };

  const confirmBulkDelete = () => {
    selectedIds.forEach((id) => deleteProduct(id));
    setSelectedIds(new Set());
    setBulkConfirm(false);
  };

  const catLabel = (key) =>
    CATEGORY_OPTIONS.find((c) => c.key === key)?.label || key;

  const handleLogout = () => { logout(); navigate("/login"); };

  // ────────────────────────────────────────────────────────────────────────
  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-[#0f0f0f] min-h-screen flex flex-col hidden md:flex">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-0.5">
            <img src="/logo.jpeg" alt="INOUT Logo" className="h-8 w-8 object-contain rounded" />
            <p
              className="text-white font-bold text-lg tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              INOUT
            </p>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <SidebarLink active={view === "list"} onClick={() => setView("list")}>
            <IconList /> Products
          </SidebarLink>
          <SidebarLink active={view === "form" && !editingId} onClick={openAdd}>
            <IconPlus /> Add Product
          </SidebarLink>
          <SidebarLink active={view === "settings"} onClick={() => setView("settings")}>
            <IconSettings /> Settings
          </SidebarLink>
        </nav>
        <div className="px-3 py-5 border-t border-white/10 space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 text-sm font-medium transition-all duration-200"
          >
            <IconArrow /> View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200"
          >
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile brand */}
            <img src="/logo.jpeg" alt="INOUT Logo" className="md:hidden h-7 w-7 object-contain rounded" />
            <span className="md:hidden font-bold text-sm tracking-widest uppercase text-[#0f0f0f]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>INOUT Admin</span>
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {view === "form" ? (editingId ? "Edit Product" : "Add Product") : view === "settings" ? "Settings" : "All Products"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {view === "list" && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f0f0f] text-white text-xs font-medium tracking-wide hover:bg-[#8B2252] transition-colors duration-200"
              >
                <IconPlus /> Add Product
              </button>
            )}
            {(view === "form") && (
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <IconArrow /> Back
              </button>
            )}
            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-400 text-xs font-medium hover:bg-red-50 transition-colors duration-200"
            >
              <IconLogout />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">

          {/* ── PRODUCT LIST ─────────────────────────────────────────── */}
          {view === "list" && (
            <div>
              {/* Bulk action bar */}
              {someSelected && (
                <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <span className="text-sm font-medium text-red-600">
                    {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-400 hover:bg-red-100 transition-colors duration-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setBulkConfirm(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 min-w-[160px] max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2252]/30"
                />
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B2252]/30"
                >
                  <option value="all">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <span className="self-center text-xs text-gray-400">
                  {visible.length} product{visible.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded accent-[#8B2252] cursor-pointer"
                          />
                        </th>
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Image</th>
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Name</th>
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Category</th>
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Price</th>
                        <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">MOQ</th>
                        <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-gray-300 text-xs tracking-widest uppercase">
                            No products found
                          </td>
                        </tr>
                      )}
                      {visible.map((p, i) => (
                        <tr
                          key={p.id}
                          className={`border-b border-gray-50 transition-colors duration-150 ${selectedIds.has(p.id) ? "bg-red-50/50" : "hover:bg-gray-50/70"} ${i === visible.length - 1 ? "border-b-0" : ""}`}
                        >
                          <td className="px-4 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              className="w-4 h-4 rounded accent-[#8B2252] cursor-pointer"
                            />
                          </td>
                          <td className="px-5 py-3">
                            {((p.images && p.images[0]) || p.image) ? (
                              <img
                                src={(p.images && p.images[0]) || p.image}
                                alt={p.name}
                                className="w-10 h-12 object-cover rounded-lg"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-10 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">?</div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                          <td className="px-5 py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium bg-gray-100 text-gray-500">
                              {catLabel(p.category)}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-800">₹{p.price}</td>
                          <td className="px-5 py-3 text-gray-400 text-xs">{p.quantity}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-[#0f0f0f] hover:text-white transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteId(p.id)}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD / EDIT FORM ───────────────────────────────────────── */}
          {view === "form" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-semibold text-gray-800 mb-6">
                  {editingId ? "Edit Product" : "New Product"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Name */}
                  <Field label="Product Name" error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Essential Crew Neck"
                      className={inputCls(errors.name)}
                    />
                  </Field>

                  {/* Category */}
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className={inputCls()}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Price + Quantity row */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price (₹)" error={errors.price}>
                      <input
                        type="number"
                        min="1"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="320"
                        className={inputCls(errors.price)}
                      />
                    </Field>
                    <Field label="MOQ / Quantity" error={errors.quantity}>
                      <input
                        type="text"
                        value={form.quantity}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                        placeholder="MOQ: 50 pcs"
                        className={inputCls(errors.quantity)}
                      />
                    </Field>
                  </div>

                  {/* Image Upload */}
                  <Field label="Product Images" error={errors.images}>
                    <div
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-2 w-full min-h-[108px] border-2 border-dashed rounded-xl transition-all duration-200 ${
                        uploading
                          ? "border-[#8B2252]/30 bg-[#8B2252]/[0.03] cursor-wait"
                          : errors.images
                          ? "border-red-300 bg-red-50/30 cursor-pointer"
                          : "border-gray-200 hover:border-[#8B2252]/45 hover:bg-[#8B2252]/[0.02] bg-gray-50/60 cursor-pointer"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <svg className="w-6 h-6 text-[#8B2252] animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          <p className="text-xs text-[#8B2252] font-medium">Uploading to Cloudinary…</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs text-gray-400 font-medium">Click to upload images</p>
                          <p className="text-[10px] text-gray-300">PNG, JPG, WEBP — multiple allowed</p>
                        </>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Field>

                  {/* Image Previews */}
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      {form.images.map((src, idx) => (
                        <div key={idx} className="relative group w-16 h-20 shrink-0">
                          <img
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-600"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 text-[8px] bg-[#8B2252] text-white px-1 py-0.5 rounded font-medium leading-none">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                      {/* Add more tile */}
                      <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`w-16 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-colors duration-200 shrink-0 ${
                          uploading
                            ? "border-gray-100 cursor-wait opacity-50"
                            : "border-gray-200 cursor-pointer hover:border-[#8B2252]/50"
                        }`}
                      >
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[9px] text-gray-300">Add more</span>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-2.5 rounded-lg bg-[#0f0f0f] text-white text-sm font-medium hover:bg-[#8B2252] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingId ? "Save Changes" : "Add Product"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* ── SETTINGS ──────────────────────────────────────────── */}
          {view === "settings" && <SettingsView />}

        </main>
      </div>

      {/* ── BULK DELETE CONFIRMATION MODAL ──────────────────────────────── */}
      {bulkConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Delete {selectedIds.size} Product{selectedIds.size !== 1 ? "s" : ""}?</h3>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors duration-200"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────── */}
      {deleteId !== null && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
    </PageTransition>
  );
}

// ── Small reusable components ─────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SidebarLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/10 text-white"
          : "text-white/40 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls = (err) =>
  `w-full border ${err ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#8B2252]/20"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow duration-200`;

function IconList() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ── Settings View — 3 separate cards ────────────────────────────────────
function SettingsView() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <WhatsAppCard />
      <InstagramCard />
      <ChangePasswordCard />
    </div>
  );
}

// ── WhatsApp Card ────────────────────────────────────────────────────────
function WhatsAppCard() {
  const { settings, updateSettings } = useSettings();
  const [value, setValue]   = useState(settings.whatsappNumber);
  const [error, setError]   = useState("");
  const [saved, setSaved]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) { setError("WhatsApp number is required"); return; }
    if (!/^\d{10,15}$/.test(v)) { setError("Digits only, 10–15 characters (e.g. 919791639162)"); return; }
    setError("");
    updateSettings({ whatsappNumber: v });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(37,211,102,0.1)" }}>
          <svg className="w-4 h-4" fill="#25D366" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">WhatsApp Number</h3>
          <p className="text-[11px] text-gray-400">Used for all enquiry and floating chat buttons</p>
        </div>
      </div>

      {saved && <SuccessBanner msg="WhatsApp number updated!" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Phone Number" error={error}>
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); setError(""); }}
            placeholder="919791639162"
            className={inputCls(error)}
          />
          <p className="text-[10px] text-gray-400 mt-1">Country code + number, digits only. E.g. 919791639162</p>
        </Field>
        <SaveBtn />
      </form>
    </div>
  );
}

// ── Instagram Card ───────────────────────────────────────────────────────
function InstagramCard() {
  const { settings, updateSettings } = useSettings();
  const [value, setValue]   = useState(settings.instagramLink);
  const [error, setError]   = useState("");
  const [saved, setSaved]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) { setError("Instagram URL is required"); return; }
    if (!v.startsWith("http")) { setError("Enter a valid URL starting with http"); return; }
    setError("");
    updateSettings({ instagramLink: v });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(225,48,108,0.1)" }}>
          <svg className="w-4 h-4" fill="#E1306C" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Instagram Profile</h3>
          <p className="text-[11px] text-gray-400">Used in footer and social links across the site</p>
        </div>
      </div>

      {saved && <SuccessBanner msg="Instagram link updated!" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Profile URL" error={error}>
          <input
            type="url"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); setError(""); }}
            placeholder="https://www.instagram.com/your_handle"
            className={inputCls(error)}
          />
        </Field>
        <SaveBtn />
      </form>
    </div>
  );
}

// ── Change Password Card ─────────────────────────────────────────────────
function ChangePasswordCard() {
  const { changePassword } = useAuth();
  const [pwForm, setPwForm]     = useState({ current: "", newPwd: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [success, setSuccess]   = useState(false);
  const [show, setShow]         = useState({ current: false, newPwd: false, confirm: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current)               errs.current = "Enter your current password";
    if (!pwForm.newPwd)                errs.newPwd  = "Enter a new password";
    else if (pwForm.newPwd.length < 6) errs.newPwd  = "Must be at least 6 characters";
    if (pwForm.newPwd !== pwForm.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    const result = changePassword(pwForm.current, pwForm.newPwd, pwForm.confirm);
    if (result.success) {
      setSuccess(true);
      setPwForm({ current: "", newPwd: "", confirm: "" });
      setPwErrors({});
    } else {
      setPwErrors({ current: result.error });
    }
  };

  const toggleShow = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(139,34,82,0.1)" }}>
          <IconKey />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
          <p className="text-[11px] text-gray-400">Update your admin login credentials</p>
        </div>
      </div>

      {success && <SuccessBanner msg="Password updated successfully!" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[{ key: "current", label: "Current Password", ph: "Enter current password" },
          { key: "newPwd",  label: "New Password",     ph: "Minimum 6 characters" },
          { key: "confirm", label: "Confirm New Password", ph: "Re-enter new password" }
        ].map(({ key, label, ph }) => (
          <Field key={key} label={label} error={pwErrors[key]}>
            <div className="relative">
              <input
                type={show[key] ? "text" : "password"}
                value={pwForm[key]}
                onChange={(e) => { setPwForm((f) => ({ ...f, [key]: e.target.value })); setSuccess(false); }}
                placeholder={ph}
                className={inputCls(pwErrors[key]) + " pr-10"}
              />
              <button type="button" onClick={() => toggleShow(key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show[key] ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </Field>
        ))}
        <SaveBtn label="Update Password" />
      </form>
    </div>
  );
}

// ── Tiny shared helpers ──────────────────────────────────────────────────
function SuccessBanner({ msg }) {
  return (
    <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2.5">
      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <p className="text-sm text-green-700 font-medium">{msg}</p>
    </div>
  );
}

function SaveBtn({ label = "Save Changes" }) {
  return (
    <button
      type="submit"
      className="w-full py-2.5 rounded-lg bg-[#0f0f0f] text-white text-sm font-medium hover:bg-[#8B2252] transition-colors duration-200"
    >
      {label}
    </button>
  );
}
