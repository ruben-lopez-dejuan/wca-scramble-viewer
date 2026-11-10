/* Selector de color nativo que se abre junto al puntero (como al pulsar una cara en TNoodle). */
(function (root) {
  'use strict';
  function open(evt, hex, onInput, onChange) {
    let inp = document.getElementById('wsv-color-input');
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'color';
      inp.id = 'wsv-color-input';
      inp.setAttribute('aria-hidden', 'true');
      inp.tabIndex = -1;
      Object.assign(inp.style, {
        position: 'fixed', width: '1px', height: '1px', opacity: '0', border: '0',
        padding: '0', margin: '0', pointerEvents: 'none', zIndex: '2147483647'
      });
      document.body.appendChild(inp);
    }
    inp.style.left = Math.max(0, evt.clientX) + 'px';
    inp.style.top = Math.max(0, evt.clientY) + 'px';
    inp.value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000';
    inp.oninput = () => onInput && onInput(inp.value.toLowerCase());
    inp.onchange = () => onChange && onChange(inp.value.toLowerCase());
    try {
      inp.showPicker();
    } catch (e) {
      inp.click();
    }
  }
  root.WSVPicker = { open };
})(typeof globalThis !== 'undefined' ? globalThis : this);
