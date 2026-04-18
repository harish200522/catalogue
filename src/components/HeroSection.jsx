import FireEffect from "./FireEffect";

export default function HeroSection() {
  return (
    <section>
      {/* Hero Image Banner */}
      <div className="relative w-full h-[42vh] sm:h-[52vh] md:h-[65vh] lg:h-[75vh] overflow-hidden">
        {/* Original hero image with brand name */}
        <div
          className="hero-image absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <FireEffect />
      </div>

      {/* Content Below Image */}
      <div className="hero-content max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-16 pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 text-center flex flex-col items-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-[-0.01em] text-[#111]">
          Redefining Wholesale <span className="text-[#8B2252] font-light italic inline-block animate-[float3d_3s_ease-in-out_infinite]" style={{ textShadow: '2px 2px 4px rgba(139, 34, 82, 1), 4px 4px 8px rgba(139, 34, 82, 0.6)' }}>Fashion</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-[#3B1A15] max-w-lg leading-[1.8] font-light" style={{ textShadow: '1px 1px 3px rgba(59, 26, 21, 0.8)' }}>
          Premium quality clothing, curated for wholesalers who demand excellence. Minimum orders, maximum impact.
        </p>
      </div>
    </section>
  );
}
