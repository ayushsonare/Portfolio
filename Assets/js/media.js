/* ==========================================================================
   Media & Interactive Filtering Handler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Autoplay and click-to-play support for local HTML5 videos
  const videos = document.querySelectorAll('video');
  videos.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    // Tap/Click to toggle play
    v.addEventListener('click', () => {
      if (v.paused) v.play();
      else v.pause();
    });

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy prevented playback, start on first interaction
        const startPlayback = () => {
          v.play();
          window.removeEventListener('click', startPlayback);
          window.removeEventListener('touchstart', startPlayback);
        };
        window.addEventListener('click', startPlayback, { once: true });
        window.addEventListener('touchstart', startPlayback, { once: true });
      });
    }
  });

  // Category Filtering on Work Page
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-grid .project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.getAttribute('data-filter') || 'all';

        projectCards.forEach(card => {
          const categories = card.getAttribute('data-category') || '';
          if (filter === 'all' || categories.split(' ').includes(filter)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});
