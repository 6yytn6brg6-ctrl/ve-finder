// V/E Finder v2.0: delete user-created stations with an in-app confirmation panel.
(() => {
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const statusMsg = document.getElementById('statusMsg');
  const previousDetail = detail;

  function isOwnStation(x) {
    return !!x && user.some(entry => entry.id === x.id);
  }

  function deleteStation(x) {
    const name = x.name || 'Diese Station';
    user = user.filter(entry => entry.id !== x.id);
    localStorage.setItem(KEY, JSON.stringify(user));
    if (detailDialog?.open) detailDialog.close();
    render();
    if (statusMsg) statusMsg.textContent = `Eigene Station „${name}“ gelöscht.`;
  }

  detail = function(x) {
    previousDetail(x);
    if (!isOwnStation(x)) return;

    const inner = detailContent?.querySelector('.sheet-inner');
    if (!inner || inner.querySelector('.user-delete-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'user-delete-wrap';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'danger user-delete-btn';
    button.textContent = 'Eigene Station löschen';

    button.addEventListener('click', () => {
      const name = x.name || 'Diese Station';
      wrap.innerHTML = `
        <div class="user-delete-confirm">
          <strong>„${name}“ wirklich löschen?</strong>
          <div class="user-delete-actions">
            <button type="button" class="outline user-delete-cancel">Abbrechen</button>
            <button type="button" class="danger user-delete-yes">Ja, löschen</button>
          </div>
        </div>`;

      wrap.querySelector('.user-delete-cancel')?.addEventListener('click', () => {
        wrap.innerHTML = '';
        wrap.appendChild(button);
      });

      wrap.querySelector('.user-delete-yes')?.addEventListener('click', () => deleteStation(x));
    });

    wrap.appendChild(button);
    const routeInfo = inner.querySelector('#routeInfo');
    if (routeInfo) inner.insertBefore(wrap, routeInfo);
    else inner.appendChild(wrap);
  };

  const style = document.createElement('style');
  style.textContent = `
    .user-delete-wrap {
      margin-top:14px;
    }
    .user-delete-btn {
      display:block;
      width:100%;
    }
    .user-delete-confirm {
      padding:12px;
      border-radius:12px;
      background:#f7e9e8;
      color:#6f2c2a;
    }
    .user-delete-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      margin-top:10px;
    }
    .user-delete-actions button {
      width:100%;
    }
    html[data-theme="dark"] .user-delete-btn,
    html[data-theme="dark"] .user-delete-yes {
      background:#4b2424;
      color:#ffd9d7;
    }
    html[data-theme="dark"] .user-delete-confirm {
      background:#311c1c;
      color:#ffd9d7;
    }
  `;
  document.head.appendChild(style);
})();
