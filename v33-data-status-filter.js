// V/E Finder v3.3: make the status rows in "Daten" open the complete matching list.
(() => {
  const dataBtn = document.getElementById('dataBtn');
  const dataDialog = document.getElementById('dataDialog');
  const allBtn = document.getElementById('allBtn');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const statusMsg = document.getElementById('statusMsg');
  const resultsPanel = document.querySelector('.results-panel');

  if (!dataBtn || typeof filtered !== 'function') return;

  const statusInfo = {
    'Grün': { label: 'Bestätigt', symbol: '🟢' },
    'Gelb': { label: 'Noch prüfen', symbol: '🟡' },
    'Weiß': { label: 'Kandidat', symbol: '⚪' },
    'Rot': { label: 'Keine Durchreise-V/E', symbol: '🔴' }
  };

  let statusColorFilter = null;
  const previousFiltered = filtered;

  // Apply the status selector last, after all existing search/map/state logic.
  filtered = function() {
    const entries = previousFiltered();
    return statusColorFilter
      ? entries.filter(entry => entry.color === statusColorFilter)
      : entries;
  };

  function clearStatusFilter() {
    statusColorFilter = null;
  }

  // A normal tap on "Alle" or "In der Nähe" returns to the ordinary list.
  allBtn?.addEventListener('click', clearStatusFilter, true);
  nearbyBtn?.addEventListener('click', clearStatusFilter, true);

  function clearOrdinaryFilters() {
    if (searchInput) {
      searchInput.value = '';
      // Also resets the place-search origin/marker from v2.7.
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    ['fCassette', 'fGrey', 'fWater', 'fTrash', 'fConfirmed'].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.checked = false;
    });

    if (sortSelect) sortSelect.value = 'name';
  }

  function fitStatusEntries(color) {
    const entries = all().filter(entry => entry.color === color);
    const points = entries
      .filter(entry => Number.isFinite(Number(entry.lat)) && Number.isFinite(Number(entry.lon)))
      .map(entry => [Number(entry.lat), Number(entry.lon)]);

    map.invalidateSize({ animate: false, pan: false });
    if (points.length === 1) {
      map.setView(points[0], 12, { animate: false });
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [24, 24],
        animate: false,
        maxZoom: 12
      });
    }
  }

  function openStatus(color) {
    const info = statusInfo[color];
    if (!info) return;

    if (dataDialog?.open) dataDialog.close();

    // Trigger the existing "Alle" behaviour once so hidden viewport/state modes
    // are reset as well. The status filter is installed immediately afterwards.
    clearStatusFilter();
    allBtn?.click();
    clearOrdinaryFilters();

    mode = 'all';
    statusColorFilter = color;
    render();

    const entries = all().filter(entry => entry.color === color);
    if (statusMsg) statusMsg.textContent = `${info.symbol} ${info.label} · ${entries.length} Treffer`;
    if (resultsPanel) resultsPanel.scrollTop = 0;

    requestAnimationFrame(() => setTimeout(() => fitStatusEntries(color), 60));
  }

  function enhanceDataRows() {
    const rows = document.querySelectorAll('#dataContent .data-legend-row');
    rows.forEach(row => {
      if (row.dataset.statusEnhanced === '1') return;
      const text = row.textContent || '';
      const color = text.includes('🟢') ? 'Grün'
        : text.includes('🟡') ? 'Gelb'
        : text.includes('⚪') ? 'Weiß'
        : text.includes('🔴') ? 'Rot'
        : null;
      if (!color) return;

      row.dataset.statusEnhanced = '1';
      row.dataset.statusColor = color;
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-label', `${statusInfo[color].label} anzeigen`);
      row.classList.add('data-status-link');

      const chevron = document.createElement('span');
      chevron.className = 'data-status-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = '›';
      row.appendChild(chevron);

      const activate = () => openStatus(color);
      row.addEventListener('click', activate);
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  dataBtn.addEventListener('click', () => setTimeout(enhanceDataRows, 0));

  const style = document.createElement('style');
  style.textContent = `
    #dataContent .data-legend-row.data-status-link {
      cursor: pointer;
      align-items: center;
      transition: transform .08s ease, background .08s ease;
    }
    #dataContent .data-legend-row.data-status-link:active {
      transform: scale(.985);
    }
    #dataContent .data-status-chevron {
      margin-left: 2px;
      font-size: 24px;
      line-height: 1;
      color: var(--muted);
      font-weight: 500;
    }
    #dataContent .data-legend-row.data-status-link strong {
      margin-left: auto;
    }
  `;
  document.head.appendChild(style);
})();
