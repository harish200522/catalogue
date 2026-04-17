import { useEffect, useRef } from "react";

export default function FireEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Diagonal Cinema Light Rays ──────────────────────────────
    const BEAM_COUNT = 7;
    const beams = Array.from({ length: BEAM_COUNT }, (_, i) => ({
      x: (i / BEAM_COUNT) * canvas.width * 1.8 - canvas.width * 0.4,
      width: 30 + Math.random() * 120,
      speed: 0.18 + Math.random() * 0.14,
      maxAlpha: 0.06 + Math.random() * 0.1,
      phase: (i / BEAM_COUNT) * Math.PI * 2 + Math.random(),
      gold: Math.random() < 0.4,
    }));

    const drawBeam = (beam) => {
      const alpha = beam.maxAlpha * (0.4 + 0.6 * Math.sin(frame * 0.014 + beam.phase));
      // slowly drift right
      beam.x += beam.speed;
      if (beam.x > canvas.width * 1.5) beam.x = -canvas.width * 0.5;

      const angle = Math.PI / 3.8; // ~47° diagonal
      const dX = Math.cos(angle);
      const dY = Math.sin(angle);
      const pX = -dY;
      const pY = dX;
      const hw = beam.width / 2;
      const len = (canvas.height / dY) * 1.3;

      const sx = beam.x, sy = 0;
      const ex = sx + dX * len, ey = dY * len;

      const [r, g, b] = beam.gold ? [255, 210, 80] : [255, 255, 255];
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.12, `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.88, `rgba(${r},${g},${b},${alpha * 0.3})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.moveTo(sx + pX * hw, sy + pY * hw);
      ctx.lineTo(sx - pX * hw, sy - pY * hw);
      ctx.lineTo(ex - pX * hw, ey - pY * hw);
      ctx.lineTo(ex + pX * hw, ey + pY * hw);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    };

    // ── Fast Metallic Streak Particles ──────────────────────────
    class Streak {
      constructor(stagger) {
        this.reset(stagger);
      }
      reset(stagger = false) {
        this.x = Math.random() * canvas.width;
        this.y = stagger ? Math.random() * canvas.height : canvas.height * 0.1 + Math.random() * canvas.height * 0.8;
        const spd = 4 + Math.random() * 7;
        const angle = -(Math.PI * 0.18) + (Math.random() - 0.5) * 0.25;
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        this.tail = 25 + Math.random() * 60;
        this.alpha = 0.35 + Math.random() * 0.55;
        this.life = stagger ? Math.floor(Math.random() * 50) : 0;
        this.maxLife = 25 + Math.random() * 45;
        this.lw = 0.4 + Math.random() * 1.6;
        this.gold = Math.random() < 0.45;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life >= this.maxLife || this.x > canvas.width + 120 || this.x < -120 || this.y < -120) {
          this.reset();
        }
      }
      draw() {
        const t = this.life / this.maxLife;
        const a = this.alpha * (1 - t * t);
        const mag = Math.hypot(this.vx, this.vy);
        const tailX = this.x - (this.vx / mag) * this.tail;
        const tailY = this.y - (this.vy / mag) * this.tail;
        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        // Flame tail: deep red → orange → bright yellow-white tip
        grad.addColorStop(0,    `rgba(120,10,0,0)`);
        grad.addColorStop(0.25, `rgba(200,30,0,${a * 0.3})`);
        grad.addColorStop(0.55, `rgba(255,100,0,${a * 0.65})`);
        grad.addColorStop(0.8,  `rgba(255,200,40,${a * 0.85})`);
        grad.addColorStop(1,    `rgba(255,240,180,${a})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.lw;
        ctx.stroke();
      }
    }

    const streaks = Array.from({ length: 55 }, () => new Streak(true));

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "screen";

      beams.forEach(drawBeam);
      streaks.forEach(s => { s.update(); s.draw(); });

      ctx.globalCompositeOperation = "source-over";
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

