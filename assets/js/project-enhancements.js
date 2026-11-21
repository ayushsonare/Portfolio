/* ==========================================================================
   Project Card Enhancements:
   1. Video Lightbox & Watch Reel Badges
   2. Technical Architecture Drawers
   3. Platform & Category Filter Toolbar
   4. Cursor Spotlight Radial Glow (Steam / Epic Games Store Style)
   ========================================================================== */

import { playClick } from './audio-system.js';

function initProjectEnhancements() {
  const isSubdir = window.location.pathname.includes('/work/') || 
                   window.location.pathname.includes('/about/') || 
                   window.location.pathname.includes('/contact/');
  const root = isSubdir ? '../' : './';
  const isDeepSubdir = (window.location.pathname.match(/\/projects\/[^/]+\//) !== null);
  const deepRoot = isDeepSubdir ? '../../' : root;

  const projectDataMap = {
    'roar': {
      category: ['multiplayer', 'action', 'pc'],
      videoType: 'iframe',
      videoSrc: 'https://www.youtube-nocookie.com/embed/7mJBKVK88fc?autoplay=1&rel=0',
      archPoints: [
        'Dedicated Server & Client Network Replication (RPCs, FastArray serialization, movement prediction)',
        'Bot AI Combat System utilizing Behavior Trees, Blackboard queries, and dynamic EQS positioning',
        'Epic Online Services (EOS) session matchmaking, party lobbies, and player state replication'
      ]
    },
    'lekh': {
      category: ['action', 'pc'],
      videoType: 'iframe',
      videoSrc: 'https://www.youtube-nocookie.com/embed/jDXf9jH3NU0?autoplay=1&rel=0',
      archPoints: [
        'Directional combo melee combat state machine & 8-way root motion locomotion blending',
        'Dynamic camera collision spring-arm warping & lock-on target tracking system',
        'Tactical companion AI with assist state routines and perception range queries'
      ]
    },
    'air events': {
      category: ['multiplayer', 'pc'],
      videoType: 'iframe',
      videoSrc: 'https://www.youtube-nocookie.com/embed/8FmVWWde1FY?autoplay=1&rel=0',
      archPoints: [
        'Massively networked multi-user space with high-concurrency avatar state synchronization',
        'Runtime modular character customizer with mesh baking & dynamic material instancing',
        'Spatial 3D audio attenuation & real-time presentation screen media streaming'
      ]
    },
    'flaws': {
      category: ['action', 'pc'],
      videoType: 'iframe',
      videoSrc: 'https://www.youtube-nocookie.com/embed/pwVN_OQtCug?autoplay=1&rel=0',
      archPoints: [
        'Physics-driven ballistic bullet drop calculation, dynamic recoil kick, and procedural ADS',
        'Aggressive enemy tactical AI with flanking maneuvers, cover usage, and suppressive fire logic',
        'Modular inventory, weapon attachment socketing, and physical weapon handling physics'
      ]
    },
    'soul eater': {
      category: ['mobile', 'action'],
      videoType: 'video',
      videoSrc: `${deepRoot}assets/video/SoulEater/Gameplay.mp4`,
      archPoints: [
        'High-density 200+ enemy horde spawner optimized for Android mobile CPU/GPU thermal limits',
        'Interface-driven decoupled ability cooldown system and dynamic object pooling framework',
        'Mobile frame budgeting maintaining strict 60 FPS under heavy particle and projectile loads'
      ]
    },
    'basketball': {
      category: ['mobile', 'multiplayer'],
      videoType: 'iframe',
      videoSrc: 'https://www.youtube-nocookie.com/embed/AhCk1IuZI0k?autoplay=1&rel=0',
      archPoints: [
        'Arcade trajectory predictive physics math calculating realistic swish and rim rebounds',
        'Real-time gesture swipe touch shooting input with velocity curve calibration',
        'Low-overhead mobile render pipeline with custom shader optimizations for Android'
      ]
    },
    'vr tour': {
      category: ['vr'],
      videoType: 'video',
      videoSrc: `${deepRoot}assets/video/VRTour/VRTour.mp4`,
      archPoints: [
        'Dynamic Runtime Material Instances allowing real-time wall, floor, and furniture material swapping',
        '6DOF motion controller interaction system built with native Unreal Engine OpenXR',
        'Forward Shading renderer tuning to hold a strict, comfortable 90 FPS VR frame budget'
      ]
    }
  };

  // Video Lightbox Modal setup
  let lightboxModal = document.getElementById('videoLightboxModal');
  if (!lightboxModal) {
    lightboxModal = document.createElement('div');
    lightboxModal.id = 'videoLightboxModal';
    lightboxModal.className = 'lightbox-backdrop';
    lightboxModal.setAttribute('aria-hidden', 'true');
    lightboxModal.innerHTML = `
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Gameplay Video Reel">
        <button class="lightbox-close" id="lightboxCloseBtn" aria-label="Close video player">✕</button>
        <div class="lightbox-video-wrap" id="lightboxVideoWrap">
          <!-- Video / iframe injected dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(lightboxModal);

    const closeBtn = document.getElementById('lightboxCloseBtn');
    function closeLightbox() {
      lightboxModal.classList.remove('is-open');
      lightboxModal.setAttribute('aria-hidden', 'true');
      const wrap = document.getElementById('lightboxVideoWrap');
      if (wrap) wrap.innerHTML = '';
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('is-open')) closeLightbox();
    });
  }

  function openVideoModal(videoType, videoSrc) {
    playClick();
    const wrap = document.getElementById('lightboxVideoWrap');
    if (!wrap) return;

    if (videoType === 'iframe') {
      wrap.innerHTML = `<iframe src="${videoSrc}" title="Project Gameplay Reel" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      wrap.innerHTML = `<video src="${videoSrc}" controls autoplay playsinline></video>`;
    }

    lightboxModal.classList.add('is-open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Iterate over all project cards on the page
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const titleEl = card.querySelector('.project-card-title a') || card.querySelector('.project-card-title');
    const titleText = (titleEl?.textContent || '').trim().toLowerCase();
    
    // Find matching project key
    let matchedKey = null;
    for (const key of Object.keys(projectDataMap)) {
      if (titleText.includes(key)) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) return;
    const data = projectDataMap[matchedKey];

    // Store categories as data attribute for filtering
    card.setAttribute('data-category', data.category.join(' '));

    // 1. Add Watch Reel badge over media
    const mediaEl = card.querySelector('.project-card-media');
    if (mediaEl && !mediaEl.querySelector('.reel-badge')) {
      const reelBtn = document.createElement('button');
      reelBtn.type = 'button';
      reelBtn.className = 'reel-badge';
      reelBtn.setAttribute('aria-label', `Watch ${titleText} Gameplay Video`);
      reelBtn.innerHTML = `
        <span class="reel-play-icon" aria-hidden="true">▶</span>
        <span>Watch Reel</span>
      `;
      reelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openVideoModal(data.videoType, data.videoSrc);
      });
      mediaEl.appendChild(reelBtn);
    }

    // 2. Add Architecture Highlights drawer inside body
    const bodyEl = card.querySelector('.project-card-body');
    if (bodyEl && !bodyEl.querySelector('.arch-drawer-wrap')) {
      const drawerWrap = document.createElement('div');
      drawerWrap.className = 'arch-drawer-wrap';
      drawerWrap.innerHTML = `
        <button type="button" class="arch-toggle-btn" aria-expanded="false">
          <span class="arch-toggle-icon">⚡</span>
          <span>Technical Architecture</span>
          <span class="arch-toggle-arrow">▾</span>
        </button>
        <div class="arch-content">
          <ul class="arch-list">
            ${data.archPoints.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      `;

      const toggleBtn = drawerWrap.querySelector('.arch-toggle-btn');
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        drawerWrap.classList.toggle('is-open', !isOpen);
      });

      // Insert before tags
      const tagsEl = bodyEl.querySelector('.project-card-tags');
      if (tagsEl) {
        bodyEl.insertBefore(drawerWrap, tagsEl);
      } else {
        bodyEl.appendChild(drawerWrap);
      }
    }
  });

  // 3. Platform & Category Filter Toolbar for Selected Work
  const projectGrid = document.querySelector('.project-grid');
  if (projectGrid && !projectGrid.previousElementSibling?.classList.contains('project-filter-toolbar')) {
    const filterToolbar = document.createElement('div');
    filterToolbar.className = 'project-filter-toolbar';
    filterToolbar.innerHTML = `
      <div class="project-filter-pills">
        <button class="proj-pill-btn is-active" data-filter="all">All (${cards.length})</button>
        <button class="proj-pill-btn" data-filter="multiplayer">Multiplayer & PC</button>
        <button class="proj-pill-btn" data-filter="mobile">Mobile (Android)</button>
        <button class="proj-pill-btn" data-filter="vr">VR / OpenXR</button>
        <button class="proj-pill-btn" data-filter="action">Action & Combat</button>
      </div>
    `;

    projectGrid.parentNode.insertBefore(filterToolbar, projectGrid);

    const pillBtns = filterToolbar.querySelectorAll('.proj-pill-btn');
    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        playClick();

        const filter = btn.getAttribute('data-filter') || 'all';
        cards.forEach(card => {
          const cardCats = (card.getAttribute('data-category') || '').split(' ');
          if (filter === 'all' || cardCats.includes(filter)) {
            card.style.display = '';
            card.classList.remove('is-hidden');
          } else {
            card.style.display = 'none';
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // 4. Cursor Spotlight Radial Glow on Cards (Steam / Epic Games Store Style)
  const spotlightCards = document.querySelectorAll('.project-card, .fab-card, .timeline-content');
  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectEnhancements);
} else {
  initProjectEnhancements();
}
