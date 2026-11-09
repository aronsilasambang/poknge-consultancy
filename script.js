/* ==========================================================================
   POKNGE CONSULTANCY — WEBSITE SCRIPT
   --------------------------------------------------------------------------
   EDIT YOUR CONTACT DETAILS HERE — IN ONE PLACE.
   Every WhatsApp button, email link, phone number and the enquiry form
   on all pages update automatically from the settings below.
   ========================================================================== */
var SITE_CONFIG = {
  businessName: "Poknge Consultancy",

  // WhatsApp number in international format: 675 + your number.
  // No "+" sign and no spaces. Example: "67573810309"
  whatsappNumber: "67573810309",

  // How the phone number is shown to visitors
  phoneDisplay: "+675 7381 0309",

  // Business email — receives email-link messages AND enquiry form messages
  email: "asilasambang@gmail.com",

  // The message that is pre-typed when a visitor opens WhatsApp
  whatsappMessage: "Hello Poknge Consultancy, I would like to enquire about your services.",

  // OPTIONAL: after activating FormSubmit you may paste your private
  // FormSubmit code here (e.g. "a1b2c3d4e5f6") to hide your email address.
  // Leave empty "" to send form enquiries to the email above.
  formSubmitCode: ""
};
/* ======================= END OF SETTINGS ================================= */


