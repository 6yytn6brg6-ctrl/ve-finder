// V/E Finder v1.7: radius framing, Bundesland selection, route map mode, dark mode and live map exploration.
(() => {
  const sortSelect = document.getElementById('sortSelect');
  const radiusSelect = document.getElementById('radiusSelect');
  const statusMsg = document.getElementById('statusMsg');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const allBtn = document.getElementById('allBtn');

  const fallbackStates = [
    'Berlin',
    'Brandenburg',
    'Mecklenburg-Vorpommern',
    'Sachsen',
    'Sachsen-Anhalt',
    'Thüringen'
  ];

  function stateValues() {
    const fromData = all()
      .map(x => String(x.state || '').trim())
      .filter(Boolean);
    return [...new Set(fallbackStates.concat(fromData))]
      .sort((a, b) => a.localeCompare(b, 'de'));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function rebuildSortMenu() {
    if (!sortSelect || !radiusSelect) return;

    const previous = sortSelect.value;
    const currentRadius = ['10', '25', '50'].includes(radiusSelect.value) ? radiusSelect.value : '25';
    const states = stateValues();

    sortSelect.innerHTML = `
      <optgroup label="Entfernung">
        <option value="distance10">10 km</option>
        <option value="distance25">25 km</option>
        <option value="distance50">50 km</option>
      </optgroup>
      <optgroup label="Bundesland">
        ${states.map(state => `<option value="state:${escapeHtml(state)}">${escapeHtml(state)}</option>`).join('')}
      </optgroup>
      <option value="name">Name</option>`;

    const validValues = new Set([
      'distance10', 'distance25', 'distance50', 'name',
      ...states.map(state => `state:${state}`)
    ]);
    sortSelect.value = validValues.has(previous) ? previous : `distance${currentRadius}`;
  }

  rebuildSortMenu();
  // The full database is loaded asynchronously; rebuild once more after it is available.
  setTimeout(rebuildSortMenu, 1400);

  let viewportMode = false;
  let mapGesture = false;
  const originalFiltered = filtered;

  function selectedState() {
    const value = sortSelect?.value || '';
    return value.startsWith('state:') ? value.slice(6) : null;
  }

  // State selection shows the whole selected Bundesland (while respecting the
  // ordinary service/status filters). Manual map exploration uses visible bounds.
  filtered = function() {
    const state = selectedState();
    if (state) {
      const previousMode = mode;
      mode = 'all';
      const entries = originalFiltered();
      mode = previousMode;
      return entries.filter(x => x.state === state);
    }

    if (!viewportMode) return originalFiltered();

    const previousMode = mode;
    mode = 'all';
    const entries = originalFiltered();
    mode = previousMode;

    const bounds = map.getBounds();
    return entries.filter(x => bounds.contains(L.latLng(x.lat, x.lon)));
  };

  function setNearbyActive() {
    mode = 'nearby';
    nearbyBtn?.classList.add('active');
    allBtn?.classList.remove('active');
  }

  function setAllActive() {
    mode = 'all';
    allBtn?.classList.add('active');
    nearbyBtn?.classList.remove('active');
  }

  async function fitRadius(km) {
    if (!Number.isFinite(km) || km <= 0 || km >= 9999) return;
    try {
      await getPosition();
      mapGesture = false;
      const bounds = L.circle([pos.lat, pos.lon], { radius: km * 1000 }).getBounds();
      map.fitBounds(bounds, { padding: [14, 14], animate: true });
    } catch (_) { }
  }

  function chooseRadius(km) {
    viewportMode = false;
    mapGesture = false;
    radiusSelect.value = String(km);
    setNearbyActive();
    render();
    fitRadius(km).then(() => {
      if (statusMsg) statusMsg.textContent = `Umkreis ${km} km · nach Entfernung sortiert`;
    });
  }

  function fitState(state) {
    const entries = filtered();
    if (!entries.length) {
      if (statusMsg) statusMsg.textContent = `${state} · keine Station mit den aktuellen Filtern`;
      return;
    }

    mapGesture = false;
    const points = entries.map(x => [x.lat, x.lon]);
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(L.latLngBounds(points), { padding: [22, 22], animate: true });
    if (statusMsg) statusMsg.textContent = `${state} · ${entries.length} passende Station${entries.length === 1 ? '' : 'en'}`;
  }

  sortSelect?.addEventListener('change', () => {
    const radiusMatch = sortSelect.value.match(/^distance(10|25|50)$/);
    if (radiusMatch) {
      chooseRadius(Number(radiusMatch[1]));
      return;
    }

    const state = selectedState();
    if (state) {
      viewportMode = false;
      mapGesture = false;
      setAllActive();
      render();
      fitState(state);
    }
  }, true);

  radiusSelect?.addEventListener('change', () => {
    viewportMode = false;
    mapGesture = false;
    const r = Number(radiusSelect.value);
    if (['10', '25', '50'].includes(radiusSelect.value) && sortSelect) {
      sortSelect.value = `distance${radiusSelect.value}`;
    }
    if (Number.isFinite(r) && r < 9999) fitRadius(r);
  }, true);

  // Reset map-explore mode before the v1.5 section handlers render their list.
  nearbyBtn?.addEventListener('click', () => {
    viewportMode = false;
    mapGesture = false;
    const r = radiusSelect?.value;
    if (sortSelect && ['10', '25', '50'].includes(r)) sortSelect.value = `distance${r}`;
  }, true);

  allBtn?.addEventListener('click', () => {
    viewportMode = false;
    mapGesture = false;
  }, true);

  // --- Explore visible map area -------------------------------------------
  // Only a real finger/mouse gesture activates viewport mode. Programmatic
  // setView/fitBounds calls (locate, route display, radius/state framing) do not.
  const mapEl = map.getContainer();
  const markGesture = () => { mapGesture = true; };
  mapEl.addEventListener('pointerdown', markGesture, { passive: true });
  mapEl.addEventListener('touchstart', markGesture, { passive: true });
  mapEl.addEventListener('wheel', markGesture, { passive: true });

  map.on('moveend', () => {
    if (!mapGesture || document.body.classList.contains('route-mode')) return;
    mapGesture = false;

    viewportMode = true;
    setNearbyActive();
    render();
    if (statusMsg) statusMsg.textContent = 'Kartenausschnitt aktiv · alle passenden Stationen im sichtbaren Bereich';
  });

  // --- Route map mode ------------------------------------------------------
  // A calculated route gets the whole usable screen. The ordinary results list
  // disappears until the user returns to the previous map/list view.
  const routeStyle = document.createElement('style');
  routeStyle.textContent = `
    body.route-mode .searchbar,
    body.route-mode #filters,
    body.route-mode .results-panel { display:none !important; }
    body.route-mode main { display:block !important; }
    body.route-mode #map {
      position:fixed !important;
      left:0;
      right:0;
      top:calc(env(safe-area-inset-top) + 74px);
      bottom:calc(66px + env(safe-area-inset-bottom));
      width:100% !important;
      height:auto !important;
      z-index:5500;
    }
    #routeBackBtn {
      display:none;
      position:absolute;
      top:12px;
      right:12px;
      z-index:1200;
      border:0;
      border-radius:12px;
      padding:10px 13px;
      background:#174b3dee;
      color:white;
      font-weight:750;
      box-shadow:0 3px 14px #0004;
    }
    body.route-mode #routeBackBtn { display:block; }
    html[data-theme="dark"] #routeBackBtn { background:#123d31ee; color:#eef6f2; }
  `;
  document.head.appendChild(routeStyle);

  let routeBackBtn = document.getElementById('routeBackBtn');
  if (!routeBackBtn) {
    routeBackBtn = document.createElement('button');
    routeBackBtn.id = 'routeBackBtn';
    routeBackBtn.type = 'button';
    routeBackBtn.textContent = '← Trefferliste';
    mapEl.appendChild(routeBackBtn);
  }

  let routeReturnView = null;

  function enterRouteMode() {
    document.body.classList.add('route-mode');
    requestAnimationFrame(() => {
      map.invalidateSize();
      if (routeLine) map.fitBounds(routeLine.getBounds().pad(0.12), { animate: false });
    });
  }

  function leaveRouteMode(restoreView = true) {
    if (!document.body.classList.contains('route-mode')) return;
    document.body.classList.remove('route-mode');
    if (routeLine) {
      routeLine.remove();
      routeLine = null;
    }
    map.closePopup();
    requestAnimationFrame(() => {
      map.invalidateSize();
      if (restoreView && routeReturnView) {
        mapGesture = false;
        map.setView(routeReturnView.center, routeReturnView.zoom, { animate: false });
      }
      render();
    });
  }

  routeBackBtn.addEventListener('click', () => leaveRouteMode(true));

  ['nearbyBtn', 'allBtn', 'addBtn', 'dataBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (document.body.classList.contains('route-mode')) leaveRouteMode(false);
    }, true);
  });

  const originalRouteTo = window.routeTo;
  if (typeof originalRouteTo === 'function') {
    window.routeTo = async id => {
      routeReturnView = { center: map.getCenter(), zoom: map.getZoom() };
      const previousLine = routeLine;
      await originalRouteTo(id);
      if (routeLine && routeLine !== previousLine) enterRouteMode();
    };
  }

  // --- Dark mode -----------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .top-actions { display:flex; gap:8px; align-items:center; }
    html[data-theme="dark"] {
      --bg:#0f1513;
      --card:#18201d;
      --ink:#edf3f0;
      --muted:#a7b3ad;
      --brand:#123d31;
      --line:#33423c;
      --green:#55a675;
      --yellow:#e8bd59;
      --red:#d0716d;
      color-scheme:dark;
    }
    html[data-theme="dark"] body,
    html[data-theme="dark"] #app { background:var(--bg); color:var(--ink); }
    html[data-theme="dark"] .searchbar,
    html[data-theme="dark"] .filters,
    html[data-theme="dark"] .bottomnav,
    html[data-theme="dark"] .sheet,
    html[data-theme="dark"] #detailDialog[open],
    html[data-theme="dark"] #dataDialog[open],
    html[data-theme="dark"] #addDialog[open] { background:#151d1a !important; color:var(--ink); }
    html[data-theme="dark"] .searchbar input,
    html[data-theme="dark"] .panel-head select,
    html[data-theme="dark"] .filter-grid select,
    html[data-theme="dark"] .form-grid input,
    html[data-theme="dark"] .form-grid select,
    html[data-theme="dark"] .form-grid textarea { background:#1d2723; color:var(--ink); border-color:var(--line); }
    html[data-theme="dark"] .result-card { background:var(--card); border-color:var(--line); }
    html[data-theme="dark"] .detail-item,
    html[data-theme="dark"] .routebox,
    html[data-theme="dark"] .badge,
    html[data-theme="dark"] .data-legend-row { background:#202b27 !important; color:var(--ink); }
    html[data-theme="dark"] .outline,
    html[data-theme="dark"] .secondary,
    html[data-theme="dark"] .closebtn { background:#26342e; color:#d7eee4; }
    html[data-theme="dark"] .bottomnav { border-top-color:var(--line); }
    html[data-theme="dark"] .bottomnav button { color:#9aa9a2; }
    html[data-theme="dark"] .bottomnav button.active { color:#7fd0ab; }
    html[data-theme="dark"] #map { background:#111715; }
    html[data-theme="dark"] .leaflet-tile-pane { filter:brightness(.62) invert(.90) hue-rotate(180deg) saturate(.65); }
    html[data-theme="dark"] .leaflet-control-zoom a,
    html[data-theme="dark"] .leaflet-control-layers,
    html[data-theme="dark"] .leaflet-popup-content-wrapper,
    html[data-theme="dark"] .leaflet-popup-tip { background:#1b2421; color:#edf3f0; }
    html[data-theme="dark"] .leaflet-control-attribution { background:#151d1acc; color:#a7b3ad; }
    html[data-theme="dark"] .leaflet-control-attribution a { color:#9bd5bc; }
  `;
  document.head.appendChild(style);

  const topbar = document.querySelector('.topbar');
  const locateBtn = document.getElementById('locateBtn');
  let themeBtn = document.getElementById('themeBtn');
  if (topbar && locateBtn && !themeBtn) {
    const actions = document.createElement('div');
    actions.className = 'top-actions';
    locateBtn.parentNode.insertBefore(actions, locateBtn);
    actions.appendChild(locateBtn);

    themeBtn = document.createElement('button');
    themeBtn.id = 'themeBtn';
    themeBtn.className = 'iconbtn';
    themeBtn.setAttribute('aria-label', 'Hell/Dunkel umschalten');
    actions.insertBefore(themeBtn, locateBtn);
  }

  const THEME_KEY = 'vefinder.theme.v1';
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  let theme = localStorage.getItem(THEME_KEY) || (systemDark ? 'dark' : 'light');

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀︎' : '☾';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#123d31' : '#174b3d';
  }

  themeBtn?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
  });

  applyTheme();
})();
