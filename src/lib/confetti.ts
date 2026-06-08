type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
};

const CONFETTI_COLORS = ["#1f6b42", "#2d7a4f", "#4a9b6a", "#e8a838", "#fff4dc", "#b8dcc4"];

export function fireConfetti(durationMs = 3200): void {
  if (typeof window === "undefined") {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const ctx = context;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.38;
  const particles: ConfettiParticle[] = Array.from({ length: 140 }, () => ({
    x: originX + (Math.random() - 0.5) * 80,
    y: originY + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -16 - 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? "#1f6b42",
    size: Math.random() * 8 + 4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.25,
    shape: Math.random() > 0.45 ? "rect" : "circle",
  }));

  const startedAt = performance.now();

  function drawFrame(now: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.32;
      particle.vx *= 0.99;
      particle.rotation += particle.rotationSpeed;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;

      if (particle.shape === "rect") {
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.65);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (now - startedAt < durationMs) {
      requestAnimationFrame(drawFrame);
      return;
    }

    canvas.remove();
  }

  requestAnimationFrame(drawFrame);
}
