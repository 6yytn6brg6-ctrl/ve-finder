// V/E Finder v3.1: render the OSM base map in Retina resolution on iPhone displays.
(() => {
  try {
    let oldBaseLayer = null;

    map.eachLayer(candidate => {
      if (candidate instanceof L.TileLayer) oldBaseLayer = candidate;
    });

    if (oldBaseLayer) map.removeLayer(oldBaseLayer);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      detectRetina: true,
      className: 've-retina-tile',
      attribution: '&copy; OpenStreetMap-Mitwirkende'
    }).addTo(map);

    const style = document.createElement('style');
    style.textContent = `
      #map .ve-retina-tile {
        filter: contrast(1.24) saturate(1.32) brightness(1.04);
      }
    `;
    document.head.appendChild(style);

    requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
  } catch (error) {
    console.error('v3.1 Retina map setup failed', error);
  }
})();
