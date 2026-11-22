/* ==========================================================================
   Game Dev Telemetry & Settings Navbar Dropdown
   (Android-style 3-lines menu in header: FPS, Engine, Viewport, Ambience, Audio & Palette)
   ========================================================================== */

import { isAudioEnabled, toggleAudio, playShockwave, playClick } from './audio-system.js';

function initHUD() {
  if (document.getElementById('navSettingsWrapper')) return;

  const headerInner = document.querySelector('.header-inner');
  if (!headerInner) return;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘K' : 'Ctrl+K';

  const wrapper = document.createElement('div');
  wrapper.id = 'navSettingsWrapper';
  wrapper.className = 'nav-settings-wrapper';

  wrapper.innerHTML = `
    <button class="nav-settings-btn" id="navSettingsToggle" aria-label="System Settings & Viewport Controls" aria-expanded="false" title="Engine & Display Controls">
      <span class="settings-lines-icon" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <div class="nav-settings-dropdown" id="navSettingsDropdown" role="menu" aria-label="Engine Settings Menu">
      <div class="settings-dropdown-header">
        <div class="settings-engine-tag">
          <span class="hud-dot" aria-hidden="true"></span>
          <span>UE 5.4+</span>
        </div>
        <div class="settings-fps-tag">
          <span id="hudFpsVal">60</span> FPS
        </div>
      </div>

      <div class="settings-dropdown-row">
        <span class="settings-row-label">VIEWPORT</span>
        <button class="settings-dropdown-btn" id="hudModeBtn" title="Toggle Unreal Engine Viewport Mode">
          <span id="hudModeVal">LIT</span>
        </button>
      </div>

      <div class="settings-dropdown-row">
        <span class="settings-row-label">AMBIENCE</span>
        <button class="settings-dropdown-btn" id="hudBgBtn" title="Switch Background Ambience">
          <span id="hudBgVal">GRID</span>
        </button>
      </div>

      <div class="settings-dropdown-row">
        <span class="settings-row-label">AUDIO SFX</span>
        <button class="settings-dropdown-btn" id="hudSfxBtn" title="Toggle UI Sound Effects">
          <span id="hudSfxIcon">🔇</span>
          <span id="hudSfxText">SFX OFF</span>
        </button>
      </div>

      <div class="settings-dropdown-row">
        <span class="settings-row-label">COMMANDS</span>
        <button class="settings-dropdown-btn" id="hudCmdBtn" title="Quick Command Palette (${shortcutKey})">
          <span>${shortcutKey}</span>
        </button>
      </div>
    </div>
  `;

  // Attach wrapper directly into headerInner right before navToggle so it is ALWAYS visible in the navbar on both desktop AND mobile
  const navToggle = headerInner.querySelector('.nav-toggle');
  if (navToggle) {
    headerInner.insertBefore(wrapper, navToggle);
  } else {
    headerInner.appendChild(wrapper);
  }

  // Also support mobile drawer controls
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileDrawer && !mobileDrawer.querySelector('.mobile-telemetry-row')) {
    const mobileRow = document.createElement('div');
    mobileRow.className = 'mobile-telemetry-row';
    mobileRow.style.cssText = 'margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 12px;';
    mobileRow.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-accent); display: flex; justify-content: space-between; align-items: center;">
        <span>● UE 5.4+ ENGINE</span>
        <span><span id="mobileFpsVal">60</span> FPS</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="settings-dropdown-btn" id="mobileModeBtn" type="button" style="flex: 1; padding: 10px 6px;">VIEW: <span id="mobileModeVal">LIT</span></button>
        <button class="settings-dropdown-btn" id="mobileBgBtn" type="button" style="flex: 1; padding: 10px 6px;">BG: <span id="mobileBgVal">GRID</span></button>
        <button class="settings-dropdown-btn" id="mobileSfxBtn" type="button" style="flex: 1; padding: 10px 6px;">SFX</button>
      </div>
    `;
    mobileDrawer.appendChild(mobileRow);

    document.getElementById('mobileModeBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('hudModeBtn')?.click();
    });
    document.getElementById('mobileBgBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('hudBgBtn')?.click();
    });
    document.getElementById('mobileSfxBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('hudSfxBtn')?.click();
    });
  }

  const toggleBtn = document.getElementById('navSettingsToggle');
  const dropdown = document.getElementById('navSettingsDropdown');

  function openDropdown() {
    // Close mobile drawer if open
    const navToggleBtn = document.getElementById('navToggle');
    const mobDrawer = document.getElementById('mobileDrawer');
    if (navToggleBtn?.getAttribute('aria-expanded') === 'true' && mobDrawer) {
      navToggleBtn.setAttribute('aria-expanded', 'false');
      mobDrawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggleBtn.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('is-open');
    playClick();
  }

  function closeDropdown() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('is-open');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('is-open');
    if (isOpen) closeDropdown();
    else openDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // Viewport Mode Toggle (Lit / Wireframe)
  const modeBtn = document.getElementById('hudModeBtn');
  const modeVal = document.getElementById('hudModeVal');
  const mobileModeVal = document.getElementById('mobileModeVal');
  let isWireframe = false;

  modeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isWireframe = !isWireframe;
    document.body.setAttribute('data-viewport-mode', isWireframe ? 'wireframe' : 'lit');
    const text = isWireframe ? 'WIRE' : 'LIT';
    if (modeVal) modeVal.textContent = text;
    if (mobileModeVal) mobileModeVal.textContent = text;
    modeBtn.classList.toggle('is-active', isWireframe);
    if (isWireframe) playShockwave();
    else playClick();
  });

  // Background Ambience Preset Switcher (Grid -> Stars -> Matrix)
  const bgBtn = document.getElementById('hudBgBtn');
  const bgVal = document.getElementById('hudBgVal');
  const mobileBgVal = document.getElementById('mobileBgVal');
  const presets = ['grid', 'stars', 'matrix'];

  function updateBgUI(preset) {
    const text = preset.toUpperCase();
    if (bgVal) bgVal.textContent = text;
    if (mobileBgVal) mobileBgVal.textContent = text;
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

  // Audio SFX toggle
  const sfxBtn = document.getElementById('hudSfxBtn');
  const sfxIcon = document.getElementById('hudSfxIcon');
  const sfxText = document.getElementById('hudSfxText');
  const mobileSfxBtn = document.getElementById('mobileSfxBtn');

  function updateSfxUI(enabled) {
    if (sfxIcon) sfxIcon.textContent = enabled ? '🔊' : '🔇';
    if (sfxText) sfxText.textContent = enabled ? 'SFX ON' : 'SFX OFF';
    if (sfxBtn) sfxBtn.classList.toggle('is-active', enabled);
    if (mobileSfxBtn) {
      mobileSfxBtn.textContent = enabled ? '🔊 SFX ON' : '🔇 SFX OFF';
      mobileSfxBtn.classList.toggle('is-active', enabled);
    }
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
    closeDropdown();
    window.dispatchEvent(new CustomEvent('opencommandpalette'));
  });

  // Real-time FPS Calculation
  const fpsVal = document.getElementById('hudFpsVal');
  const mobileFpsVal = document.getElementById('mobileFpsVal');
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
      if (mobileFpsVal) {
        mobileFpsVal.textContent = currentFps;
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
