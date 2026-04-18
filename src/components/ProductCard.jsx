import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { generateWhatsAppLink } from "../utils/whatsapp";
import { useSettings } from "../context/SettingsContext";

// ── Product Image Gallery Modal ───────────────────────────────────────────
function ProductModal({ product, waLink, onClose }) {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.image ? [product.image] : [];
  const [active, setActive] = useState(0);

  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  // ESC to close, arrow keys to navigate
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,5,0.78)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-3xl flex flex-col sm:flex-row overflow-hidden"
        style={{
          borderRadius: "16px",
          height: "82vh",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors duration-200"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Left: Image viewer ──────────────────────────────────────── */}
        <div className="bg-[#f5f1ec] sm:w-[55%] shrink-0 flex flex-col border-r border-black/[0.04]" style={{ minHeight: 0, flex: "0 0 55%" }}>
          {/* Main image — fills all available height */}
          <div className="relative flex-1 overflow-hidden">
            <img
              key={active}
              src={images[active]}
              alt={`${product.name} — image ${active + 1}`}
              className="w-full h-full object-cover"
              style={{ animation: "modalImgIn 0.22s ease" }}
            />

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[10px] text-white font-medium tracking-widest z-10"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                {active + 1} / {images.length}
              </div>
            )}
            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ background: "rgba(0,0,0,0.45)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ background: "rgba(0,0,0,0.45)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-2.5 overflow-x-auto shrink-0" style={{ background: "rgba(255,255,255,0.7)" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200"
                  style={{ borderColor: i === active ? "#8B2252" : "transparent", opacity: i === active ? 1 : 0.5 }}>
                  <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product details — scrollable body + pinned WA button ── */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-2 mt-1" style={{ color: "#8B2252" }}>
              INOUT FASHION
            </p>
            <h2
              className="text-xl sm:text-2xl font-bold text-[#111] leading-tight mb-3 pr-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em" }}
            >
              {product.name}
            </h2>
            <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, #8B2252, transparent)" }} />

            <div className="space-y-3 mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#111]">₹{product.price}</span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">/ piece</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#8B2252" }} />
                <span className="text-sm text-gray-500 font-medium">{product.quantity} <span className="text-xs text-gray-400 uppercase tracking-widest">total piece</span></span>
              </div>
            </div>

            <p className="text-[11px] text-black leading-relaxed">
              Contact us on WhatsApp to enquire about bulk pricing, colour variants, and delivery timelines.
            </p>
          </div>

          {/* WhatsApp button — always pinned at bottom, never clipped */}
          <div className="shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-white">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-white text-sm font-semibold tracking-wide transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 18px rgba(37,211,102,0.35)" }}
            >
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalImgIn { from { opacity:0; transform:scale(1.03); } to { opacity:1; transform:scale(1); } }
        @media (min-width:640px) {
          .modal-img-host { height: auto !important; max-height: none !important; flex: 1 1 0%; }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Product Card ──────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { settings } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const waLink = generateWhatsAppLink(product, settings.whatsappNumber);
  const thumb  = (product.images && product.images[0]) || product.image || "";

  return (
    <>
    {modalOpen && (
      <ProductModal product={product} waLink={waLink} onClose={() => setModalOpen(false)} />
    )}
    <div className="group cursor-pointer select-none transition-transform duration-300 ease-out hover:scale-[1.01] active:scale-[0.98]" onClick={() => setModalOpen(true)}>
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] overflow-hidden mb-4 rounded-2xl border border-black/[0.04]"
        style={{
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <img
          src={thumb}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {/* Premium gradient overlay — bottom fade */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(to top, rgba(26,10,10,0.7) 0%, transparent 55%)" }}
        />
        {/* Multi-image badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.5)" }}>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {product.images.length}
          </div>
        )}
        {/* MOQ badge + WhatsApp button — slide up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out px-3 pb-3 pt-2 flex items-end justify-between gap-2">
          <span
            className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
          >
            {product.quantity}
          </span>
          {/* WhatsApp enquire button — desktop hover */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[10px] font-semibold tracking-wide transition-all duration-200 active:scale-95"
            style={{ background: "#25D366", boxShadow: "0 2px 10px rgba(37,211,102,0.4)" }}
          >
            <svg width="11" height="11" fill="white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Order Now
          </a>
        </div>
        {/* Accent corner tag */}
        <div
          className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "#8B2252" }}
        />
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-1">
        <h3 className="text-xs sm:text-sm font-semibold text-[#111] leading-snug tracking-wide group-hover:text-[#8B2252] transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#111]">
            ₹{product.price}
          </span>
          <span className="text-[12px]" style={{ color: "#888" }}>
            Min. qty: {product.quantity}
          </span>
        </div>
        {/* Bottom accent line — grows on hover */}
        <div className="h-px bg-gray-200 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-0 group-hover:w-full transition-all duration-500 ease-out"
            style={{ background: "linear-gradient(90deg, #8B2252, #c0406e)" }}
          />
        </div>
        {/* Mobile-always-visible WhatsApp button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="sm:hidden flex items-center justify-center gap-1.5 w-full py-2 mt-1 rounded-xl text-white text-[11px] font-semibold tracking-wide transition-all duration-300 active:scale-95 hover:opacity-90"
          style={{ background: "#25D366" }}
        >
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Order Now
        </a>
      </div>
    </div>
    </>
  );
}
