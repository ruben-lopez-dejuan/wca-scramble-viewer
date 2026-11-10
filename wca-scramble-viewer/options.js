(function () {
  'use strict';
  const V = window.WCAScrambleViz;
  const S = window.WSVSettings;
  const P = window.WSVPicker;

  let settings = S.defaults();
  const ORDER = ['cube', 'pyram', 'skewb', 'minx', 'sq1', 'clock'];

  function previewSvg(puzzle) {
    // Estado resuelto: se ven claramente todos los colores de cada cara.
    return V.renderPuzzle(puzzle, 3, '', settings.schemes[puzzle]);
  }

  function refreshCard(puzzle) {
    const card = document.querySelector('.card[data-puzzle="' + puzzle + '"]');
    if (!card) return;
    card.querySelector('.preview').innerHTML = previewSvg(puzzle);
    card.querySelectorAll('input[type=color]').forEach(inp => {
      inp.value = settings.schemes[puzzle][inp.dataset.face];
    });
  }

  function setColor(puzzle, face, value, persist) {
    settings.schemes[puzzle][face] = value;
    refreshCard(puzzle);
    if (persist) S.save(settings);
  }

  function build() {
    const main = document.getElementById('puzzles');
    main.textContent = '';
    for (const puzzle of ORDER) {
      const def = V.PUZZLES[puzzle];
      const card = document.createElement('section');
      card.className = 'card';
      card.dataset.puzzle = puzzle;

      const h = document.createElement('h2');
      h.textContent = def.name;
      card.appendChild(h);

      const prev = document.createElement('div');
      prev.className = 'preview';
      prev.title = 'Haz clic en una pegatina para cambiar su color';
      card.appendChild(prev);

      const faces = document.createElement('div');
      faces.className = 'faces';
      for (const [key, label] of def.faces) {
        const l = document.createElement('label');
        const inp = document.createElement('input');
        inp.type = 'color';
        inp.dataset.face = key;
        inp.addEventListener('input', () => setColor(puzzle, key, inp.value.toLowerCase(), false));
        inp.addEventListener('change', () => setColor(puzzle, key, inp.value.toLowerCase(), true));
        l.appendChild(inp);
        l.appendChild(document.createTextNode(label));
        faces.appendChild(l);
      }
      card.appendChild(faces);

      const reset = document.createElement('button');
      reset.textContent = 'Restablecer colores de TNoodle';
      reset.addEventListener('click', () => {
        settings.schemes[puzzle] = Object.assign({}, def.defaults);
        refreshCard(puzzle);
        S.save(settings);
      });
      card.appendChild(reset);

      prev.addEventListener('click', evt => {
        const st = evt.target.closest('[data-face]');
        if (!st) return;
        const face = st.getAttribute('data-face');
        if (!(face in settings.schemes[puzzle])) return;
        P.open(evt, settings.schemes[puzzle][face],
          v => setColor(puzzle, face, v, false),
          v => setColor(puzzle, face, v, true));
      });

      main.appendChild(card);
      refreshCard(puzzle);
    }
  }

  function syncGeneral() {
    document.getElementById('enabled').checked = settings.enabled;
    document.getElementById('height').value = settings.height;
    document.getElementById('heightOut').textContent = settings.height + ' px';
  }

  document.getElementById('enabled').addEventListener('change', e => {
    settings.enabled = e.target.checked;
    S.save(settings);
  });
  const height = document.getElementById('height');
  height.addEventListener('input', () => {
    document.getElementById('heightOut').textContent = height.value + ' px';
  });
  height.addEventListener('change', () => {
    settings.height = parseInt(height.value, 10);
    S.save(settings);
  });
  document.getElementById('resetAll').addEventListener('click', () => {
    if (!confirm('¿Restablecer los colores de todos los puzzles a los de TNoodle?')) return;
    const d = S.defaults();
    settings.schemes = d.schemes;
    S.save(settings);
    ORDER.forEach(refreshCard);
  });

  S.onChange(next => {
    settings = next;
    syncGeneral();
    ORDER.forEach(refreshCard);
  });

  S.load().then(loaded => {
    settings = loaded;
    syncGeneral();
    build();
  });
})();
