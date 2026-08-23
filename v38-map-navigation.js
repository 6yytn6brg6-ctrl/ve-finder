// V/E Finder v3.8: start Organic Maps navigation from the calculated route map.
(() => {
  const mapEl = document.getElementById('map');
  const previousRouteTo = window.routeTo;
  if (!mapEl || typeof previousRouteTo !== 'function') return;

  let activeRouteId = null;

  const routeNavBtn = document.createElement('button');
  routeNavBtn.id = 'routeNavBtn';
  routeNavBtn.type = 'button';
  routeNavBtn.textContent = 'Navigation starten';
  routeNavBtn.setAttribute('aria-label', 'Navigation für die angezeigte Route starten');
  mapEl.appendChild(routeNavBtn);

  routeNavBtn.addEventListener('click', () => {
    if (!activeRouteId || typeof window.startOrganicNav !== 'function') return;
    window.startOrganicNav(activeRouteId);
  });

  window.routeTo = async id => {
    await previousRouteTo(id);
    if (document.body.classList.contains('route-mode')) activeRouteId = id;
  };

  const style = document.createElement('style');
  style.textContent = `
    #routeNavBtn {
      display:none;
      position:fixed;
      top:calc(env(safe-area-inset-top) + 86px);
      right:12px;
      z-index:7000;
      border:0;
      border-radius:12px;
      padding:10px 13px;
      background:#174b3dee;
      color:#fff;
      font-weight:750;
      font-size:13px;
      box-shadow:0 3px 14px #0004;
    }
    body.route-mode #routeNavBtn { display:block; }
    html[data-theme="dark"] #routeNavBtn { background:#123d31ee; color:#eef6f2; }
  `;
  document.head.appendChild(style);
})();
