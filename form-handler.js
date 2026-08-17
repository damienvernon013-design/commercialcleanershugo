(function () {
  "use strict";

  var STORAGE_KEY = "qm_utm_params";

  function getStoredUtmParams() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function setStatus(statusEl, type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible is-" + type;
  }

  function clearStatus(statusEl) {
    if (!statusEl) return;
    statusEl.className = "form-status";
    statusEl.textContent = "";
  }

  function handleSubmit(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var statusEl = form.querySelector(".form-status");
      var submitBtn = form.querySelector('button[type="submit"]');
      clearStatus(statusEl);

      var formData = new FormData(form);
      var utm = getStoredUtmParams();

      var payload = {
        name: (formData.get("name") || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        email: (formData.get("email") || "").toString().trim(),
        facility: (formData.get("facility") || "").toString().trim(),
        sqft: (formData.get("sqft") || "").toString().trim(),
        message: (formData.get("message") || "").toString().trim(),
        utm_source: utm.utm_source || "",
        utm_medium: utm.utm_medium || "",
        utm_campaign: utm.utm_campaign || "",
        utm_term: utm.utm_term || "",
        utm_content: utm.utm_content || "",
        page_url: window.location.href
      };

      if (!payload.name || !payload.phone || !payload.email) {
        setStatus(statusEl, "error", "Please fill in your name, phone, and email.");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setStatus(statusEl, "success", "Sending…");
      statusEl.className = "form-status is-visible";

      fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            setStatus(statusEl, "success", "Thanks — your request was sent. We respond next business day.");
            form.reset();
          } else {
            setStatus(statusEl, "error", "Something went wrong sending your request. Please call (866) 958-8773 or try again.");
          }
        })
        .catch(function () {
          setStatus(statusEl, "error", "Something went wrong sending your request. Please call (866) 958-8773 or try again.");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll('form[action="/request-a-quote/"]');
    forms.forEach(function (form) {
      var statusEl = document.createElement("div");
      statusEl.className = "form-status";
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
      form.insertBefore(statusEl, form.firstChild);
      handleSubmit(form);
    });
  });
})();
