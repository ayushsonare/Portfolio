/* ==========================================================================
   Game Dev Telemetry HUD Widget
   Displays real-time FPS, Engine specs, Viewport Mode, Ambient Preset, Audio SFX toggle & Command Palette shortcut.
   ========================================================================== */

import { isAudioEnabled, toggleAudio, playShockwave, playClick } from './audio-system.js';

function initHUD() {
  if (document.getElementById('gameDevHUD')) return;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

  const hud = document.createElement('aside');
  hud.id = 'gameDevHUD';
  hud.className = 'game-hud';
  hud.setAttribute('aria-label', 'System Telemetry HUD');

  hud.innerHTML = `
    <div class="hud-pill">
      <div class="hud-item hud-engine">
        <span class="hud-dot" aria-hidden="true"></span>
        <span class="hud-label">UE 5.4+</span>
      </div>
      <div class="hud-item hud-fps">
        <span class="hud-dim">FPS</span>
        <span class="hud-val" id="hudFpsVal">60</span>
      </div>
      <button class="hud-btn hud-mode-btn" id="hudModeBtn" aria-label="Toggle Unreal Viewport Mode" title="Toggle Unreal Engine Viewport Mode (Lit / Wireframe)">
        <span class="hud-mode-tag">VIEW</span>
        <span class="hud-mode-val" id="hudModeVal">LIT</span>
      </button>
      <button class="hud-btn hud-bg-btn" id="hudBgBtn" aria-label="Switch Background Ambience" title="Switch Background Ambience (Grid / Stars / Matrix)">
        <span class="hud-bg-tag">BG</span>
        <span class="hud-bg-val" id="hudBgVal">GRID</span>
      </button>
      <button class="hud-btn hud-sfx-btn" id="hudSfxBtn" aria-label="Toggle UI Audio SFX" title="Toggle UI Sound Effects">
        <span class="hud-sfx-icon" id="hudSfxIcon">🔇</span>
        <span class="hud-sfx-text" id="hudSfxText">SFX OFF</span>
      </button>
      <button class="hud-btn hud-cmd-btn" id="hudCmdBtn" aria-label="Open Command Palette (${shortcutKey})" title="Quick Command Palette (${shortcutKey})">
        <span class="hud-kbd">${shortcutKey}</span>
      </button>
    </div>
  `;

  document.body.appendChild(hud);

  // Viewport Mode Toggle (Lit / Wireframe)
  const modeBtn = document.getElementById('hudModeBtn');
  const modeVal = document.getElementById('hudModeVal');
  let isWireframe = false;

  modeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isWireframe = !isWireframe;
    document.body.setAttribute('data-viewport-mode', isWireframe ? 'wireframe' : 'lit');
    if (modeVal) modeVal.textContent = isWireframe ? 'WIRE' : 'LIT';
    modeBtn.classList.toggle('is-active', isWireframe);
    if (isWireframe) playShockwave();
    else playClick();
  });

  // Background Ambience Preset Switcher (Grid -> Stars -> Matrix)
  const bgBtn = document.getElementById('hudBgBtn');
  const bgVal = document.getElementById('hudBgVal');
  const presets = ['grid', 'stars', 'matrix'];

  function updateBgUI(preset) {
    if (bgVal) bgVal.textContent = preset.toUpperCase();
    if (bgBtn) bgBtn.classList.toggle('is-active', preset !== 'grid');
  }

  if (window.getBgPreset) {
    updateBgUI(window.getBgPreset());
  }

  bgBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playClick();
    const current = window.getBgPreset ? window.getBgPreset() : 'grid';
    const nextIdx = (presets.indexOf(current) + 1) % presets.length;
    const nextPreset = presets[nextIdx];
    if (window.setBgPreset) {
      window.setBgPreset(nextPreset);
    }
    updateBgUI(nextPreset);
  });

  window.addEventListener('bgpresetchange', (e) => {
    updateBgUI(e.detail.preset);
  });

  // Update SFX UI
  const sfxBtn = document.getElementById('hudSfxBtn');
  const sfxIcon = document.getElementById('hudSfxIcon');
  const sfxText = document.getElementById('hudSfxText');

  function updateSfxUI(enabled) {
    if (sfxIcon) sfxIcon.textContent = enabled ? '🔊' : '🔇';
    if (sfxText) sfxText.textContent = enabled ? 'SFX ON' : 'SFX OFF';
    if (sfxBtn) sfxBtn.classList.toggle('is-active', enabled);
  }

  updateSfxUI(isAudioEnabled());

  sfxBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const enabled = toggleAudio();
    updateSfxUI(enabled);
  });

  window.addEventListener('audiostatechange', (e) => {
    updateSfxUI(e.detail.enabled);
  });

  // Command palette button click
  const cmdBtn = document.getElementById('hudCmdBtn');
  cmdBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('opencommandpalette'));
  });

  // Real-time FPS Calculation
  const fpsVal = document.getElementById('hudFpsVal');
  let frameCount = 0;
  let lastTime = performance.now();

  function calcFPS(now) {
    frameCount++;
    const delta = now - lastTime;
    if (delta >= 1000) {
      const currentFps = Math.round((frameCount * 1000) / delta);
      if (fpsVal) {
        fpsVal.textContent = currentFps;
        if (currentFps >= 55) {
          fpsVal.style.color = 'var(--color-accent)';
        } else if (currentFps >= 30) {
          fpsVal.style.color = '#ffc83b';
        } else {
          fpsVal.style.color = '#ff4d4d';
        }
      }
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(calcFPS);
  }
  requestAnimationFrame(calcFPS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHUD);
} else {
  initHUD();
}
