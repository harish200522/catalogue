import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

function ProductCardSkeleton() {
  return (
    <div>
      {/* Image block */}
      <div className="aspect-[3/4] rounded-2xl skeleton-shimmer mb-4" />
      {/* Info lines */}
      <div className="space-y-2 px-1">
        <div className="h-3 rounded skeleton-shimmer w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-3.5 rounded skeleton-shimmer w-1/3" />
          <div className="h-2.5 rounded skeleton-shimmer w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function CategorySection({ id, label, items, loading }) {
  const navigate = useNavigate();

  return (
    <section id={id} className="scroll-mt-28">
      {/* Section Header */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 mb-8 sm:mb-10 md:mb-12 overflow-hidden border-l-0"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 50%, #1a1a1a 100%)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }}
        />
        {/* Accent line left */}
        <div className="absolute left-0 top-0 h-full w-1" style={{ background: "linear-gradient(180deg, #8B2252, #c0406e)" }} />
        <h2 className="relative text-sm sm:text-base font-semibold tracking-[0.1em] uppercase text-white pl-3">
          {label}
        </h2>
        <button
          onClick={() => navigate(`/category/${id}`)}
          className="relative group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all duration-300 font-medium cursor-pointer"
        >
          View all
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/20 group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300">
            <svg className="w-2.5 h-2.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
        }
      </div>
    </section>
  );
}
