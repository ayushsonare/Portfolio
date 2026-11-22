/* ==========================================================================
   Minimal Contact Form Handler
   Handles form validation, visual feedback, and seamless email composition.
   ========================================================================== */

import { playChime, playClick } from './audio-system.js';

export function initContactForm() {
  const form = document.getElementById('portfolioContactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const statusEl = document.getElementById('contactFormStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    // Basic validation
    if (!name || !email || !message) {
      if (statusEl) {
        statusEl.className = 'form-status is-error';
        statusEl.textContent = 'Please fill in all fields before sending.';
      }
      return;
    }

    playChime();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Preparing...';
    }

    // Construct mailto URL with prefilled fields
    const toEmail = 'ayushsonare692@gmail.com';
    const subject = encodeURIComponent(`Unreal Engine Inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n---\nSender: ${name}\nEmail: ${email}`);
    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${body}`;

    // Copy formatted text to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`Inquiry from ${name} (${email}):\n\n${message}`).catch(() => {});
    }

    // Update status
    if (statusEl) {
      statusEl.className = 'form-status is-success';
      statusEl.innerHTML = `✓ Thank you, <strong>${name}</strong>! Redirecting to email compose...`;
    }

    // Redirect to email client after short tactile feedback
    setTimeout(() => {
      window.location.href = mailtoUrl;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
      form.reset();
    }, 450);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}
