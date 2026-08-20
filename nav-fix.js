// Organic Maps HTTPS handoff for iOS Safari / PWA.
// Uses the official omaps.app universal link instead of the custom om:// scheme.
window.startOrganicNav = id => {
  const x = all().find(a => a.id === id);
  if (!x) return;
  const params = new URLSearchParams({
    origin: 'currentLocation',
    destination: `${x.lat},${x.lon}`,
    destination_name: x.name,
    mode: 'drive'
  });
  window.location.href = `https://omaps.app/v2/nav?${params.toString()}`;
};
