// V/E Finder v1.5: make bottom navigation behave like real app sections.
(() => {
  const detailDialog = document.getElementById('detailDialog');
  const addDialog = document.getElementById('addDialog');
  const dataDialog = document.getElementById('dataDialog');
  const dataContent = document.getElementById('dataContent');
  const navIds = ['nearbyBtn', 'allBtn', 'addBtn', 'dataBtn'];

  const style = document.createElement('style');
  style.textContent = `
    #dataDialog[open], #addDialog[open] {
      position: fixed;
      inset: auto 0 calc(66px + env(safe-area-inset-bottom)) 0;
      margin: 0 auto;
      z-index: 5000;
      background: #fff;
      box-shadow: 0 -10px 30px #0002;
    }
    .data-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 14px 0;
    }
    .data-summary .detail-item strong {
      display: block;
      font-size: 20px;
      margin-top: 2px;
    }
    .data-legend {
      display: grid;
      gap: 7px;
      margin-top: 12px;
      font-size: 13px;
    }
    .data-legend-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 10px;
      border-radius: 10px;
      background: #f5f7f5;
    }
  `;
  document.head.appendChild(style);

  function setActive(id) {
    navIds.forEach(navId => document.getElementById(navId)?.classList.toggle('active', navId === id));
  }

  function syncModeActive() {
    setActive(mode === 'all' ? 'allBtn' : 'nearbyBtn');
  }

  function closeDialog(dialog) {
    if (dialog?.open) dialog.close();
  }

  function closeSheets(except) {
    [detailDialog, addDialog, dataDialog].forEach(dialog => {
      if (dialog !== except) closeDialog(dialog);
    });
  }

  const nearbyBtn = document.getElementById('nearbyBtn');
  const allBtn = document.getElementById('allBtn');
  const addBtn = document.getElementById('addBtn');
  const dataBtn = document.getElementById('dataBtn');

  nearbyBtn.onclick = async () => {
    closeSheets();
    mode = 'nearby';
    setActive('nearbyBtn');
    render();
    if (!pos) await locate();
  };

  allBtn.onclick = () => {
    closeSheets();
    mode = 'all';
    setActive('allBtn');
    render();
  };

  addBtn.onclick = () => {
    closeSheets(addDialog);
    setActive('addBtn');
    add();
    if (!addDialog?.open) setTimeout(syncModeActive, 0);
  };

  dataBtn.onclick = () => {
    closeSheets(dataDialog);
    setActive('dataBtn');

    const entries = all();
    const count = value => entries.filter(x => x.color === value).length;
    const postcode = entries.filter(x => x.coordinateQuality === 'postcode').length;
    const exact = Math.max(0, entries.length - postcode);

    dataContent.innerHTML = `<div class="sheet-inner">
      <div class="sheet-head">
        <div><h2>Datenbestand</h2><div class="statusmsg">Aktuell geladene V/E-Punkte auf diesem Gerät</div></div>
        <button class="closebtn" id="closeDataSheet" aria-label="Daten schließen">×</button>
      </div>
      <div class="data-summary">
        <div class="detail-item"><small>Datenbank</small><strong>${seed.length}</strong></div>
        <div class="detail-item"><small>Eigene Punkte</small><strong>${user.length}</strong></div>
        <div class="detail-item"><small>Position exakt/übernommen</small><strong>${exact}</strong></div>
        <div class="detail-item"><small>Position nur PLZ-genau</small><strong>${postcode}</strong></div>
      </div>
      <div class="data-legend">
        <div class="data-legend-row"><span>🟢 Bestätigt</span><strong>${count('Grün')}</strong></div>
        <div class="data-legend-row"><span>🟡 Noch prüfen</span><strong>${count('Gelb')}</strong></div>
        <div class="data-legend-row"><span>⚪ Kandidat</span><strong>${count('Weiß')}</strong></div>
        <div class="data-legend-row"><span>🔴 Keine Durchreise-V/E</span><strong>${count('Rot')}</strong></div>
      </div>
      <div class="routebox">„Alle“ zeigt den gesamten Datenbestand unter Berücksichtigung deiner gesetzten Filter. „In der Nähe“ begrenzt zusätzlich auf den gewählten Radius um deinen Standort.</div>
    </div>`;

    document.getElementById('closeDataSheet')?.addEventListener('click', () => dataDialog.close());
    if (!dataDialog.open) dataDialog.show();
  };

  addDialog?.addEventListener('close', syncModeActive);
  dataDialog?.addEventListener('close', syncModeActive);
})();
