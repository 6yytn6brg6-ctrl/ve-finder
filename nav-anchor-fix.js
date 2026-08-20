// iOS Safari / PWA handoff test for Organic Maps.
// Important: use a real, user-tapped <a href="om://..."> link instead of a JS redirect.
function organicNavUrl(x) {
  const name = encodeURIComponent(x.name);
  return `om://v2/nav?origin=currentLocation&destination=${x.lat},${x.lon}&destination_name=${name}&mode=drive`;
}

function detail(x) {
  const navUrl = organicNavUrl(x);
  $('detailContent').innerHTML = `<div class="sheet-inner">
    <div class="sheet-head">
      <div><h2>${x.name}</h2><div class="statusmsg">${x.postal} ${x.state}</div></div>
      <button class="closebtn" onclick="document.getElementById('detailDialog').close()">×</button>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><small>Kassette</small>${x.cassette}</div>
      <div class="detail-item"><small>Grauwasser</small>${x.grey}</div>
      <div class="detail-item"><small>Frischwasser</small>${x.water}</div>
      <div class="detail-item"><small>Müll</small>${x.trash}</div>
      <div class="detail-item"><small>Preis</small>${x.price||'—'}</div>
      <div class="detail-item"><small>Telefon</small>${x.phone||'—'}</div>
    </div>
    <div class="routebox">${x.note||''}</div>
    <div class="actions">
      <a class="primary nav-start" href="${navUrl}" style="display:flex;align-items:center;justify-content:center;text-decoration:none">Navigation starten</a>
      <button class="outline" onclick="routeTo('${x.id}')">Route auf Karte anzeigen</button>
      <button class="outline" onclick="openOsmRoute('${x.id}')">Route in OSM öffnen</button>
    </div>
    <div class="routebox" style="font-size:11px">Organic Maps wird über einen direkten iOS-App-Link geöffnet.</div>
    <div id="routeInfo"></div>
  </div>`;
  $('detailDialog').showModal();
}
