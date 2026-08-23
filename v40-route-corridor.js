// V/E Finder v4.0: find stations inside a selectable corridor along a calculated driving route.
(() => {
  const EARTH_KM = 6371;
  const TO_RAD = Math.PI / 180;

  function distanceKm(a, b) {
    const dLat = (b.lat - a.lat) * TO_RAD;
    const dLon = (b.lon - a.lon) * TO_RAD;
    const lat1 = a.lat * TO_RAD;
    const lat2 = b.lat * TO_RAD;
    const q = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_KM * Math.asin(Math.sqrt(q));
  }

  function buildRouteIndex(rawPoints) {
    const points = rawPoints
      .map(point => ({ lat: Number(point.lat), lon: Number(point.lon) }))
      .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon));
    const cumulativeKm = [0];
    for (let i = 1; i < points.length; i++) {
      cumulativeKm.push(cumulativeKm[i - 1] + distanceKm(points[i - 1], points[i]));
    }
    return { points, cumulativeKm, totalKm: cumulativeKm.at(-1) || 0 };
  }

  function nearestToRoute(lat, lon, index) {
    const pointLat = Number(lat);
    const pointLon = Number(lon);
    if (!Number.isFinite(pointLat) || !Number.isFinite(pointLon) || index.points.length < 2) return null;

    let bestDistance = Infinity;
    let bestAlong = 0;

    for (let i = 0; i < index.points.length - 1; i++) {
      const a = index.points[i];
      const b = index.points[i + 1];
      const meanLat = ((a.lat + b.lat + pointLat) / 3) * TO_RAD;
      const lonScale = 111.32 * Math.cos(meanLat);
      const latScale = 110.574;
      const ax = (a.lon - pointLon) * lonScale;
      const ay = (a.lat - pointLat) * latScale;
      const bx = (b.lon - pointLon) * lonScale;
      const by = (b.lat - pointLat) * latScale;
      const dx = bx - ax;
      const dy = by - ay;
      const lengthSquared = dx * dx + dy * dy;
      const t = lengthSquared > 0
        ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared))
        : 0;
      const nearestX = ax + t * dx;
      const nearestY = ay + t * dy;
      const offRouteKm = Math.hypot(nearestX, nearestY);

      if (offRouteKm < bestDistance) {
        bestDistance = offRouteKm;
        const segmentKm = index.cumulativeKm[i + 1] - index.cumulativeKm[i];
        bestAlong = index.cumulativeKm[i] + segmentKm * t;
      }
    }

    return { offRouteKm: bestDistance, alongKm: bestAlong };
  }

  function stationsAlongRoute(stations, index, corridorKm) {
    return stations
      .map(station => {
        const nearest = nearestToRoute(station.lat, station.lon, index);
        return nearest ? { id: station.id, ...nearest } : null;
      })
      .filter(entry => entry && entry.offRouteKm <= corridorKm)
      .sort((a, b) => a.alongKm - b.alongKm || a.offRouteKm - b.offRouteKm);
  }

  window.VERouteCorridor = { buildRouteIndex, nearestToRoute, stationsAlongRoute };

  const routeButton = document.getElementById('routeSearchBtn');
  const routeDialog = document.getElementById('routeSearchDialog');
  const routeContent = document.getElementById('routeSearchContent');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const statusMsg = document.getElementById('statusMsg');
  const navIds = ['nearbyBtn', 'allBtn', 'routeSearchBtn', 'addBtn', 'dataBtn'];

  if (!routeButton || !routeDialog || !routeContent || typeof filtered !== 'function') return;

  const originalSearchPlaceholder = searchInput?.placeholder || '';
  const GEOCODE_CACHE_KEY = 'vefinder.route-geocode.v1';
  const GEOCODE_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
  const previousFiltered = filtered;
  const previousRender = render;
  const kmOneDecimal = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  let routeState = null;
  let routeLine = null;
  let startMarker = null;
  let endMarker = null;
  let previousSortValue = null;
  let startGpsOverride = null;
  let lastGeocodeAt = 0;
  let geocodeCache = {};
  try {
    geocodeCache = JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
  } catch (_) { }

  function matchesFilters(station) {
    const yesValue = value => String(value).toLowerCase() === 'ja';
    if (document.getElementById('fCassette')?.checked && !yesValue(station.cassette)) return false;
    if (document.getElementById('fGrey')?.checked && !yesValue(station.grey)) return false;
    if (document.getElementById('fWater')?.checked && !yesValue(station.water)) return false;
    if (document.getElementById('fTrash')?.checked && !yesValue(station.trash)) return false;
    if (document.getElementById('fConfirmed')?.checked && !['Grün', 'Gelb'].includes(station.color)) return false;
    if (document.getElementById('fGreenOnly')?.checked && station.color !== 'Grün') return false;
    return true;
  }

  filtered = function() {
    if (!routeState?.active) return previousFiltered();

    const currentStations = new Map(all().map(station => [station.id, station]));
    return routeState.stationMeta
      .map(meta => {
        const station = currentStations.get(meta.id);
        return station && matchesFilters(station)
          ? { ...station, d: meta.alongKm, routeOffsetKm: meta.offRouteKm }
          : null;
      })
      .filter(Boolean);
  };

  function formatDuration(minutes) {
    const rounded = Math.max(1, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    const rest = rounded % 60;
    if (!hours) return `${rest} min`;
    return rest ? `${hours} Std. ${rest} min` : `${hours} Std.`;
  }

  function routeSummary(count) {
    if (!routeState) return '';
    return `${routeState.start.label} → ${routeState.destination.label} · ${Math.round(routeState.distanceKm)} km · ${formatDuration(routeState.durationMin)} · ${count} V/E-Station${count === 1 ? '' : 'en'} bis ${routeState.corridorKm} km von der Route`;
  }

  function annotateRouteCards() {
    if (!routeState?.active) return;
    const metaById = new Map(routeState.stationMeta.map(meta => [meta.id, meta]));
    document.querySelectorAll('.result-card').forEach(card => {
      const meta = metaById.get(card.dataset.id);
      const distance = card.querySelector('.distance');
      if (!meta || !distance) return;
      const offset = meta.offRouteKm < 0.1
        ? 'direkt an der Route'
        : `${kmOneDecimal.format(meta.offRouteKm)} km von der Route`;
      distance.textContent = `nach ${Math.round(meta.alongKm)} km · ${offset}`;
    });
  }

  render = function() {
    const result = previousRender();
    if (routeState?.active) {
      requestAnimationFrame(() => {
        annotateRouteCards();
        if (statusMsg) statusMsg.textContent = routeSummary(filtered().length);
      });
    }
    return result;
  };

  function clearRouteLayers() {
    [routeLine, startMarker, endMarker].forEach(item => item?.remove());
    routeLine = null;
    startMarker = null;
    endMarker = null;
  }

  function drawRoute(fit = false) {
    if (!routeState) return;
    clearRouteLayers();
    const points = routeState.index.points.map(point => [point.lat, point.lon]);
    routeLine = L.polyline(points, { color: '#2e6db4', weight: 6, opacity: 0.82 }).addTo(map);
    startMarker = L.circleMarker([routeState.start.lat, routeState.start.lon], {
      radius: 7, color: '#fff', weight: 3, fillColor: '#2e82e6', fillOpacity: 1
    }).addTo(map).bindTooltip(`Start: ${escapeHtml(routeState.start.label)}`, { direction: 'top' });
    endMarker = L.circleMarker([routeState.destination.lat, routeState.destination.lon], {
      radius: 7, color: '#fff', weight: 3, fillColor: '#d84a43', fillOpacity: 1
    }).addTo(map).bindTooltip(`Ziel: ${escapeHtml(routeState.destination.label)}`, { direction: 'top' });

    if (fit) {
      const bounds = routeLine.getBounds();
      const currentStations = new Map(all().map(station => [station.id, station]));
      routeState.stationMeta.forEach(meta => {
        const station = currentStations.get(meta.id);
        if (station) bounds.extend([Number(station.lat), Number(station.lon)]);
      });
      map.invalidateSize({ animate: false, pan: false });
      map.fitBounds(bounds, {
        paddingTopLeft: [28, 24],
        paddingBottomRight: [28, 24],
        animate: false
      });
    }
  }

  function setRouteNavActive() {
    navIds.forEach(id => document.getElementById(id)?.classList.toggle('active', id === 'routeSearchBtn'));
  }

  function addRouteSortOption() {
    if (!sortSelect) return;
    let option = sortSelect.querySelector('option[data-route-sort]');
    if (!option) {
      option = document.createElement('option');
      option.value = 'route';
      option.dataset.routeSort = 'true';
      option.textContent = 'Entlang Route';
      sortSelect.appendChild(option);
    }
    sortSelect.value = 'route';
    sortSelect.disabled = true;
  }

  function activateRoute(nextState) {
    if (!routeState?.active) previousSortValue = sortSelect?.value || null;
    routeState = { ...nextState, active: true };
    mode = 'all';
    document.body.classList.add('route-corridor-active');
    setRouteNavActive();
    addRouteSortOption();

    if (searchInput) {
      searchInput.disabled = false;
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.placeholder = 'Entlang der Route aktiv';
      searchInput.disabled = true;
    }

    render();
    drawRoute(true);
  }

  function deactivateRoute(renderAfter = false) {
    if (!routeState?.active) return;
    routeState.active = false;
    clearRouteLayers();
    document.body.classList.remove('route-corridor-active');

    if (searchInput) {
      searchInput.disabled = false;
      searchInput.placeholder = originalSearchPlaceholder;
    }
    if (sortSelect) {
      sortSelect.disabled = false;
      sortSelect.querySelector('option[data-route-sort]')?.remove();
      if (previousSortValue && [...sortSelect.options].some(option => option.value === previousSortValue)) {
        sortSelect.value = previousSortValue;
      }
    }
    if (renderAfter) render();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function openRouteDialog() {
    ['detailDialog', 'addDialog', 'dataDialog'].forEach(id => {
      const dialog = document.getElementById(id);
      if (dialog?.open) dialog.close();
    });
    if (routeState?.active && !routeLine) drawRoute(true);
    setRouteNavActive();
    const startValue = routeState?.formStart || '';
    const destinationValue = routeState?.formDestination || '';
    const corridor = routeState?.corridorKm || 10;
    startGpsOverride = routeState?.start?.fromGps ? routeState.start : null;

    routeContent.innerHTML = `<div class="sheet-inner">
      <div class="sheet-head">
        <div><h2>V/E entlang der Route</h2><div class="statusmsg">Start leer lassen, wenn deine aktuelle Position verwendet werden soll.</div></div>
        <button type="button" class="closebtn" id="closeRouteSearch" aria-label="Routensuche schließen">×</button>
      </div>
      <form id="routeSearchForm" class="form-grid">
        <label>Start
          <div class="route-start-row">
            <input id="routeStartInput" value="${escapeHtml(startValue)}" placeholder="z. B. Berlin oder leer">
            <button type="button" class="outline" id="routeUseGps">◎ Standort</button>
          </div>
        </label>
        <label>Ziel<input id="routeDestinationInput" value="${escapeHtml(destinationValue)}" placeholder="z. B. Rostock" required></label>
        <label>Korridor neben der Route
          <select id="routeCorridorSelect">
            <option value="5"${corridor === 5 ? ' selected' : ''}>bis 5 km</option>
            <option value="10"${corridor === 10 ? ' selected' : ''}>bis 10 km</option>
            <option value="20"${corridor === 20 ? ' selected' : ''}>bis 20 km</option>
          </select>
        </label>
        <div class="routebox" id="routeSearchStatus">Es wird die tatsächliche Fahrstrecke berechnet, nicht die Luftlinie.</div>
        <button type="submit" class="primary" id="calculateRouteBtn">Route berechnen und Stationen zeigen</button>
      </form>
    </div>`;

    const startInput = document.getElementById('routeStartInput');
    const destinationInput = document.getElementById('routeDestinationInput');
    const corridorSelect = document.getElementById('routeCorridorSelect');
    const form = document.getElementById('routeSearchForm');

    document.getElementById('closeRouteSearch')?.addEventListener('click', () => routeDialog.close());
    startInput?.addEventListener('input', () => {
      if (startInput.value !== 'Aktueller Standort') startGpsOverride = null;
    });
    document.getElementById('routeUseGps')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      const routeStatus = document.getElementById('routeSearchStatus');
      button.disabled = true;
      if (routeStatus) routeStatus.textContent = 'Aktueller Standort wird bestimmt …';
      try {
        await getPosition();
        startGpsOverride = { lat: pos.lat, lon: pos.lon, label: 'Aktueller Standort', fromGps: true };
        if (startInput) startInput.value = 'Aktueller Standort';
        if (routeStatus) routeStatus.textContent = 'Aktueller Standort als Start übernommen.';
      } catch (error) {
        console.error(error);
        if (routeStatus) routeStatus.textContent = 'Standort konnte nicht gelesen werden. Bitte Standortfreigabe prüfen.';
      } finally {
        button.disabled = false;
      }
    });

    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const submit = document.getElementById('calculateRouteBtn');
      const routeStatus = document.getElementById('routeSearchStatus');
      const rawStart = String(startInput?.value || '').trim();
      const rawDestination = String(destinationInput?.value || '').trim();
      const corridorKm = Number(corridorSelect?.value || 10);
      if (!rawDestination) return;

      submit.disabled = true;
      submit.textContent = 'Route wird berechnet …';
      try {
        let start;
        if (startGpsOverride && rawStart === 'Aktueller Standort') {
          start = startGpsOverride;
        } else if (!rawStart) {
          if (routeStatus) routeStatus.textContent = 'Aktueller Standort wird bestimmt …';
          await getPosition();
          start = { lat: pos.lat, lon: pos.lon, label: 'Aktueller Standort', fromGps: true };
        } else {
          if (routeStatus) routeStatus.textContent = `Start „${rawStart}“ wird gesucht …`;
          start = await geocode(rawStart);
        }

        if (routeStatus) routeStatus.textContent = `Ziel „${rawDestination}“ wird gesucht …`;
        const destination = await geocode(rawDestination);
        if (routeStatus) routeStatus.textContent = 'Fahrroute und passende V/E-Stationen werden berechnet …';
        const calculated = await calculateDrivingRoute(start, destination);
        const index = buildRouteIndex(calculated.points);
        const stationMeta = stationsAlongRoute(all(), index, corridorKm);

        activateRoute({
          start,
          destination,
          index,
          stationMeta,
          corridorKm,
          distanceKm: calculated.distanceKm,
          durationMin: calculated.durationMin,
          formStart: start.fromGps ? 'Aktueller Standort' : rawStart,
          formDestination: rawDestination
        });
        routeDialog.close();
      } catch (error) {
        console.error(error);
        if (routeStatus) routeStatus.textContent = error.message || 'Route konnte nicht berechnet werden.';
        submit.disabled = false;
        submit.textContent = 'Erneut versuchen';
      }
    });

    if (!routeDialog.open) routeDialog.show();
  }

  async function geocode(query) {
    const cacheKey = query.trim().toLowerCase();
    const cached = geocodeCache[cacheKey];
    if (cached && Date.now() - Number(cached.savedAt || 0) < GEOCODE_CACHE_MAX_AGE) {
      return { lat: cached.lat, lon: cached.lon, label: cached.label, fromGps: false };
    }

    const waitMs = Math.max(0, 1050 - (Date.now() - lastGeocodeAt));
    if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs));

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'de');
    url.searchParams.set('accept-language', 'de');
    url.searchParams.set('q', query);
    lastGeocodeAt = Date.now();
    const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Ortssuche nicht erreichbar (HTTP ${response.status})`);
    const results = await response.json();
    const result = Array.isArray(results) ? results[0] : null;
    if (!result) throw new Error(`Ort „${query}“ wurde nicht gefunden.`);
    const resolved = {
      lat: Number(result.lat),
      lon: Number(result.lon),
      label: String(result.display_name || query).split(',')[0],
      fromGps: false
    };
    geocodeCache[cacheKey] = { ...resolved, savedAt: Date.now() };
    try {
      const newest = Object.entries(geocodeCache)
        .sort((a, b) => Number(b[1].savedAt || 0) - Number(a[1].savedAt || 0))
        .slice(0, 50);
      geocodeCache = Object.fromEntries(newest);
      localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(geocodeCache));
    } catch (_) { }
    return resolved;
  }

  async function calculateDrivingRoute(start, destination) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=false`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Routenberechnung nicht erreichbar (HTTP ${response.status})`);
    const data = await response.json();
    const route = data?.routes?.[0];
    if (data?.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
      throw new Error('Für Start und Ziel wurde keine Fahrroute gefunden.');
    }
    return {
      points: route.geometry.coordinates.map(([lon, lat]) => ({ lat, lon })),
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60
    };
  }

  routeButton.addEventListener('click', openRouteDialog);
  ['nearbyBtn', 'allBtn', 'addBtn', 'dataBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (routeDialog.open) routeDialog.close();
      deactivateRoute(false);
    }, true);
  });

  routeDialog.addEventListener('close', () => {
    if (routeState?.active) setRouteNavActive();
    else {
      const activeId = mode === 'all' ? 'allBtn' : 'nearbyBtn';
      navIds.forEach(id => document.getElementById(id)?.classList.toggle('active', id === activeId));
    }
  });

  const previousRouteTo = window.routeTo;
  if (typeof previousRouteTo === 'function') {
    window.routeTo = async id => {
      if (routeState?.active) clearRouteLayers();
      await previousRouteTo(id);
      if (routeState?.active && !document.body.classList.contains('route-mode')) drawRoute(false);
    };
    document.getElementById('routeBackBtn')?.addEventListener('click', () => {
      if (routeState?.active) setTimeout(() => drawRoute(false), 0);
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .bottomnav { grid-template-columns:repeat(5,1fr) !important; }
    #routeSearchDialog[open] {
      position:fixed;
      inset:auto 0 calc(66px + env(safe-area-inset-bottom)) 0;
      margin:0 auto;
      z-index:5000;
      background:#fff;
      box-shadow:0 -10px 30px #0002;
    }
    .route-start-row {
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      gap:7px;
      align-items:end;
    }
    .route-start-row .outline {
      white-space:nowrap;
      padding:10px;
    }
    body.route-corridor-active .filter-grid label:first-child { display:none; }
    body.route-corridor-active #searchInput:disabled {
      opacity:1;
      color:var(--muted);
      -webkit-text-fill-color:var(--muted);
    }
    html[data-theme="dark"] #routeSearchDialog[open] { background:#18201d; color:var(--ink); }
    @media(max-width:380px) {
      .bottomnav button span { font-size:9px; }
      .route-start-row { grid-template-columns:1fr; }
      .route-start-row .outline { width:100%; }
    }
  `;
  document.head.appendChild(style);
})();
