// V/E Finder v2.9: dedicated iPhone landscape layout with map-first split view.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    @media (orientation:landscape) and (max-height:600px) {
      html, body {
        height:100%;
        overflow:hidden;
      }
      body {
        padding-bottom:0 !important;
      }
      #app {
        height:100%;
        min-height:0;
        display:flex;
        flex-direction:column;
        overflow:hidden;
      }

      /* Save vertical space in landscape while keeping the main controls visible. */
      .topbar {
        flex:0 0 46px !important;
        height:46px !important;
        padding:4px 12px !important;
      }
      .topbar h1 {
        font-size:18px !important;
      }
      .eyebrow {
        display:none !important;
      }
      .iconbtn {
        width:34px !important;
        height:34px !important;
        border-radius:10px !important;
        font-size:22px !important;
      }

      .searchbar {
        flex:0 0 44px !important;
        padding:5px 8px !important;
        gap:6px !important;
      }
      .searchbar input {
        padding:7px 10px !important;
        border-radius:10px !important;
        font-size:14px !important;
      }
      .secondary {
        padding:0 12px !important;
        border-radius:10px !important;
        font-size:12px !important;
      }

      /* Filters open as a floating panel so they do not shrink the map/list split. */
      #filters:not(.hidden) {
        position:fixed !important;
        z-index:1400 !important;
        top:calc(env(safe-area-inset-top) + 94px) !important;
        left:10px !important;
        right:10px !important;
        max-height:calc(100vh - 150px) !important;
        overflow:auto !important;
        border:1px solid var(--line) !important;
        border-radius:14px !important;
        box-shadow:0 10px 30px #0003 !important;
      }

      /* Landscape is a true split view: large map left, compact list right. */
      main {
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow:hidden !important;
        display:grid !important;
        grid-template-columns:minmax(0,68fr) minmax(230px,32fr) !important;
        grid-template-rows:minmax(0,1fr) !important;
      }
      #map {
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
      }
      .results-panel {
        min-width:0 !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
        overscroll-behavior:contain;
        padding:0 7px calc(50px + env(safe-area-inset-bottom)) !important;
        border-left:1px solid var(--line);
      }
      .panel-head {
        height:31px !important;
        font-size:11.5px !important;
      }
      .panel-head select {
        padding:3px 5px !important;
        font-size:10px !important;
        border-radius:8px !important;
      }
      .statusmsg {
        max-width:100%;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        padding-bottom:4px !important;
        font-size:8.5px !important;
        line-height:1.1 !important;
      }
      .results {
        gap:4px !important;
      }
      .result-card {
        min-height:0 !important;
        padding:5px 55px 5px 7px !important;
        border-radius:9px !important;
        border-left-width:4px !important;
      }
      .result-title {
        margin-bottom:2px !important;
        font-size:11px !important;
        line-height:1.1 !important;
      }
      .result-meta {
        gap:4px !important;
        font-size:8px !important;
        line-height:1.05 !important;
      }
      .badges {
        margin-top:3px !important;
        gap:2px !important;
      }
      .badge {
        padding:1px 4px !important;
        font-size:7.5px !important;
      }
      .result-details-btn {
        right:5px !important;
        padding:4px 5px !important;
        font-size:8px !important;
      }

      .bottomnav {
        height:calc(46px + env(safe-area-inset-bottom)) !important;
      }
      .bottomnav button {
        font-size:17px !important;
      }
      .bottomnav button span {
        font-size:8px !important;
      }

      /* Detail sheets are easier to use centered in the shallow landscape screen. */
      .sheet {
        width:min(76vw,620px) !important;
        max-height:92vh !important;
        margin:auto !important;
        border-radius:18px !important;
      }
      .sheet-inner {
        max-height:92vh !important;
        padding-bottom:16px !important;
      }
    }
  `;
  document.head.appendChild(style);

  const refreshMap = () => {
    try { map.invalidateSize({ animate:false, pan:false }); } catch (_) { }
  };

  // WKWebView can report its final size a little after the device rotation.
  window.addEventListener('resize', () => {
    requestAnimationFrame(refreshMap);
    setTimeout(refreshMap, 180);
  }, { passive:true });
  window.addEventListener('orientationchange', () => {
    setTimeout(refreshMap, 220);
  }, { passive:true });

  setTimeout(refreshMap, 300);
})();
