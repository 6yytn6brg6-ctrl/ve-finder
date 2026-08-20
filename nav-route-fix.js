// Organic Maps route handoff using the legacy route URL scheme.
// Organic Maps expects both coordinates AND address/name fields for this scheme.
window.startOrganicNav = async id => {
  const x = all().find(a => a.id === id);
  if (!x) return;

  const box = $('routeInfo');
  try {
    await getPosition();
    const startName = encodeURIComponent('Aktueller Standort');
    const destinationName = encodeURIComponent(x.name);
    const u = `om://route?sll=${pos.lat},${pos.lon}&saddr=${startName}&dll=${x.lat},${x.lon}&daddr=${destinationName}&type=vehicle`;
    window.location.href = u;
  } catch (err) {
    console.error(err);
    if (box) box.innerHTML = '<div class="routebox">Standort konnte nicht gelesen werden. Bitte Standortfreigabe prüfen.</div>';
  }
};
