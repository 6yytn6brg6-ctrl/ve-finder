// V/E Finder v3.0: clearer, less grey-looking OpenStreetMap presentation.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    /* Keep the familiar OSM map, but give roads, labels, water and green areas
       a little more separation on the iPhone display. This is deliberately a
       visual treatment only, so no extra tile provider or API key is needed. */
    #map .leaflet-tile {
      filter: contrast(1.16) saturate(1.20) brightness(1.035);
    }

    /* Make Leaflet controls stand out from the stronger map underneath. */
    #map .leaflet-control-zoom a,
    #map .leaflet-control-attribution {
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
    }

    @media (prefers-contrast: more) {
      #map .leaflet-tile {
        filter: contrast(1.22) saturate(1.22) brightness(1.035);
      }
    }
  `;
  document.head.appendChild(style);

  // Repaint the existing tiles without changing the current map position.
  requestAnimationFrame(() => {
    try { map.invalidateSize({ animate:false, pan:false }); } catch (_) { }
  });
})();
