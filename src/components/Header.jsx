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
      {/* Main Header Bar */}
      <div
        className={`w-full relative overflow-hidden transition-all duration-300 ease-out ${
          scrolled ? "shadow-sm" : "shadow-none"
        }`}
      >
        {/* Background image — visible only when scrolled */}
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: "url('/hero-bg.jpeg')", backgroundPosition: "center center" }}
        />
        {/* Frosted overlay when scrolled */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            scrolled ? "bg-white/15 backdrop-blur-[2px]" : "bg-transparent"
          }`}
        />
        <div
          className={`relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16 md:h-20"
          }`}
        >
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
              style={{ "--hamburger-color": scrolled ? "#111" : "white" }}
            >
              <div className="line1" />
              <div className="line2" />
              <div className="line3" />
            </label>
          </div>

          {/* Tagline — visible in centre when scrolled */}
          <p
            className={`absolute left-1/2 -translate-x-1/2 text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-light transition-all duration-500 ease-in-out pointer-events-none ${
              scrolled ? "opacity-100 text-white/90" : "opacity-0"
            } ${taglineFade ? "opacity-100" : "opacity-0"}`}
          >
            {taglines[taglineIndex]}
          </p>

          {/* Logo — right side */}
          <a href="#" className="block">
            <img
              src="/logo.jpeg"
              alt="INOUT Logo"
              className={`w-auto object-contain transition-all duration-300 ${
                scrolled ? "h-10 md:h-12" : "h-14 md:h-16"
              }`}
            />
          </a>
        </div>
      </div>
    </header>
  );
}
