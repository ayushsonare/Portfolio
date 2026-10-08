
'use strict';

document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

    (() => {
      const loader = document.getElementById('loader');
      const logoRig = document.getElementById('logoRig');
      const projectLogoRig = document.getElementById('projectLogoRig');
      const bgWord = document.getElementById('backgroundWord');
      const progress = document.getElementById('progress');
      const sections = [...document.querySelectorAll('.section')];
      const navLinks = [...document.querySelectorAll('[data-nav]')];
      const indexItems = [...document.querySelectorAll('.index-item')];
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


      const projectSection = document.getElementById('projects');
      const projectViewport = document.getElementById('projectViewport');
      const projectCards = [...document.querySelectorAll('#projectViewport .project-card')];

      // All carousel text now comes directly from each project <article> in index.html.
      function parseProjectList(value) {
        return String(value || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }

      function projectFromElement(element) {
        const imageElement = element.querySelector('img');
        const videoElement = element.querySelector('video');
        const youtubeFrame = element.querySelector('iframe');

        return {
          id: element.dataset.id || '',
          featured: element.dataset.featured !== 'false',
          title: element.dataset.title || element.getAttribute('aria-label') || 'PROJECT',
          subtitle: element.dataset.subtitle || 'Selected Work',
          role: element.dataset.role || 'Unreal Engine Developer',
          year: element.dataset.year || '',
          description: element.dataset.description || '',
          tags: parseProjectList(element.dataset.tags),
          categories: parseProjectList(element.dataset.categories),
          image: imageElement?.getAttribute('src') || element.dataset.image || '',
          video: videoElement?.getAttribute('src') || element.dataset.video || '',
          videoUrl: youtubeFrame?.getAttribute('src') || '',
          link: element.dataset.link || (element.dataset.id ? `projects/${element.dataset.id}.html` : '#')
        };
      }

      const libraryProjectSources = [
        ...document.querySelectorAll('#projectLibraryData .project-library-source')
      ];

      const sourceProjects = [
        ...projectCards.map(projectFromElement),
        ...libraryProjectSources.map(projectFromElement)
      ];

      const projectData = sourceProjects
        .filter(item => item.featured !== false)
        .slice(0, 5)
        .map(item => ({
          ...item,
          tags: [...item.tags],
          categories: [...item.categories]
        }));
      const pageTransition = document.createElement('div');
      pageTransition.className = 'page-transition';
      pageTransition.setAttribute('aria-hidden', 'true');
      document.body.appendChild(pageTransition);

      function navigateToWorks(projectIndex = 0) {
        openWorksPanel(projectIndex);
        history.replaceState(null, '', '#works');
      }

      const projectOpenLink = document.getElementById('projectOpenLink');
      if (projectOpenLink) {
        projectOpenLink.addEventListener('click', function(event) {
          window.location.href = 'projects.html';
          event.preventDefault();
        });
      }
      const projectDataPanel = document.querySelector('.project-data');
      const projectTitle = document.getElementById('projectTitle');
      const projectSubtitle = document.getElementById('projectSubtitle');
      const projectYear = document.getElementById('projectYear');
      const projectRole = document.getElementById('projectRole');
      const projectDescription = document.getElementById('projectDescription');
      const projectTags = document.getElementById('projectTags');
      const projectCounter = document.getElementById('projectCounter');
      const projectStatusRole = document.getElementById('projectStatusRole');
      const projectScrollCue = document.getElementById('projectScrollCue');
      let projectIndex = 0;
      let projectDirection = 1;
      let projectWheelLocked = false;
      let wheelResetTimer = 0;
      let wheelAmount = 0;

      function updateProjectCopy(item) {
        if (!item) return;
        if (projectTitle) projectTitle.textContent = item.title;
        if (projectSubtitle) projectSubtitle.textContent = item.subtitle;
        if (projectYear) projectYear.textContent = item.year;
        if (projectRole) projectRole.textContent = item.role;
        if (projectDescription) projectDescription.textContent = item.description || '';
        if (projectStatusRole) projectStatusRole.textContent = item.role;
        renderMainProjectTags(item);
        if (projectOpenLink) {
          projectOpenLink.href = 'projects.html';
          projectOpenLink.innerHTML = `OPEN PROJECT <span>↗</span>`;
        }
      }



      // Owner-editable tags on the main featured Projects screen.
      function mainProjectTagsEditingAllowed() {
        return document.documentElement.classList.contains('owner-unlocked') &&
          document.documentElement.classList.contains('owner-site-editing');
      }

      function renderMainProjectTags(item) {
        if (!projectTags) return;
        const allowed = mainProjectTagsEditingAllowed();
        if (projectTags.classList.contains('is-editing-tags') && document.activeElement === projectTags) return;
        projectTags.classList.remove('is-editing-tags');
        projectTags.contentEditable = 'false';
        projectTags.spellcheck = false;
        projectTags.tabIndex = allowed ? 0 : -1;
        projectTags.setAttribute('aria-label', allowed ? 'Edit project tags. Separate tags with commas.' : 'Project tags');
        projectTags.innerHTML = item.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
      }

      function syncMainProjectTagsEditing() {
        if (!projectTags) return;
        const allowed = mainProjectTagsEditingAllowed();
        projectTags.tabIndex = allowed ? 0 : -1;
        projectTags.setAttribute('aria-label', allowed ? 'Edit project tags. Separate tags with commas.' : 'Project tags');
        if (!allowed && projectTags.classList.contains('is-editing-tags')) {
          projectTags.classList.remove('is-editing-tags');
          projectTags.contentEditable = 'false';
          renderMainProjectTags(projectData[projectIndex]);
        }
      }

      projectTags?.addEventListener('focus', () => {
        if (!mainProjectTagsEditingAllowed()) return;
        const item = projectData[projectIndex];
        projectTags.classList.add('is-editing-tags');
        projectTags.contentEditable = 'true';
        projectTags.textContent = item.tags.join(', ');
        requestAnimationFrame(() => {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(projectTags);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        });
      });

      projectTags?.addEventListener('pointerdown', event => {
        if (!mainProjectTagsEditingAllowed()) return;
        event.stopPropagation();
      }, true);

      projectTags?.addEventListener('click', event => {
        if (!mainProjectTagsEditingAllowed()) return;
        event.preventDefault();
        event.stopPropagation();
        if (document.activeElement !== projectTags) projectTags.focus();
      });

      projectTags?.addEventListener('keydown', event => {
        if (!mainProjectTagsEditingAllowed()) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          projectTags.blur();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          projectTags.dataset.cancelEdit = 'true';
          projectTags.blur();
        }
      });

      projectTags?.addEventListener('blur', () => {
        if (!projectTags.classList.contains('is-editing-tags')) return;
        const cancel = projectTags.dataset.cancelEdit === 'true';
        delete projectTags.dataset.cancelEdit;
        const rawValue = projectTags.textContent || '';
        projectTags.classList.remove('is-editing-tags');
        projectTags.contentEditable = 'false';
        if (!cancel) updateWorksMetadata(projectIndex, 'tags', rawValue);
        renderMainProjectTags(projectData[projectIndex]);
      });

      new MutationObserver(syncMainProjectTagsEditing).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      function renderProjects(nextIndex, direction = 1, immediate = false) {
        const total = projectCards.length;
        const clamped = Math.max(0, Math.min(total - 1, nextIndex));
        if (clamped === projectIndex && !immediate) return;
        projectDirection = direction;
        projectIndex = clamped;

        projectCards.forEach((card, index) => {
          const diff = index - projectIndex;
          card.classList.remove('is-active','is-prev','is-next','is-far-prev','is-far-next','is-before','is-after');
          if (diff === 0) card.classList.add('is-active');
          else if (diff === -1) card.classList.add('is-prev');
          else if (diff === 1) card.classList.add('is-next');
          else if (diff === -2) card.classList.add('is-far-prev');
          else if (diff === 2) card.classList.add('is-far-next');
          else if (diff < 0) card.classList.add('is-before');
          else card.classList.add('is-after');
          card.setAttribute('aria-hidden', diff === 0 ? 'false' : 'true');

          const vid = card.querySelector('video');
          if (vid) {
            if (diff === 0) {
              vid.muted = true;
              vid.playsInline = true;
              const p = vid.play();
              if (p && typeof p.catch === 'function') {
                p.catch(() => {});
              }
            } else {
              if (!vid.paused) {
                vid.pause();
              }
            }
          }
        });

        if (projectCounter) projectCounter.textContent = `PROJECT ${String(projectIndex + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
        if (projectScrollCue) projectScrollCue.textContent = projectIndex === total - 1 ? 'Scroll for Plugins ↓' : 'Swipe ‹ › or scroll for next ↓';

        updateProjectDots(projectIndex);

        if (immediate || reduced) {
          updateProjectCopy(projectData[projectIndex]);
        } else {
          projectDataPanel?.classList.add('is-changing');
          window.setTimeout(() => {
            updateProjectCopy(projectData[projectIndex]);
            projectDataPanel?.classList.remove('is-changing');
          }, 180);
        }
      }

      function moveProject(direction, allowExit = false) {
        const last = projectCards.length - 1;
        if (direction > 0 && projectIndex < last) {
          renderProjects(projectIndex + 1, 1);
          return true;
        }
        if (direction < 0 && projectIndex > 0) {
          renderProjects(projectIndex - 1, -1);
          return true;
        }
        if (allowExit) {
          const target = direction > 0 ? projectSection.nextElementSibling : projectSection.previousElementSibling;
          if (target) {
            projectWheelLocked = true;
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            window.setTimeout(() => { projectWheelLocked = false; }, reduced ? 80 : 950);
          }
        }
        return false;
      }

      // Mobile carousel dots and prev/next controls
      function renderProjectDots() {
        const dotsContainer = document.getElementById('projectDots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        projectCards.forEach((card, idx) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `project-dot ${idx === projectIndex ? 'is-active' : ''}`;
          dot.setAttribute('aria-label', `View ${card.dataset.title || `Project ${idx + 1}`}`);
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            renderProjects(idx, idx > projectIndex ? 1 : -1);
          });
          dotsContainer.appendChild(dot);
        });
      }

      function updateProjectDots(idx) {
        const dots = document.querySelectorAll('#projectDots .project-dot');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }

      const projectPrevBtn = document.getElementById('projectPrevBtn');
      const projectNextBtn = document.getElementById('projectNextBtn');
      projectPrevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        moveProject(-1, false);
      });
      projectNextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        moveProject(1, false);
      });

      renderProjectDots();

      // Card tap and navigation: tap peeking card to advance, tap active card to view details
      projectCards.forEach((card, index) => {
        card.addEventListener('click', event => {
          if (event.target.closest('.owner-project-media-tools') || event.target.closest('.project-data-open')) return;
          if (index !== projectIndex) {
            event.preventDefault();
            renderProjects(index, index > projectIndex ? 1 : -1);
          } else {
            // Tapping active card opens the projects page
            window.location.href = 'projects.html';
          }
        });
      });

      function portfolioOverlayIsOpen() {
        return document.body.classList.contains('works-panel-open') ||
          document.body.classList.contains('project-detail-open') ||
          document.body.classList.contains('mobile-nav-open') ||
          document.querySelector('.works-panel.is-open, .project-detail-panel.is-open, .mobile-nav.is-open');
      }

      // Robust touch & pointer gesture handling
      let touchStartX = null;
      let touchStartY = null;
      let touchStartTime = 0;
      let touchIsHorizontal = false;
      let touchIsVertical = false;

      function onTouchStart(clientX, clientY) {
        touchStartX = clientX;
        touchStartY = clientY;
        touchStartTime = performance.now();
        touchIsHorizontal = false;
        touchIsVertical = false;
      }

      function onTouchMove(clientX, clientY, event) {
        if (touchStartX === null || touchStartY === null) return;
        const dx = clientX - touchStartX;
        const dy = clientY - touchStartY;

        if (!touchIsHorizontal && !touchIsVertical) {
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            if (Math.abs(dx) > Math.abs(dy) * 1.1) {
              touchIsHorizontal = true;
            } else {
              touchIsVertical = true;
            }
          }
        }

        if (touchIsHorizontal && event && event.cancelable) {
          // Prevent horizontal page sway during carousel swipe
          event.preventDefault();
        }
      }

      function onTouchEnd(clientX, clientY) {
        if (touchStartX === null || touchStartY === null) return;
        const dx = clientX - touchStartX;
        const dy = clientY - touchStartY;
        const dt = performance.now() - touchStartTime;
        touchStartX = null;
        touchStartY = null;

        if (touchIsHorizontal || (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28)) {
          const threshold = dt < 320 ? 24 : 42;
          if (Math.abs(dx) > threshold) {
            moveProject(dx < 0 ? 1 : -1, false);
          }
        }
        touchIsHorizontal = false;
        touchIsVertical = false;
      }

      // Touch events on projectSection
      projectSection?.addEventListener('touchstart', (e) => {
        if (portfolioOverlayIsOpen() || !e.touches?.length) return;
        onTouchStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      projectSection?.addEventListener('touchmove', (e) => {
        if (portfolioOverlayIsOpen() || !e.touches?.length) return;
        onTouchMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }, { passive: false });

      projectSection?.addEventListener('touchend', (e) => {
        if (portfolioOverlayIsOpen()) return;
        const touch = e.changedTouches?.[0];
        if (touch) onTouchEnd(touch.clientX, touch.clientY);
      }, { passive: true });

      projectSection?.addEventListener('touchcancel', () => {
        touchStartX = null;
        touchStartY = null;
        touchIsHorizontal = false;
        touchIsVertical = false;
      }, { passive: true });

      // Mouse drag for desktop
      let isMouseDragging = false;
      projectViewport?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.owner-project-media-tools') || e.target.closest('a') || e.target.closest('button')) return;
        isMouseDragging = true;
        projectViewport.classList.add('dragging');
        onTouchStart(e.clientX, e.clientY);
      });

      window.addEventListener('mousemove', (e) => {
        if (isMouseDragging) onTouchMove(e.clientX, e.clientY, e);
      });

      window.addEventListener('mouseup', (e) => {
        if (isMouseDragging) {
          isMouseDragging = false;
          projectViewport?.classList.remove('dragging');
          onTouchEnd(e.clientX, e.clientY);
        }
      });

      function projectIsDominant() {
        const rect = projectSection.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
        return visible >= innerHeight * .35;
      }

      window.addEventListener('wheel', event => {
        if (portfolioOverlayIsOpen()) return;
        const projectRect = projectSection.getBoundingClientRect();
        const inProjects = projectRect.top <= 25 && projectRect.bottom >= innerHeight - 25;
        if (!inProjects) return;

        // Allow natural exit on boundary scroll
        if (event.deltaY > 0 && projectIndex === projectCards.length - 1) return;
        if (event.deltaY < 0 && projectIndex === 0) return;

        event.preventDefault();
        if (projectWheelLocked) return;

        wheelAmount += event.deltaY;
        clearTimeout(wheelResetTimer);
        wheelResetTimer = window.setTimeout(() => { wheelAmount = 0; }, 160);
        if (Math.abs(wheelAmount) < 24) return;

        const direction = wheelAmount > 0 ? 1 : -1;
        wheelAmount = 0;
        projectWheelLocked = true;

        moveProject(direction, false);
        window.setTimeout(() => { projectWheelLocked = false; }, reduced ? 60 : 650);
      }, { passive: false });

      window.addEventListener('keydown', event => {
        if (!document.body.classList.contains('projects-active')) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          moveProject(-1, true);
        }
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          moveProject(1, true);
        }
      renderProjects(0, 1, true);

      function ensureActiveVideoPlays() {
        const activeCard = projectCards[projectIndex];
        const vid = activeCard?.querySelector('video');
        if (vid && vid.paused) {
          vid.muted = true;
          vid.playsInline = true;
          const p = vid.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      }
      ['click', 'touchstart', 'keydown', 'wheel'].forEach(evt => {
        window.addEventListener(evt, ensureActiveVideoPlays, { passive: true });
      });

      // Architectural Schematic Blueprint Sketch Loading (4.2 Seconds with Camera Fly-Through)
      const loaderPercent = document.getElementById('loaderPercent');
      const loaderBarFill = document.getElementById('loaderBarFill');
      const loaderLog = document.getElementById('loaderLog');
      const archStatusTag = document.getElementById('archStatusTag');
      const minimumIntroTime = 4200; // 4.2 seconds
      let loadStart = performance.now();
      let loaderFinished = false;
      let loaderFrame = 0;
      let loaderTimer = 0;

      const bootSteps = [
        { progress: 0, text: "CALIBRATING DRAFTING GRID & EXTENSION RAYS..." },
        { progress: 22, text: "SKETCHING CONCENTRIC GUIDE ARCS & TANGENTS..." },
        { progress: 48, text: "DRAFTING ISOMETRIC PERSPECTIVE TUNNEL..." },
        { progress: 72, text: "RENDERING SOLID ARCHITECTURAL 'A' GEOMETRY..." },
        { progress: 92, text: "APPROACHING PERSPECTIVE HORIZON // ENTERING" }
      ];

      function finishLoader() {
        if (loaderFinished) return;
        loaderFinished = true;
        clearTimeout(loaderTimer);
        cancelAnimationFrame(loaderFrame);
        if (loaderPercent) loaderPercent.textContent = '100';
        if (loaderBarFill) loaderBarFill.style.width = '100%';
        if (loaderLog) loaderLog.textContent = "APPROACHING PERSPECTIVE HORIZON...";
        if (archStatusTag) archStatusTag.textContent = "ENTERING";

        // Trigger cinematic camera dive-through into the 'A' monogram
        if (loader) {
          loader.classList.add('is-zooming');
          document.body.classList.add('is-transitioning-hero');
          setTimeout(() => {
            if (loader) {
              loader.classList.add('is-complete');
              loader.style.display = 'none';
              try { loader.remove(); } catch(e) {}
            }
            document.body.classList.remove('is-loading');
            document.body.classList.remove('is-transitioning-hero');
          }, 1200);
        } else {
          document.body.classList.remove('is-loading');
        }
        document.body.classList.add('hero-revealed');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        try {
          const introSection = document.getElementById('intro') || document.getElementById('home');
          if (introSection) {
            introSection.classList.add('visible');
            if (typeof setSection === 'function') setSection(introSection);
          }
          sections.forEach(s => {
            const r = s.getBoundingClientRect();
            if (r.top < innerHeight && r.bottom > 0) s.classList.add('visible');
          });
        } catch (e) {
          console.warn(e);
        }
      }

      function runLoader(now) {
        if (loaderFinished) return;
        const elapsed = now - loadStart;
        const t = Math.min(1, elapsed / minimumIntroTime);
        const progress = Math.min(100, Math.floor((1 - Math.pow(1 - t, 2.2)) * 100));
        
        if (loaderPercent) loaderPercent.textContent = String(progress).padStart(3, '0');
        if (loaderBarFill) loaderBarFill.style.width = `${progress}%`;
        
        if (loaderLog) {
          for (let i = bootSteps.length - 1; i >= 0; i--) {
            if (progress >= bootSteps[i].progress) {
              loaderLog.textContent = bootSteps[i].text;
              break;
            }
          }
        }

        if (elapsed >= minimumIntroTime) {
          finishLoader();
          return;
        }
        loaderFrame = requestAnimationFrame(runLoader);
      }

      function startCompulsoryLoader() {
        if (window.location.hash && window.location.hash !== '#intro') {
          finishLoader();
          const targetSection = document.querySelector(window.location.hash);
          if (targetSection) {
            setTimeout(() => {
              targetSection.scrollIntoView({ behavior: 'smooth' });
              if (typeof setSection === 'function') setSection(targetSection);
            }, 100);
          }
          return;
        }
        if (!loader) {
          loaderFinished = true;
          document.body.classList.remove('is-loading');
          return;
        }
        clearTimeout(loaderTimer);
        cancelAnimationFrame(loaderFrame);
        loadStart = performance.now();
        loaderFinished = false;
        document.body.classList.add('is-loading');
        if (loader) {
          loader.classList.remove('is-complete');
          loader.style.pointerEvents = 'auto';
        }
        if (loaderPercent) loaderPercent.textContent = '000';
        if (loaderBarFill) loaderBarFill.style.width = '0%';
        if (loaderLog) loaderLog.textContent = bootSteps[0].text;
        loaderFrame = requestAnimationFrame(runLoader);
        loaderTimer = window.setTimeout(finishLoader, minimumIntroTime + 50);
      }

      startCompulsoryLoader();
      loader?.addEventListener('pointerdown', finishLoader);
      loader?.addEventListener('touchstart', finishLoader, { passive: true });
      loader?.addEventListener('click', finishLoader);
      window.addEventListener('keydown', finishLoader, { once: true });
      window.addEventListener('wheel', finishLoader, { passive: true, once: true });

      window.addEventListener('pageshow', event => {
        if (event.persisted) finishLoader();
      });

      // Full-Screen Studio Navigation Overlay Handlers
      const menuToggle = document.getElementById('menuToggle');
      const siteMenuOverlay = document.getElementById('siteMenuOverlay');
      const siteMenuClose = document.getElementById('siteMenuClose');
      const siteMenuLinks = document.querySelectorAll('.site-menu-link');

      if (menuToggle && siteMenuOverlay) {
        menuToggle.addEventListener('click', () => {
          siteMenuOverlay.classList.add('is-open');
          siteMenuOverlay.setAttribute('aria-hidden', 'false');
        });
      }
      if (siteMenuClose && siteMenuOverlay) {
        siteMenuClose.addEventListener('click', () => {
          siteMenuOverlay.classList.remove('is-open');
          siteMenuOverlay.setAttribute('aria-hidden', 'true');
        });
      }
      siteMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (siteMenuOverlay) {
            siteMenuOverlay.classList.remove('is-open');
            siteMenuOverlay.setAttribute('aria-hidden', 'true');
          }
        });
      });

      // Scroll Cue Fade-out Handler
      const heroScrollCue = document.getElementById('heroScrollCue');
      window.addEventListener('scroll', () => {
        if (heroScrollCue) {
          if (window.scrollY > 40) {
            heroScrollCue.classList.add('is-hidden');
          } else {
            heroScrollCue.classList.remove('is-hidden');
          }
        }
      }, { passive: true });

      // Interactive 3D logo tilt with Touch, Mouse & Gyroscope
      let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
      function setPointerPosition(clientX, clientY) {
        pointerX = (clientX / innerWidth - .5) * 2;
        pointerY = (clientY / innerHeight - .5) * 2;
      }

      window.addEventListener('pointermove', (event) => {
        setPointerPosition(event.clientX, event.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', (event) => {
        if (event.touches?.length) {
          setPointerPosition(event.touches[0].clientX, event.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('deviceorientation', (event) => {
        if (event.gamma !== null && event.beta !== null) {
          const gx = Math.max(-1, Math.min(1, event.gamma / 35));
          const gy = Math.max(-1, Math.min(1, (event.beta - 45) / 35));
          pointerX = pointerX * 0.75 + gx * 0.25;
          pointerY = pointerY * 0.75 + gy * 0.25;
        }
      }, { passive: tr      // ==========================================
      // SLEEK LIQUID FLUID MOTION CURSOR ENGINE
      // ==========================================
      const cursorDot = document.getElementById('cursorDot');
      const cursorRing = document.getElementById('cursorRing');
      const cursorSpotlight = document.getElementById('cursorSpotlight');
      const interactionCanvas = document.getElementById('interactionCanvas');
      const ctx = interactionCanvas?.getContext('2d');

      let mouseScreenX = -1000;
      let mouseScreenY = -1000;
      let ringScreenX = -1000;
      let ringScreenY = -1000;
      let spotScreenX = -1000;
      let spotScreenY = -1000;
      let isMouseActive = false;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Trailing Liquid Fluid Nodes
      const FLUID_NODE_COUNT = 16;
      const fluidNodes = [];
      for (let i = 0; i < FLUID_NODE_COUNT; i++) {
        fluidNodes.push({
          x: -1000,
          y: -1000,
          vx: 0,
          vy: 0
        });
      }

      const ripples = [];

      function resizeCanvas() {
        if (!interactionCanvas || !ctx) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        interactionCanvas.width = window.innerWidth * dpr;
        interactionCanvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });

      function getThemeRgb() {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb');
        return raw ? raw.trim() : '0, 240, 255';
      }

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function spawnFluidRipple(x, y) {
        if (reduced) return;
        const rgb = getThemeRgb();
        ripples.push({
          x,
          y,
          radius: 8,
          maxRadius: Math.min(window.innerWidth * 0.22, 90),
          alpha: 0.85,
          speed: 2.8,
          lineWidth: 2,
          rgb
        });
      }

      // Mouse Listeners (Windows / Desktop)
      window.addEventListener('mousemove', (e) => {
        mouseScreenX = e.clientX;
        mouseScreenY = e.clientY;

        if (!isMouseActive) {
          isMouseActive = true;
          ringScreenX = mouseScreenX;
          ringScreenY = mouseScreenY;
          spotScreenX = mouseScreenX;
          spotScreenY = mouseScreenY;
          fluidNodes.forEach(node => {
            node.x = mouseScreenX;
            node.y = mouseScreenY;
            node.vx = 0;
            node.vy = 0;
          });
          if (cursorDot) cursorDot.style.opacity = '1';
          if (cursorRing) cursorRing.style.opacity = '1';
          if (cursorSpotlight) cursorSpotlight.style.opacity = '1';
          document.body.classList.add('has-custom-cursor');
        }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        isMouseActive = false;
        if (cursorDot) cursorDot.style.opacity = '0';
        if (cursorRing) cursorRing.style.opacity = '0';
        if (cursorSpotlight) cursorSpotlight.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        if (isMouseActive) {
          if (cursorDot) cursorDot.style.opacity = '1';
          if (cursorRing) cursorRing.style.opacity = '1';
          if (cursorSpotlight) cursorSpotlight.style.opacity = '1';
        }
      });

      window.addEventListener('mousedown', (e) => {
        if (cursorRing) cursorRing.classList.add('is-clicking');
        spawnFluidRipple(e.clientX, e.clientY);
      });

      window.addEventListener('mouseup', () => {
        if (cursorRing) cursorRing.classList.remove('is-clicking');
      });

      // Hover element detection for cursor ring expansion
      const interactiveSelector = 'a, button, [role="button"], input, .project-card, .library-card, .skill, .plugin-item, .contact-link, .works-filter, .project-dot, .index-item';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
          cursorRing?.classList.add('is-hovering');
        }
      }, { passive: true });

      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
          cursorRing?.classList.remove('is-hovering');
        }
      }, { passive: true });

      // Touch Listeners (Mobile)
      window.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          spawnFluidRipple(t.clientX, t.clientY);
        }
      }, { passive: true });

      // Interaction Animation Loop
      function renderInteractions() {
        const rgb = getThemeRgb();

        if (isMouseActive && cursorDot && cursorRing && cursorSpotlight) {
          // Smooth fluid lerp tracking
          ringScreenX = lerp(ringScreenX, mouseScreenX, 0.22);
          ringScreenY = lerp(ringScreenY, mouseScreenY, 0.22);
          spotScreenX = lerp(spotScreenX, mouseScreenX, 0.08);
          spotScreenY = lerp(spotScreenY, mouseScreenY, 0.08);

          cursorDot.style.transform = `translate3d(${mouseScreenX}px, ${mouseScreenY}px, 0)`;
          cursorRing.style.transform = `translate3d(${ringScreenX}px, ${ringScreenY}px, 0)`;
          cursorSpotlight.style.transform = `translate3d(${spotScreenX}px, ${spotScreenY}px, 0)`;

          // Fluid Trailing Nodes (Spring Dynamics)
          fluidNodes[0].x = lerp(fluidNodes[0].x, mouseScreenX, 0.5);
          fluidNodes[0].y = lerp(fluidNodes[0].y, mouseScreenY, 0.5);

          for (let i = 1; i < FLUID_NODE_COUNT; i++) {
            const leader = fluidNodes[i - 1];
            const follower = fluidNodes[i];

            const nx = leader.x - follower.x;
            const ny = leader.y - follower.y;

            follower.vx += nx * 0.32;
            follower.vy += ny * 0.32;
            follower.vx *= 0.58;
            follower.vy *= 0.58;

            follower.x += follower.vx;
            follower.y += follower.vy;
          }
        }

        // Render Silky Smooth Fluid Trail & Waves on Canvas
        if (ctx) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

          // Draw Silky Smooth Liquid Neon Trail
          if (isMouseActive && !reduced && fluidNodes[0].x > -500) {
            ctx.save();

            for (let i = 0; i < FLUID_NODE_COUNT - 1; i++) {
              const curr = fluidNodes[i];
              const next = fluidNodes[i + 1];
              const segProgress = i / FLUID_NODE_COUNT;
              const alpha = (1 - segProgress) * 0.42;
              const lineWidth = Math.max(0.6, (1 - segProgress) * 4.5);

              ctx.beginPath();
              ctx.moveTo(curr.x, curr.y);
              ctx.lineTo(next.x, next.y);
              ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
              ctx.lineWidth = lineWidth;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.shadowBlur = 8;
              ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.9})`;
              ctx.stroke();
            }

            ctx.restore();
          }

          // Draw Clean Fluid Expanding Waves / Ripples
          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += r.speed;
            r.alpha -= 0.024;
            r.lineWidth = Math.max(0.5, r.lineWidth * 0.96);

            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
              ripples.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r.rgb}, ${r.alpha})`;
            ctx.lineWidth = r.lineWidth;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${r.rgb}, ${r.alpha * 0.7})`;
            ctx.stroke();
            ctx.restore();
          }
        }

      requestAnimationFrame(renderInteractions);

      // ==========================================
      // PERSISTENT SCROLL-DRIVEN 3D LOGO TRANSITION
      // ==========================================
      const logoStage = document.getElementById('logoStage') || document.querySelector('.logo-stage');

      // Fixed, persistent transform coordinates for each section (X%, Y%, Scale, 3D Euler Angles, Opacity)
      const logoSectionTransforms = {
        intro:      { x: 0,   y: 0,  scale: 1.25, rx: 0,   ry: 0,   rz: 0,   opacity: 0.95 },
        home:       { x: 24,  y: -4, scale: 0.92, rx: 12,  ry: -24, rz: 5,   opacity: 0.85 },
        about:      { x: -24, y: 6,  scale: 1.10, rx: -14, ry: 32,  rz: -8,  opacity: 0.70 },
        experience: { x: 25,  y: -6, scale: 0.88, rx: 20,  ry: -38, rz: 12,  opacity: 0.60 },
        projects:   { x: 28,  y: 2,  scale: 1.15, rx: 10,  ry: -28, rz: -4,  opacity: 0.35 },
        plugins:    { x: -25, y: 2,  scale: 0.92, rx: -16, ry: 35,  rz: 8,   opacity: 0.55 },
        contact:    { x: 0,   y: -8, scale: 1.05, rx: 8,   ry: 16,  rz: -2,  opacity: 0.75 }
      };

      const sectionKeys = ['intro', 'home', 'about', 'experience', 'projects', 'plugins', 'contact'];

      let currentLogoX = 0, currentLogoY = 0, currentLogoScale = 1.25;
      let currentLogoRx = 0, currentLogoRy = 0, currentLogoRz = 0;
      let currentLogoOpacity = 0.95;

      function getInterpolatedLogoTransform() {
        const scroll = window.scrollY || window.pageYOffset || 0;
        
        // When at top of page (intro screen), stay dead-center
        if (scroll <= 20) {
          return logoSectionTransforms.intro;
        }

        const sectionElements = sectionKeys.map(id => document.getElementById(id)).filter(Boolean);
        if (!sectionElements.length) return logoSectionTransforms.intro;

        const secOffsets = sectionElements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            id: el.id,
            top: rect.top + scroll,
            height: el.offsetHeight
          };
        });

        const currentScroll = scroll;

        let idx = 0;
        for (let i = 0; i < secOffsets.length - 1; i++) {
          if (currentScroll >= secOffsets[i].top && currentScroll < secOffsets[i+1].top) {
            idx = i;
            break;
          }
          if (currentScroll >= secOffsets[i+1].top) {
            idx = i + 1;
          }
        }

        if (idx >= secOffsets.length - 1) {
          return logoSectionTransforms[secOffsets[secOffsets.length - 1].id] || logoSectionTransforms.contact;
        }

        const secA = secOffsets[idx];
        const secB = secOffsets[idx + 1];
        const distance = Math.max(1, secB.top - secA.top);
        let rawT = Math.max(0, Math.min(1, (currentScroll - secA.top) / distance));

        // Keep logo centered for the initial portion of intro scroll before initiating transition
        if (secA.id === 'intro') {
          if (rawT < 0.2) {
            rawT = 0;
          } else {
            rawT = (rawT - 0.2) / 0.8;
          }
        }

        const t = rawT * rawT * (3 - 2 * rawT); // Smooth cubic interpolation

        const transA = logoSectionTransforms[secA.id] || logoSectionTransforms.intro;
        const transB = logoSectionTransforms[secB.id] || logoSectionTransforms.contact;

        return {
          x: transA.x + (transB.x - transA.x) * t,
          y: transA.y + (transB.y - transA.y) * t,
          scale: transA.scale + (transB.scale - transA.scale) * t,
          rx: transA.rx + (transB.rx - transA.rx) * t,
          ry: transA.ry + (transB.ry - transA.ry) * t,
          rz: transA.rz + (transB.rz - transA.rz) * t,
          opacity: transA.opacity + (transB.opacity - transA.opacity) * t
        };
      }

      // ==========================================
      // AMBIENT RHYTHM GRADIENT & SMOOTH 2D/3D LOGO TILT
      // ==========================================
      const blob1 = document.getElementById('auroraBlob1');
      const blob2 = document.getElementById('auroraBlob2');
      const blob3 = document.getElementById('auroraBlob3');
      const blob4 = document.getElementById('auroraBlob4');
      const rhythmMesh = document.getElementById('rhythmGlowMesh');

      function animateScene(time) {
        // 1. Dynamic Rhythmic Gradient Background Feel
        const rhythmWave = Math.sin(time * 0.00065);
        const rhythmCos = Math.cos(time * 0.00055);

        if (blob1) {
          const shiftX = pointerX * 20 + rhythmWave * 30;
          const shiftY = pointerY * 15 + rhythmCos * 25;
          blob1.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${1 + rhythmWave * 0.1})`;
        }
        if (blob2) {
          const shiftX = pointerX * -25 - rhythmCos * 25;
          const shiftY = pointerY * -18 + rhythmWave * 35;
          blob2.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${1 - rhythmWave * 0.08})`;
        }
        if (blob3) {
          const shiftX = pointerX * 18 + rhythmCos * 30;
          const shiftY = pointerY * -20 - rhythmWave * 25;
          blob3.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${1 + rhythmCos * 0.12})`;
        }
        if (blob4) {
          const shiftX = pointerX * -20 - rhythmWave * 25;
          const shiftY = pointerY * 15 + rhythmCos * 30;
          blob4.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${1 - rhythmCos * 0.1})`;
        }
        if (rhythmMesh) {
          rhythmMesh.style.transform = `scale(${1 + rhythmWave * 0.05})`;
          rhythmMesh.style.opacity = `${0.65 + rhythmWave * 0.35}`;
        }

        // 2. Smooth Persistent Scroll-driven Logo Transformation
        const target = getInterpolatedLogoTransform();
        const lerpRate = 0.085;

        currentLogoX += (target.x - currentLogoX) * lerpRate;
        currentLogoY += (target.y - currentLogoY) * lerpRate;
        currentLogoScale += (target.scale - currentLogoScale) * lerpRate;
        currentLogoOpacity += (target.opacity - currentLogoOpacity) * lerpRate;

        // Subtle responsive mouse/pointer tilt
        currentX += (pointerX - currentX) * 0.05;
        currentY += (pointerY - currentY) * 0.05;

        const totalRx = target.rx + currentY * -8;
        const totalRy = target.ry + currentX * 12;
        const totalRz = target.rz + currentX * -3;

        currentLogoRx += (totalRx - currentLogoRx) * lerpRate;
        currentLogoRy += (totalRy - currentLogoRy) * lerpRate;
        currentLogoRz += (totalRz - currentLogoRz) * lerpRate;

        if (logoStage) {
          logoStage.style.transform = `translate3d(calc(-50% + ${currentLogoX.toFixed(2)}vw), calc(-50% + ${currentLogoY.toFixed(2)}vh), 0) scale(${currentLogoScale.toFixed(3)})`;
          logoStage.style.opacity = currentLogoOpacity.toFixed(3);
        }

        if (logoRig) {
          logoRig.style.transform = `rotateX(${currentLogoRx.toFixed(2)}deg) rotateY(${currentLogoRy.toFixed(2)}deg) rotateZ(${currentLogoRz.toFixed(2)}deg)`;
        }

        if (projectLogoRig) {
          const orbitRy = -currentX * 6 + Math.sin(time * 0.0003) * 6;
          const orbitRx = currentY * 4.5 + Math.cos(time * 0.00025) * 3;
          const orbitRz = Math.sin(time * 0.00018) * 2;
          projectLogoRig.style.transform = `rotateX(${orbitRx}deg) rotateY(${orbitRy}deg) rotateZ(${orbitRz}deg)`;
        }

        requestAnimationFrame(animateScene);
      }
      requestAnimationFrame(animateScene);

      function setSection(section) {
        const id = section.id;
        const word = section.dataset.word;
        if (bgWord && bgWord.textContent !== word) {
          document.body.classList.add('switching');
          setTimeout(() => {
            bgWord.textContent = word;
            document.body.classList.remove('switching');
          }, reduced ? 0 : 150);
        }
        document.documentElement.style.setProperty('--accent', section.dataset.accent);
        document.documentElement.style.setProperty('--accent-rgb', section.dataset.rgb);
        document.documentElement.style.setProperty('--page', section.dataset.page);
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.nav === id));
        indexItems.forEach(item => item.classList.toggle('active', item.dataset.target === id));
        document.body.classList.toggle('projects-active', id === 'projects');
        document.body.classList.toggle('intro-active', id === 'intro');
      }

      if ('IntersectionObserver' in window) {
        document.documentElement.classList.add('motion-ready');
        const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              if (entry.intersectionRatio > .42) setSection(entry.target);
            }
          });
        }, { threshold: [.18, .42, .65] });
        sections.forEach(section => sectionObserver.observe(section));
        setTimeout(function () {
          sections.forEach(function (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top < innerHeight && rect.bottom > 0) section.classList.add('visible');
          });
        }, 100);
      } else {
        sections.forEach(section => section.classList.add('visible'));
        if (sections.length) setSection(sections[0]);
      }

      let progressFrame = 0;
      function updateProgress() {
        if (progressFrame) return;
        progressFrame = requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - innerHeight;
          if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
          progressFrame = 0;
        });
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.dataset.nav || link.getAttribute('href')?.replace('#', '');
          const target = document.getElementById(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', `#${targetId}`);
          }
        });
      });

      indexItems.forEach(item => item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          history.pushState(null, '', `#${targetId}`);
        }
      }));

      // Mobile Navigation Drawer logic
      const mobileNav = document.getElementById('mobileNav');
      const mobileNavClose = document.getElementById('mobileNavClose');
      const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
      const menuToggle = document.getElementById('menuToggle');
      const mobileNavWorksBtn = document.getElementById('mobileNavWorksBtn');

      function openMobileNav() {
        if (!mobileNav) return;
        mobileNav.classList.add('is-open');
        mobileNav.setAttribute('aria-hidden', 'false');
        document.body.classList.add('mobile-nav-open');
        if (menuToggle) menuToggle.textContent = '✕';
      }

      function closeMobileNav() {
        if (!mobileNav) return;
        mobileNav.classList.remove('is-open');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mobile-nav-open');
        if (menuToggle) menuToggle.textContent = '☰';
      }

      menuToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (mobileNav?.classList.contains('is-open')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });

      mobileNavClose?.addEventListener('click', closeMobileNav);
      mobileNavBackdrop?.addEventListener('click', closeMobileNav);

      mobileNav?.querySelectorAll('.mobile-nav-link:not(.mobile-nav-works)').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            closeMobileNav();
            const target = document.querySelector(href);
            if (target) {
              window.setTimeout(() => {
                target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
              }, 120);
            }
          }
        });
      });

      mobileNavWorksBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileNav();
        window.setTimeout(() => openWorksPanel(projectIndex), 180);
      });

      // Small depth response while scrolling
      window.addEventListener('scroll', () => {
        const logoStage = document.querySelector('.logo-stage');
        if (logoStage) {
          const shift = Math.sin(scrollY * .002) * 5;
          logoStage.style.marginTop = `${shift}px`;
        }
      }, { passive: true });


      // Full project library panel
      const worksPanel = document.getElementById('worksPanel');
      const worksClose = document.getElementById('worksClose');
      const worksGrid = document.getElementById('worksGrid');
      const worksFilters = [...document.querySelectorAll('.works-filter')];
      const projectImages = projectData.map(item => item.image || '');
      const fullProjectList = sourceProjects.length
        ? sourceProjects.map((item, index) => ({...item, tags:[...(item.tags || [])], categories:[...(item.categories || [])], image:item.image || projectImages[index % Math.max(projectImages.length, 1)] || ''}))
        : projectData.map((item, index) => ({...item, categories:item.categories || ['gameplay'], image:projectImages[index] || ''}));

      // Media is authored directly inside each carousel <article> in index.html.
      projectCards.forEach((card, index) => {
        const item = projectData[index];
        if (item) card.setAttribute('aria-label', item.title);
      });

      // Owner-editable Works metadata (year/status, tags and title).
      const worksMetaStorageKey = 'ayushWorksProjectMetaV1';
      let activeWorksFilter = 'all';

      function parseWorksTags(value) {
        return String(value || '')
          .replace(/^\s*\[/, '')
          .replace(/\]\s*$/, '')
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
          .slice(0, 12);
      }

      function loadWorksMetadata() { updateProjectCopy(projectData[projectIndex]); }

      function saveWorksMetadata() { /* Source files only. */ }

      function updateWorksMetadata(index, field, rawValue) {
        const item = fullProjectList[index];
        if (!item) return;
        const oldTitle = item.title;
        if (field === 'tags') {
          const tags = parseWorksTags(rawValue);
          if (tags.length) item.tags = tags;
        } else {
          const value = String(rawValue || '').trim();
          if (!value) return;
          item[field] = value;
        }

        if (index < projectData.length) {
          projectData[index].title = item.title;
          projectData[index].year = item.year;
          projectData[index].tags = [...item.tags];
          projectCards[index]?.setAttribute('aria-label', item.title);
          if (index === projectIndex) updateProjectCopy(projectData[index]);
        }

        saveWorksMetadata();
        window.dispatchEvent(new CustomEvent('ayush:project-meta-updated', {
          detail: { index, field, oldTitle, item: { ...item, tags: [...item.tags] } }
        }));
      }

      function worksMetadataEditingAllowed() { return false; }

      function syncWorksMetadataEditing() {
        const allowed = worksMetadataEditingAllowed();
        worksGrid?.querySelectorAll('[data-work-field]').forEach(field => {
          field.contentEditable = allowed ? 'true' : 'false';
          field.spellcheck = allowed;
          field.tabIndex = allowed ? 0 : -1;
          field.setAttribute('aria-label', allowed ? `Edit project ${field.dataset.workField}` : '');
        });
      }

      loadWorksMetadata();

      const detailPanel = document.getElementById('projectDetailPanel');
      const detailClose = document.getElementById('detailClose');
      const detailImage = document.getElementById('detailImage');
      const detailTitle = document.getElementById('detailTitle');
      const detailYear = document.getElementById('detailYear');
      const detailKicker = document.getElementById('detailKicker');
      const detailRole = document.getElementById('detailRole');
      const detailType = document.getElementById('detailType');
      const detailStack = document.getElementById('detailStack');
      const detailStatus = document.getElementById('detailStatus');
      const detailHeading = document.getElementById('detailHeading');
      const detailStoryTitle = document.getElementById('detailStoryTitle');
      const detailGalleryTitle = document.getElementById('detailGalleryTitle');
      const detailImpactTitle = document.getElementById('detailImpactTitle');
      const detailCreditsTitle = document.getElementById('detailCreditsTitle');
      const detailVideoSlot = document.getElementById('detailVideoSlot');
      const detailDescription = document.getElementById('detailDescription');
      const detailPoints = document.getElementById('detailPoints');
      const detailTags = document.getElementById('detailTags');
      const detailMarquee = document.getElementById('detailMarquee');
      const detailNext = document.getElementById('detailNext');
      const detailNextTitle = document.getElementById('detailNextTitle');
      let activeDetailIndex = 0;
      const detailEdit = document.getElementById('detailEdit');
      const detailSave = document.getElementById('detailSave');
      const detailReset = document.getElementById('detailReset');
      const editableNodes = detailPanel ? [...detailPanel.querySelectorAll('[data-editable]')] : [];
      const galleryIds = ['galleryImage1','galleryImage2','galleryImage3','galleryImage4','galleryImage5','galleryImage6'];
      let detailObjectUrls = [];
      function detailStorageKey(){ return `ayushProjectDetail:${fullProjectList[activeDetailIndex]?.title || activeDetailIndex}`; }
      function setEditMode(enabled){
        detailPanel.classList.toggle('edit-mode', enabled);
        editableNodes.forEach(n=>n.contentEditable = enabled ? 'true' : 'false');
        detailEdit.textContent = enabled ? 'EDITING' : 'EDIT PROJECT';
      }
      detailEdit?.addEventListener('click', ()=>{ window.location.href='/editor.html'; });
      detailSave?.addEventListener('click', ()=>{ window.location.href='/editor.html'; });
      detailReset?.addEventListener('click', ()=>{ openProjectDetail(activeDetailIndex); });
      detailPanel?.querySelectorAll('input[data-media], #detailVideoInput').forEach(input=>{ input.disabled=true; });
      function loadSavedDetail(){ /* Source files only. */ }

      const projectDetailExtras = {
        'ROAR': ['EOS authentication, sessions, party flow and invites','Networked weapon, combat and player-state support','Companion AI using Behavior Trees','Replication testing and gameplay stabilization'],
        'BOUNTY HUNTER ROYAL': ['Animation Blueprint and locomotion stabilization','Pickup and drop interaction systems','Gameplay bug fixing and engine migration support','Production iteration with design feedback'],
        'RED BAMBOO': ['Inventory and interaction design','Threat-state and enemy AI behavior','Randomized survival objectives','Atmosphere and player feedback systems'],
        'HAPPY NOW 2': ['Core arcade loop and responsive controls','Progression, rewards and mobile UI','Android packaging and release iteration','Performance tuning for mobile hardware'],
        'SOUL EATER': ['Ability-driven combat loop','Roguelike progression and balancing','Enemy waves and player upgrades','Responsive top-down action feel']
      };

      function openProjectDetail(index){
        const item = fullProjectList[index];
        if (!item) return;
        const target = item.link || (item.id ? `projects/${item.id}.html` : '');
        if (target) window.location.href = target;
      }
      function closeProjectDetail(){
        detailPanel?.classList.remove('is-open');
        detailPanel?.setAttribute('aria-hidden','true');
        document.body.classList.remove('project-detail-open');
      }
      detailClose?.addEventListener('click', closeProjectDetail);
      detailNext?.addEventListener('click', ()=>openProjectDetail(Number(detailNext.dataset.next || 0)));

      function renderWorks(filter='all') {
        activeWorksFilter = filter;
        worksGrid.innerHTML = '';
        fullProjectList.forEach((item, index) => {
          if (filter !== 'all' && !item.categories.includes(filter)) return;
          const card = document.createElement('article');
          card.className = 'library-card';
          card.dataset.projectIndex = String(index);
          card.style.transitionDelay = `${Math.min(index,8)*45}ms`;
          card.innerHTML = `<div class="library-media"><img src="${item.image}" alt="${item.title}" draggable="false"></div><div class="library-meta"><span class="library-year owner-work-field" data-work-field="year">${item.year}</span><span class="library-tags owner-work-field" data-work-field="tags">[${item.tags.join(', ')}]</span></div><h3 class="library-name owner-work-field" data-work-field="title">${item.title}</h3><button type="button" class="library-open-btn">OPEN</button>`;
          const openLibraryProject = () => {
            if (worksMetadataEditingAllowed()) return;
            openProjectDetail(index);
          };
          card.addEventListener('click', openLibraryProject);
          card.querySelector('.library-open-btn')?.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation(); openProjectDetail(index);
          });
          worksGrid.appendChild(card);
        });
        syncWorksMetadataEditing();
      }

      worksGrid?.addEventListener('pointerdown', event => {
        if (!worksMetadataEditingAllowed() || !event.target.closest('[data-work-field]')) return;
        event.stopPropagation();
      }, true);
      worksGrid?.addEventListener('click', event => {
        if (!worksMetadataEditingAllowed() || !event.target.closest('[data-work-field]')) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);
      worksGrid?.addEventListener('keydown', event => {
        const field = event.target.closest('[data-work-field]');
        if (!field || !worksMetadataEditingAllowed()) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          field.blur();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          renderWorks(activeWorksFilter);
        }
      });
      worksGrid?.addEventListener('focusout', event => {
        const field = event.target.closest('[data-work-field]');
        if (!field || !worksMetadataEditingAllowed()) return;
        const card = field.closest('.library-card');
        const index = Number(card?.dataset.projectIndex);
        if (!Number.isInteger(index)) return;
        updateWorksMetadata(index, field.dataset.workField, field.textContent);
        const item = fullProjectList[index];
        if (field.dataset.workField === 'tags') field.textContent = `[${item.tags.join(', ')}]`;
        else field.textContent = item[field.dataset.workField];
      }, true);

      new MutationObserver(syncWorksMetadataEditing).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      function openWorksPanel(startIndex=projectIndex) {
        if (!worksPanel) return;
        renderWorks('all');
        worksFilters.forEach((b,i)=>b.classList.toggle('is-active',i===0));
        worksPanel.classList.add('is-open');
        worksPanel.setAttribute('aria-hidden','false');
        document.body.classList.add('works-panel-open');
        worksPanel.scrollTop = 0;
      }
      function closeWorksPanel() {
        worksPanel.classList.remove('is-open');
        worksPanel.setAttribute('aria-hidden','true');
        document.body.classList.remove('works-panel-open');
        if (location.hash === '#works') history.replaceState(null, '', '#projects');
      }
      worksClose?.addEventListener('click', closeWorksPanel);
      worksPanel?.addEventListener('click', e => { if (e.target === worksPanel) closeWorksPanel(); });
      worksFilters.forEach(button => button.addEventListener('click', () => {
        worksFilters.forEach(b => b.classList.remove('is-active'));
        button.classList.add('is-active');
        renderWorks(button.dataset.filter);
      }));
      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && detailPanel?.classList.contains('is-open')) { closeProjectDetail(); return; }
        if (e.key === 'Escape' && worksPanel?.classList.contains('is-open')) closeWorksPanel();
      });
      // Public runtime API used by owner-only project management extensions.
      window.AyushWorksRuntime = {
        fullProjectList,
        renderWorks,
        openProjectDetail,
        saveWorksMetadata,
        updateWorksMetadata,
        get activeFilter(){ return activeWorksFilter; },
        get featuredProjectCount(){ return projectData.length; }
      };

      if (location.hash === '#works') window.setTimeout(() => openWorksPanel(projectIndex), 3200);

    })();


