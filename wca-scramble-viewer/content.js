/* Inserta la imagen de cada mezcla en las páginas /competitions/<id>/scrambles de la WCA. */
(function () {
  'use strict';
  const V = window.WCAScrambleViz;
  const S = window.WSVSettings;
  const P = window.WSVPicker;

  let settings = S.defaults();
  let version = 0;
  let scheduled = false;

  function currentEvent(root) {
    const sel = root.querySelector('.event-menu-bar .cubing-icon.selected');
    if (sel) {
      const m = /(?:^|\s)event-([a-z0-9]+)(?:\s|$)/.exec(sel.className);
      if (m) return m[1];
    }
    const param = new URLSearchParams(location.search).get('event');
    if (param) return param;
    const ds = document.getElementById('selected-event');
    return ds ? ds.dataset.selected : null;
  }

  function removeAll(scope) {
    scope.querySelectorAll('.wsv-cell, .wsv-th').forEach(el => el.remove());
  }

  function sizeSvg(svg) {
    const vb = svg.viewBox.baseVal;
    const h = settings.height;
    svg.setAttribute('height', h);
    svg.setAttribute('width', vb && vb.height ? Math.round(h * vb.width / vb.height) : h);
  }

  function fill(cell, ev, info, text) {
    cell.textContent = '';
    const wrap = document.createElement('div');
    wrap.className = 'wsv-wrap';
    // En MBLD puede venir más de una mezcla por celda (una por línea).
    const parts = ev === '333mbf' ? text.split(/\n+/).filter(s => s.trim()) : [text];
    for (const part of parts) {
      const box = document.createElement('div');
      box.className = 'wsv-img';
      box.dataset.puzzle = info.puzzle;
      try {
        box.innerHTML = V.renderEvent(ev, part, settings.schemes);
        const svg = box.querySelector('svg');
        sizeSvg(svg);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Estado tras la mezcla');
      } catch (e) {
        box.className = 'wsv-error';
        box.textContent = '⚠ ' + (e && e.message ? e.message : 'No se pudo dibujar');
      }
      wrap.appendChild(box);
    }
    cell.appendChild(wrap);
  }

  function process() {
    scheduled = false;
    const root = document.getElementById('competition_scrambles');
    if (!root) return;
    const ev = currentEvent(root);
    const info = ev ? V.EVENTS[ev] : null;
    if (!settings.enabled || !info) {
      removeAll(root);
      return;
    }
    root.querySelectorAll('table').forEach(table => {
      const cells = table.querySelectorAll('td.prewrap');
      if (!cells.length) return;
      const headRow = table.querySelector('thead tr');
      if (headRow && !headRow.querySelector('th.wsv-th')) {
        const th = document.createElement('th');
        th.className = 'wsv-th';
        th.textContent = 'Imagen';
        th.title = 'Haz clic en una pegatina para cambiar el color de esa cara';
        headRow.appendChild(th);
      }
      cells.forEach(td => {
        const row = td.parentElement;
        const text = td.textContent.trim();
        const key = [ev, text, version, settings.height].join('\u0000');
        let cell = row.querySelector(':scope > td.wsv-cell');
        if (cell && cell.dataset.key === key) return;
        if (!cell) {
          cell = document.createElement('td');
          cell.className = 'wsv-cell';
          row.appendChild(cell);
        }
        cell.dataset.key = key;
        fill(cell, ev, info, text);
      });
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(process);
  }

  // Clic en una pegatina -> cambiar el color de esa cara (para todo el puzzle).
  document.addEventListener('click', evt => {
    const sticker = evt.target.closest && evt.target.closest('.wsv-img [data-face]');
    if (!sticker) return;
    const puzzle = sticker.closest('.wsv-img').dataset.puzzle;
    const face = sticker.getAttribute('data-face');
    const scheme = settings.schemes[puzzle];
    if (!scheme || !(face in scheme)) return;
    evt.preventDefault();
    P.open(evt, scheme[face], value => {
      scheme[face] = value;
      version++;
      schedule();
    }, value => {
      scheme[face] = value;
      S.save(settings);
    });
  });

  S.onChange(next => {
    settings = next;
    version++;
    schedule();
  });

  S.load().then(loaded => {
    settings = loaded;
    version++;
    process();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
