/* ==========================================================================
   Quick Command Palette (Ctrl+K / Cmd+K)
   Instant keyboard navigation across projects, pages, and actions.
   ========================================================================== */

import { toggleAudio, playHover, playClick } from './audio-system.js';

function initCommandPalette() {
  if (document.getElementById('commandPaletteModal')) return;

  // Determine root path prefix depending on whether we are in a subfolder like /work/ or /projects/
  const isSubdir = window.location.pathname.includes('/work/') || 
                   window.location.pathname.includes('/about/') || 
                   window.location.pathname.includes('/contact/') || 
                   window.location.pathname.includes('/projects/');
  const root = isSubdir ? '../' : './';
  const isDeepSubdir = (window.location.pathname.match(/\/projects\/[^/]+\//) !== null);
  const deepRoot = isDeepSubdir ? '../../' : root;

  const items = [
    // Projects
    { title: 'ROAR', category: 'Project', subtitle: 'Multiplayer FPS & EOS Matchmaking', url: `${deepRoot}projects/roar/index.html`, icon: '🎮' },
    { title: 'AIR EVENTS', category: 'Project', subtitle: 'Metaverse 3D Meeting Space', url: `${deepRoot}projects/air-events/index.html`, icon: '🌐' },
    { title: 'VR Tour', category: 'Project', subtitle: 'Interactive ArchViz & Material Swapper', url: `${deepRoot}projects/vr-tour/index.html`, icon: '🥽' },
    { title: 'LEKH', category: 'Project', subtitle: 'Atmospheric Narrative Adventure', url: `${deepRoot}projects/lekh/index.html`, icon: '🏔️' },
    { title: 'FLAWS: The Shadow', category: 'Project', subtitle: 'Action Adventure & AI Combat', url: `${deepRoot}projects/flaws-the-shadow/index.html`, icon: '⚔️' },
    { title: 'Soul Eater', category: 'Project', subtitle: 'Rogue-lite Horde Survival Mobile', url: `${deepRoot}projects/soul-eater/index.html`, icon: '💀' },
    { title: 'Basketball Mobile', category: 'Project', subtitle: '3v3 Real-Time Physics Sports', url: `${deepRoot}projects/basketball-mobile/index.html`, icon: '🏀' },
    { title: 'Happy Now 2', category: 'Project', subtitle: 'Android Mobile Arcade & Touch Systems', url: `${deepRoot}projects/happy-now-2/index.html`, icon: '⚡' },
    { title: 'Happy Now', category: 'Project', subtitle: 'Android Obstacle Runner & Timing Loops', url: `${deepRoot}projects/happy-now/index.html`, icon: '🎯' },

    // Pages
    { title: 'Home', category: 'Page', subtitle: 'Landing page & Hero', url: `${deepRoot}index.html`, icon: '🏠' },
    { title: 'Work', category: 'Page', subtitle: 'Full Selected Projects Archive', url: `${deepRoot}work/index.html`, icon: '📁' },
    { title: 'About', category: 'Page', subtitle: 'Experience, 4+ Years, CarinaSoftLabs, Freelance', url: `${deepRoot}about/index.html`, icon: '👤' },
    { title: 'Contact', category: 'Page', subtitle: 'Get in touch & socials', url: `${deepRoot}contact/index.html`, icon: '✉️' },

    // Quick Actions
    { title: 'Download Resume', category: 'Action', subtitle: 'Ayush_Sonare_Resume.pdf', url: `${deepRoot}assets/documents/Ayush_Sonare_Resume.pdf`, download: true, icon: '📄' },
    { title: 'Email Ayush Sonare', category: 'Action', subtitle: 'ayushsonare692@gmail.com', url: 'mailto:ayushsonare692@gmail.com', icon: '📬' },
    { title: 'ZedStudioz on Fab Marketplace', category: 'Action', subtitle: '21+ Unreal Engine Plugins & Systems', url: 'https://www.fab.com/sellers/ZedStudioz', external: true, icon: '⚡' },
    { title: 'GitHub Profile', category: 'Action', subtitle: 'github.com/ayushsonare', url: 'https://github.com/ayushsonare/', external: true, icon: '🐙' },
    { title: 'LinkedIn Profile', category: 'Action', subtitle: 'Connect with Ayush Sonare', url: 'https://www.linkedin.com/in/ayush-sonare-55155221b', external: true, icon: '💼' },
    { title: 'Unlock Developer God Mode', category: 'Easter Egg', subtitle: 'Konami Code Secret (godmode)', action: 'unlock-godmode', icon: '🏆' },
    { title: 'Background: 3D Cyber Grid', category: 'Ambience', subtitle: '3D perspective grid with glow orbs', action: 'bg-grid', icon: '🌐' },
    { title: 'Background: Deep Space Stars', category: 'Ambience', subtitle: 'Volumetric cosmic starfield motes', action: 'bg-stars', icon: '✨' },
    { title: 'Background: Matrix Code Rain', category: 'Ambience', subtitle: 'Streaming Unreal C++ glyph rain', action: 'bg-matrix', icon: '💻' }
  ];

  const modal = document.createElement('div');
  modal.id = 'commandPaletteModal';
  modal.className = 'cmd-palette-backdrop';
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="cmd-palette-dialog" role="dialog" aria-modal="true" aria-label="Command Navigation Palette">
      <div class="cmd-palette-header">
        <span class="cmd-search-icon" aria-hidden="true">🔍</span>
        <input type="text" id="cmdPaletteInput" class="cmd-palette-input" placeholder="Search projects, pages, or actions..." autocomplete="off" spellcheck="false" />
        <span class="cmd-esc-badge" aria-hidden="true">ESC</span>
      </div>
      <div class="cmd-palette-body" id="cmdPaletteResults" role="listbox">
        <!-- Results rendered dynamically -->
      </div>
      <div class="cmd-palette-footer">
        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
        <span><kbd>↵</kbd> Select</span>
        <span><kbd>ESC</kbd> Close</span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const input = document.getElementById('cmdPaletteInput');
  const resultsContainer = document.getElementById('cmdPaletteResults');
  let selectedIndex = 0;
  let activeMatches = [...items];

  function renderList(list) {
    activeMatches = list;
    if (selectedIndex >= activeMatches.length) {
      selectedIndex = Math.max(0, activeMatches.length - 1);
    }

    if (list.length === 0) {
      resultsContainer.innerHTML = `
        <div class="cmd-empty-state">
          <p>No matching commands found.</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = list.map((item, idx) => `
      <div class="cmd-item ${idx === selectedIndex ? 'is-selected' : ''}" role="option" data-index="${idx}" aria-selected="${idx === selectedIndex}">
        <span class="cmd-item-icon">${item.icon}</span>
        <div class="cmd-item-details">
          <div class="cmd-item-title">${item.title}</div>
          <div class="cmd-item-subtitle">${item.subtitle}</div>
        </div>
        <span class="cmd-item-tag">${item.category}</span>
      </div>
    `).join('');

    // Attach click and hover
    resultsContainer.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        setSelectedIndex(idx, false);
      });
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        executeItem(activeMatches[idx]);
      });
    });

    scrollSelectedIntoView();
  }

  function setSelectedIndex(newIndex, scroll = true) {
    selectedIndex = newIndex;
    const allItems = resultsContainer.querySelectorAll('.cmd-item');
    allItems.forEach((el, idx) => {
      el.classList.toggle('is-selected', idx === selectedIndex);
      el.setAttribute('aria-selected', idx === selectedIndex);
    });
    if (scroll) scrollSelectedIntoView();
  }

  function scrollSelectedIntoView() {
    const selectedEl = resultsContainer.querySelector('.cmd-item.is-selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function executeItem(item) {
    if (!item) return;
    playClick();
    closePalette();

    if (item.action === 'toggle-audio') {
      toggleAudio();
      return;
    }

    if (item.action === 'unlock-godmode') {
      window.dispatchEvent(new CustomEvent('unlockgodmode'));
      return;
    }

    if (item.action && item.action.startsWith('bg-')) {
      const preset = item.action.replace('bg-', '');
      if (window.setBgPreset) window.setBgPreset(preset);
      return;
    }

    if (item.external) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.download) {
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.title;
      link.click();
    } else {
      window.location.href = item.url;
    }
  }

  function openPalette() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderList(items);
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('is-open')) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closePalette();
    }
  });

  // Custom event trigger from HUD button
  window.addEventListener('opencommandpalette', () => {
    openPalette();
  });

  // Modal backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePalette();
    }
  });

  // Search input live filtering
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      renderList(items);
      return;
    }
    const filtered = items.filter(item => {
      return item.title.toLowerCase().includes(query) ||
             item.subtitle.toLowerCase().includes(query) ||
             item.category.toLowerCase().includes(query);
    });
    selectedIndex = 0;
    renderList(filtered);
  });

  // Arrow key navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeMatches.length > 0) {
        setSelectedIndex((selectedIndex + 1) % activeMatches.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeMatches.length > 0) {
        setSelectedIndex((selectedIndex - 1 + activeMatches.length) % activeMatches.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeMatches[selectedIndex]) {
        executeItem(activeMatches[selectedIndex]);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommandPalette);
} else {
  initCommandPalette();
}
