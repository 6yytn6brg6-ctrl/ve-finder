// V/E Finder v2.6: make scroll selection follow a fixed focus line so short cards are not skipped.
(() => {
  const resultsPanel = document.querySelector('.results-panel');
  const resultsEl = document.getElementById('results');
  if (!resultsPanel || !resultsEl) return;

  let frame = 0;

  function updateFocusedCard() {
    frame = 0;
    if (document.body.classList.contains('route-mode')) return;

    const cards = [...resultsEl.querySelectorAll('.result-card')];
    if (!cards.length) return;

    const panelRect = resultsPanel.getBoundingClientRect();
    const focusY = panelRect.top + panelRect.height * 0.42;

    let best = null;
    let bestDistance = Infinity;

    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom <= panelRect.top || rect.top >= panelRect.bottom) continue;

      const centerY = (rect.top + rect.bottom) / 2;
      const distance = Math.abs(centerY - focusY);
      if (distance < bestDistance) {
        best = card;
        bestDistance = distance;
      }
    }

    // v2.5 changed a card tap into map-selection only. Reusing that behavior
    // keeps the active colour and red flag in one place without opening details.
    if (best && !best.classList.contains('map-active')) best.click();
  }

  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateFocusedCard);
  }

  resultsPanel.addEventListener('scroll', schedule, { passive: true });
  resultsPanel.addEventListener('touchend', schedule, { passive: true });
  setTimeout(schedule, 300);
})();
