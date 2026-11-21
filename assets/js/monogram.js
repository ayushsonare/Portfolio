/* ==========================================================================
   3D Monogram Rig Animation Handler + Shockwave Interaction
   ========================================================================== */

import { playShockwave } from './audio-system.js';

function initMonogram() {
  const heroLogoRig = document.getElementById('heroLogoRig');
  const stage = document.querySelector('.hero-logo-stage');
  if (!heroLogoRig || !stage) return;

  // Immediate default 3D pose
  heroLogoRig.style.transform = 'rotateX(8deg) rotateY(-18deg) rotateZ(0deg)';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let shockImpulse = 0;

  // Track mouse coordinates normalized between -1 and 1
  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // Click interaction: Shockwave pulse
  stage.addEventListener('click', () => {
    shockImpulse = 360; // 360-degree dynamic spin impulse
    playShockwave();

    // Spawn shockwave ring
    const ripple = document.createElement('div');
    ripple.className = 'monogram-shockwave';
    stage.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1000);
  });

  let rafId;
  function animateMonogram(time) {
    // Smooth lerp towards pointer position
    currentX += (pointerX - currentX) * 0.05;
    currentY += (pointerY - currentY) * 0.05;

    // Decay shockwave impulse
    if (shockImpulse > 0.5) {
      shockImpulse *= 0.92;
    } else {
      shockImpulse = 0;
    }

    // Organic idle floating oscillation
    const idleRotY = Math.sin(time * 0.0006) * 12;
    const idleRotX = Math.cos(time * 0.0005) * 5;
    const idleRotZ = Math.sin(time * 0.00035) * 3;

    // Combined interactive tilt + idle motion + shockwave spin
    const rx = currentY * -16 + idleRotX;
    const ry = currentX * 22 + idleRotY - 15 + shockImpulse; // default slight 3/4 isometric angle + impulse
    const rz = currentX * -4 + idleRotZ;

    heroLogoRig.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;

    rafId = requestAnimationFrame(animateMonogram);
  }

  rafId = requestAnimationFrame(animateMonogram);

  // Pause animation when tab is not visible to preserve battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(animateMonogram);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMonogram);
} else {
  initMonogram();
}
