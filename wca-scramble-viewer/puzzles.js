/*
 * WCA Scramble Viewer - simuladores y dibujo de puzzles.
 *
 * La lógica de estados y la geometría de los dibujos están portadas de
 * TNoodle (https://github.com/thewca/tnoodle-lib, licencia GPL-3.0) para que
 * las imágenes coincidan con las que aparecen en las hojas de mezclas oficiales.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Colores de TNoodle (svglite/Color.java)
  // ---------------------------------------------------------------------------
  const COL = {
    RED: '#ff0000', GREEN: '#00ff00', BLUE: '#0000ff', WHITE: '#ffffff',
    YELLOW: '#ffff00', ORANGE: '#ff8000', BLACK: '#000000',
    YELLOW_GOLD: '#ffcc00', BLUE_NAVY: '#0000b3', RED_VERMILION: '#dd0000',
    GREEN_DARK: '#006600', PURPLE_ORCHID: '#8a1aff', GRAY_MEDIUM: '#999999',
    YELLOW_CREAM: '#ffffb3', PINK: '#ff99ff', GREEN_LIME: '#71e600',
    ORANGE_TANGERINE: '#ff8433', BLUE_SKY: '#88ddff',
    BLUE_DEEP: '#113366', BLUE_BRIGHT: '#ccddee', BLUE_ICE: '#88aacc',
    BLUE_ASPHALT: '#446699', YELLOW_SUNFLOWER: '#ffcc44', ORANGE_BRONZE: '#cc6600'
  };

  // ---------------------------------------------------------------------------
  // Definición de puzzles: caras configurables y esquema por defecto de TNoodle
  // ---------------------------------------------------------------------------
  const PUZZLES = {
    cube: {
      name: 'Cubos NxN (2x2 a 7x7)',
      faces: [
        ['U', 'Arriba (U)'], ['L', 'Izquierda (L)'], ['F', 'Frente (F)'],
        ['R', 'Derecha (R)'], ['B', 'Atrás (B)'], ['D', 'Abajo (D)']
      ],
      defaults: { U: COL.WHITE, L: COL.ORANGE, F: COL.GREEN, R: COL.RED, B: COL.BLUE, D: COL.YELLOW },
      sample: "R U R' U'"
    },
    pyram: {
      name: 'Pyraminx',
      faces: [['F', 'Frente (F)'], ['L', 'Izquierda (L)'], ['R', 'Derecha (R)'], ['D', 'Abajo (D)']],
      defaults: { F: COL.GREEN, D: COL.YELLOW, L: COL.RED, R: COL.BLUE },
      sample: "U L' r"
    },
    skewb: {
      name: 'Skewb',
      faces: [
        ['U', 'Arriba (U)'], ['L', 'Izquierda (L)'], ['F', 'Frente (F)'],
        ['R', 'Derecha (R)'], ['B', 'Atrás (B)'], ['D', 'Abajo (D)']
      ],
      defaults: { U: COL.WHITE, R: COL.BLUE, F: COL.RED, D: COL.YELLOW, L: COL.GREEN, B: COL.ORANGE },
      sample: "R U' L"
    },
    minx: {
      name: 'Megaminx',
      faces: [
        ['U', 'U'], ['BL', 'BL'], ['BR', 'BR'], ['R', 'R'], ['F', 'F'], ['L', 'L'],
        ['D', 'D'], ['DR', 'DR'], ['DBR', 'DBR'], ['B', 'B'], ['DBL', 'DBL'], ['DL', 'DL']
      ],
      defaults: {
        U: COL.WHITE, BL: COL.YELLOW_GOLD, BR: COL.BLUE_NAVY, R: COL.RED_VERMILION,
        F: COL.GREEN_DARK, L: COL.PURPLE_ORCHID, D: COL.GRAY_MEDIUM, DR: COL.YELLOW_CREAM,
        DBR: COL.PINK, B: COL.GREEN_LIME, DBL: COL.ORANGE_TANGERINE, DL: COL.BLUE_SKY
      },
      sample: 'R++ D-- U'
    },
    sq1: {
      name: 'Square-1',
      faces: [
        ['U', 'Arriba (U)'], ['D', 'Abajo (D)'], ['F', 'Frente (F)'],
        ['B', 'Atrás (B)'], ['L', 'Izquierda (L)'], ['R', 'Derecha (R)']
      ],
      defaults: { B: COL.ORANGE, D: COL.WHITE, F: COL.RED, L: COL.BLUE, R: COL.GREEN, U: COL.YELLOW },
      sample: '(1,0) / (-1,-1) /'
    },
    clock: {
      name: 'Clock',
      faces: [
        ['Front', 'Cara delantera'], ['FrontClock', 'Esferas delanteras'],
        ['FrontTopClock', 'Marca de las 12 (delante)'], ['FrontHand', 'Agujas delanteras'],
        ['FrontHandBorder', 'Borde agujas (delante)'], ['FrontPin', 'Pines (delante)'],
        ['Back', 'Cara trasera'], ['BackClock', 'Esferas traseras'],
        ['BackTopClock', 'Marca de las 12 (detrás)'], ['BackHand', 'Agujas traseras'],
        ['BackHandBorder', 'Borde agujas (detrás)'], ['BackPin', 'Pines (detrás)']
      ],
      defaults: {
        Front: COL.BLUE_DEEP, FrontClock: COL.BLUE_BRIGHT, FrontTopClock: COL.YELLOW_SUNFLOWER,
        FrontHand: COL.BLUE_DEEP, FrontHandBorder: COL.BLUE_DEEP, FrontPin: COL.BLUE_ICE,
        Back: COL.BLUE_BRIGHT, BackClock: COL.BLUE_DEEP, BackTopClock: COL.ORANGE_BRONZE,
        BackHand: COL.BLUE_BRIGHT, BackHandBorder: COL.BLUE_BRIGHT, BackPin: COL.BLUE_ASPHALT
      },
      sample: 'UR1+ ALL2- y2 U3+'
    }
  };

  // Categorías WCA -> puzzle
  const EVENTS = {
    '222': { puzzle: 'cube', size: 2 },
    '333': { puzzle: 'cube', size: 3 },
    '333oh': { puzzle: 'cube', size: 3 },
    '333bf': { puzzle: 'cube', size: 3 },
    '333fm': { puzzle: 'cube', size: 3 },
    '333ft': { puzzle: 'cube', size: 3 },
    '333mbf': { puzzle: 'cube', size: 3 },
    '444': { puzzle: 'cube', size: 4 },
    '444bf': { puzzle: 'cube', size: 4 },
    '555': { puzzle: 'cube', size: 5 },
    '555bf': { puzzle: 'cube', size: 5 },
    '666': { puzzle: 'cube', size: 6 },
    '777': { puzzle: 'cube', size: 7 },
    pyram: { puzzle: 'pyram' },
    skewb: { puzzle: 'skewb' },
    minx: { puzzle: 'minx' },
    sq1: { puzzle: 'sq1' },
    clock: { puzzle: 'clock' }
  };

  class ScrambleError extends Error {}

  // ---------------------------------------------------------------------------
  // Utilidades SVG
  // ---------------------------------------------------------------------------
  function n(v) { return Math.round(v * 1000) / 1000; }
  function pts(list) { return list.map(p => n(p[0]) + ',' + n(p[1])).join(' '); }
  function attrs(o) {
    let s = '';
    for (const k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"';
    return s;
  }
  function poly(points, fill, face, extra) {
    return '<polygon' + attrs(Object.assign({ points: pts(points), fill: fill, stroke: '#000', 'data-face': face }, extra || {})) + '/>';
  }
  function svgWrap(w, h, body, rootAttrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n(w) + ' ' + n(h) + '"' +
      attrs(Object.assign({ width: n(w), height: n(h) }, rootAttrs || {})) + '>' + body + '</svg>';
  }
  function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const det = (a, b, c, d) => a * d - b * c;
    const den = det(x1 - x2, y1 - y2, x3 - x4, y3 - y4);
    return [
      det(det(x1, y1, x2, y2), x1 - x2, det(x3, y3, x4, y4), x3 - x4) / den,
      det(det(x1, y1, x2, y2), y1 - y2, det(x3, y3, x4, y4), y3 - y4) / den
    ];
  }
  function tokens(scramble) {
    return String(scramble).trim().split(/\s+/).filter(Boolean);
  }

  // ---------------------------------------------------------------------------
  // Cubos NxN (CubePuzzle.java)
  // ---------------------------------------------------------------------------
  const CF = { R: 0, U: 1, F: 2, L: 3, D: 4, B: 5 };
  const CFN = 'RUFLDB';
  const oppFace = f => (f + 3) % 6;

  function cubeSolved(size) {
    const img = [];
    for (let f = 0; f < 6; f++) {
      img.push([]);
      for (let j = 0; j < size; j++) img[f].push(new Array(size).fill(f));
    }
    return img;
  }

  function swap4(img, f1, x1, y1, f2, x2, y2, f3, x3, y3, f4, x4, y4, dir) {
    let t;
    if (dir === 1) {
      t = img[f1][x1][y1];
      img[f1][x1][y1] = img[f2][x2][y2];
      img[f2][x2][y2] = img[f3][x3][y3];
      img[f3][x3][y3] = img[f4][x4][y4];
      img[f4][x4][y4] = t;
    } else if (dir === 2) {
      t = img[f1][x1][y1]; img[f1][x1][y1] = img[f3][x3][y3]; img[f3][x3][y3] = t;
      t = img[f2][x2][y2]; img[f2][x2][y2] = img[f4][x4][y4]; img[f4][x4][y4] = t;
    } else if (dir === 3) {
      t = img[f4][x4][y4];
      img[f4][x4][y4] = img[f3][x3][y3];
      img[f3][x3][y3] = img[f2][x2][y2];
      img[f2][x2][y2] = img[f1][x1][y1];
      img[f1][x1][y1] = t;
    }
  }

  function cubeSlice(face, slice, dir, img) {
    const size = img[0].length;
    const { U, R, F, L, D, B } = CF;
    let sface = face, sslice = slice, sdir = dir;
    if (face !== L && face !== D && face !== B) {
      sface = oppFace(face);
      sslice = size - 1 - slice;
      sdir = 4 - dir;
    }
    for (let j = 0; j < size; j++) {
      if (sface === L) {
        swap4(img, U, j, sslice, B, size - 1 - j, size - 1 - sslice, D, j, sslice, F, j, sslice, sdir);
      } else if (sface === D) {
        swap4(img, L, size - 1 - sslice, j, B, size - 1 - sslice, j, R, size - 1 - sslice, j, F, size - 1 - sslice, j, sdir);
      } else if (sface === B) {
        swap4(img, U, sslice, j, R, j, size - 1 - sslice, D, size - 1 - sslice, size - 1 - j, L, size - 1 - j, sslice, sdir);
      }
    }
    if (slice === 0 || slice === size - 1) {
      let f;
      if (slice === 0) { f = face; sdir = 4 - dir; } else { f = oppFace(face); sdir = dir; }
      for (let j = 0; j < Math.floor((size + 1) / 2); j++) {
        for (let k = 0; k < Math.floor(size / 2); k++) {
          swap4(img, f, j, k, f, k, size - 1 - j, f, size - 1 - j, size - 1 - k, f, size - 1 - k, j, sdir);
        }
      }
    }
  }

  function parseDir(suffix) {
    if (suffix === '' || suffix === undefined) return 1;
    if (suffix === '2' || suffix === "2'") return 2;
    if (suffix === "'") return 3;
    return null;
  }

  function cubeApply(size, scramble) {
    const img = cubeSolved(size);
    for (let tok of tokens(scramble)) {
      tok = tok.replace(/[’`´]/g, "'");
      let m, face, dir, slices = [];
      if ((m = /^([xyz])(2'|2|')?$/.exec(tok))) {
        face = { x: CF.R, y: CF.U, z: CF.F }[m[1]];
        dir = parseDir(m[2] || '');
        for (let s = 0; s < size; s++) slices.push(s);
      } else if ((m = /^(\d+)?([URFDLB])(w)?(2'|2|')?$/.exec(tok))) {
        face = CF[m[2]];
        dir = parseDir(m[4] || '');
        const num = m[1] ? parseInt(m[1], 10) : null;
        if (m[3]) {
          const depth = num || 2;
          for (let s = 0; s < depth; s++) slices.push(s);
        } else if (num) {
          slices.push(num - 1); // notación SiGN: "3R" = sólo la tercera capa
        } else {
          slices.push(0);
        }
      } else if ((m = /^([urfdlb])(2'|2|')?$/.exec(tok))) {
        face = CF[m[1].toUpperCase()];
        dir = parseDir(m[2] || '');
        slices.push(0, 1);
      } else {
        throw new ScrambleError('Movimiento no reconocido: ' + tok);
      }
      if (slices.some(s => s < 0 || s >= size)) throw new ScrambleError('Capa fuera de rango: ' + tok);
      for (const s of slices) cubeSlice(face, s, dir, img);
    }
    return img;
  }

  function cubeDraw(size, img, scheme) {
    const gap = 2, cubie = 10;
    const W = (size * cubie + gap) * 4 + gap;
    const H = (size * cubie + gap) * 3 + gap;
    let body = '';
    const paint = (x, y, f) => {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const c = CFN[img[f][row][col]];
          body += '<rect' + attrs({
            x: x + col * cubie, y: y + row * cubie, width: cubie, height: cubie,
            fill: scheme[c], stroke: '#000', 'data-face': c
          }) + '/>';
        }
      }
    };
    const s = size * cubie;
    paint(gap, 2 * gap + s, CF.L);
    paint(2 * gap + s, 3 * gap + 2 * s, CF.D);
    paint(4 * gap + 3 * s, 2 * gap + s, CF.B);
    paint(3 * gap + 2 * s, 2 * gap + s, CF.R);
    paint(2 * gap + s, gap, CF.U);
    paint(2 * gap + s, 2 * gap + s, CF.F);
    return svgWrap(W, H, body);
  }

  // ---------------------------------------------------------------------------
  // Pyraminx (PyraminxPuzzle.java)
  // ---------------------------------------------------------------------------
  function pyrSwap(img, f1, s1, f2, s2, f3, s3) {
    const t = img[f1][s1];
    img[f1][s1] = img[f2][s2];
    img[f2][s2] = img[f3][s3];
    img[f3][s3] = t;
  }
  function pyrTip(s, img) {
    switch (s) {
      case 0: pyrSwap(img, 0, 0, 3, 0, 2, 3); break;
      case 1: pyrSwap(img, 0, 6, 2, 6, 1, 0); break;
      case 2: pyrSwap(img, 0, 3, 1, 3, 3, 6); break;
      case 3: pyrSwap(img, 1, 6, 2, 0, 3, 3); break;
    }
  }
  function pyrTurn(s, img) {
    switch (s) {
      case 0:
        pyrSwap(img, 0, 8, 3, 8, 2, 2); pyrSwap(img, 0, 1, 3, 1, 2, 4); pyrSwap(img, 0, 2, 3, 2, 2, 5); break;
      case 1:
        pyrSwap(img, 2, 8, 1, 2, 0, 8); pyrSwap(img, 2, 7, 1, 1, 0, 7); pyrSwap(img, 2, 5, 1, 8, 0, 5); break;
      case 2:
        pyrSwap(img, 3, 8, 0, 5, 1, 5); pyrSwap(img, 3, 7, 0, 4, 1, 4); pyrSwap(img, 3, 5, 0, 2, 1, 2); break;
      case 3:
        pyrSwap(img, 1, 8, 2, 2, 3, 5); pyrSwap(img, 1, 7, 2, 1, 3, 4); pyrSwap(img, 1, 5, 2, 8, 3, 2); break;
    }
    pyrTip(s, img);
  }
  function pyrApply(scramble) {
    const img = [0, 1, 2, 3].map(i => new Array(9).fill(i));
    for (let tok of tokens(scramble)) {
      tok = tok.replace(/[’`´]/g, "'");
      const m = /^([ULRBulrb])(')?$/.exec(tok);
      if (!m) throw new ScrambleError('Movimiento no reconocido: ' + tok);
      const axis = 'ulrb'.indexOf(m[1].toLowerCase());
      const dir = m[2] ? 2 : 1;
      const tip = m[1] === m[1].toLowerCase();
      for (let i = 0; i < dir; i++) (tip ? pyrTip : pyrTurn)(axis, img);
    }
    return img;
  }
  function pyrDraw(img, scheme) {
    const pieceSize = 30, gap = 5;
    const FACES = 'FDLR';
    const W = 2 * 3 * pieceSize + 4 * gap;
    const H = Math.trunc(2 * 1.5 * Math.sqrt(3) * pieceSize + 3 * gap);
    let body = '';
    const triangle = (x, y, up, state) => {
      const rad = Math.trunc(Math.sqrt(3) * pieceSize);
      const angs = [7 / 6, 11 / 6, 0.5].map(a => (a + (up ? 1 / 3 : 0)) * Math.PI);
      const xp = angs.map(a => rad * Math.cos(a) + x);
      const yp = angs.map(a => rad * Math.sin(a) + y);
      const xs = [], ys = [];
      for (let i = 0; i < 3; i++) {
        xs[i] = 1 / 3 * xp[(i + 1) % 3] + 2 / 3 * xp[i];
        ys[i] = 1 / 3 * yp[(i + 1) % 3] + 2 / 3 * yp[i];
        xs[i + 3] = 2 / 3 * xp[(i + 1) % 3] + 1 / 3 * xp[i];
        ys[i + 3] = 2 / 3 * yp[(i + 1) % 3] + 1 / 3 * yp[i];
      }
      const c = lineIntersection(xs[0], ys[0], xs[4], ys[4], xs[2], ys[2], xs[3], ys[3]);
      const ps = [];
      for (let i = 0; i < 3; i++) {
        const k = 3 + (2 + i) % 3;
        ps[3 * i] = [[xp[i], yp[i]], [xs[i], ys[i]], [xs[k], ys[k]]];
        ps[3 * i + 1] = [[xs[i], ys[i]], [xs[k], ys[k]], c];
        ps[3 * i + 2] = [[xs[i], ys[i]], [xs[i + 3], ys[i + 3]], c];
      }
      for (let i = 0; i < 9; i++) {
        const f = FACES[state[i]];
        body += poly(ps[i], scheme[f], f);
      }
    };
    const s3 = Math.sqrt(3);
    triangle(2 * gap + 3 * pieceSize, gap + s3 * pieceSize, true, img[0]);
    triangle(2 * gap + 3 * pieceSize, 2 * gap + 2 * s3 * pieceSize, false, img[1]);
    triangle(gap + 1.5 * pieceSize, gap + s3 / 2 * pieceSize, false, img[2]);
    triangle(3 * gap + 4.5 * pieceSize, gap + s3 / 2 * pieceSize, false, img[3]);
    return svgWrap(W, H, body, { 'stroke-width': 2, 'stroke-miterlimit': 10, 'stroke-linejoin': 'round' });
  }

  // ---------------------------------------------------------------------------
  // Skewb (SkewbPuzzle.java)
  // ---------------------------------------------------------------------------
  function skewbApply(scramble) {
    const img = [0, 1, 2, 3, 4, 5].map(i => new Array(5).fill(i));
    const sw = pyrSwap;
    const turn = axis => {
      switch (axis) {
        case 0:
          sw(img, 2, 0, 3, 0, 1, 0); sw(img, 2, 4, 3, 2, 1, 3); sw(img, 2, 2, 3, 1, 1, 4);
          sw(img, 2, 3, 3, 4, 1, 1); sw(img, 4, 4, 5, 3, 0, 4); break;
        case 1:
          sw(img, 0, 0, 1, 0, 5, 0); sw(img, 0, 2, 1, 2, 5, 1); sw(img, 0, 4, 1, 4, 5, 2);
          sw(img, 0, 1, 1, 1, 5, 3); sw(img, 4, 1, 2, 2, 3, 4); break;
        case 2:
          sw(img, 4, 0, 5, 0, 3, 0); sw(img, 4, 3, 5, 4, 3, 3); sw(img, 4, 1, 5, 3, 3, 1);
          sw(img, 4, 4, 5, 2, 3, 4); sw(img, 2, 3, 0, 1, 1, 4); break;
        case 3:
          sw(img, 1, 0, 3, 0, 5, 0); sw(img, 1, 4, 3, 4, 5, 3); sw(img, 1, 3, 3, 3, 5, 1);
          sw(img, 1, 2, 3, 2, 5, 4); sw(img, 0, 2, 2, 4, 4, 3); break;
      }
    };
    for (let tok of tokens(scramble)) {
      tok = tok.replace(/[’`´]/g, "'");
      const m = /^([RULB])(')?$/.exec(tok);
      if (!m) throw new ScrambleError('Movimiento no reconocido: ' + tok);
      const axis = 'RULB'.indexOf(m[1]);
      const pow = m[2] ? 2 : 1;
      for (let i = 0; i < pow; i++) turn(axis);
    }
    return img;
  }
  function skewbDraw(img, scheme) {
    const pieceSize = 30, gap = 3, sq3d2 = Math.sqrt(3) / 2;
    const half = Math.trunc(pieceSize / 2);
    const W = Math.ceil((3 * gap + 8 * pieceSize + 1) * sq3d2);
    const H = Math.ceil(2 * gap + 6 * pieceSize + 1);
    // Transform(a, b, c, d, e, f): x' = a x + c y + e ; y' = b x + d y + f
    const T = [
      [pieceSize * sq3d2, -half, pieceSize * sq3d2, half, (pieceSize * 4 + gap * 1.5) * sq3d2, pieceSize],
      [pieceSize * sq3d2, -half, 0, pieceSize, (pieceSize * 7 + gap * 3) * sq3d2, pieceSize * 1.5],
      [pieceSize * sq3d2, -half, 0, pieceSize, (pieceSize * 5 + gap * 2) * sq3d2, pieceSize * 2.5 + 0.5 * gap],
      [0, pieceSize, -pieceSize * sq3d2, -half, (pieceSize * 3 + gap * 1) * sq3d2, pieceSize * 4.5 + 1.5 * gap],
      [pieceSize * sq3d2, half, 0, pieceSize, (pieceSize * 3 + gap * 1) * sq3d2, pieceSize * 2.5 + 0.5 * gap],
      [pieceSize * sq3d2, half, 0, pieceSize, pieceSize * sq3d2, pieceSize * 1.5]
    ];
    const P = [
      [[-1, 0], [0, 1], [1, 0], [0, -1]],
      [[-1, 0], [-1, -1], [0, -1]],
      [[0, -1], [1, -1], [1, 0]],
      [[-1, 0], [-1, 1], [0, 1]],
      [[0, 1], [1, 1], [1, 0]]
    ];
    let body = '';
    for (let face = 0; face < 6; face++) {
      const [a, b, c, d, e, f] = T[face];
      for (let i = 0; i < 5; i++) {
        const p = P[i].map(([x, y]) => [a * x + c * y + e, b * x + d * y + f]);
        const fc = 'URFDLB'[img[face][i]];
        body += poly(p, scheme[fc], fc);
      }
    }
    return svgWrap(W, H, body);
  }

  // ---------------------------------------------------------------------------
  // Megaminx (MegaminxPuzzle.java)
  // ---------------------------------------------------------------------------
  const MF = ['U', 'BL', 'BR', 'R', 'F', 'L', 'D', 'DR', 'DBR', 'B', 'DBL', 'DL'];
  const MFI = {};
  MF.forEach((f, i) => { MFI[f] = i; });

  function mSwapOnSide(img, b, f1, s1, f2, s2, f3, s3, f4, s4, f5, s5) {
    for (let i = 0; i < 3; i++) {
      const A = [(f1 + b) % 12, (s1 + i) % 10], B = [(f2 + b) % 12, (s2 + i) % 10],
        C = [(f3 + b) % 12, (s3 + i) % 10], D = [(f4 + b) % 12, (s4 + i) % 10],
        E = [(f5 + b) % 12, (s5 + i) % 10];
      const t = img[A[0]][A[1]];
      img[A[0]][A[1]] = img[B[0]][B[1]];
      img[B[0]][B[1]] = img[C[0]][C[1]];
      img[C[0]][C[1]] = img[D[0]][D[1]];
      img[D[0]][D[1]] = img[E[0]][E[1]];
      img[E[0]][E[1]] = t;
    }
  }
  function mSwapOnFace(img, f, s1, s2, s3, s4, s5) {
    const t = img[f][s1];
    img[f][s1] = img[f][s2]; img[f][s2] = img[f][s3]; img[f][s3] = img[f][s4]; img[f][s4] = img[f][s5];
    img[f][s5] = t;
  }
  function mRotateFace(img, f) {
    mSwapOnFace(img, f, 0, 8, 6, 4, 2);
    mSwapOnFace(img, f, 1, 9, 7, 5, 3);
  }
  function mTurnOnce(img, s) {
    const b = s >= 6 ? 6 : 0;
    switch (s % 6) {
      case 0: mSwapOnSide(img, b, 1, 6, 5, 4, 4, 2, 3, 0, 2, 8); break;
      case 1: mSwapOnSide(img, b, 0, 0, 2, 0, 9, 6, 10, 6, 5, 2); break;
      case 2: mSwapOnSide(img, b, 0, 2, 3, 2, 8, 4, 9, 4, 1, 4); break;
      case 3: mSwapOnSide(img, b, 0, 4, 4, 4, 7, 2, 8, 2, 2, 6); break;
      case 4: mSwapOnSide(img, b, 0, 6, 5, 6, 11, 0, 7, 0, 3, 8); break;
      case 5: mSwapOnSide(img, b, 0, 8, 1, 8, 10, 8, 11, 8, 4, 0); break;
    }
    mRotateFace(img, s);
  }
  function mSwap(img, f1, s1, f2, s2, f3, s3, f4, s4, f5, s5) {
    const t = img[f1][s1];
    img[f1][s1] = img[f2][s2]; img[f2][s2] = img[f3][s3]; img[f3][s3] = img[f4][s4]; img[f4][s4] = img[f5][s5];
    img[f5][s5] = t;
  }
  function mSwapCenters(img, f1, f2, f3, f4, f5) { mSwap(img, f1, 10, f2, 10, f3, 10, f4, 10, f5, 10); }
  function mSwapWholeFace(img, f1, s1, f2, s2, f3, s3, f4, s4, f5, s5) {
    for (let i = 0; i < 10; i++) {
      mSwap(img, f1 % 12, (s1 + i) % 10, f2 % 12, (s2 + i) % 10, f3 % 12, (s3 + i) % 10,
        f4 % 12, (s4 + i) % 10, f5 % 12, (s5 + i) % 10);
    }
    mSwapCenters(img, f1, f2, f3, f4, f5);
  }
  function mBigTurnOnce(img, f) {
    if (f === MFI.DBR) {
      for (let i = 0; i < 7; i++) mSwap(img, 0, (1 + i) % 10, 4, (3 + i) % 10, 11, (1 + i) % 10, 10, (1 + i) % 10, 1, (1 + i) % 10);
      mSwapCenters(img, 0, 4, 11, 10, 1);
      mSwapWholeFace(img, 2, 0, 3, 0, 7, 0, 6, 8, 9, 8);
      mRotateFace(img, MFI.DBR);
    } else {
      for (let i = 0; i < 7; i++) mSwap(img, 1, (9 + i) % 10, 2, (1 + i) % 10, 3, (3 + i) % 10, 4, (5 + i) % 10, 5, (7 + i) % 10);
      mSwapCenters(img, 1, 2, 3, 4, 5);
      mSwapWholeFace(img, 11, 0, 10, 8, 9, 6, 8, 4, 7, 2);
      mRotateFace(img, MFI.D);
    }
  }
  function minxApply(scramble) {
    const img = MF.map((_, i) => new Array(11).fill(i));
    for (let tok of tokens(scramble)) {
      tok = tok.replace(/[’`´]/g, "'");
      let m;
      if ((m = /^([RD])(\+\+|--|\+|-)$/.exec(tok))) {
        const dir = { '+': 1, '++': 2, '--': 3, '-': 4 }[m[2]];
        const f = m[1] === 'R' ? MFI.DBR : MFI.D;
        for (let i = 0; i < dir; i++) mBigTurnOnce(img, f);
      } else if ((m = /^(DBR|DBL|BL|BR|DR|DL|U|R|F|L|D|B)(2'|2|')?$/.exec(tok))) {
        const dir = { '': 1, '2': 2, "2'": 3, "'": 4 }[m[2] || ''];
        for (let i = 0; i < dir; i++) mTurnOnce(img, MFI[m[1]]);
      } else {
        throw new ScrambleError('Movimiento no reconocido: ' + tok);
      }
    }
    return img;
  }
  function minxDraw(img, scheme) {
    const gap = 2, minxRad = 30;
    const UNFOLDHEIGHT = 2 + 3 * Math.sin(0.3 * Math.PI) + Math.sin(0.1 * Math.PI);
    const UNFOLDWIDTH = 4 * Math.cos(0.1 * Math.PI) + 2 * Math.cos(0.3 * Math.PI);
    const W = Math.trunc(UNFOLDWIDTH * 2 * minxRad + 3 * gap);
    const H = Math.trunc(UNFOLDHEIGHT * minxRad + 2 * gap);

    const x = minxRad * Math.sqrt(2 * (1 - Math.cos(0.6 * Math.PI)));
    const a = minxRad * Math.cos(0.1 * Math.PI);
    const b = x * Math.cos(0.1 * Math.PI);
    const c = x * Math.cos(0.3 * Math.PI);
    const d = x * Math.sin(0.1 * Math.PI);
    const e = x * Math.sin(0.3 * Math.PI);
    const leftCenterX = gap + a + b + d / 2;
    const leftCenterY = gap + x + minxRad - d;
    const f = Math.cos(0.1 * Math.PI);
    const gg = Math.cos(0.2 * Math.PI);
    const magicShiftNumber = d * 0.6 + minxRad * (f + gg);
    const shift = leftCenterX + magicShiftNumber;

    const pentagon = (cx, cy, up) => {
      return [1.3, 1.7, 0.1, 0.5, 0.9].map(ang => {
        const t = (ang - (up ? 0.2 : 0)) * Math.PI;
        return [minxRad * Math.cos(t) + cx, minxRad * Math.sin(t) + cy];
      });
    };
    const faces = {
      U: pentagon(leftCenterX, leftCenterY, true),
      BL: pentagon(leftCenterX - c, leftCenterY - e, false),
      BR: pentagon(leftCenterX + c, leftCenterY - e, false),
      R: pentagon(leftCenterX + b, leftCenterY + d, false),
      F: pentagon(leftCenterX, leftCenterY + x, false),
      L: pentagon(leftCenterX - b, leftCenterY + d, false),
      D: pentagon(shift + gap + a + b, gap + x + minxRad, false),
      DR: pentagon(shift + gap + a + b - c, gap + x + e + minxRad, true),
      DBR: pentagon(shift + gap + a, gap + x - d + minxRad, true),
      B: pentagon(shift + gap + a + b, gap + minxRad, true),
      DBL: pentagon(shift + gap + a + 2 * b, gap + x - d + minxRad, true),
      DL: pentagon(shift + gap + a + b + c, gap + x + e + minxRad, true)
    };

    let body = '';
    for (const face of MF) {
      const fi = MFI[face];
      const rot = face === 'U' ? 0 : (fi <= 5 ? 1 : 2);
      const P = faces[face];
      const xp = P.map(p => p[0]), yp = P.map(p => p[1]);
      const xs = [], ys = [];
      for (let i = 0; i < 5; i++) {
        xs[i] = 0.4 * xp[(i + 1) % 5] + 0.6 * xp[i];
        ys[i] = 0.4 * yp[(i + 1) % 5] + 0.6 * yp[i];
        xs[i + 5] = 0.6 * xp[(i + 1) % 5] + 0.4 * xp[i];
        ys[i + 5] = 0.6 * yp[(i + 1) % 5] + 0.4 * yp[i];
      }
      const ip = [];
      for (let i = 0; i < 5; i++) {
        ip[i] = lineIntersection(xs[i], ys[i], xs[5 + (3 + i) % 5], ys[5 + (3 + i) % 5],
          xs[(i + 1) % 5], ys[(i + 1) % 5], xs[5 + (4 + i) % 5], ys[5 + (4 + i) % 5]);
      }
      const ps = [];
      for (let i = 0; i < 5; i++) {
        const k = 5 + (4 + i) % 5;
        ps[2 * i] = [[xp[i], yp[i]], [xs[i], ys[i]], ip[i], [xs[k], ys[k]]];
        ps[2 * i + 1] = [[xs[i], ys[i]], [xs[i + 5], ys[i + 5]], ip[(i + 1) % 5], ip[i]];
      }
      ps[10] = ip;
      for (let i = 0; i < 11; i++) {
        const j = i < 10 ? (i + 2 * rot) % 10 : i;
        const fc = MF[img[fi][j]];
        body += poly(ps[i], scheme[fc], fc);
      }
      if (face === 'U' || face === 'F') {
        const cx = ip.reduce((s, p) => s + p[0], 0) / 5;
        const cy = ip.reduce((s, p) => s + p[1], 0) / 5;
        const ysP = ip.map(p => p[1]);
        const hgt = Math.abs(Math.max(...ysP) - Math.min(...ysP));
        body += '<text' + attrs({
          x: n(cx), y: n(cy), dy: Math.round(hgt * 0.2) + 'px', 'text-anchor': 'middle',
          'font-family': 'sans-serif', 'font-size': '16px', fill: '#000', stroke: 'none',
          'pointer-events': 'none'
        }) + '>' + face + '</text>';
      }
    }
    return svgWrap(W, H, body);
  }

  // ---------------------------------------------------------------------------
  // Square-1 (SquareOnePuzzle.java)
  // ---------------------------------------------------------------------------
  function sq1Apply(scramble) {
    let pieces = [0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15];
    let sliceSolved = true;
    const s = String(scramble).replace(/[−–]/g, '-');
    const re = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)|\//g;
    // Comprueba que no quede nada sin interpretar
    const rest = s.replace(re, '').trim();
    if (rest) throw new ScrambleError('Movimiento no reconocido: ' + rest.split(/\s+/)[0]);
    let m;
    while ((m = re.exec(s))) {
      if (m[0] === '/') {
        const np = pieces.slice();
        for (let i = 0; i < 6; i++) {
          const t = np[i + 12]; np[i + 12] = np[i + 6]; np[i + 6] = t;
        }
        pieces = np;
        sliceSolved = !sliceSolved;
      } else {
        let top = parseInt(m[1], 10), bottom = parseInt(m[2], 10);
        top = ((-top % 12) + 12) % 12;
        bottom = ((-bottom % 12) + 12) % 12;
        const np = pieces.slice();
        for (let i = 0; i < 12; i++) np[i] = pieces[(top + i) % 12];
        for (let i = 0; i < 12; i++) np[i + 12] = pieces[12 + (bottom + i) % 12];
        pieces = np;
      }
    }
    return { pieces, sliceSolved };
  }
  function sq1Draw(state, scheme) {
    const radius = 32;
    const RM = Math.sqrt(2) * Math.cos(15 * Math.PI / 180);
    const mult = 1.4;
    const W = Math.trunc(2 * RM * mult * radius);
    const H = Math.trunc(4 * RM * mult * radius);
    const FACES = 'LBRFUD'; // índices: 0 L, 1 B, 2 R, 3 F, 4 U, 5 D
    const rad = deg => deg * Math.PI / 180;
    let body = '';

    // Franja central
    const hsw = (radius * RM * mult) / Math.sqrt(2);
    const ew = 2 * radius * mult * Math.sin(rad(15));
    const cw = hsw - ew / 2;
    const ry = H / 2 - radius * (mult - 1) / 2, rh = radius * (mult - 1);
    const lx = W / 2 - hsw;
    const rightW = state.sliceSolved ? 2 * cw + ew : cw + ew;
    const rightFace = state.sliceSolved ? 'F' : 'B';
    const rect = (w, fill, stroke, face) => '<rect' + attrs({
      x: n(lx), y: n(ry), width: n(w), height: n(rh), fill: fill, stroke: stroke, 'data-face': face
    }) + '/>';
    body += rect(rightW, scheme[rightFace], 'none', rightFace);
    body += rect(cw, scheme.F, 'none', 'F');
    body += rect(rightW, 'none', '#000');
    body += rect(cw, 'none', '#000');

    const isCorner = p => ((p + (p <= 7 ? 0 : 1)) % 2) === 0;
    const pieceFaces = piece => {
      const up = piece <= 7;
      const top = up ? 4 : 5;
      if (isCorner(piece)) {
        if (!up) piece = 15 - piece;
        let a = (Math.floor(piece / 2) + 3) % 4, b = Math.floor(piece / 2);
        if (!up) { const t = a; a = b; b = t; }
        return [top, a, b];
      }
      if (!up) piece = 14 - piece;
      return [top, Math.floor(piece / 2)];
    };
    const wedgePolys = (x, y) => {
      const tx = Math.sqrt(3) * radius / 2, ty = radius / 2;
      return [
        [[0, 0], [radius, 0], [tx, ty]],
        [[radius, 0], [mult * radius, 0], [mult * tx, mult * ty], [tx, ty]]
      ].map(pl => pl.map(([px, py]) => [px + x, py + y]));
    };
    const cornerPolys = (x, y) => {
      const tx = radius * (1 + Math.cos(rad(75)) / Math.sqrt(2));
      const ty = radius * Math.sin(rad(75)) / Math.sqrt(2);
      const tX = radius / 2, tY = Math.sqrt(3) * radius / 2;
      return [
        [[0, 0], [radius, 0], [tx, ty], [tX, tY]],
        [[radius, 0], [mult * radius, 0], [mult * tx, mult * ty], [tx, ty]],
        [[mult * tx, mult * ty], [tx, ty], [tX, tY], [mult * tX, mult * tY]]
      ].map(pl => pl.map(([px, py]) => [px + x, py + y]));
    };
    const drawFace = (face, x, y, startDeg) => {
      let angle = startDeg;
      for (let ch = 0; ch < 12; ch++) {
        if (ch < 11 && face[ch] === face[ch + 1]) ch++;
        const piece = face[ch];
        const corner = isCorner(piece);
        const P = corner ? cornerPolys(x, y) : wedgePolys(x, y);
        const fc = pieceFaces(piece);
        for (let k = fc.length - 1; k >= 0; k--) {
          const fname = FACES[fc[k]];
          body += poly(P[k], scheme[fname], fname, { transform: 'rotate(' + n(angle) + ' ' + n(x) + ' ' + n(y) + ')' });
        }
        angle += corner ? 60 : 30;
      }
    };
    drawFace(state.pieces.slice(0, 12), W / 2, H / 4, 90 + 15);
    drawFace(state.pieces.slice(12), W / 2, H / 4 * 3, -90 - 15);
    return svgWrap(W, H, body, { 'stroke-width': 2, 'stroke-miterlimit': 10, 'stroke-linejoin': 'round' });
  }

  // ---------------------------------------------------------------------------
  // Clock (ClockPuzzle.java)
  // ---------------------------------------------------------------------------
  const CLOCK_TURNS = ['UR', 'DR', 'DL', 'UL', 'U', 'R', 'D', 'L', 'ALL'];
  const CLOCK_MOVES = [
    [0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, -1, 0, 0, 0, 0, 0, -1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, -1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 0, -1, 0, 0, 0, -1, 0, -1]
  ];
  function clockApply(scramble) {
    let posit = new Array(18).fill(0);
    let rightSideUp = true;
    for (let tok of tokens(scramble)) {
      tok = tok.replace(/[−–]/g, '-');
      let m;
      if ((m = /^(UR|DR|DL|UL|U|R|D|L|ALL)(\d+)([+-])$/.exec(tok))) {
        const turn = CLOCK_TURNS.indexOf(m[1]);
        let amount = parseInt(m[2], 10) % 12;
        const rot = m[3] === '+' ? amount : (12 - amount) % 12;
        posit = posit.map((p, i) => (((p + rot * CLOCK_MOVES[turn][i]) % 12) + 12) % 12);
      } else if (tok === 'y2') {
        posit = posit.slice(9).concat(posit.slice(0, 9));
        rightSideUp = !rightSideUp;
      } else if (/^(UR|DR|DL|UL)$/.test(tok)) {
        // Pines al final de las mezclas antiguas: no cambian las agujas.
      } else {
        throw new ScrambleError('Movimiento no reconocido: ' + tok);
      }
    }
    return { posit, rightSideUp };
  }
  function clockDraw(state, scheme) {
    const radius = 70, clockRadius = 14, clockOuterRadius = 21;
    const pointRadius = Math.trunc((clockRadius + clockOuterRadius) / 2);
    const arrowHeight = 10, arrowRadius = 2, pinRadius = 4, gap = 5, STROKE = 2;
    const arrowAngle = Math.PI / 2 - Math.acos(arrowRadius / arrowHeight);
    const W = 4 * (radius + gap), H = 2 * (radius + gap);
    const sides = state.rightSideUp ? ['Front', 'Back'] : ['Back', 'Front'];
    const circle = (cx, cy, r, a) => '<circle' + attrs(Object.assign({ cx: n(cx), cy: n(cy), r: n(r) }, a)) + '/>';
    let body = '';

    for (let s = 0; s < 2; s++) {
      const ox = (s * 2 + 1) * (radius + gap), oy = radius + gap;
      const side = sides[s];
      const bg = scheme[side];
      for (const dx of [-2 * clockOuterRadius, 2 * clockOuterRadius]) {
        for (const dy of [-2 * clockOuterRadius, 2 * clockOuterRadius]) {
          body += circle(ox + dx, oy + dy, clockOuterRadius, { fill: bg, stroke: '#000', 'data-face': side });
        }
      }
      body += circle(ox, oy, radius, { fill: bg, stroke: '#000', 'data-face': side });
      for (const dx of [-2 * clockOuterRadius, 2 * clockOuterRadius]) {
        for (const dy of [-2 * clockOuterRadius, 2 * clockOuterRadius]) {
          body += circle(ox + dx, oy + dy, clockOuterRadius - STROKE / 2, { fill: bg, stroke: 'none', 'data-face': side });
        }
      }
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const cx = ox + 2 * i * clockOuterRadius, cy = oy + 2 * j * clockOuterRadius;
          body += circle(cx, cy, clockRadius, {
            fill: scheme[side + 'Clock'], stroke: '#000', 'stroke-width': 1, 'data-face': side + 'Clock'
          });
          for (let k = 0; k < 12; k++) {
            const t = k * 30 * Math.PI / 180;
            const key = side + (k === 0 ? 'Top' : '') + 'Clock';
            body += circle(cx + pointRadius * Math.sin(t), cy - pointRadius * Math.cos(t),
              k === 0 ? 2 : 1, { fill: scheme[key], stroke: 'none', 'data-face': key });
          }
        }
      }
    }

    const ca = arrowRadius * Math.cos(arrowAngle), sa = arrowRadius * Math.sin(arrowAngle);
    const arrow = [[0, 0], [ca, -sa], [0, -arrowHeight], [-ca, -sa]];
    for (let i = 0; i < 18; i++) {
      let clock = i;
      const side = ((clock < 9) !== state.rightSideUp) ? 'Back' : 'Front';
      let netX = clock < 9 ? radius + gap : 3 * (radius + gap);
      let netY = radius + gap;
      if (clock >= 9) clock -= 9;
      netX += 2 * ((clock % 3) - 1) * clockOuterRadius;
      netY += 2 * (Math.floor(clock / 3) - 1) * clockOuterRadius;
      const tr = 'translate(' + n(netX) + ' ' + n(netY) + ') rotate(' + (state.posit[i] * 30) + ')';
      const border = scheme[side + 'HandBorder'], hand = scheme[side + 'Hand'];
      body += '<g' + attrs({ transform: tr }) + '>' +
        '<polygon' + attrs({ points: pts(arrow), fill: hand, stroke: border, 'data-face': side + 'HandBorder' }) + '/>' +
        circle(0, 0, arrowRadius, { fill: hand, stroke: border, 'data-face': side + 'HandBorder' }) +
        '<polygon' + attrs({ points: pts(arrow), fill: hand, stroke: 'none', 'data-face': side + 'Hand' }) + '/>' +
        circle(0, 0, arrowRadius, { fill: hand, stroke: 'none', 'data-face': side + 'Hand' }) +
        '</g>';
    }

    const pinsAt = (ox, key) => {
      for (const i of [-1, 1]) {
        for (const j of [-1, 1]) {
          body += circle(ox + j * clockOuterRadius, radius + gap + i * clockOuterRadius, pinRadius,
            { fill: scheme[key], stroke: 'none', 'data-face': key });
        }
      }
    };
    pinsAt(radius + gap, state.rightSideUp ? 'BackPin' : 'FrontPin');
    pinsAt(3 * (radius + gap), state.rightSideUp ? 'FrontPin' : 'BackPin');

    return svgWrap(W, H, body, { 'stroke-width': STROKE, 'stroke-miterlimit': 10, 'stroke-linejoin': 'round' });
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------
  function renderPuzzle(puzzle, size, scramble, scheme) {
    scheme = Object.assign({}, PUZZLES[puzzle].defaults, scheme || {});
    switch (puzzle) {
      case 'cube': return cubeDraw(size, cubeApply(size, scramble), scheme);
      case 'pyram': return pyrDraw(pyrApply(scramble), scheme);
      case 'skewb': return skewbDraw(skewbApply(scramble), scheme);
      case 'minx': return minxDraw(minxApply(scramble), scheme);
      case 'sq1': return sq1Draw(sq1Apply(scramble), scheme);
      case 'clock': return clockDraw(clockApply(scramble), scheme);
    }
    throw new ScrambleError('Puzzle desconocido: ' + puzzle);
  }

  function renderEvent(eventId, scramble, schemes) {
    const ev = EVENTS[eventId];
    if (!ev) throw new ScrambleError('Categoría sin dibujo: ' + eventId);
    return renderPuzzle(ev.puzzle, ev.size, scramble, (schemes || {})[ev.puzzle]);
  }

  const api = {
    PUZZLES, EVENTS, ScrambleError, renderPuzzle, renderEvent,
    // expuestos para las pruebas
    _internal: { cubeApply, pyrApply, skewbApply, minxApply, sq1Apply, clockApply }
  };
  root.WCAScrambleViz = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
