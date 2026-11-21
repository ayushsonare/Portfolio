/* ==========================================================================
   Email Copy & HUD Toast Notification
   Copies email address to clipboard with tactile feedback.
   ========================================================================== */

import { playChime, playClick } from './audio-system.js';

function initEmailToast() {
  const email = 'ayushsonare692@gmail.com';

  function showToast(msg) {
    let toast = document.getElementById('hudToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hudToast';
      toast.className = 'hud-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="hud-toast-content">
        <span class="hud-toast-icon">📋</span>
        <span class="hud-toast-text">${msg}</span>
      </div>
    `;

    toast.classList.remove('is-active');
    void toast.offsetWidth; // Force reflow
    toast.classList.add('is-active');

    setTimeout(() => {
      toast.classList.remove('is-active');
    }, 3200);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="mailto:"]');
    if (link) {
      // Check if navigator clipboard is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          playChime();
          showToast(`COPIED TO CLIPBOARD: ${email}`);
        }).catch(() => {
          playClick();
        });
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailToast);
} else {
  initEmailToast();
}
