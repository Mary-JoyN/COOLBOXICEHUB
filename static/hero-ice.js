/**
 * CoolerBox Ice Hub — Animated Ice Cubes Hero Background
 * Renders smooth, translucent 3D-shaded ice cubes floating in chilled water.
 */
(() => {
  const canvas = document.getElementById('hero-ice-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;

  const cubes = [];
  const bubbles = [];
  const CUBE_COUNT = 18;
  const BUBBLE_COUNT = 36;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createCube(randomY = true) {
    const size = rand(38, 108);
    return {
      x: rand(0, width || 1200),
      y: randomY ? rand(-80, (height || 520) + 80) : (height || 520) + size,
      size,
      vx: rand(-0.22, 0.22),
      vy: rand(-0.55, -0.18),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.0045, 0.0045),
      alpha: rand(0.18, 0.45),
      bobPhase: rand(0, Math.PI * 2),
      bobSpeed: rand(0.01, 0.024),
    };
  }

  function createBubble(randomY = true) {
    return {
      x: rand(0, width || 1200),
      y: randomY ? rand(0, height || 520) : (height || 520) + 10,
      r: rand(1.2, 3.8),
      vy: rand(-0.9, -0.35),
      vx: rand(-0.15, 0.15),
      alpha: rand(0.18, 0.55),
    };
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, rect.width);
    height = Math.max(360, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!cubes.length) {
      for (let i = 0; i < CUBE_COUNT; i++) cubes.push(createCube(true));
      for (let i = 0; i < BUBBLE_COUNT; i++) bubbles.push(createBubble(true));
    }
  }

  function roundRectPath(c, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + w, y, x + w, y + h, radius);
    c.arcTo(x + w, y + h, x, y + h, radius);
    c.arcTo(x, y + h, x, y, radius);
    c.arcTo(x, y, x + w, y, radius);
    c.closePath();
  }

  function drawIceCube(cube) {
    const s = cube.size;
    const half = s / 2;
    const r = s * 0.16;

    ctx.save();
    ctx.translate(cube.x, cube.y);
    ctx.rotate(cube.angle);
    ctx.globalAlpha = cube.alpha;

    // Outer translucent ice body
    const bodyGrad = ctx.createLinearGradient(-half, -half, half, half);
    bodyGrad.addColorStop(0, 'rgba(224, 247, 255, 0.85)');
    bodyGrad.addColorStop(0.45, 'rgba(125, 211, 252, 0.35)');
    bodyGrad.addColorStop(1, 'rgba(14, 165, 233, 0.22)');

    roundRectPath(ctx, -half, -half, s, s, r);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Crisp icy rim
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(224, 247, 255, 0.72)';
    ctx.stroke();

    // Inner bevel facet (gives 3D cube depth)
    const inset = s * 0.16;
    const innerSize = s - inset * 2;
    roundRectPath(ctx, -half + inset, -half + inset, innerSize, innerSize, r * 0.65);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.42)';
    ctx.stroke();

    // Diagonal light refraction streak
    ctx.beginPath();
    ctx.moveTo(-half + s * 0.18, -half + s * 0.08);
    ctx.lineTo(-half + s * 0.56, -half + s * 0.08);
    ctx.lineTo(-half + s * 0.16, -half + s * 0.48);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.fill();

    // Tiny trapped air pocket inside cube
    ctx.beginPath();
    ctx.arc(s * 0.1, s * 0.08, Math.max(1.5, s * 0.035), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    ctx.restore();
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);

    // Subtle cool radial glow on right side
    const bgGlow = ctx.createRadialGradient(width * 0.72, height * 0.45, 20, width * 0.72, height * 0.45, width * 0.6);
    bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    bgGlow.addColorStop(1, 'rgba(6, 28, 61, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    for (const c of cubes) {
      if (!reducedMotion) {
        c.bobPhase += c.bobSpeed;
        c.x += c.vx + Math.sin(c.bobPhase) * 0.18;
        c.y += c.vy;
        c.angle += c.spin;
        if (c.y < -c.size - 20) {
          Object.assign(c, createCube(false));
        }
        if (c.x < -c.size) c.x = width + c.size;
        if (c.x > width + c.size) c.x = -c.size;
      }
      drawIceCube(c);
    }

    for (const b of bubbles) {
      if (!reducedMotion) {
        b.y += b.vy;
        b.x += b.vx;
        if (b.y < -10) {
          Object.assign(b, createBubble(false));
        }
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 247, 255, ${b.alpha})`;
      ctx.fill();
    }

    if (!reducedMotion && !document.hidden) {
      rafId = window.requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !reducedMotion && !rafId) {
      rafId = window.requestAnimationFrame(renderFrame);
    } else if (document.hidden && rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  resize();
  renderFrame();
})();
