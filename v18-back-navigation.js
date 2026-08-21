// V/E Finder v2.3: explicit back navigation that restores the exact previous search context.
(() => {
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const sortSelect = document.getElementById('sortSelect');
  const radiusSelect = document.getElementById('radiusSelect');
  const searchInput = document.getElementById('searchInput');
  const statusMsg = document.getElementById('statusMsg');

  const filterIds = ['fCassette', 'fGrey', 'fWater', 'fTrash', 'fConfirmed'];

  function contextLabel() {
    const status = statusMsg?.textContent || '';
    if (status.includes('Kartenausschnitt aktiv')) return 'Kartenausschnitt';

    const value = sortSelect?.value || '';
    if (value.startsWith('state:')) return value.slice(6);

    const distance = value.match(/^distance(10|25|50)$/);
    if (mode === 'nearby' && distance) return `${distance[1]}-km-Umkreis`;

    return mode === 'all' ? 'Alle Stationen' : 'In der Nähe';
  }

  function snapshotContext() {
    return {
      center: map.getCenter(),
      zoom: map.getZoom(),
      mode,
      sort: sortSelect?.value || '',
      radius: radiusSelect?.value || '',
      search: searchInput?.value || '',
      status: statusMsg?.textContent || '',
      filters: Object.fromEntries(filterIds.map(id => [id, !!document.getElementById(id)?.checked]))
    };
  }

  function restoreContext(ctx) {
    if (!ctx) return;

    if (searchInput) searchInput.value = ctx.search;
    if (radiusSelect && ctx.radius) radiusSelect.value = ctx.radius;
    for (const [id, checked] of Object.entries(ctx.filters || {})) {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    }

    // Re-run the active selection through the normal v1.7 handlers. This is
    // important because it also clears a temporary map-viewport filter that can
    // otherwise be left behind after tapping a marker.
    if (sortSelect && ctx.sort) sortSelect.value = ctx.sort;

    if (ctx.status.includes('Kartenausschnitt aktiv')) {
      // The viewport mode itself is still active while the detail sheet is open;
      // keep it untouched and only restore the map view below.
      mode = ctx.mode;
      render();
    } else if (ctx.sort?.startsWith('state:')) {
      sortSelect?.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (ctx.mode === 'nearby' && /^distance(10|25|50)$/.test(ctx.sort || '')) {
      sortSelect?.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      mode = ctx.mode;
      document.getElementById('nearbyBtn')?.classList.toggle('active', mode === 'nearby');
      document.getElementById('allBtn')?.classList.toggle('active', mode === 'all');
      render();
    }

    // Restore exactly the map position the user had before opening the station.
    // Delay one frame so a radius/state handler cannot overwrite it afterwards.
    requestAnimationFrame(() => {
      map.setView(ctx.center, ctx.zoom, { animate: false });
      if (statusMsg) statusMsg.textContent = ctx.status;
      render();
    });
  }

  const previousDetail = detail;
  detail = function(x) {
    const returnContext = snapshotContext();
    const label = contextLabel();

    previousDetail(x);

    const inner = detailContent?.querySelector('.sheet-inner');
    if (!inner || inner.querySelector('.detail-back-btn')) return;

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'detail-back-btn';
    back.textContent = `← Zurück zu ${label}`;
    back.addEventListener('click', () => {
      if (detailDialog?.open) detailDialog.close();
      restoreContext(returnContext);
    });
    inner.insertBefore(back, inner.firstChild);
  };

  const style = document.createElement('style');
  style.textContent = `
    .detail-back-btn {
      display:block;
      width:max-content;
      max-width:100%;
      margin:0 0 10px;
      border:0;
      border-radius:11px;
      padding:9px 12px;
      background:#e8efec;
      color:#174b3d;
      font-weight:750;
      font-size:13px;
    }
    html[data-theme="dark"] .detail-back-btn {
      background:#26342e;
      color:#d7eee4;
    }
    body.route-mode #routeBackBtn {
      display:block !important;
      position:fixed !important;
      top:calc(env(safe-area-inset-top) + 86px) !important;
      left:12px !important;
      right:auto !important;
      z-index:7000 !important;
      pointer-events:auto !important;
    }
  `;
  document.head.appendChild(style);

  const routeBackBtn = document.getElementById('routeBackBtn');
  if (routeBackBtn) routeBackBtn.textContent = '← Zurück zur Auswahl';
})();
