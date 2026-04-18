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
    <header className="fixed top-0 left-0 w-full z-50 shadow-lg" style={{ background: "linear-gradient(90deg, #0f0f0f 0%, #1a0d0d 50%, #0f0f0f 100%)" }}>
      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 h-14">
        {/* Hamburger */}
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

        {/* Tagline — centred */}
        <p
          className={`absolute left-1/2 -translate-x-1/2 text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-light pointer-events-none text-white/70 transition-opacity duration-500 ${
            taglineFade ? "opacity-100" : "opacity-0"
          }`}
        >
          {taglines[taglineIndex]}
        </p>

        {/* Logo — right side */}
        <a href="#" className="block">
          <img src="/logo.jpeg" alt="INOUT Logo" className="h-10 w-auto object-contain" />
        </a>
      </div>
    </header>
  );
}
