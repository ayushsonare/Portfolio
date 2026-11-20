/* ==========================================================================
   3D Monogram Rig Animation Handler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const heroLogoRig = document.getElementById('heroLogoRig');
  if (!heroLogoRig) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    heroLogoRig.style.transform = 'rotateX(8deg) rotateY(-18deg) rotateZ(0deg)';
    return;
  }

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;

  // Track mouse coordinates normalized between -1 and 1
  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let rafId;
  function animateMonogram(time) {
    // Smooth lerp towards pointer position
    currentX += (pointerX - currentX) * 0.05;
    currentY += (pointerY - currentY) * 0.05;

    // Organic idle floating oscillation
    const idleRotY = Math.sin(time * 0.0006) * 12;
    const idleRotX = Math.cos(time * 0.0005) * 5;
    const idleRotZ = Math.sin(time * 0.00035) * 3;

    // Combined interactive tilt + idle motion
    const rx = currentY * -16 + idleRotX;
    const ry = currentX * 22 + idleRotY - 15; // default slight 3/4 isometric angle
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
});
