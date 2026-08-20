// Organic Maps route handoff using the legacy route URL scheme.
// This overrides startOrganicNav from app.js after the main script has loaded.
window.startOrganicNav = async id => {
  const x = all().find(a => a.id === id);
  if (!x) return;

  const box = $('routeInfo');
  try {
    await getPosition();
    const u = `om://route?sll=${pos.lat},${pos.lon}&dll=${x.lat},${x.lon}&type=vehicle`;
    window.location.href = u;
  } catch (err) {
    console.error(err);
    if (box) box.innerHTML = '<div class="routebox">Standort konnte nicht gelesen werden. Bitte Standortfreigabe prüfen.</div>';
  }
};
