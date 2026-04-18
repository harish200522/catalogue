import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/products";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";
import SidebarMenu from "../components/SidebarMenu";
import Header from "../components/Header";
import FireEffect from "../components/FireEffect";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import PageTransition from "../components/PageTransition";

export default function CategoryPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { getByCategory, loading } = useProducts();

  const category = categories.find((c) => c.key === categoryKey);
  const items = getByCategory(categoryKey);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F5F1EC] flex items-center justify-center">
        <p className="text-gray-400 text-sm tracking-widest uppercase">Category not found</p>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#F5F1EC]">
      <Header simple menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(o => !o)} />
      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Page Header */}
      <div
        className="relative w-full pt-24 sm:pt-28 pb-10 sm:pb-14 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0f0f0f 0%, #2d1f1f 60%, #0f0f0f 100%)",
        }}
      >
        <FireEffect />
        {/* Top accent line */}
        <div
          className="h-px w-full mb-10 sm:mb-14"
          style={{
            background:
              "linear-gradient(90deg, transparent, #8B2252, #c0406e, #8B2252, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex items-end justify-between">
          <div>
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-white/40 hover:text-white text-[10px] uppercase tracking-[0.3em] mb-5 transition-colors duration-300 cursor-pointer"
            >
              <svg
                className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">
              Collection
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {category.label}
            </h1>
          </div>

          <p className="text-white/30 text-[11px] tracking-widest uppercase hidden sm:block">
            {loading ? "Loading..." : `${items.length} Products`}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #8B2252, #c0406e, #8B2252, transparent)",
        }}
      />

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] rounded-2xl skeleton-shimmer mb-4" />
                  <div className="space-y-2 px-1">
                    <div className="h-3 rounded skeleton-shimmer w-3/4" />
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 rounded skeleton-shimmer w-1/3" />
                      <div className="h-2.5 rounded skeleton-shimmer w-1/4" />
                    </div>
                  </div>
                </div>
              ))
            : items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
          }
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 sm:mt-20"
        style={{
          background: "linear-gradient(160deg, #0f0f0f 0%, #1a0d0d 60%, #0f0f0f 100%)",
        }}
      >
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #8B2252, #c0406e, #8B2252, transparent)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="font-bold tracking-[0.15em] uppercase text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}
          >
            INOUT FASHION
          </p>
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} INOUT Fashion. All rights reserved.
          </p>
        </div>
      </footer>
      <FloatingWhatsApp />
    </div>
    </PageTransition>
  );
}
