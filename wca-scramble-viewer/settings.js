/* Ajustes compartidos entre el script de contenido, el popup y la página de opciones. */
(function (root) {
  'use strict';
  const V = root.WCAScrambleViz;
  const KEY = 'wsvSettings';

  function defaults() {
    const schemes = {};
    for (const p in V.PUZZLES) schemes[p] = Object.assign({}, V.PUZZLES[p].defaults);
    return { enabled: true, height: 110, schemes };
  }

  function merge(stored) {
    const d = defaults();
    if (!stored || typeof stored !== 'object') return d;
    if (typeof stored.enabled === 'boolean') d.enabled = stored.enabled;
    if (typeof stored.height === 'number') d.height = stored.height;
    for (const p in d.schemes) {
      Object.assign(d.schemes[p], (stored.schemes || {})[p] || {});
    }
    return d;
  }

  function load() {
    return new Promise(resolve => {
      chrome.storage.sync.get(KEY, data => resolve(merge(data && data[KEY])));
    });
  }

  function save(settings) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ [KEY]: settings }, resolve);
    });
  }

  function onChange(cb) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[KEY]) cb(merge(changes[KEY].newValue));
    });
  }

  root.WSVSettings = { KEY, defaults, merge, load, save, onChange };
})(typeof globalThis !== 'undefined' ? globalThis : this);
