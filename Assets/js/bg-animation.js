/* ==========================================================================
   Cyber Grid, Floating Orbs & Tactical Starfield Background
   High-performance, pure Canvas WebGL-inspired engine.
   ========================================================================== */

(function () {
  function startBackground() {
    if (document.getElementById('bgSceneCanvas')) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bgSceneCanvas';
    canvas.className = 'bg-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pointer state
    let mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      hasMoved: false
    };

    window.addEventListener('pointermove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.hasMoved = true;
    }, { passive: true });

    // 1. Perspective 3D Matrix Grid parameters
    let gridOffsetZ = 0;

    // 2. Tactical Glowing Floating Nodes / Energy Motes
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const NODE_COUNT = isMobile ? 38 : 72;
    const nodes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2, // depth factor
        radius: Math.random() * 2.2 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.5 + 0.25,
        isAccent: Math.random() > 0.45 // 55% glowing neon green
      });
    }

    // Main Render Loop
    let rafId;
    function render(time) {
      // Smooth lerp mouse
      if (mouse.hasMoved) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      ctx.clearRect(0, 0, width, height);

      // --- LAYER 1: Deep Atmospheric Ambient Nebulae (Glow Spheres) ---
      const grad1X = width * 0.75 + (mouse.x - width * 0.5) * 0.06;
      const grad1Y = height * 0.25 + (mouse.y - height * 0.5) * 0.06;
      const rad1 = ctx.createRadialGradient(grad1X, grad1Y, 0, grad1X, grad1Y, Math.max(width, height) * 0.45);
      rad1.addColorStop(0, 'rgba(166, 255, 107, 0.045)');
      rad1.addColorStop(0.5, 'rgba(166, 255, 107, 0.012)');
      rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const grad2X = width * 0.25 - (mouse.x - width * 0.5) * 0.04;
      const grad2Y = height * 0.75 - (mouse.y - height * 0.5) * 0.04;
      const rad2 = ctx.createRadialGradient(grad2X, grad2Y, 0, grad2X, grad2Y, Math.max(width, height) * 0.4);
      rad2.addColorStop(0, 'rgba(56, 189, 248, 0.03)');
      rad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: Tactical Infinite Ground Plane Perspective Grid ---
      gridOffsetZ = (time * 0.02) % 40;
      const horizonY = height * 0.55;
      const fov = 340;
      const vanishX = width * 0.5 + (mouse.x - width * 0.5) * 0.08;

      ctx.save();
      ctx.lineWidth = 1;

      // Draw Perspective Grid lines receding toward horizon
      for (let x = -width * 0.6; x <= width * 1.6; x += 65) {
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(x, height);
        ctx.strokeStyle = 'rgba(166, 255, 107, 0.038)';
        ctx.stroke();
      }

      // Draw horizontal cross-stripes moving forward
      for (let z = 30; z < 500; z += 35) {
        const effZ = (z + gridOffsetZ) % 470 + 30;
        const lineY = horizonY + (fov * (height - horizonY)) / (effZ + fov);
        if (lineY > horizonY && lineY <= height) {
          const depthRatio = (lineY - horizonY) / (height - horizonY);
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(width, lineY);
          ctx.strokeStyle = `rgba(166, 255, 107, ${depthRatio * 0.055})`;
          ctx.stroke();
        }
      }
      ctx.restore();

      // --- LAYER 3: Constellation Connecting Lines ---
      const maxConnectDist = isMobile ? 110 : 160;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.16 * nodes[i].z * nodes[j].z;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            if (nodes[i].isAccent || nodes[j].isAccent) {
              ctx.strokeStyle = `rgba(166, 255, 107, ${alpha * 1.6})`;
            } else {
              ctx.strokeStyle = `rgba(180, 210, 240, ${alpha})`;
            }
            ctx.stroke();
          }
        }
      }

      // --- LAYER 4: Interactive Cursor Energy Tether ---
      if (mouse.hasMoved) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 180) {
            const tetherAlpha = (1 - dist / 180) * 0.35 * n.z;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(166, 255, 107, ${tetherAlpha})`;
            ctx.stroke();
          }
        }
      }

      // --- LAYER 5: Tactical Glowing Nodes ---
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Drift
        n.x += n.vx * n.z;
        n.y += n.vy * n.z;

        // Wrap edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // Subtle mouse deflection
        if (mouse.hasMoved) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140 && dist > 0) {
            const push = (1 - dist / 140) * 1.5 * n.z;
            n.x += (dx / dist) * push;
            n.y += (dy / dist) * push;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * n.z, 0, Math.PI * 2);
        if (n.isAccent) {
          ctx.fillStyle = `rgba(166, 255, 107, ${n.alpha})`;
          ctx.shadowColor = 'rgba(166, 255, 107, 0.85)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(225, 235, 245, ${n.alpha * 0.8})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(render);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBackground);
  } else {
    startBackground();
  }
})();
