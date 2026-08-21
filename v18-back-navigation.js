// V/E Finder v1.8: explicit back navigation for station details and route map mode.
(() => {
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const sortSelect = document.getElementById('sortSelect');
  const statusMsg = document.getElementById('statusMsg');

  function contextLabel() {
    const value = sortSelect?.value || '';
    if (value.startsWith('state:')) return value.slice(6);
    const distance = value.match(/^distance(10|25|50)$/);
    if (distance) return `${distance[1]}-km-Umkreis`;
    if (statusMsg?.textContent?.includes('Kartenausschnitt aktiv')) return 'Kartenausschnitt';
    return mode === 'all' ? 'Alle Stationen' : 'In der Nähe';
  }

  const previousDetail = detail;
  detail = function(x) {
    const returnView = { center: map.getCenter(), zoom: map.getZoom() };
    const returnStatus = statusMsg?.textContent || '';
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
      map.setView(returnView.center, returnView.zoom, { animate: false });
      if (statusMsg) statusMsg.textContent = returnStatus;
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
