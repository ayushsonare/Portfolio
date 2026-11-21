/* ==========================================================================
   Konami Code Easter Egg (Developer God Mode)
   Unlockable achievement with retro fanfare and golden HUD badge.
   ========================================================================== */

import { playChime, playShockwave } from './audio-system.js';

function initEasterEgg() {
  const konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  let currentKeyIdx = 0;
  let isUnlocked = false;

  function triggerGodMode() {
    if (isUnlocked) return;
    isUnlocked = true;

    playChime();
    setTimeout(playShockwave, 250);

    // 1. Show Achievement Banner
    let banner = document.getElementById('godModeBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'godModeBanner';
      banner.className = 'godmode-banner';
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div class="godmode-card">
        <div class="godmode-trophy">🏆</div>
        <div class="godmode-details">
          <div class="godmode-kicker">ACHIEVEMENT UNLOCKED</div>
          <div class="godmode-title">DEVELOPER GOD MODE</div>
          <div class="godmode-sub">100% Unreal Engine Gameplay Architecture & Systems Unlocked</div>
        </div>
      </div>
    `;

    banner.classList.add('is-active');

    // 2. Add Gold Badge to HUD
    const hudPill = document.querySelector('.hud-pill');
    if (hudPill && !document.getElementById('hudGodBadge')) {
      const badge = document.createElement('div');
      badge.id = 'hudGodBadge';
      badge.className = 'hud-item hud-god-badge';
      badge.innerHTML = `<span class="hud-god-star">★</span> GOD MODE`;
      hudPill.prepend(badge);
    }

    // 3. Raining golden particles effect
    createParticleBurst();

    setTimeout(() => {
      banner.classList.remove('is-active');
    }, 6000);
  }

  function createParticleBurst() {
    const burst = document.createElement('div');
    burst.className = 'godmode-particles';
    document.body.appendChild(burst);

    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'godmode-particle';
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      p.style.animationDelay = `${Math.random() * 0.5}s`;
      burst.appendChild(p);
    }

    setTimeout(() => {
      burst.remove();
    }, 4500);
  }

  window.addEventListener('keydown', (e) => {
    const requiredKey = konamiSequence[currentKeyIdx];
    if (e.key.toLowerCase() === requiredKey.toLowerCase()) {
      currentKeyIdx++;
      if (currentKeyIdx === konamiSequence.length) {
        currentKeyIdx = 0;
        triggerGodMode();
      }
    } else {
      currentKeyIdx = 0;
    }
  });

  // Also support custom event from command palette (typing "godmode")
  window.addEventListener('unlockgodmode', () => {
    triggerGodMode();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEasterEgg);
} else {
  initEasterEgg();
}
