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

  // Architecture Lightbox Modal Setup (Opens clean modal without deforming card grid)
  let archModal = document.getElementById('archLightboxModal');
  if (!archModal) {
    archModal = document.createElement('div');
    archModal.id = 'archLightboxModal';
    archModal.className = 'lightbox-backdrop';
    archModal.setAttribute('aria-hidden', 'true');
    archModal.innerHTML = `
      <div class="lightbox-dialog arch-modal-dialog" role="dialog" aria-modal="true" aria-label="Technical Architecture Specs">
        <button class="lightbox-close" id="archLightboxCloseBtn" aria-label="Close architecture inspector">✕</button>
        <div class="arch-modal-inner" id="archModalInner">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(archModal);

    const closeArchBtn = document.getElementById('archLightboxCloseBtn');
    function closeArchModal() {
      archModal.classList.remove('is-open');
      archModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    closeArchBtn?.addEventListener('click', closeArchModal);
    archModal.addEventListener('click', (e) => {
      if (e.target === archModal) closeArchModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && archModal.classList.contains('is-open')) closeArchModal();
    });
  }

  function openArchModal(title, meta, points, caseStudyUrl) {
    playClick();
    const inner = document.getElementById('archModalInner');
    if (!inner) return;

    inner.innerHTML = `
      <div class="arch-modal-header">
        <div class="arch-modal-badge">⚡ TECHNICAL ARCHITECTURE SPECIFICATION</div>
        <h2 class="arch-modal-title">${title}</h2>
        <div class="arch-modal-meta">${meta}</div>
      </div>
      <div class="arch-modal-body">
        <div class="arch-modal-heading">ENGINEERING HIGHLIGHTS & SUBSYSTEMS</div>
        <ul class="arch-spec-list">
          ${points.map(pt => `
            <li class="arch-spec-item">
              <span class="arch-spec-bullet">◆</span>
              <span>${pt}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="arch-modal-footer">
        <a class="btn btn-primary" href="${caseStudyUrl}">
          <span>Explore Full Case Study</span>
          <span class="arrow" aria-hidden="true">↗</span>
        </a>
      </div>
    `;

    archModal.classList.add('is-open');
    archModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
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

    // 2. Add Architecture Specs button inside body (Opens modal without displacing grid row heights)
    const bodyEl = card.querySelector('.project-card-body');
    if (bodyEl && !bodyEl.querySelector('.arch-btn')) {
      const archBtn = document.createElement('button');
      archBtn.type = 'button';
      archBtn.className = 'arch-btn';
      archBtn.setAttribute('aria-label', `View ${titleText} Technical Architecture`);
      archBtn.innerHTML = `
        <span class="arch-btn-left" style="display:inline-flex;align-items:center;gap:8px;">
          <span class="arch-btn-icon" aria-hidden="true">⚡</span>
          <span>Technical Architecture</span>
        </span>
        <span class="arch-btn-arrow" aria-hidden="true">↗</span>
      `;

      archBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rawTitle = card.querySelector('.project-card-title span')?.textContent || card.querySelector('.project-card-title a')?.textContent || 'Project Architecture';
        const metaText = card.querySelector('.project-card-meta')?.textContent?.replace(/\s+/g, ' ').trim() || 'Unreal Engine 5';
        const linkHref = card.querySelector('.project-card-title a')?.getAttribute('href') || '#';
        openArchModal(rawTitle.trim(), metaText, data.archPoints, linkHref);
      });

      // Insert before tags
      const tagsEl = bodyEl.querySelector('.project-card-tags');
      if (tagsEl) {
        bodyEl.insertBefore(archBtn, tagsEl);
      } else {
        bodyEl.appendChild(archBtn);
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

  // 5. Seamless Full-Card Click Navigation for All Project Cards
  cards.forEach(card => {
    const titleLink = card.querySelector('.project-card-title a');
    const mediaLink = card.querySelector('.project-card-media');
    const targetUrl = titleLink?.getAttribute('href') || mediaLink?.getAttribute('href');
    if (!targetUrl) return;

    card.style.cursor = 'pointer';

    card.addEventListener('click', (e) => {
      // Don't intercept clicks on interactive nested controls (video reel modal, architecture modal trigger, buttons)
      if (e.target.closest('.reel-badge, .arch-btn, .arch-modal-dialog, button, input, iframe, video')) {
        return;
      }

      playClick();

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(targetUrl, '_blank');
      } else {
        window.location.href = targetUrl;
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectEnhancements);
} else {
  initProjectEnhancements();
}
