import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/products";

export default function SidebarMenu({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navigate = useNavigate();

  const handleClick = (key) => {
    onClose();
    setTimeout(() => navigate(`/category/${key}`), 300);
  };

  const handleHome = () => {
    onClose();
    setTimeout(() => navigate('/'), 300);
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[6px] transition-all duration-600 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full w-[80vw] max-w-[300px] sm:max-w-[320px] bg-white transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header: COLLECTIONS label + close */}
          <div className="flex-shrink-0 px-5 sm:px-8 md:px-10 pt-8 sm:pt-10 md:pt-12 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.4em] text-gray-400 mb-1">
                  Browse
                </p>
                <h2 className="text-[15px] font-medium uppercase tracking-[0.35em] text-[#111]">
                  Collections
                </h2>
              </div>
              <button
                onClick={onClose}
                className="mt-1 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-all duration-300 cursor-pointer group"
                aria-label="Close menu"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-300 group-hover:rotate-90"
                >
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="#999"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 sm:mx-8 md:mx-10 h-px bg-gray-200" />

          {/* Menu Items */}
          <nav className="flex-1 px-5 sm:px-8 md:px-10 pt-4 overflow-y-auto">
            <ul>
              {/* Home */}
              <li>
                <button
                  onClick={handleHome}
                  className="group w-full text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between py-4 sm:py-5 md:py-6">
                    <span className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#8B2252] transition-all duration-300 group-hover:text-[#111] group-hover:tracking-[0.35em]">
                      Home
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-gray-300 transition-all duration-300 group-hover:text-[#111] group-hover:translate-x-1 opacity-0 group-hover:opacity-100"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l8 8-8 8" />
                    </svg>
                  </div>
                  <div className="h-px bg-gray-100" />
                </button>
              </li>
              {categories.map((cat, i) => (
                <li key={cat.key}>
                  <button
                    onClick={() => handleClick(cat.key)}
                    className="group w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between py-4 sm:py-5 md:py-6">
                      <span
                        className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#333] transition-all duration-300 group-hover:text-[#111] group-hover:tracking-[0.35em]"
                      >
                        {cat.label}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 transition-all duration-300 group-hover:text-[#111] group-hover:translate-x-1 opacity-0 group-hover:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l8 8-8 8" />
                      </svg>
                    </div>
                    {i < categories.length - 1 && (
                      <div className="h-px bg-gray-100 transition-colors duration-300 group-hover:bg-gray-200" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 sm:px-8 md:px-10 pb-8 sm:pb-10 pt-5 sm:pt-6">
            <div className="h-px bg-gray-100 mb-6" />
            <p className="text-[9px] font-normal uppercase tracking-[0.3em] text-gray-300 leading-relaxed">
              Premium Wholesale Catalogue
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
