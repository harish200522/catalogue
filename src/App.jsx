import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import SidebarMenu from "./components/SidebarMenu";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import CategoryPage from "./pages/CategoryPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import PageTransition from "./components/PageTransition";
import { categories } from "./data/products";
import { useProducts } from "./context/ProductContext";
import { useSettings } from "./context/SettingsContext";

// ── Loading skeleton for product cards ──────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-gray-200 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { getByCategory, loading } = useProducts();
  const { settings } = useSettings();

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#F5F1EC] pt-14">
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(o => !o)} />
      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <HeroSection />

      {/* Category Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="py-10 sm:py-14 md:py-16 lg:py-20 space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-28">
          {categories.map((cat) => (
            <CategorySection
              key={cat.key}
              id={cat.key}
              label={cat.label}
              items={loading ? [] : getByCategory(cat.key, 5)}
              loading={loading}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
        <footer className="mt-8" style={{ background: "linear-gradient(160deg, #0f0f0f 0%, #1a0d0d 60%, #0f0f0f 100%)" }}>
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #8B2252, #c0406e, #8B2252, transparent)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-14 sm:py-16 md:py-20">
          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 md:gap-16">

            {/* Brand */}
            <div>
              <p
                className="font-bold tracking-[0.15em] uppercase text-white mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", letterSpacing: "0.18em" }}
              >
                INOUT FASHION
              </p>
              <p className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: "#8B2252" }}>
                Premium Wholesale Clothing
              </p>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs font-light italic">
                "Dress the man. Build the brand. <br />Every stitch tells a story."
              </p>
            </div>

            {/* Contact & Address */}
            <div className="space-y-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/30 font-medium mb-4">
                Get In Touch
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#8B2252" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Senguthapuram, 2nd Cross<br />Karur, Tamil Nadu — 639002
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#8B2252" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-xs text-white/50">+91 97916 39162</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#8B2252" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-white/50">hello@inoutfashion.in</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/30 font-medium mb-6">
                Follow & Connect
              </p>
              <div className="flex flex-col gap-3">
                {/* Instagram */}
                <a
                  href={settings.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-white text-sm font-semibold transition-opacity duration-200 hover:opacity-90 active:scale-[0.97]"
                  style={{ width: "160px", height: "38px", borderRadius: "30px", background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", flexShrink: 0 }}
                >
                  <span>Follow Us!</span>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-white text-sm font-semibold transition-opacity duration-200 hover:opacity-90 active:scale-[0.97]"
                  style={{ width: "160px", height: "38px", borderRadius: "30px", background: "linear-gradient(135deg, #25D366, #128C7E)", flexShrink: 0 }}
                >
                  <span>Chat Now!</span>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 sm:mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-white/20 tracking-widest uppercase">
              &copy; {new Date().getFullYear()} INOUT Fashion. All rights reserved.
            </p>
            <p className="text-[10px] text-white/20 tracking-widest uppercase">
              Wholesale · Bulk Orders · Pan India Delivery
            </p>
          </div>
        </div>
      </footer>
      <FloatingWhatsApp />
    </div>
    </PageTransition>
  );
}

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryKey" element={<CategoryPage />} />
        <Route path="/inout" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
