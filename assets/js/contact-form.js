/* ==========================================================================
   Direct Contact Form Handler
   Sends messages directly to Ayush's Gmail inbox via Google Apps Script Web App.
   ========================================================================== */

import { playChime, playClick } from './audio-system.js';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsCseR8VhdY7-tQga7-ITySe5JetSj6krrAwVaQk7ABuBoN_Sosyi1k3NE3d0P3mx_/exec';

export function initContactForm() {
  const form = document.getElementById('portfolioContactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const statusEl = document.getElementById('contactFormStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    // Basic validation
    if (!name || !email || !message) {
      if (statusEl) {
        statusEl.className = 'form-status is-error';
        statusEl.style.display = 'block';
        statusEl.textContent = 'Please fill in all fields before sending.';
      }
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (statusEl) {
        statusEl.className = 'form-status is-error';
        statusEl.style.display = 'block';
        statusEl.textContent = 'Please provide a valid email address.';
      }
      return;
    }

    playClick();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending message...';
    }

    if (statusEl) {
      statusEl.className = 'form-status';
      statusEl.style.display = 'none';
      statusEl.textContent = '';
    }

    try {
      // Send directly to Google Apps Script Web App
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message
        })
      });

      // Google Apps Script processes the request and sends the email directly to ayushsonare692@gmail.com
      playChime();

      if (statusEl) {
        statusEl.className = 'form-status is-success';
        statusEl.style.display = 'block';
        statusEl.innerHTML = `✓ Thank you, <strong>${name}</strong>! Your message has been sent directly to Ayush's Gmail inbox.`;
      }

      form.reset();
    } catch (err) {
      console.error('Contact form submission error:', err);
      if (statusEl) {
        statusEl.className = 'form-status is-error';
        statusEl.style.display = 'block';
        statusEl.innerHTML = `Unable to send directly. You can also reach out directly via email at <a href="mailto:ayushsonare692@gmail.com" style="color:inherit;text-decoration:underline;">ayushsonare692@gmail.com</a>.`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}
