/* ==========================================================================
   Procedural Web Audio Engine (Enabled by Default)
   High-performance synthetic UI sound effects without external audio assets.
   ========================================================================== */

let audioCtx = null;
let isMuted = false; // Enabled by default

// Retrieve persisted mute preference (defaults to enabled unless explicitly muted)
try {
  const saved = localStorage.getItem('ayush_portfolio_audio');
  if (saved === 'muted') {
    isMuted = true;
  } else if (saved === 'enabled') {
    isMuted = false;
  }
} catch (e) {}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Mobile Audio Unlock on first touch/interaction
function unlockMobileAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}
window.addEventListener('touchstart', unlockMobileAudio, { passive: true });
window.addEventListener('touchend', unlockMobileAudio, { passive: true });
window.addEventListener('click', unlockMobileAudio, { passive: true });

export function isAudioEnabled() {
  return !isMuted;
}

export function toggleAudio() {
  isMuted = !isMuted;
  try {
    localStorage.setItem('ayush_portfolio_audio', isMuted ? 'muted' : 'enabled');
  } catch (e) {}

  if (!isMuted) {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        playChime();
      }).catch(() => {
        playChime();
      });
    } else {
      playChime();
    }
  }
  dispatchAudioStateChange();
  return !isMuted;
}

function dispatchAudioStateChange() {
  window.dispatchEvent(new CustomEvent('audiostatechange', {
    detail: { enabled: !isMuted }
  }));
}

export function playHover() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.035);
    
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {}
}

export function playClick() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.05);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

export function playShockwave() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {}
}

export function playChime() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.06;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.035, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.23);
    });
  } catch (e) {}
}

// Bind interactive sounds to key elements
function setupInteractiveSounds() {
  const hoverSelectors = '.btn, .nav-link, .fab-card, .project-card, .btn-text, .tag-pill, .command-item';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(hoverSelectors)) {
      playHover();
    }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('a, button, .fab-card, .project-card')) {
      playClick();
    }
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupInteractiveSounds);
} else {
  setupInteractiveSounds();
}
