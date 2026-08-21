// V/E Finder v1.3: keep Leaflet controls behind the station sheet and simplify route actions.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #detailDialog[open] {
      z-index: 5000 !important;
      background: #fff;
      isolation: isolate;
    }
    .bottomnav {
      z-index: 6000 !important;
    }
    #detailDialog .actions {
      grid-template-columns: 1fr !important;
    }
    #detailDialog .actions .nav-start {
      grid-column: auto !important;
    }
    #detailDialog button[onclick^="openOsmRoute"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
})();
