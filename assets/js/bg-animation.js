/* ==========================================================================
   Multi-Mode Ambient Background Canvas Engine
   Modes:
   1. 'grid'   - 3D Perspective Cyber Grid + Volumetric Orbs & Tactical Nodes
   2. 'stars'  - Deep Volumetric Space Starfield & Cosmic Floating Motes
   3. 'matrix' - Streaming Neon Digital Rain / Unreal Engine C++ Glyphs
   ========================================================================== */

(function () {
  let currentPreset = 'grid'; // 'grid' | 'stars' | 'matrix'

  try {
    const saved = localStorage.getItem('ayush_bg_preset');
    if (saved && ['grid', 'stars', 'matrix'].includes(saved)) {
      currentPreset = saved;
    }
  } catch (e) {}

  window.getBgPreset = function () {
    return currentPreset;
  };

  window.setBgPreset = function (preset) {
    if (['grid', 'stars', 'matrix'].includes(preset)) {
      currentPreset = preset;
      try { localStorage.setItem('ayush_bg_preset', preset); } catch (e) {}
      window.dispatchEvent(new CustomEvent('bgpresetchange', { detail: { preset } }));
    }
  };

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
      initMatrixColumns();
      initStars();
    }

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

    // Mode 1: Cyber Grid Data
    let gridOffsetZ = 0;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const NODE_COUNT = isMobile ? 36 : 68;
    const nodes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        radius: Math.random() * 2.2 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        alpha: Math.random() * 0.5 + 0.25,
        isAccent: Math.random() < 0.22
      });
    }

    // Mode 2: Deep Starfield Data
    const STAR_COUNT = isMobile ? 90 : 160;
    let stars = [];
    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 1.5 + 0.5,
          size: Math.random() * 2.2 + 0.8,
          speed: (Math.random() * 0.6 + 0.2),
          twinkle: Math.random() * Math.PI * 2,
          isCyan: Math.random() < 0.35
        });
      }
    }

    // Mode 3: Matrix Code Rain Data
    const glyphs = '01UE5CPPFActorFVectorRPCGASBOOSTNETBTEQSLOD';
    let matrixCols = [];
    function initMatrixColumns() {
      const colWidth = 20;
      const count = Math.ceil(width / colWidth);
      matrixCols = [];
      for (let i = 0; i < count; i++) {
        matrixCols.push({
          x: i * colWidth,
          y: Math.random() * -500,
          speed: Math.random() * 2.5 + 1.8,
          chars: Array.from({ length: 18 }, () => glyphs[Math.floor(Math.random() * glyphs.length)])
        });
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rafId;

    function render(time) {
      // Smooth pointer lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // ======================================================================
      // PRESET 1: CYBER GRID + VOLUMETRIC GLOW
      // ======================================================================
      if (currentPreset === 'grid') {
        const horizonY = height * 0.62;
        const vanishX = width * 0.5 + (mouse.x - width * 0.5) * 0.08;
        const vanishY = horizonY - 40;

        gridOffsetZ = (gridOffsetZ + 0.65) % 40;

        // Radial Atmospheric Glow
        const grad1 = ctx.createRadialGradient(vanishX, vanishY, 20, vanishX, vanishY, Math.max(width, height) * 0.7);
        grad1.addColorStop(0, 'rgba(166, 255, 107, 0.07)');
        grad1.addColorStop(0.35, 'rgba(18, 28, 22, 0.04)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        // Perspective Ground Grid Lines
        ctx.lineWidth = 1;
        const perspLines = isMobile ? 12 : 22;
        for (let i = -perspLines; i <= perspLines; i++) {
          const bottomX = width * 0.5 + i * (width / perspLines) * 1.5;
          ctx.beginPath();
          ctx.moveTo(vanishX, vanishY);
          ctx.lineTo(bottomX, height);
          ctx.strokeStyle = (i === 0) ? 'rgba(166, 255, 107, 0.28)' : 'rgba(166, 255, 107, 0.075)';
          ctx.stroke();
        }

        // Horizontal Depth Strides
        const horizonStrides = isMobile ? 10 : 16;
        for (let k = 0; k < horizonStrides; k++) {
          const depthProgress = Math.pow((k + gridOffsetZ / 40) / horizonStrides, 2.4);
          const currentY = vanishY + depthProgress * (height - vanishY);
          if (currentY > vanishY && currentY <= height) {
            const alpha = Math.min(depthProgress * 0.35, 0.25);
            ctx.beginPath();
            ctx.moveTo(0, currentY);
            ctx.lineTo(width, currentY);
            ctx.strokeStyle = `rgba(166, 255, 107, ${alpha})`;
            ctx.stroke();
          }
        }

        // Floating Tactical Nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx * n.z;
          n.y += n.vy * n.z;
          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * n.z, 0, Math.PI * 2);
          ctx.fillStyle = n.isAccent ? `rgba(166, 255, 107, ${n.alpha})` : `rgba(225, 235, 245, ${n.alpha * 0.7})`;
          ctx.fill();
        }
      }

      // ======================================================================
      // PRESET 2: DEEP STARFIELD & SPACE MOTES
      // ======================================================================
      else if (currentPreset === 'stars') {
        // Deep Nebula Glow
        const nebGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, width * 0.5, height * 0.5, width * 0.7);
        nebGrad.addColorStop(0, 'rgba(80, 160, 255, 0.06)');
        nebGrad.addColorStop(0.5, 'rgba(166, 255, 107, 0.03)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.y += s.speed * s.z;
          s.twinkle += 0.04;
          if (s.y > height + 10) {
            s.y = -10;
            s.x = Math.random() * width;
          }

          const currentAlpha = 0.35 + Math.sin(s.twinkle) * 0.3;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * s.z, 0, Math.PI * 2);
          ctx.fillStyle = s.isCyan ? `rgba(120, 210, 255, ${currentAlpha})` : `rgba(240, 250, 245, ${currentAlpha})`;
          ctx.fill();
        }
      }

      // ======================================================================
      // PRESET 3: MATRIX DIGITAL CODE RAIN
      // ======================================================================
      else if (currentPreset === 'matrix') {
        ctx.font = '14px "DM Mono", monospace';
        for (let i = 0; i < matrixCols.length; i++) {
          const col = matrixCols[i];
          col.y += col.speed;
          if (col.y > height + 300) {
            col.y = Math.random() * -200;
            col.speed = Math.random() * 2.5 + 1.8;
          }

          // Randomize characters occasionally
          if (Math.random() < 0.03) {
            col.chars[Math.floor(Math.random() * col.chars.length)] = glyphs[Math.floor(Math.random() * glyphs.length)];
          }

          for (let j = 0; j < col.chars.length; j++) {
            const charY = col.y - j * 16;
            if (charY > -20 && charY < height + 20) {
              const alpha = Math.max(0.1, 1 - j / col.chars.length);
              ctx.fillStyle = j === 0 ? '#ffffff' : `rgba(166, 255, 107, ${alpha * 0.8})`;
              ctx.fillText(col.chars[j], col.x, charY);
            }
          }
        }
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
