/* ==========================================================================
   Navigation & Mobile Menu Handler + Brand Typewriter Effect
   ========================================================================== */

function initNavigation() {
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

  // Brand Name - Static by default, Typewriter Loop runs as Easter Egg when God Mode is unlocked
  const brandEl = document.querySelector('.brand span:not(.brand-dot)');
  if (brandEl) {
    brandEl.textContent = 'AYUSH SONARE'; // Static name by default

    function startBrandTypewriter() {
      if (brandEl.classList.contains('brand-typewriter-active')) return;
      brandEl.classList.add('brand-typewriter-active', 'brand-text');

      // Create cursor element if not present
      if (!brandEl.nextElementSibling?.classList.contains('brand-cursor')) {
        const cursor = document.createElement('span');
        cursor.className = 'brand-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        brandEl.after(cursor);
      }

      const textToType = 'AYUSH SONARE';
      let charIndex = 0;
      let isDeleting = false;

      function typewriterTick() {
        if (!isDeleting) {
          charIndex++;
          brandEl.textContent = textToType.substring(0, charIndex);

          if (charIndex === textToType.length) {
            setTimeout(typewriterTick, 2400);
            isDeleting = true;
            return;
          }
        } else {
          charIndex--;
          brandEl.textContent = textToType.substring(0, charIndex);

          if (charIndex === 0) {
            setTimeout(typewriterTick, 500);
            isDeleting = false;
            return;
          }
        }

        const speed = isDeleting ? 45 : 100;
        setTimeout(typewriterTick, speed);
      }

      setTimeout(typewriterTick, 400);
    }

    // Activated strictly when God Mode is unlocked!
    window.addEventListener('unlockgodmode', startBrandTypewriter);
  }

  // Dynamic Resume Button Visibility:
  // Hidden while on the Hero section in index; appears when scrolled to subsequent sections.
  const heroSection = document.querySelector('.hero-section');
  const navResumeBtn = document.querySelector('.nav-resume-btn');
  if (heroSection && navResumeBtn) {
    function updateResumeVisibility() {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom <= 120) {
        navResumeBtn.classList.remove('is-hidden');
      } else {
        navResumeBtn.classList.add('is-hidden');
      }
    }

    window.addEventListener('scroll', updateResumeVisibility, { passive: true });
    updateResumeVisibility();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
  initNavigation();
}
