// V/E Finder v2.5: keep the map visible while scrolling and separate station selection from opening details.
(() => {
  const resultsEl = document.getElementById('results');
  const resultsPanel = document.querySelector('.results-panel');
  const sortSelect = document.getElementById('sortSelect');
  const radiusSelect = document.getElementById('radiusSelect');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const filterBtn = document.getElementById('filterBtn');
  const searchInput = document.getElementById('searchInput');

  if (!resultsEl || !sortSelect || !radiusSelect) return;

  let activeId = null;
  let activeFlag = null;
  let scrollFrame = 0;
  let fitTimer = 0;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function entryById(id) {
    return all().find(entry => entry.id === id) || null;
  }

  function isDistanceContext() {
    return /^distance(10|25|50)$/.test(sortSelect.value || '') && mode === 'nearby';
  }

  function clearActiveCard() {
    document.querySelectorAll('.result-card.map-active').forEach(card => {
      card.classList.remove('map-active');
      card.setAttribute('aria-selected', 'false');
    });
  }

  function removeActiveFlag() {
    if (activeFlag) {
      activeFlag.remove();
      activeFlag = null;
    }
  }

  function cardForId(id) {
    return [...resultsEl.querySelectorAll('.result-card')].find(card => card.dataset.id === id) || null;
  }

  function setActiveStation(id) {
    if (!id) {
      activeId = null;
      clearActiveCard();
      removeActiveFlag();
      return;
    }

    const entry = entryById(id);
    const card = cardForId(id);
    if (!entry || !card) return;

    activeId = id;
    clearActiveCard();
    card.classList.add('map-active');
    card.setAttribute('aria-selected', 'true');
    removeActiveFlag();

    const label = escapeHtml(entry.name || 'Station');
    const flagIcon = L.divIcon({
      className: 've-active-flag-icon',
      html: `<div class="ve-active-flag"><span class="ve-flag-symbol">🚩</span><span class="ve-flag-label">${label}</span></div>`,
      iconSize: [190, 46],
      iconAnchor: [18, 42]
    });

    activeFlag = L.marker([entry.lat, entry.lon], {
      icon: flagIcon,
      zIndexOffset: 2500,
      interactive: false
    }).addTo(map);
  }

  function wireCards() {
    resultsEl.querySelectorAll('.result-card').forEach(card => {
      card.setAttribute('role', 'button');
      card.setAttribute('aria-selected', card.dataset.id === activeId ? 'true' : 'false');

      let detailsBtn = card.querySelector('.result-details-btn');
      if (!detailsBtn) {
        detailsBtn = document.createElement('button');
        detailsBtn.type = 'button';
        detailsBtn.className = 'result-details-btn';
        detailsBtn.textContent = 'Details ›';
        card.appendChild(detailsBtn);
      }

      detailsBtn.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const entry = entryById(card.dataset.id);
        if (entry) detail(entry);
      };

      // A tap on the card now only selects the station on the map. Details are
      // opened deliberately with the separate button, avoiding accidental jumps.
      card.onclick = event => {
        if (event.target.closest('.result-details-btn')) return;
        event.preventDefault();
        event.stopPropagation();
        setActiveStation(card.dataset.id);
      };
    });
  }

  function cardVisibleAmount(card) {
    const rect = card.getBoundingClientRect();
    const panelRect = resultsPanel?.getBoundingClientRect();
    const topLimit = Math.max(0, panelRect?.top || 0);
    const bottomLimit = Math.min(window.innerHeight, panelRect?.bottom || window.innerHeight);
    const visibleTop = Math.max(rect.top, topLimit);
    const visibleBottom = Math.min(rect.bottom, bottomLimit);
    return Math.max(0, visibleBottom - visibleTop);
  }

  function updateActiveFromScroll() {
    scrollFrame = 0;
    if (document.body.classList.contains('route-mode')) return;

    const cards = [...resultsEl.querySelectorAll('.result-card')];
    if (!cards.length) {
      setActiveStation(null);
      return;
    }

    let best = null;
    let bestVisible = 0;
    for (const card of cards) {
      const visible = cardVisibleAmount(card);
      if (visible > bestVisible) {
        best = card;
        bestVisible = visible;
      }
    }

    if (!best || bestVisible <= 0) return;
    if (best.dataset.id !== activeId) setActiveStation(best.dataset.id);
  }

  function scheduleScrollSync() {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateActiveFromScroll);
  }

  function fitCurrentResults() {
    if (!isDistanceContext() || document.body.classList.contains('route-mode')) return;
    const entries = filtered();
    if (!entries.length) return;

    const points = entries
      .filter(entry => Number.isFinite(Number(entry.lat)) && Number.isFinite(Number(entry.lon)))
      .map(entry => [Number(entry.lat), Number(entry.lon)]);

    if (pos && Number.isFinite(pos.lat) && Number.isFinite(pos.lon)) points.push([pos.lat, pos.lon]);
    if (!points.length) return;

    // The map now lives in its own fixed pane on phones, so Leaflet must know
    // the final pane size before framing the result set.
    map.invalidateSize({ animate: false, pan: false });

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: false });
    } else {
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [30, 26],
        paddingBottomRight: [30, 26],
        animate: false,
        maxZoom: 13
      });
    }
  }

  function scheduleFit(delay = 180) {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => {
      fitCurrentResults();
      scheduleScrollSync();
    }, delay);
  }

  // Wrap render so every newly created card gets the new select/details behavior
  // and the active list/map state remains synchronized.
  const previousRender = render;
  render = function() {
    const result = previousRender();
    requestAnimationFrame(() => {
      wireCards();
      const stillThere = activeId && cardForId(activeId);
      if (stillThere) setActiveStation(activeId);
      else {
        const first = resultsEl.querySelector('.result-card');
        setActiveStation(first?.dataset.id || null);
      }
      scheduleScrollSync();
    });
    return result;
  };

  // Reframe after anything that changes the current result set. This guarantees
  // that all stations shown in the list are also visible in the map pane.
  sortSelect.addEventListener('change', () => {
    if (/^distance(10|25|50)$/.test(sortSelect.value || '')) scheduleFit(300);
  });

  radiusSelect.addEventListener('change', () => {
    if (['10', '25', '50'].includes(radiusSelect.value)) scheduleFit(350);
  });

  nearbyBtn?.addEventListener('click', () => {
    if (['10', '25', '50'].includes(radiusSelect.value)) scheduleFit(350);
  });

  searchInput?.addEventListener('input', () => scheduleFit(280));
  ['fCassette', 'fGrey', 'fWater', 'fTrash', 'fConfirmed'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => scheduleFit(280));
  });

  filterBtn?.addEventListener('click', () => {
    setTimeout(() => {
      map.invalidateSize({ animate: false, pan: false });
      scheduleFit(80);
    }, 80);
  });

  window.addEventListener('resize', () => {
    map.invalidateSize({ animate: false, pan: false });
    scheduleFit(120);
  }, { passive: true });
  resultsPanel?.addEventListener('scroll', scheduleScrollSync, { passive: true });

  // Full data and geolocation arrive asynchronously on startup. Reframe once
  // both have had time to settle so the first 25-km result set is complete.
  setTimeout(() => {
    wireCards();
    map.invalidateSize({ animate: false, pan: false });
    scheduleFit(0);
  }, 2200);

  const style = document.createElement('style');
  style.textContent = `
    /* On phones, the map and list are two independent panes. Only the list
       scrolls, so the map remains visible while browsing the results. */
    @media (max-width:849px) {
      html, body { height:100%; overflow:hidden; }
      body { padding-bottom:0 !important; }
      #app {
        height:100%;
        min-height:0;
        display:flex;
        flex-direction:column;
        overflow:hidden;
      }
      .topbar { flex:0 0 74px; }
      .searchbar { flex:0 0 auto; }
      #filters {
        flex:0 0 auto;
        max-height:30vh;
        overflow:auto;
      }
      main {
        flex:1 1 auto;
        min-height:0;
        overflow:hidden;
        display:grid !important;
        grid-template-rows:minmax(175px,31vh) minmax(0,1fr) !important;
      }
      #map {
        width:100% !important;
        height:100% !important;
        min-height:175px;
      }
      .results-panel {
        min-height:0;
        overflow-y:auto;
        -webkit-overflow-scrolling:touch;
        overscroll-behavior:contain;
        padding-bottom:calc(82px + env(safe-area-inset-bottom));
      }
    }

    .result-card.map-active {
      background:#fff3f1 !important;
      box-shadow:inset 0 0 0 2px #d84a43, 0 3px 12px #0002;
      transform:translateY(-1px);
    }
    html[data-theme="dark"] .result-card.map-active {
      background:#3a2422 !important;
      box-shadow:inset 0 0 0 2px #ef746d, 0 3px 12px #0005;
    }
    .result-details-btn {
      display:block;
      width:max-content;
      margin:9px 0 0 auto;
      padding:6px 10px;
      border:0;
      border-radius:999px;
      background:#e8efec;
      color:#174b3d;
      font-size:11px;
      font-weight:800;
    }
    html[data-theme="dark"] .result-details-btn {
      background:#2b3933;
      color:#d7eee4;
    }
    .ve-active-flag-icon {
      background:transparent !important;
      border:0 !important;
    }
    .ve-active-flag {
      display:flex;
      align-items:center;
      gap:5px;
      width:max-content;
      max-width:185px;
      filter:drop-shadow(0 2px 4px #0005);
      transform-origin:left bottom;
      animation:veFlagOpen .16s ease-out;
    }
    .ve-flag-symbol {
      font-size:30px;
      line-height:1;
    }
    .ve-flag-label {
      display:block;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      max-width:145px;
      padding:5px 8px;
      border-radius:9px;
      background:#d43e38;
      color:white;
      font-size:12px;
      font-weight:800;
      line-height:1.1;
    }
    @keyframes veFlagOpen {
      from { opacity:0; transform:scale(.82) translateY(5px); }
      to { opacity:1; transform:scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
