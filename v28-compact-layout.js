// V/E Finder v2.8: larger map pane and denser result cards on phones.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width:849px) {
      /* Give the map the visual priority. The list remains independently
         scrollable underneath, but gets less height because its cards are denser. */
      main {
        grid-template-rows:minmax(235px,55%) minmax(0,1fr) !important;
      }

      .results-panel {
        padding-left:9px !important;
        padding-right:9px !important;
      }

      .panel-head {
        height:38px !important;
        font-size:13px;
      }
      .panel-head select {
        padding:4px 7px !important;
        font-size:12px;
      }
      .statusmsg {
        font-size:10.5px !important;
        line-height:1.2;
        padding-bottom:5px !important;
      }

      .results {
        gap:5px !important;
      }
      .result-card {
        position:relative;
        min-height:0;
        padding:7px 67px 7px 9px !important;
        border-radius:10px !important;
        border-left-width:4px !important;
      }
      .result-title {
        margin-bottom:3px !important;
        font-size:12.5px !important;
        line-height:1.15 !important;
      }
      .result-meta {
        gap:5px !important;
        font-size:9.5px !important;
        line-height:1.15;
      }
      .badges {
        margin-top:4px !important;
        gap:3px !important;
      }
      .badge {
        padding:2px 5px !important;
        font-size:8.5px !important;
      }
      .result-details-btn {
        position:absolute !important;
        right:7px;
        top:50%;
        transform:translateY(-50%);
        margin:0 !important;
        padding:5px 7px !important;
        font-size:9.5px !important;
        white-space:nowrap;
      }

      .result-card.map-active {
        transform:none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Leaflet was initialized before the final phone layout existed. Recalculate
  // its size after the CSS change without altering the current map position.
  const refreshMapSize = () => {
    try { map.invalidateSize({ animate:false, pan:false }); } catch (_) { }
  };
  requestAnimationFrame(refreshMapSize);
  setTimeout(refreshMapSize, 250);
  setTimeout(refreshMapSize, 1200);
})();
