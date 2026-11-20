/* ==========================================================================
   Interactive Background Animation System (Constellation Particle Matrix)
   High-performance, lightweight, responsive Canvas-based engine.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'bgSceneCanvas';
  canvas.className = 'bg-scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Particle configuration
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const PARTICLE_COUNT = isMobile ? 45 : 85;
  const CONNECT_DISTANCE = isMobile ? 95 : 140;
  const MOUSE_RADIUS = 180;

  let particles = [];
  let mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    isActive: false
  };

  // Resize handler
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

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * 0.8 + 0.2; // depth layer (0.2 to 1.0)
      this.baseRadius = (Math.random() * 1.5 + 1.0) * this.z;
      this.radius = this.baseRadius;

      // Drift velocity based on depth
      const speed = (Math.random() * 0.35 + 0.15) * this.z;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Color variation: 80% subtle green-white, 20% vibrant accent green
      this.isAccent = Math.random() > 0.78;
      this.baseAlpha = this.isAccent ? (0.45 * this.z) : (0.22 * this.z);
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
      // Natural drifting
      this.x += this.vx;
      this.y += this.vy;

      // Screen wrap
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      // Subtle breathing pulse
      this.alpha = this.baseAlpha + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.08;

      // Interactive mouse repulsion/gravitation
      if (mouse.isActive) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 2.2 * this.z;
          const normalX = dx / dist;
          const normalY = dy / dist;
          this.x += normalX * force;
          this.y += normalY * force;
          this.alpha = Math.min(this.alpha + 0.3, 0.9);
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      if (this.isAccent) {
        ctx.fillStyle = `rgba(166, 255, 107, ${Math.max(0, this.alpha)})`;
        ctx.shadowColor = 'rgba(166, 255, 107, 0.6)';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = `rgba(220, 230, 240, ${Math.max(0, this.alpha)})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  // Initialize particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  resize();
  initParticles();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  }, { passive: true });

  // Mouse move listener
  window.addEventListener('pointermove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isActive = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.isActive = false;
  }, { passive: true });

  // Animation Loop
  let rafId;
  let lastTime = 0;

  function render(time) {
    // Smooth lerp mouse coordinates
    if (mouse.isActive) {
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connecting constellation lines
    ctx.lineWidth = 0.75;
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONNECT_DISTANCE) {
          const lineAlpha = (1 - dist / CONNECT_DISTANCE) * 0.14 * p1.z * p2.z;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          if (p1.isAccent || p2.isAccent) {
            ctx.strokeStyle = `rgba(166, 255, 107, ${lineAlpha * 1.5})`;
          } else {
            ctx.strokeStyle = `rgba(180, 200, 220, ${lineAlpha})`;
          }
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }

    // Interactive mouse tether lines
    if (mouse.isActive) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < MOUSE_RADIUS * 0.85) {
          const tetherAlpha = (1 - dist / (MOUSE_RADIUS * 0.85)) * 0.22 * p.z;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(166, 255, 107, ${tetherAlpha})`;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(time * 0.05);
      particles[i].draw();
    }

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  // Performance preservation when tab is idle
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(render);
    }
  });
});
