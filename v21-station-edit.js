// V/E Finder v3.9: edit station data locally and set exact coordinates by GPS or directly on the map.
(() => {
  const OVERRIDE_KEY = 'vefinder.overrides.v1';
  let overrides = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const statusMsg = document.getElementById('statusMsg');

  function ownEntry(id) {
    return user.find(entry => entry.id === id) || null;
  }

  function seedEntry(id) {
    return seed.find(entry => entry.id === id) || null;
  }

  function applyOverrides() {
    seed.forEach(entry => {
      if (overrides[entry.id]) Object.assign(entry, overrides[entry.id]);
    });
  }

  const previousRender = render;
  render = function() {
    applyOverrides();
    return previousRender();
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function option(value, current, label) {
    return `<option value="${value}"${String(current).toLowerCase() === value ? ' selected' : ''}>${label}</option>`;
  }

  function coordText(lat, lon) {
    const a = Number(lat);
    const b = Number(lon);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 'keine Koordinaten gespeichert';
    return `${a.toFixed(6)}, ${b.toFixed(6)}`;
  }

  function freshGpsPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS/Standort ist auf diesem Gerät nicht verfügbar.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        result => resolve({
          lat: result.coords.latitude,
          lon: result.coords.longitude,
          accuracy: result.coords.accuracy
        }),
        reject,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  let editDialog = document.getElementById('editDialog');
  if (!editDialog) {
    editDialog = document.createElement('dialog');
    editDialog.id = 'editDialog';
    editDialog.className = 'sheet';
    editDialog.innerHTML = '<div id="editContent"></div>';
    document.body.appendChild(editDialog);
  }

  function openEditor(x) {
    const isOwn = !!ownEntry(x.id);
    const editContent = document.getElementById('editContent');
    if (!editContent) return;

    let draftLat = Number(x.lat);
    let draftLon = Number(x.lon);
    let draftCoordinateQuality = x.coordinateQuality || '';
    let positionWasChanged = false;
    let pickerMarker = null;
    let pickerClickHandler = null;
    let pickerReturnView = null;
    let pickerLayerWasVisible = false;

    editContent.innerHTML = `<div class="sheet-inner">
      <div class="sheet-head">
        <div>
          <h2>Station bearbeiten</h2>
          <div class="statusmsg">${isOwn ? 'Eigene Station' : 'Datenbankstation · Änderung wird vorerst nur auf diesem Gerät gespeichert'}</div>
        </div>
        <button type="button" class="closebtn" id="closeEditBtn">×</button>
      </div>
      <form id="editStationForm" class="form-grid">
        <label>Name<input name="name" value="${escapeHtml(x.name)}" required></label>
        <label>PLZ<input name="postal" value="${escapeHtml(x.postal)}"></label>
        <label>Bundesland<input name="state" value="${escapeHtml(x.state)}"></label>
        <div class="edit-service-grid">
          <label>Kassette<select name="cassette">
            ${option('ja', x.cassette, 'ja')}${option('nein', x.cassette, 'nein')}${option('?', x.cassette, 'unbekannt')}
          </select></label>
          <label>Grauwasser<select name="grey">
            ${option('ja', x.grey, 'ja')}${option('nein', x.grey, 'nein')}${option('?', x.grey, 'unbekannt')}
          </select></label>
          <label>Frischwasser<select name="water">
            ${option('ja', x.water, 'ja')}${option('nein', x.water, 'nein')}${option('?', x.water, 'unbekannt')}
          </select></label>
          <label>Müll<select name="trash">
            ${option('ja', x.trash, 'ja')}${option('nein', x.trash, 'nein')}${option('?', x.trash, 'unbekannt')}
          </select></label>
        </div>
        <label>Preis<input name="price" value="${escapeHtml(x.price)}"></label>
        <label>Telefon<input name="phone" value="${escapeHtml(x.phone)}"></label>
        <label>Hinweis<textarea name="note">${escapeHtml(x.note)}</textarea></label>

        <div class="edit-gps-card">
          <div><strong>Genaue Position</strong><div class="statusmsg" id="editGpsCoords">Gespeichert: ${coordText(draftLat, draftLon)}</div></div>
          <button type="button" class="outline edit-gps-btn" id="takeGpsBtn">◎ Aktuellen GPS-Standort übernehmen</button>
          <button type="button" class="outline edit-gps-btn" id="pickMapBtn">⌖ Position auf Karte festlegen</button>
          <div class="statusmsg" id="editGpsStatus">Vor Ort kannst du GPS verwenden. Aus der Ferne lässt sich der genaue Punkt auf der Karte markieren. Gespeichert wird erst mit „Änderungen speichern“.</div>
        </div>

        <button type="submit" class="primary">Änderungen speichern</button>
      </form>
    </div>`;

    document.getElementById('closeEditBtn')?.addEventListener('click', () => editDialog.close());

    function updatePickerPosition(latlng, moveMarker = true) {
      if (!latlng || !pickerMarker) return;
      if (moveMarker) pickerMarker.setLatLng(latlng);
      const coords = document.getElementById('positionPickCoords');
      if (coords) coords.textContent = coordText(latlng.lat, latlng.lng);
    }

    function finishMapPicker(usePosition) {
      const selected = pickerMarker?.getLatLng();

      if (pickerClickHandler) map.off('click', pickerClickHandler);
      pickerClickHandler = null;
      if (pickerMarker) pickerMarker.remove();
      pickerMarker = null;
      document.getElementById('positionPickPanel')?.remove();
      document.body.classList.remove('position-pick-mode');

      if (pickerLayerWasVisible && !map.hasLayer(layer)) layer.addTo(map);

      if (usePosition && selected) {
        draftLat = selected.lat;
        draftLon = selected.lng;
        draftCoordinateQuality = 'exact';
        positionWasChanged = true;

        const gpsCoords = document.getElementById('editGpsCoords');
        const gpsStatus = document.getElementById('editGpsStatus');
        const pickMapBtn = document.getElementById('pickMapBtn');
        if (gpsCoords) gpsCoords.textContent = `Neu: ${coordText(draftLat, draftLon)}`;
        if (gpsStatus) gpsStatus.textContent = 'Kartenposition übernommen. Jetzt „Änderungen speichern“ tippen.';
        if (pickMapBtn) pickMapBtn.textContent = '✓ Kartenposition übernommen';
      }

      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
        if (pickerReturnView) {
          map.setView(pickerReturnView.center, pickerReturnView.zoom, { animate: false });
        }
        pickerReturnView = null;
        if (!editDialog.open) editDialog.showModal();
      });
    }

    function startMapPicker() {
      const startLat = Number.isFinite(draftLat) ? draftLat : map.getCenter().lat;
      const startLon = Number.isFinite(draftLon) ? draftLon : map.getCenter().lng;
      pickerReturnView = { center: map.getCenter(), zoom: map.getZoom() };
      pickerLayerWasVisible = map.hasLayer(layer);

      if (editDialog.open) editDialog.close();
      document.body.classList.add('position-pick-mode');
      if (pickerLayerWasVisible) map.removeLayer(layer);

      pickerMarker = L.marker([startLat, startLon], {
        draggable: true,
        zIndexOffset: 3000,
        title: 'Genaue Position'
      }).addTo(map);

      const panel = document.createElement('div');
      panel.id = 'positionPickPanel';
      panel.innerHTML = `
        <strong>Genaue Position markieren</strong>
        <div>Tippe auf den richtigen Punkt oder ziehe die Markierung dorthin.</div>
        <div class="position-pick-coords" id="positionPickCoords">${coordText(startLat, startLon)}</div>
        <div class="position-pick-actions">
          <button type="button" class="outline" id="cancelPositionPick">Abbrechen</button>
          <button type="button" class="primary" id="savePositionPick">Position übernehmen</button>
        </div>`;
      document.body.appendChild(panel);

      pickerClickHandler = event => updatePickerPosition(event.latlng);
      map.on('click', pickerClickHandler);
      pickerMarker.on('drag', event => updatePickerPosition(event.target.getLatLng(), false));
      document.getElementById('cancelPositionPick')?.addEventListener('click', () => finishMapPicker(false));
      document.getElementById('savePositionPick')?.addEventListener('click', () => finishMapPicker(true));

      map.setView([startLat, startLon], 16, { animate: false });
      requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    }

    document.getElementById('pickMapBtn')?.addEventListener('click', startMapPicker);

    document.getElementById('takeGpsBtn')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      const gpsStatus = document.getElementById('editGpsStatus');
      const gpsCoords = document.getElementById('editGpsCoords');
      button.disabled = true;
      button.textContent = 'GPS wird bestimmt …';
      if (gpsStatus) gpsStatus.textContent = 'Bitte kurz warten – möglichst im Freien bzw. mit guter Sicht zum Himmel.';

      try {
        const fix = await freshGpsPosition();
        draftLat = fix.lat;
        draftLon = fix.lon;
        draftCoordinateQuality = 'exact';
        positionWasChanged = true;

        // Keep the app's current-position marker fresh as well.
        pos = { lat: fix.lat, lon: fix.lon };
        if (me) me.remove();
        me = L.circleMarker([fix.lat, fix.lon], {
          radius: 8, color: '#fff', weight: 3, fillColor: '#2e82e6', fillOpacity: 1
        }).addTo(map);

        if (gpsCoords) gpsCoords.textContent = `Neu: ${coordText(fix.lat, fix.lon)}`;
        if (gpsStatus) gpsStatus.textContent = `GPS übernommen · Genauigkeit ca. ${Math.round(fix.accuracy)} m. Jetzt „Änderungen speichern“ tippen.`;
        button.textContent = '✓ GPS-Standort übernommen';
      } catch (error) {
        console.error(error);
        if (gpsStatus) gpsStatus.textContent = 'GPS konnte nicht gelesen werden. Bitte Standortfreigabe prüfen und erneut versuchen.';
        button.textContent = '◎ Aktuellen GPS-Standort übernehmen';
      } finally {
        button.disabled = false;
      }
    });

    document.getElementById('editStationForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const update = {
        name: String(form.get('name') || '').trim(),
        postal: String(form.get('postal') || '').trim(),
        state: String(form.get('state') || '').trim(),
        cassette: String(form.get('cassette') || '?'),
        grey: String(form.get('grey') || '?'),
        water: String(form.get('water') || '?'),
        trash: String(form.get('trash') || '?'),
        price: String(form.get('price') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        note: String(form.get('note') || '').trim()
      };

      if (Number.isFinite(draftLat) && Number.isFinite(draftLon)) {
        update.lat = draftLat;
        update.lon = draftLon;
      }
      if (draftCoordinateQuality) update.coordinateQuality = draftCoordinateQuality;

      let target = ownEntry(x.id);
      if (target) {
        Object.assign(target, update);
        localStorage.setItem(KEY, JSON.stringify(user));
      } else {
        overrides[x.id] = { ...(overrides[x.id] || {}), ...update };
        localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
        target = seedEntry(x.id);
        if (target) Object.assign(target, update);
      }

      editDialog.close();
      render();
      if (statusMsg) {
        statusMsg.textContent = positionWasChanged
          ? `${update.name || 'Station'} · Daten und genaue Position gespeichert`
          : `${update.name || 'Station'} · Änderung gespeichert`;
      }
      if (target) detail(target);
    });

    if (detailDialog?.open) detailDialog.close();
    if (!editDialog.open) editDialog.showModal();
  }

  const previousDetail = detail;
  detail = function(x) {
    previousDetail(x);
    const inner = detailContent?.querySelector('.sheet-inner');
    if (!inner || inner.querySelector('.station-edit-btn')) return;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'outline station-edit-btn';
    editButton.textContent = 'Station bearbeiten';
    editButton.addEventListener('click', () => openEditor(x));

    const actions = inner.querySelector('.actions');
    if (actions) actions.insertAdjacentElement('afterend', editButton);
    else inner.appendChild(editButton);
  };

  const style = document.createElement('style');
  style.textContent = `
    .station-edit-btn {
      display:block;
      width:100%;
      margin-top:10px;
    }
    .edit-service-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    }
    .edit-service-grid label { min-width:0; }
    .edit-service-grid select {
      width:100%;
      margin-top:4px;
      padding:10px;
      border:1px solid var(--line);
      border-radius:10px;
      font-size:15px;
      background:#fff;
    }
    .edit-gps-card {
      display:grid;
      gap:8px;
      padding:11px;
      border:1px solid var(--line);
      border-radius:12px;
      background:#f5f7f5;
    }
    .edit-gps-card .statusmsg { padding:3px 0 0; }
    .edit-gps-btn { width:100%; }
    body.position-pick-mode {
      padding-bottom:0 !important;
      overflow:hidden !important;
    }
    body.position-pick-mode .searchbar,
    body.position-pick-mode #filters,
    body.position-pick-mode .results-panel,
    body.position-pick-mode .bottomnav { display:none !important; }
    body.position-pick-mode main { display:block !important; }
    body.position-pick-mode #map {
      position:fixed !important;
      left:0;
      right:0;
      top:calc(env(safe-area-inset-top) + 74px);
      bottom:0;
      width:100% !important;
      height:auto !important;
      z-index:5500;
    }
    body.position-pick-mode .ve-active-flag-icon { display:none !important; }
    #positionPickPanel {
      position:fixed;
      left:12px;
      right:12px;
      bottom:calc(12px + env(safe-area-inset-bottom));
      z-index:7000;
      display:grid;
      gap:6px;
      padding:12px;
      border:1px solid var(--line);
      border-radius:14px;
      background:#fffffff2;
      color:var(--ink);
      font-size:12px;
      box-shadow:0 5px 24px #0005;
      backdrop-filter:blur(16px);
    }
    .position-pick-coords {
      color:var(--muted);
      font-variant-numeric:tabular-nums;
    }
    .position-pick-actions {
      display:grid;
      grid-template-columns:1fr 1.25fr;
      gap:8px;
      margin-top:2px;
    }
    .position-pick-actions button { width:100%; }
    html[data-theme="dark"] #positionPickPanel {
      background:#18201df2;
      color:var(--ink);
      border-color:var(--line);
    }
    @media (orientation:landscape) and (max-height:600px) {
      body.position-pick-mode #map { top:calc(env(safe-area-inset-top) + 46px); }
      #positionPickPanel {
        left:auto;
        width:min(360px,46vw);
      }
    }
    html[data-theme="dark"] .edit-service-grid select {
      background:#1d2723;
      color:var(--ink);
      border-color:var(--line);
    }
    html[data-theme="dark"] .edit-gps-card {
      background:#202b27;
      color:var(--ink);
      border-color:var(--line);
    }
  `;
  document.head.appendChild(style);

  applyOverrides();
})();
