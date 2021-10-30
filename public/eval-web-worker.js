var F = (x) => x;

self.addEventListener(
  "message",
  (event) => {
    const { data, code, imports } = event.data;
    if (code) {
      F = new Function('"use strict";' + code);
    }
    if (imports) {
      imports.map((url) => {
        self.importScripts(url);
      });
    }
    if (data) {
      self.postMessage(F.apply(data));
    }
  },
  false
);
