// V/E Finder v1.2: keep the bottom navigation usable while a station detail is open.
(() => {
  const previousDetail = detail;
  const detailDialog = document.getElementById('detailDialog');

  // Keep the station sheet above the content, but below the fixed bottom navigation.
  const style = document.createElement('style');
  style.textContent = `
    #detailDialog[open] {
      position: fixed;
      inset: auto 0 calc(66px + env(safe-area-inset-bottom)) 0;
      margin: 0 auto;
      z-index: 900;
      box-shadow: 0 -10px 30px #0002;
    }
  `;
  document.head.appendChild(style);

  // The original detail view is modal. Convert it immediately to a normal bottom sheet
  // so the four bottom-nav buttons stay tappable.
  detail = function(x) {
    previousDetail(x);
    if (detailDialog?.open) detailDialog.close();
    detailDialog?.show();
  };

  // Switching sections should always dismiss the selected station first.
  ['nearbyBtn', 'allBtn', 'addBtn', 'dataBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (detailDialog?.open) detailDialog.close();
    }, true);
  });
})();
