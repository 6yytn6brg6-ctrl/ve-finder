// V/E Finder v1.6: distance submenu, dark mode and live map-viewport exploration.
(() => {
  const sortSelect = document.getElementById('sortSelect');
  const radiusSelect = document.getElementById('radiusSelect');
  const statusMsg = document.getElementById('statusMsg');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const allBtn = document.getElementById('allBtn');

  // --- Distance submenu ----------------------------------------------------
  // Distance choices also set the nearby radius and keep distance sorting.
  if (sortSelect && radiusSelect) {
    const currentRadius = ['10', '25', '50'].includes(radiusSelect.value) ? radiusSelect.value : '25';
    sortSelect.innerHTML = `
      <optgroup label="Entfernung">
        <option value="distance10">10 km</option>
        <option value="distance25">25 km</option>
        <option value="distance50">50 km</option>
      </optgroup>
      <option value="state">Bundesland</option>
      <option value="name">Name</option>`;
    sortSelect.value = `distance${currentRadius}`;
  }

  let viewportMode = false;
  let mapGesture = false;
  const originalFiltered = filtered;

  // In map-explore mode, keep all ordinary filters but replace the fixed
  // radius with the currently visible map bounds.
  filtered = function() {
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

  function chooseRadius(km) {
    viewportMode = false;
    radiusSelect.value = String(km);
    setNearbyActive();
    render();
    if (statusMsg) statusMsg.textContent = `Umkreis ${km} km · nach Entfernung sortiert`;
  }

  sortSelect?.addEventListener('change', () => {
    const match = sortSelect.value.match(/^distance(10|25|50)$/);
    if (match) chooseRadius(Number(match[1]));
  }, true);

  radiusSelect?.addEventListener('change', () => {
    viewportMode = false;
    const r = radiusSelect.value;
    if (['10', '25', '50'].includes(r) && sortSelect) sortSelect.value = `distance${r}`;
  }, true);

  nearbyBtn?.addEventListener('click', () => {
    viewportMode = false;
    const r = radiusSelect?.value;
    if (sortSelect && ['10', '25', '50'].includes(r)) sortSelect.value = `distance${r}`;
  });

  allBtn?.addEventListener('click', () => {
    viewportMode = false;
  });

  // --- Explore visible map area -------------------------------------------
  // Only a real finger/mouse gesture activates viewport mode. Programmatic
  // setView/fitBounds calls (locate, route display) therefore do not.
  const mapEl = map.getContainer();
  const markGesture = () => { mapGesture = true; };
  mapEl.addEventListener('pointerdown', markGesture, { passive: true });
  mapEl.addEventListener('touchstart', markGesture, { passive: true });
  mapEl.addEventListener('wheel', markGesture, { passive: true });

  map.on('moveend', () => {
    if (!mapGesture) return;
    mapGesture = false;

    viewportMode = true;
    setNearbyActive();
    render();
    if (statusMsg) statusMsg.textContent = 'Kartenausschnitt aktiv · alle passenden Stationen im sichtbaren Bereich';
  });

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
