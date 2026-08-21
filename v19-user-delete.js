// V/E Finder v1.9: allow deletion of stations created on this device.
(() => {
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const statusMsg = document.getElementById('statusMsg');
  const previousDetail = detail;

  function isOwnStation(x) {
    return !!x && user.some(entry => entry.id === x.id);
  }

  detail = function(x) {
    previousDetail(x);
    if (!isOwnStation(x)) return;

    const inner = detailContent?.querySelector('.sheet-inner');
    if (!inner || inner.querySelector('.user-delete-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'danger user-delete-btn';
    button.textContent = 'Eigene Station löschen';
    button.addEventListener('click', () => {
      const name = x.name || 'Diese Station';
      if (!window.confirm(`„${name}“ wirklich löschen?`)) return;

      user = user.filter(entry => entry.id !== x.id);
      localStorage.setItem(KEY, JSON.stringify(user));
      if (detailDialog?.open) detailDialog.close();
      render();
      if (statusMsg) statusMsg.textContent = `Eigene Station „${name}“ gelöscht.`;
    });

    const routeInfo = inner.querySelector('#routeInfo');
    if (routeInfo) inner.insertBefore(button, routeInfo);
    else inner.appendChild(button);
  };

  const style = document.createElement('style');
  style.textContent = `
    .user-delete-btn {
      display:block;
      width:100%;
      margin-top:14px;
    }
    html[data-theme="dark"] .user-delete-btn {
      background:#4b2424;
      color:#ffd9d7;
    }
  `;
  document.head.appendChild(style);
})();
