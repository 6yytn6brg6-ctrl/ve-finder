// V/E Finder v2.2: edit station data locally and optionally replace station coordinates with the current GPS position.
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
    let gpsWasTaken = false;

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
          <div><strong>GPS-Position</strong><div class="statusmsg" id="editGpsCoords">Gespeichert: ${coordText(draftLat, draftLon)}</div></div>
          <button type="button" class="outline edit-gps-btn" id="takeGpsBtn">◎ Aktuellen GPS-Standort übernehmen</button>
          <div class="statusmsg" id="editGpsStatus">Vor Ort an der V/E-Stelle tippen. Gespeichert wird erst mit „Änderungen speichern“.</div>
        </div>

        <button type="submit" class="primary">Änderungen speichern</button>
      </form>
    </div>`;

    document.getElementById('closeEditBtn')?.addEventListener('click', () => editDialog.close());

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
        gpsWasTaken = true;

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
        statusMsg.textContent = gpsWasTaken
          ? `${update.name || 'Station'} · Daten und GPS-Position gespeichert`
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
