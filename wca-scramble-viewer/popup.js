(function () {
  'use strict';
  const S = window.WSVSettings;
  const enabled = document.getElementById('enabled');
  const height = document.getElementById('height');
  const out = document.getElementById('out');
  let settings;

  S.load().then(s => {
    settings = s;
    enabled.checked = s.enabled;
    height.value = s.height;
    out.textContent = s.height + ' px';
  });

  enabled.addEventListener('change', () => {
    settings.enabled = enabled.checked;
    S.save(settings);
  });
  height.addEventListener('input', () => { out.textContent = height.value + ' px'; });
  height.addEventListener('change', () => {
    settings.height = parseInt(height.value, 10);
    S.save(settings);
  });
  document.getElementById('colors').addEventListener('click', () => chrome.runtime.openOptionsPage());
})();
