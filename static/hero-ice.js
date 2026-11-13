/**
 * CoolerBox Ice Hub — Ice Cubes Dropping into Water Hero Animation
 * Simulates 3D-shaded ice cubes dropping under gravity into chilled water,
 * creating splashes, surface ripples, buoyancy bobbing, and rising bubbles.
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
  let wavePhase = 0;

  const cubes = [];
  const splashes = [];
  const ripples = [];
  const bubbles = [];

  const CUBE_COUNT = 12;
  const WATER_RATIO = 0.58; // Waterline at 58% of hero height

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function waterYAt(x) {
    const base = (height || 520) * WATER_RATIO;
    return (
      base +
      Math.sin(x * 0.012 + wavePhase) * 4 +
      Math.cos(x * 0.025 - wavePhase * 1.4) * 2.5
    );
  }

  function createCube(staggered = false) {
    const size = rand(40, 88);
    const w = width || 1200;
    const h = height || 520;
    return {
      x: rand(w * 0.15, w * 0.92),
      y: staggered ? rand(-h * 0.8, h * 0.85) : rand(-size * 3, -size),
      size,
      vx: rand(-0.4, 0.4),
      vy: staggered ? rand(1.0, 3.2) : rand(1.2, 2.8),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.02, 0.02),
      alpha: rand(0.42, 0.72),
      inWater: false,
      ageInWater: 0,
    };
  }

  function spawnSplash(x, y, size) {
    const count = Math.min(18, Math.max(8, Math.floor(size / 5)));
    for (let i = 0; i < count; i++) {
      const angle = rand(-Math.PI * 0.88, -Math.PI * 0.12);
      const speed = rand(2.2, 6.2);
      splashes.push({
        x: x + rand(-size * 0.25, size * 0.25),
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: rand(1.6, 4.2),
        life: 1,
      });
    }
    ripples.push({
      x,
      y: y + 2,
      rx: size * 0.3,
      ry: size * 0.09,
      maxRx: size * 1.8,
      life: 1,
    });
    for (let i = 0; i < 6; i++) {
      bubbles.push({
        x: x + rand(-size * 0.3, size * 0.3),
        y: y + rand(8, 30),
        vx: rand(-0.35, 0.35),
        vy: rand(-1.8, -0.7),
        r: rand(1.5, 4.0),
        life: 1,
      });
    }
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
      for (let i = 0; i < CUBE_COUNT; i++) {
        cubes.push(createCube(true));
      }
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
    ctx.globalAlpha = cube.alpha * (cube.inWater ? Math.max(0.15, 1 - cube.ageInWater / 260) : 1);

    const bodyGrad = ctx.createLinearGradient(-half, -half, half, half);
    bodyGrad.addColorStop(0, 'rgba(235, 250, 255, 0.92)');
    bodyGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.42)');
    bodyGrad.addColorStop(1, 'rgba(14, 165, 233, 0.25)');

    roundRectPath(ctx, -half, -half, s, s, r);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(224, 247, 255, 0.8)';
    ctx.stroke();

    const inset = s * 0.16;
    const innerSize = s - inset * 2;
    roundRectPath(ctx, -half + inset, -half + inset, innerSize, innerSize, r * 0.65);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.48)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-half + s * 0.18, -half + s * 0.08);
    ctx.lineTo(-half + s * 0.56, -half + s * 0.08);
    ctx.lineTo(-half + s * 0.16, -half + s * 0.48);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    ctx.restore();
  }

  function drawWaterSurface() {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 24) {
      ctx.lineTo(x, waterYAt(x));
    }
    ctx.lineTo(width, height);
    ctx.closePath();

    const waterGrad = ctx.createLinearGradient(0, height * WATER_RATIO, 0, height);
    waterGrad.addColorStop(0, 'rgba(0, 165, 239, 0.28)');
    waterGrad.addColorStop(0.4, 'rgba(0, 109, 166, 0.38)');
    waterGrad.addColorStop(1, 'rgba(6, 28, 61, 0.65)');
    ctx.fillStyle = waterGrad;
    ctx.fill();

    // Shimmering waterline highlight
    ctx.beginPath();
    for (let x = 0; x <= width; x += 20) {
      const y = waterYAt(x);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.52)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    if (!reducedMotion) wavePhase += 0.035;

    // Update & draw cubes
    for (const c of cubes) {
      if (!reducedMotion) {
        const surfaceY = waterYAt(c.x);
        if (!c.inWater) {
          c.vy += 0.16; // Gravity acceleration as cube drops
          c.x += c.vx;
          c.y += c.vy;
          c.angle += c.spin;

          if (c.y >= surfaceY) {
            c.inWater = true;
            c.vy *= 0.38; // Water impact drag
            c.spin *= 0.35;
            spawnSplash(c.x, surfaceY, c.size);
          }
        } else {
          c.ageInWater += 1;
          // Buoyancy + water drag
          c.vy += (surfaceY + c.size * 0.22 - c.y) * 0.015;
          c.vy *= 0.94;
          c.vx *= 0.97;
          c.x += c.vx;
          c.y += c.vy;
          c.angle += c.spin;

          if (c.ageInWater > 260) {
            Object.assign(c, createCube(false));
          }
        }
      }
      drawIceCube(c);
    }

    drawWaterSurface();

    // Draw expanding water ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      if (!reducedMotion) {
        r.rx += 1.9;
        r.ry += 0.5;
        r.life -= 0.022;
      }
      if (r.life <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(224, 247, 255, ${r.life * 0.65})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Draw splash droplets
    for (let i = splashes.length - 1; i >= 0; i--) {
      const p = splashes[i];
      if (!reducedMotion) {
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.028;
      }
      if (p.life <= 0) {
        splashes.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 247, 255, ${p.life * 0.85})`;
      ctx.fill();
    }

    // Draw rising air bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (!reducedMotion) {
        b.x += b.vx + Math.sin(wavePhase + i) * 0.15;
        b.y += b.vy;
        b.life -= 0.012;
      }
      if (b.life <= 0 || b.y < waterYAt(b.x)) {
        bubbles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 247, 255, ${b.life * 0.6})`;
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
