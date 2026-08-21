// V/E Finder v2.7: true place/ZIP search using OpenStreetMap geocoding, without changing the real GPS position.
(() => {
  const searchInput = document.getElementById('searchInput');
  const radiusSelect = document.getElementById('radiusSelect');
  const sortSelect = document.getElementById('sortSelect');
  const statusMsg = document.getElementById('statusMsg');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const allBtn = document.getElementById('allBtn');

  if (!searchInput || !radiusSelect || typeof filtered !== 'function') return;

  const previousFiltered = filtered;
  let placeOrigin = null;
  let placeQuery = '';
  let geocodeTimer = 0;
  let requestSerial = 0;
  let placeMarker = null;

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function servicesMatch(x) {
    const yesValue = value => String(value).toLowerCase() === 'ja';
    if (document.getElementById('fCassette')?.checked && !yesValue(x.cassette)) return false;
    if (document.getElementById('fGrey')?.checked && !yesValue(x.grey)) return false;
    if (document.getElementById('fWater')?.checked && !yesValue(x.water)) return false;
    if (document.getElementById('fTrash')?.checked && !yesValue(x.trash)) return false;
    if (document.getElementById('fConfirmed')?.checked && !['Grün', 'Gelb'].includes(x.color)) return false;
    return true;
  }

  function withDistance(x, origin) {
    return {
      ...x,
      d: origin && Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lon))
        ? hav(Number(origin.lat), Number(origin.lon), Number(x.lat), Number(x.lon))
        : null
    };
  }

  function textMatches(x, q) {
    return `${x.name || ''} ${x.postal || ''} ${x.state || ''} ${x.note || ''}`
      .toLowerCase()
      .includes(q);
  }

  function sortResults(entries, forceDistance = false) {
    const choice = sortSelect?.value || '';
    return entries.sort((a, b) => {
      if (!forceDistance && choice === 'name') return String(a.name || '').localeCompare(String(b.name || ''), 'de');
      if (!forceDistance && choice.startsWith('state')) return String(a.state || '').localeCompare(String(b.state || ''), 'de');
      return (a.d ?? 99999) - (b.d ?? 99999);
    });
  }

  // A search term deliberately overrides current map viewport/Bundesland context.
  // Named stations are searched globally; resolved towns/ZIP codes use the selected
  // radius around that searched place.
  filtered = function() {
    const q = normalize(searchInput.value);
    if (!q) return previousFiltered();

    if (placeOrigin && placeQuery === q) {
      const radius = Number(radiusSelect.value);
      const entries = all()
        .filter(servicesMatch)
        .map(x => withDistance(x, placeOrigin))
        .filter(x => !Number.isFinite(radius) || radius >= 9999 || (x.d != null && x.d <= radius));
      return sortResults(entries, true);
    }

    const entries = all()
      .filter(servicesMatch)
      .filter(x => textMatches(x, q))
      .map(x => withDistance(x, pos));
    return sortResults(entries, false);
  };

  function removePlaceMarker() {
    if (placeMarker) {
      placeMarker.remove();
      placeMarker = null;
    }
  }

  function isPlaceResult(result) {
    const type = String(result?.addresstype || result?.type || '').toLowerCase();
    const category = String(result?.category || '').toLowerCase();
    const placeTypes = new Set([
      'city', 'town', 'village', 'municipality', 'postcode', 'suburb', 'borough',
      'hamlet', 'quarter', 'neighbourhood', 'city_district', 'administrative'
    ]);
    return placeTypes.has(type) || (category === 'boundary' && type === 'administrative');
  }

  function setNearbyUi() {
    mode = 'nearby';
    nearbyBtn?.classList.add('active');
    allBtn?.classList.remove('active');
    const radius = radiusSelect.value;
    if (sortSelect && ['10', '25', '50'].includes(radius)) sortSelect.value = `distance${radius}`;
  }

  function fitPlaceResults() {
    if (!placeOrigin || placeQuery !== normalize(searchInput.value)) return;
    const entries = filtered();
    const points = entries
      .filter(x => Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lon)))
      .map(x => [Number(x.lat), Number(x.lon)]);
    points.push([placeOrigin.lat, placeOrigin.lon]);

    map.invalidateSize({ animate: false, pan: false });
    if (points.length === 1) {
      map.setView(points[0], 12, { animate: false });
    } else {
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [28, 24],
        paddingBottomRight: [28, 24],
        animate: false,
        maxZoom: 13
      });
    }

    removePlaceMarker();
    placeMarker = L.circleMarker([placeOrigin.lat, placeOrigin.lon], {
      radius: 7,
      color: '#fff',
      weight: 3,
      fillColor: '#7a4fd0',
      fillOpacity: 1
    }).addTo(map).bindTooltip(`Suchort: ${placeOrigin.label}`, { direction: 'top' });

    const radius = Number(radiusSelect.value);
    const radiusText = radius >= 9999 ? 'alle Entfernungen' : `${radius} km`;
    if (statusMsg) statusMsg.textContent = `${placeOrigin.label} · Umkreis ${radiusText} · ${entries.length} Treffer`;
  }

  async function resolvePlace(rawQuery, serial) {
    const q = normalize(rawQuery);
    if (q.length < 2) return;

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '4');
      url.searchParams.set('countrycodes', 'de');
      url.searchParams.set('accept-language', 'de');
      url.searchParams.set('q', rawQuery.trim());

      const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);
      const results = await response.json();
      if (serial !== requestSerial || q !== normalize(searchInput.value)) return;

      const place = Array.isArray(results) ? results.find(isPlaceResult) : null;
      if (!place) {
        placeOrigin = null;
        placeQuery = '';
        window.veSearchOrigin = null;
        removePlaceMarker();
        render();
        const directCount = filtered().length;
        if (statusMsg) statusMsg.textContent = directCount
          ? `${directCount} Treffer für „${rawQuery.trim()}“`
          : `Kein Ort oder Datensatz für „${rawQuery.trim()}“ gefunden`;
        return;
      }

      placeOrigin = {
        lat: Number(place.lat),
        lon: Number(place.lon),
        label: String(place.name || place.display_name || rawQuery.trim()).split(',')[0]
      };
      placeQuery = q;
      window.veSearchOrigin = placeOrigin;
      setNearbyUi();
      render();
      requestAnimationFrame(() => setTimeout(fitPlaceResults, 80));
    } catch (error) {
      console.error(error);
      if (serial !== requestSerial) return;
      placeOrigin = null;
      placeQuery = '';
      window.veSearchOrigin = null;
      removePlaceMarker();
      render();
      if (statusMsg) statusMsg.textContent = 'Ortssuche derzeit nicht erreichbar · Datenbanksuche bleibt aktiv';
    }
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(geocodeTimer);
    requestSerial += 1;
    const serial = requestSerial;
    const raw = searchInput.value;
    const q = normalize(raw);

    placeOrigin = null;
    placeQuery = '';
    window.veSearchOrigin = null;
    removePlaceMarker();

    if (!q) {
      render();
      return;
    }

    // Show direct station/name matches immediately. Once typing stops, try the
    // same text as a real German place or postcode via OpenStreetMap.
    render();
    geocodeTimer = setTimeout(() => resolvePlace(raw, serial), 650);
  });

  radiusSelect.addEventListener('change', () => {
    if (!placeOrigin || placeQuery !== normalize(searchInput.value)) return;
    setNearbyUi();
    render();
    setTimeout(fitPlaceResults, 430);
  });

  ['fCassette', 'fGrey', 'fWater', 'fTrash', 'fConfirmed'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      if (!placeOrigin || placeQuery !== normalize(searchInput.value)) return;
      render();
      setTimeout(fitPlaceResults, 360);
    });
  });
})();
