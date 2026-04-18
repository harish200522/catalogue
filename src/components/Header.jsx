import { useState, useEffect } from "react";

const taglines = [
  "Premium Quality. Wholesale Excellence.",
  "Designed for Bulk. Crafted for Style.",
  "Minimal Orders. Maximum Impact.",
  "Elevate Your Store Collection.",
];

export default function Header({ onMenuToggle, menuOpen, simple = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);

  useEffect(() => {
    if (simple) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [simple]);

  useEffect(() => {
    if (simple || !scrolled) return;
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [scrolled, simple]);

  // Simple static header for non-home pages
  if (simple) {
    return (
      <header className="fixed top-0 left-0 w-full z-50">
        <div
          className="w-full relative"
          style={{ background: "linear-gradient(90deg, #0f0f0f 0%, #1a0d0d 50%, #0f0f0f 100%)" }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 h-14">
            <div className="relative ml-2">
              <input
                type="checkbox"
                className="check"
                id="header-menu-check"
                checked={menuOpen}
                onChange={onMenuToggle}
              />
              <label
                className="hamburger-button"
                htmlFor="header-menu-check"
                style={{ "--hamburger-color": "white" }}
              >
                <div className="line1" />
                <div className="line2" />
                <div className="line3" />
              </label>
            </div>
            <a href="/" className="block">
              <img src="/logo.jpeg" alt="INOUT Logo" className="h-9 w-auto object-contain" />
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Tagline Strip — slides in on scroll */}
      <div
        className={`w-full relative overflow-hidden transition-all duration-500 ease-out ${
          scrolled
            ? "max-h-10 opacity-100 border-b border-white/20"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-1.5 flex items-center justify-center">
          <p
            className={`text-[11px] md:text-xs tracking-[0.2em] uppercase font-medium transition-opacity duration-500 ease-in-out ${
              taglineFade ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: "#8B2252" }}
          >
            {taglines[taglineIndex]}
          </p>
        </div>
      </div>

      {/* Main Header Bar — always white, always visible */}
      <div className="w-full bg-white border-b border-[#eee]">
        <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 h-14">
          {/* Hamburger — checkbox+label UIverse button */}
          <div className="relative ml-2">
            <input
              type="checkbox"
              className="check"
              id="header-menu-check"
              checked={menuOpen}
              onChange={onMenuToggle}
            />
            <label
              className="hamburger-button"
              htmlFor="header-menu-check"
              style={{ "--hamburger-color": "#111" }}
            >
              <div className="line1" />
              <div className="line2" />
              <div className="line3" />
            </label>
          </div>

          {/* Logo — right side */}
          <a href="#" className="block">
            <img
              src="/logo.jpeg"
              alt="INOUT Logo"
              className="w-auto object-contain h-10"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
