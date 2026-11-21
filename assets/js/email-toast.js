/* ==========================================================================
   Email Redirection & HUD Toast Notification
   Redirects to email client / compose while copying address to clipboard.
   ========================================================================== */

import { playChime } from './audio-system.js';

function initEmailToast() {
  const email = 'ayushsonare692@gmail.com';
  const mailtoUrl = `mailto:${email}?subject=Unreal%20Engine%20Project%20Inquiry`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Unreal%20Engine%20Project%20Inquiry`;

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
        <span class="hud-toast-icon">📬</span>
        <span class="hud-toast-text">${msg}</span>
        <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="hud-toast-link" title="Open directly in Gmail Web">Open Gmail Web ↗</a>
      </div>
    `;

    toast.classList.remove('is-active');
    void toast.offsetWidth; // Force reflow
    toast.classList.add('is-active');

    setTimeout(() => {
      toast.classList.remove('is-active');
    }, 4500);
  }

  document.addEventListener('click', (e) => {
    // Avoid double triggering if clicking the link inside the toast
    if (e.target.closest('.hud-toast-link')) return;

    const link = e.target.closest('a[href^="mailto:"]');
    if (link) {
      playChime();

      // 1. Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      }

      // 2. Show feedback toast
      showToast(`Redirecting to email... (${email})`);

      // 3. Ensure email redirection fires smoothly
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 150);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailToast);
} else {
  initEmailToast();
}
