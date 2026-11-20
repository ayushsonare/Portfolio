/* ==========================================================================
   Navigation & Mobile Menu Handler + Brand Typewriter Effect
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (navToggle && mobileDrawer) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      mobileDrawer.classList.toggle('is-open', isExpanded);
      document.body.style.overflow = isExpanded ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => toggleMenu());

    // Close menu when clicking outside or on a navigation link
    mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  }

  // Dynamic Copyright Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Brand Name Typewriter Loop
  const brandEl = document.querySelector('.brand span:not(.brand-dot)');
  if (brandEl) {
    const textToType = 'AYUSH SONARE';
    brandEl.classList.add('brand-text');

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'brand-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    brandEl.after(cursor);

    let charIndex = 0;
    let isDeleting = false;

    function typewriterTick() {
      if (!isDeleting) {
        charIndex++;
        brandEl.textContent = textToType.substring(0, charIndex);

        if (charIndex === textToType.length) {
          // Pause at full word before deleting
          setTimeout(typewriterTick, 2400);
          isDeleting = true;
          return;
        }
      } else {
        charIndex--;
        brandEl.textContent = textToType.substring(0, charIndex);

        if (charIndex === 0) {
          // Pause at empty string before typing again
          setTimeout(typewriterTick, 500);
          isDeleting = false;
          return;
        }
      }

      // Faster deletion than typing
      const speed = isDeleting ? 45 : 100;
      setTimeout(typewriterTick, speed);
    }

    // Start typewriter loop after initial brief delay
    setTimeout(typewriterTick, 1200);
  }
});
