(function () {
  "use strict";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  var STORAGE_KEY = "qm_utm_params";
  var params = new URLSearchParams(window.location.search);
  var found = {};
  var hasAny = false;
  UTM_KEYS.forEach(function (key) {
    var value = params.get(key);
    if (value) {
      found[key] = value;
      hasAny = true;
    }
  });
  if (hasAny) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      /* sessionStorage unavailable, ignore */
    }
  }
})();
