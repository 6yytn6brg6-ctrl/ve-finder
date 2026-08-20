// V/E Finder v1.1: load the full 461-station database.
// The database is gzip-compressed and split into small Base64 chunks for reliable hosting.
(() => {
  const nativeFetch = window.fetch.bind(window);
  const parts = [
    'data/stations-461.part00.b64?v=20260820-11',
    'data/stations-461.part01.b64?v=20260820-11',
    'data/stations-461.part02.b64?v=20260820-11',
    'data/stations-461.part03.b64?v=20260820-11',
    'data/stations-461.part04.b64?v=20260820-11'
  ];

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
    if (!Array.isArray(data) || data.length !== 461) {
      throw new Error(`Unerwartete Stationsanzahl: ${Array.isArray(data) ? data.length : 'kein Array'}`);
    }
    return text;
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
      return nativeFetch(input, init);
    }
  };
})();
