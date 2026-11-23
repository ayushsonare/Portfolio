/* ==========================================================================
   Fab Marketplace Interactive Filter & Search
   Dynamic category pill filtering and instant search for ZedStudioz plugins.
   ========================================================================== */

function initFabFilter() {
  const fabGrids = document.querySelectorAll('.fab-grid');
  if (!fabGrids.length) return;

  fabGrids.forEach(grid => {
    // Check if filter bar already exists
    if (grid.previousElementSibling && grid.previousElementSibling.classList.contains('fab-filter-toolbar')) {
      return;
    }

    const cards = [...grid.querySelectorAll('.fab-card')];
    if (!cards.length) return;

    // Create toolbar container
    const toolbar = document.createElement('div');
    toolbar.className = 'fab-filter-toolbar';

    toolbar.innerHTML = `
      <div class="fab-filter-categories">
        <button class="fab-cat-btn is-active" data-cat="all">All (${cards.length})</button>
        <button class="fab-cat-btn" data-cat="gameplay">Gameplay & Combat</button>
        <button class="fab-cat-btn" data-cat="systems">Systems & Save</button>
        <button class="fab-cat-btn" data-cat="performance">Performance</button>
        <button class="fab-cat-btn" data-cat="tools">Tools & Debug</button>
        <button class="fab-cat-btn" data-cat="templates">Templates & Mobile</button>
      </div>
      <div class="fab-search-box">
        <span class="fab-search-icon" aria-hidden="true">⚡</span>
        <input type="text" class="fab-search-input" placeholder="Search ${cards.length} Fab plugins..." aria-label="Search Fab plugins" />
      </div>
    `;

    grid.parentNode.insertBefore(toolbar, grid);

    const catButtons = toolbar.querySelectorAll('.fab-cat-btn');
    const searchInput = toolbar.querySelector('.fab-search-input');

    let activeCat = 'all';
    let searchQuery = '';

    function filterCards() {
      let visibleCount = 0;
      cards.forEach(card => {
        const title = card.querySelector('.fab-title')?.textContent.toLowerCase() || '';
        const tag = card.querySelector('.fab-tag')?.textContent.toLowerCase() || '';
        
        // Category matching rules
        let matchesCat = true;
        if (activeCat === 'gameplay') {
          matchesCat = tag.includes('gameplay') || tag.includes('combat') || tag.includes('aim') || tag.includes('dismemberment') || tag.includes('quest') || tag.includes('drift');
        } else if (activeCat === 'systems') {
          matchesCat = tag.includes('save') || tag.includes('system') || tag.includes('checkpoint') || tag.includes('camera');
        } else if (activeCat === 'performance') {
          matchesCat = tag.includes('performance') || tag.includes('optimizer') || tag.includes('pooling');
        } else if (activeCat === 'tools') {
          matchesCat = tag.includes('tool') || tag.includes('debug') || tag.includes('utility') || tag.includes('json') || tag.includes('cheat') || tag.includes('profiler');
        } else if (activeCat === 'templates') {
          matchesCat = tag.includes('template') || tag.includes('mobile') || tag.includes('golf') || tag.includes('control');
        }

        // Search text matching
        const matchesSearch = !searchQuery || title.includes(searchQuery) || tag.includes(searchQuery);

        if (matchesCat && matchesSearch) {
          card.style.display = '';
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.add('is-hidden');
        }
      });

      // No results message handling
      let noResultsMsg = grid.querySelector('.fab-no-results');
      if (visibleCount === 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.className = 'fab-no-results';
          noResultsMsg.innerHTML = '<p>No plugins matching your filter. Try searching for "System", "Save", or "Performance".</p>';
          grid.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }
    }

    // Category click handler
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeCat = btn.getAttribute('data-cat') || 'all';
        filterCards();
      });
    });

    // Search input handler
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      filterCards();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFabFilter);
} else {
  initFabFilter();
}
