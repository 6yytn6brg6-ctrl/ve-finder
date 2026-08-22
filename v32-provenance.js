// V/E Finder v3.2: structured provenance for local/user-created stations.
(() => {
  const normalize = window.VEFinderProvenance?.normalizeStation;
  if (typeof normalize !== 'function') return;

  const today = () => new Date().toISOString().slice(0, 10);

  function normalizeOwnEntry(entry, isNew = false) {
    const normalized = normalize(entry);
    const checkedAt = isNew ? today() : (normalized.checked_at || null);

    normalized.source_type = 'user';
    normalized.verification_status = normalized.verification_status === 'legacy_untracked'
      ? 'candidate'
      : normalized.verification_status;
    normalized.checked_at = checkedAt;
    normalized.source_url = null;
    normalized.source_note = isNew
      ? 'Eigener Eintrag: direkt im V/E Finder am aktuellen GPS-Standort angelegt.'
      : (normalized.source_note || 'Eigener lokaler Eintrag; externe Bestätigung noch offen.');

    const hasUserSource = normalized.sources.some(source => source.type === 'user');
    if (!hasUserSource) {
      normalized.sources.unshift({
        type: 'user',
        name: 'Eigener Eintrag auf diesem Gerät',
        url: null,
        checked_at: checkedAt,
        note: isNew
          ? 'Vom Nutzer direkt vor Ort im V/E Finder angelegt.'
          : 'Lokaler Nutzereintrag; historisches Anlagedatum ggf. unbekannt.',
        confirms: ['existence', 'coordinates']
      });
    }

    return normalized;
  }

  // Migrate already existing local stations once, without touching database stations.
  if (Array.isArray(user)) {
    user = user.map(entry => normalizeOwnEntry(entry, false));
    localStorage.setItem(KEY, JSON.stringify(user));
  }

  // Wrap the existing add dialog so every newly created station immediately
  // receives the structured source/provenance fields as well.
  const previousAdd = add;
  add = function() {
    previousAdd();
    const form = document.getElementById('f');
    if (!form || typeof form.onsubmit !== 'function') return;

    const previousSubmit = form.onsubmit;
    form.onsubmit = event => {
      const before = user.length;
      previousSubmit(event);
      if (user.length <= before) return;

      const index = user.length - 1;
      user[index] = normalizeOwnEntry(user[index], true);
      localStorage.setItem(KEY, JSON.stringify(user));
      render();
    };
  };

  const addButton = document.getElementById('addBtn');
  if (addButton) addButton.onclick = add;
})();
