// V/E Finder v2.1: edit station data locally, including built-in database entries.
(() => {
  const OVERRIDE_KEY = 'vefinder.overrides.v1';
  let overrides = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
  const detailDialog = document.getElementById('detailDialog');
  const detailContent = document.getElementById('detailContent');
  const statusMsg = document.getElementById('statusMsg');

  function ownEntry(id) {
    return user.find(entry => entry.id === id) || null;
  }

  function seedEntry(id) {
    return seed.find(entry => entry.id === id) || null;
  }

  function applyOverrides() {
    seed.forEach(entry => {
      if (overrides[entry.id]) Object.assign(entry, overrides[entry.id]);
    });
  }

  const previousRender = render;
  render = function() {
    applyOverrides();
    return previousRender();
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function option(value, current, label) {
    return `<option value="${value}"${String(current).toLowerCase() === value ? ' selected' : ''}>${label}</option>`;
  }

  let editDialog = document.getElementById('editDialog');
  if (!editDialog) {
    editDialog = document.createElement('dialog');
    editDialog.id = 'editDialog';
    editDialog.className = 'sheet';
    editDialog.innerHTML = '<div id="editContent"></div>';
    document.body.appendChild(editDialog);
  }

  function openEditor(x) {
    const isOwn = !!ownEntry(x.id);
    const editContent = document.getElementById('editContent');
    if (!editContent) return;

    editContent.innerHTML = `<div class="sheet-inner">
      <div class="sheet-head">
        <div>
          <h2>Station bearbeiten</h2>
          <div class="statusmsg">${isOwn ? 'Eigene Station' : 'Datenbankstation · Änderung wird vorerst nur auf diesem Gerät gespeichert'}</div>
        </div>
        <button type="button" class="closebtn" id="closeEditBtn">×</button>
      </div>
      <form id="editStationForm" class="form-grid">
        <label>Name<input name="name" value="${escapeHtml(x.name)}" required></label>
        <label>PLZ<input name="postal" value="${escapeHtml(x.postal)}"></label>
        <label>Bundesland<input name="state" value="${escapeHtml(x.state)}"></label>
        <div class="edit-service-grid">
          <label>Kassette<select name="cassette">
            ${option('ja', x.cassette, 'ja')}${option('nein', x.cassette, 'nein')}${option('?', x.cassette, 'unbekannt')}
          </select></label>
          <label>Grauwasser<select name="grey">
            ${option('ja', x.grey, 'ja')}${option('nein', x.grey, 'nein')}${option('?', x.grey, 'unbekannt')}
          </select></label>
          <label>Frischwasser<select name="water">
            ${option('ja', x.water, 'ja')}${option('nein', x.water, 'nein')}${option('?', x.water, 'unbekannt')}
          </select></label>
          <label>Müll<select name="trash">
            ${option('ja', x.trash, 'ja')}${option('nein', x.trash, 'nein')}${option('?', x.trash, 'unbekannt')}
          </select></label>
        </div>
        <label>Preis<input name="price" value="${escapeHtml(x.price)}"></label>
        <label>Telefon<input name="phone" value="${escapeHtml(x.phone)}"></label>
        <label>Hinweis<textarea name="note">${escapeHtml(x.note)}</textarea></label>
        <button type="submit" class="primary">Änderungen speichern</button>
      </form>
    </div>`;

    document.getElementById('closeEditBtn')?.addEventListener('click', () => editDialog.close());
    document.getElementById('editStationForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const update = {
        name: String(form.get('name') || '').trim(),
        postal: String(form.get('postal') || '').trim(),
        state: String(form.get('state') || '').trim(),
        cassette: String(form.get('cassette') || '?'),
        grey: String(form.get('grey') || '?'),
        water: String(form.get('water') || '?'),
        trash: String(form.get('trash') || '?'),
        price: String(form.get('price') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        note: String(form.get('note') || '').trim()
      };

      let target = ownEntry(x.id);
      if (target) {
        Object.assign(target, update);
        localStorage.setItem(KEY, JSON.stringify(user));
      } else {
        overrides[x.id] = update;
        localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
        target = seedEntry(x.id);
        if (target) Object.assign(target, update);
      }

      editDialog.close();
      render();
      if (statusMsg) statusMsg.textContent = `${update.name || 'Station'} · Änderung gespeichert`;
      if (target) detail(target);
    });

    if (detailDialog?.open) detailDialog.close();
    if (!editDialog.open) editDialog.showModal();
  }

  const previousDetail = detail;
  detail = function(x) {
    previousDetail(x);
    const inner = detailContent?.querySelector('.sheet-inner');
    if (!inner || inner.querySelector('.station-edit-btn')) return;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'outline station-edit-btn';
    editButton.textContent = 'Station bearbeiten';
    editButton.addEventListener('click', () => openEditor(x));

    const actions = inner.querySelector('.actions');
    if (actions) actions.insertAdjacentElement('afterend', editButton);
    else inner.appendChild(editButton);
  };

  const style = document.createElement('style');
  style.textContent = `
    .station-edit-btn {
      display:block;
      width:100%;
      margin-top:10px;
    }
    .edit-service-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    }
    .edit-service-grid label { min-width:0; }
    .edit-service-grid select {
      width:100%;
      margin-top:4px;
      padding:10px;
      border:1px solid var(--line);
      border-radius:10px;
      font-size:15px;
      background:#fff;
    }
    html[data-theme="dark"] .edit-service-grid select {
      background:#1d2723;
      color:var(--ink);
      border-color:var(--line);
    }
  `;
  document.head.appendChild(style);

  applyOverrides();
})();
