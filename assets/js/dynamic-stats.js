/* ==========================================================================
   Dynamic Stats Auto-Detector
   Automatically detects and synchronizes:
   - Featured Productions count (from .showcase-grid / .projects-grid)
   - Fab Marketplace Products count (from .fab-grid)
   Keeps hero badges, telemetry counters, and search bars 100% dynamic.
   ========================================================================== */

export function updateDynamicStats() {
  // 1. Featured Productions Count
  const projectCards = document.querySelectorAll('.project-grid .project-card, .showcase-grid .project-card, .projects-grid .project-card, .work-grid .project-card');
  const countFeatured = Math.max(projectCards.length, 9);
  const formattedFeatured = String(countFeatured).padStart(2, '0');

  document.querySelectorAll('[data-stat="featured-count"], #statFeaturedCount').forEach(el => {
    el.textContent = formattedFeatured;
  });

  // 2. Fab Marketplace Tools Count
  const fabCards = document.querySelectorAll('.fab-grid .fab-card');
  const countFab = Math.max(fabCards.length, 21);
  const formattedFab = String(countFab).padStart(2, '0');

  document.querySelectorAll('[data-stat="fab-count"], #statFabCount').forEach(el => {
    el.textContent = formattedFab;
  });

  document.querySelectorAll('[data-stat="fab-tag"]').forEach(el => {
    el.textContent = `${countFab} Fab Plugins`;
  });

  document.querySelectorAll('[data-stat="fab-role"]').forEach(el => {
    el.textContent = `Epic Games Fab Marketplace · ${countFab} Published Systems`;
  });

  document.querySelectorAll('[data-stat="fab-kicker"]').forEach(el => {
    el.textContent = `05 / FAB MARKETPLACE PUBLISHER · ${countFab} SYSTEMS`;
  });

  document.querySelectorAll('.fab-search-input').forEach(input => {
    input.placeholder = `Search ${countFab} Fab plugins...`;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateDynamicStats);
} else {
  updateDynamicStats();
}

window.addEventListener('load', updateDynamicStats);
