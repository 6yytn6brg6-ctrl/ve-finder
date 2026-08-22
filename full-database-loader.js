// V/E Finder v3.4: load the full 465-station database and normalize source provenance.
// The database is gzip-compressed and split into small Base64 chunks for reliable hosting.
// The legacy "stations-461" chunk names stay in place so existing cached installs can
// update safely; the loader validates the current record count after decompression.
(() => {
  const nativeFetch = window.fetch.bind(window);
  const parts = [
    'data/stations-461.part00.b64?v=20260822-34',
    'data/stations-461.part01.b64?v=20260822-34',
    'data/stations-461.part02.b64?v=20260822-34',
    'data/stations-461.part03.b64?v=20260822-34',
    'data/stations-461.part04.b64?v=20260822-34'
  ];

  const clean = value => String(value ?? '').trim();
  const dateOrNull = value => clean(value) || null;

  function normalizeSourceEntry(entry = {}) {
    return {
      type: clean(entry.type) || 'legacy',
      name: clean(entry.name) || 'Unbekannte Quelle',
      url: clean(entry.url) || null,
      checked_at: dateOrNull(entry.checked_at),
      note: clean(entry.note),
      confirms: Array.isArray(entry.confirms) ? entry.confirms.map(clean).filter(Boolean) : []
    };
  }

  function normalizeStation(station = {}) {
    const result = { ...station };
    let sources = Array.isArray(result.sources)
      ? result.sources.map(normalizeSourceEntry)
      : [];

    const legacySource = clean(result.source);
    const legacyChecked = dateOrNull(result.lastChecked);

    // The old database has one free-text `source` field. Keep it, but mirror it
    // into the structured model without pretending that it is already audited.
    if (!sources.length && legacySource) {
      sources.push(normalizeSourceEntry({
        type: 'legacy',
        name: legacySource,
        url: result.source_url,
        checked_at: result.checked_at || legacyChecked,
        note: result.source_note || 'Aus dem Altbestand übernommen; Einzelquelle noch nicht im neuen Quellenregister geprüft.'
      }));
    }

    result.sources = sources;
    result.checked_at = dateOrNull(result.checked_at) || legacyChecked;
    result.source_type = clean(result.source_type) || (legacySource ? 'legacy' : 'legacy_untracked');
    result.source_url = clean(result.source_url) || (sources.find(item => item.url)?.url ?? null);
    result.source_note = clean(result.source_note) || (
      legacySource
        ? 'Altbestand: Quellenangabe vorhanden, aber noch nicht nach dem neuen Verfahren verifiziert.'
        : 'Altbestand: Einzelquelle noch nicht dokumentiert.'
    );
    result.verification_status = clean(result.verification_status) || 'legacy_untracked';

    return result;
  }

  window.VEFinderProvenance = {
    normalizeStation,
    normalizeSourceEntry
  };

  async function loadFullDatabase() {
    if (!('DecompressionStream' in window)) {
      throw new Error('DecompressionStream wird nicht unterstützt');
    }

    const responses = await Promise.all(parts.map(url => nativeFetch(url, { cache: 'no-store' })));
    for (const response of responses) {
      if (!response.ok) throw new Error(`Datenbank-Teil HTTP ${response.status}`);
    }

    const texts = await Promise.all(responses.map(response => response.text()));
    const b64 = texts.join('').replace(/\s+/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.length !== 465) {
      throw new Error(`Unerwartete Stationsanzahl: ${Array.isArray(data) ? data.length : 'kein Array'}`);
    }

    return JSON.stringify(data.map(normalizeStation));
  }

  async function normalizedFallback(input, init) {
    const response = await nativeFetch(input, init);
    if (!response.ok) return response;
    try {
      const data = await response.clone().json();
      if (!Array.isArray(data)) return response;
      return new Response(JSON.stringify(data.map(normalizeStation)), {
        status: response.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } catch (_) {
      return response;
    }
  }

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (!url || !/(^|\/)stations\.json(?:\?|$)/.test(url)) {
      return nativeFetch(input, init);
    }

    try {
      const text = await loadFullDatabase();
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } catch (err) {
      console.error('Vollständige V/E-Datenbank konnte nicht geladen werden; Testbestand wird verwendet.', err);
      return normalizedFallback(input, init);
    }
  };
})();