(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */
  function waLink(message) {
    return "https://wa.me/" + SITE_CONFIG.whatsappNumber + "?text=" +
      encodeURIComponent(message || SITE_CONFIG.whatsappMessage);
  }
  function mailLink(subject) {
    return "mailto:" + SITE_CONFIG.email +
      "?subject=" + encodeURIComponent(subject || ("Website enquiry - " + SITE_CONFIG.businessName));
  }
  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  /* ---------- 1. Contact links from SITE_CONFIG ---------- */
  function applyContactDetails() {
    each("[data-wa]", function (el) {
      el.setAttribute("href", waLink(el.getAttribute("data-wa")));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
    each("[data-mailto]", function (el) {
      el.setAttribute("href", mailLink(el.getAttribute("data-mailto")));
    });
    each("[data-tel]", function (el) {
      el.setAttribute("href", "tel:+" + SITE_CONFIG.whatsappNumber);
    });
    each("[data-phone-text]", function (el) { el.textContent = SITE_CONFIG.phoneDisplay; });
    each("[data-email-text]", function (el) { el.textContent = SITE_CONFIG.email; });
  }

  /* ---------- 2. Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    each("#site-nav a", function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100) setOpen(false);
    });
  }

  /* ---------- 3. Header shadow on scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 4. Gentle fade-in on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length || reduceMotion || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------- 5. Footer year ---------- */
  function initYear() {
    each("[data-year]", function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- 6. Enquiry form ---------- */
  function initForm() {
    var form = document.getElementById("enquiry-form");
    if (!form) return;

    // Free form service: FormSubmit (https://formsubmit.co).
    // Messages are delivered to SITE_CONFIG.email. See HOW-TO-PUBLISH.txt
    var formTarget = SITE_CONFIG.formSubmitCode || SITE_CONFIG.email;
    var ajaxEndpoint = "https://formsubmit.co/ajax/" + formTarget;
    form.setAttribute("action", "https://formsubmit.co/" + formTarget);
    form.setAttribute("novalidate", "");

    var f = form.elements;
    var status = document.getElementById("form-status");
    var submitBtn = form.querySelector("[type='submit']");
    var waBtn = document.getElementById("send-whatsapp");

    // Pre-select a service when arriving from a link like contact.html?service=cv
    try {
      var wanted = new URLSearchParams(window.location.search).get("service");
      if (wanted && /^[a-z0-9-]+$/.test(wanted) && f.service.querySelector("option[value='" + wanted + "']")) {
        f.service.value = wanted;
      }
    } catch (e) { /* older browser: ignore */ }

    function serviceLabel() {
      var opt = f.service.options[f.service.selectedIndex];
      return opt && opt.value ? opt.text : "General enquiry";
    }
    function contactMethod() {
      var checked = form.querySelector("input[name='contact_method']:checked");
      return checked ? checked.value : "Not specified";
    }

    var rules = {
      name: function (el) { return el.value.trim().length >= 2 || "Please enter your full name."; },
      phone: function (el) {
        return /^[+0-9 ()-]{7,20}$/.test(el.value.trim()) || "Please enter a valid phone or WhatsApp number.";
      },
      email: function (el) {
        var v = el.value.trim();
        return v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Please enter a valid email address, or leave it blank.";
      },
      service: function (el) { return el.value !== "" || "Please choose the service you need."; },
      message: function (el) {
        return el.value.trim().length >= 10 || "Please tell us a little more about what you need.";
      },
      consent: function (el) { return el.checked || "Please tick this box so we can reply to you."; }
    };

    function setError(el, msg) {
      var wrap = el.closest(".form-field");
      var err = wrap ? wrap.querySelector(".field-error") : null;
      if (wrap) wrap.classList.toggle("has-error", !!msg);
      if (err) err.textContent = msg || "";
      el.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function check(name) {
      var el = f[name];
      var result = rules[name](el);
      setError(el, result === true ? "" : result);
      return result === true;
    }
    function validate(names) {
      var firstBad = null;
      names.forEach(function (n) {
        if (!check(n) && !firstBad) firstBad = f[n];
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    Object.keys(rules).forEach(function (n) {
      var el = f[n];
      var evt = (el.type === "checkbox" || el.tagName === "SELECT") ? "change" : "input";
      el.addEventListener(evt, function () {
        var wrap = el.closest(".form-field");
        if (wrap && wrap.classList.contains("has-error")) check(n);
      });
    });

    function showStatus(type, text, withWhatsApp) {
      status.className = "form-status " + (type === "success" ? "is-success" : "is-error");
      status.textContent = text;
      if (withWhatsApp) {
        status.appendChild(document.createTextNode(" "));
        var a = document.createElement("a");
        a.href = waLink(composeWhatsAppText());
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Send your enquiry on WhatsApp instead.";
        status.appendChild(a);
      }
      status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }
    function clearStatus() { status.className = "form-status"; status.textContent = ""; }
    function setLoading(on) {
      submitBtn.disabled = on;
      submitBtn.classList.toggle("is-loading", on);
      var label = submitBtn.querySelector(".btn-label");
      if (label) label.textContent = on ? "Sending..." : "Send Enquiry";
    }

    function composeWhatsAppText() {
      var lines = ["Hello " + SITE_CONFIG.businessName + ",", "", "I would like to enquire about: " + serviceLabel(), ""];
      if (f.name.value.trim()) lines.push("Name: " + f.name.value.trim());
      if (f.phone.value.trim()) lines.push("Phone: " + f.phone.value.trim());
      if (f.email.value.trim()) lines.push("Email: " + f.email.value.trim());
      if (f.message.value.trim()) lines.push("", f.message.value.trim());
      return lines.join("\n");
    }

    // "Send via WhatsApp" link — works without any setup.
    // Its link is kept up to date while the visitor types, so a normal tap opens WhatsApp.
    function refreshWaLink() {
      if (waBtn) waBtn.setAttribute("href", waLink(composeWhatsAppText()));
    }
    if (waBtn) {
      refreshWaLink();
      form.addEventListener("input", refreshWaLink);
      form.addEventListener("change", refreshWaLink);
      waBtn.addEventListener("click", function (e) {
        clearStatus();
        if (!validate(["name", "service"])) {
          e.preventDefault();
          showStatus("error", "Please enter your name and choose a service, then press \"Send via WhatsApp\" again.");
          return;
        }
        refreshWaLink();
      });
    }

    // "Send Enquiry" button — sends the form to your email via FormSubmit
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();
      if (!validate(Object.keys(rules))) {
        showStatus("error", "Please check the highlighted fields and try again.");
        return;
      }
      // Spam trap: real people never fill in the hidden field
      if (f._honey && f._honey.value) {
        form.reset();
        showStatus("success", "Thank you. Your enquiry has been sent.");
        return;
      }

      var payload = {
        "Name": f.name.value.trim(),
        "Phone / WhatsApp": f.phone.value.trim(),
        "email": f.email.value.trim() || "Not provided",
        "Service required": serviceLabel(),
        "Preferred contact method": contactMethod(),
        "Message": f.message.value.trim(),
        "_subject": "New website enquiry: " + serviceLabel(),
        "_template": "table"
      };
      if (!f.email.value.trim()) delete payload.email;

      setLoading(true);
      fetch(ajaxEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data || {} };
          });
        })
        .then(function (r) {
          var ok = r.ok && (r.data.success === true || r.data.success === "true");
          if (ok) {
            form.reset();
            showStatus("success", "Thank you! Your enquiry has been sent. We will contact you as soon as possible.");
            return;
          }
          var msg = String(r.data.message || "");
          if (/activat/i.test(msg)) {
            showStatus("error", "Our online form is still being set up, so your message could not be delivered yet.", true);
          } else {
            throw new Error(msg || "Request failed");
          }
        })
        .catch(function () {
          showStatus("error", "Sorry, your enquiry could not be sent right now. Please check your internet connection and try again.", true);
        })
        .then(function () { setLoading(false); });
    });
  }

  /* ---------- Start ---------- */
  function init() {
    applyContactDetails();
    initNav();
    initHeader();
    initReveal();
    initYear();
    initForm();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
