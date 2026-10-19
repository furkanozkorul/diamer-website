(function () {
  "use strict";
  var cfg = window.DIAMER_CONFIG || {};
  var DEFAULT_WA_MSG = "Hola DIAMER, me gustaría información sobre su mercancía.";

  function waLink(msg) {
    if (!cfg.whatsapp) return "contacto.html";
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(msg || DEFAULT_WA_MSG);
  }
  window.diamerWaLink = waLink;

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu-principal");
  if (toggle && nav) {
    var behindMenu = document.querySelectorAll("main, .site-footer, .wa-float");
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      // Con el menú abierto, el contenido de atrás no recibe foco ni clics
      behindMenu.forEach(function (el) {
        if (open) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Si la pantalla se agranda con el menú abierto (p. ej. al girar la tableta), se cierra
    var desktop = window.matchMedia("(min-width: 901px)");
    var onChange = function () { if (desktop.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else desktop.addListener(onChange);
  }

  /* ---------- Cabecera al hacer scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Datos de contacto desde config.js ---------- */
  function applyContactLinks(root) {
    (root || document).querySelectorAll("[data-wa]").forEach(function (a) {
      a.href = waLink(a.getAttribute("data-wa"));
      if (cfg.whatsapp) { a.target = "_blank"; a.rel = "noopener"; }
    });
  }
  window.diamerApplyContactLinks = applyContactLinks;
  applyContactLinks();

  document.querySelectorAll("[data-contact]").forEach(function (el) {
    var key = el.getAttribute("data-contact");
    var value = cfg[key];
    var wrapper = el.closest("[data-optional]");
    if (!value) {
      if (wrapper) wrapper.hidden = true;
      return;
    }
    if (key === "telefono") el.href = "tel:" + value.replace(/[^\d+]/g, "");
    if (key === "email") el.href = "mailto:" + value;
    if (key === "whatsapp") {
      el.href = waLink();
      el.target = "_blank";
      el.rel = "noopener";
      value = "+" + value.replace(/^(\d{3})(\d{4})(\d+)$/, "$1 $2-$3");
    }
    el.textContent = value;
  });

  var socials = document.querySelectorAll("[data-social]");
  socials.forEach(function (a) {
    var url = cfg[a.getAttribute("data-social")];
    // Solo enlaces https: evita que un valor mal escrito ejecute código (javascript:) o cargue sin cifrar
    if (url && /^https:\/\//i.test(url)) a.href = url;
    else a.closest("li").hidden = true;
  });
  document.querySelectorAll(".social-list").forEach(function (list) {
    if (!list.querySelector("li:not([hidden])")) list.hidden = true;
  });

  var year = document.getElementById("anio");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Formulario de contacto (Formspree) ---------- */
  var form = document.getElementById("form-contacto");
  if (!form) return;

  var status = document.getElementById("form-estado");
  var submit = form.querySelector('button[type="submit"]');
  var messages = {
    nombre: "Escribí tu nombre.",
    telefono: "Escribí un teléfono o WhatsApp de al menos 8 dígitos.",
    email: "Escribí un correo válido, por ejemplo nombre@correo.com.",
    mensaje: "Contanos qué mercancía te interesa.",
  };

  function validateField(input) {
    var err = document.getElementById(input.id + "-error");
    var ok = true;
    var v = input.value.trim();
    if (input.required && !v) ok = false;
    if (ok && input.id === "telefono" && v.replace(/\D/g, "").length < 8) ok = false;
    if (ok && input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    if (err) err.textContent = ok ? "" : messages[input.id] || "Revisá este campo.";
    return ok;
  }

  form.querySelectorAll("input, textarea").forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value.trim() || input.getAttribute("aria-invalid") === "true") validateField(input);
    });
  });

  function setStatus(type, html) {
    status.className = "form-status is-" + type;
    status.innerHTML = html;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll("input:not([type=hidden]), textarea");
    var firstBad = null;
    fields.forEach(function (f) {
      if (!validateField(f) && !firstBad) firstBad = f;
    });
    if (firstBad) {
      setStatus("error", "Revisá los campos marcados para enviar tu mensaje.");
      firstBad.focus();
      return;
    }

    if (!cfg.formspreeId) {
      setStatus("error", 'El formulario aún no está conectado. Mientras tanto, escribinos por <a data-wa href="#">WhatsApp</a>.');
      applyContactLinks(status);
      return;
    }

    submit.disabled = true;
    submit.textContent = "Enviando…";
    fetch("https://formspree.io/f/" + cfg.formspreeId, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("envio");
        form.reset();
        setStatus("ok", "Mensaje enviado. Te responderemos pronto para coordinar tu visita.");
      })
      .catch(function () {
        setStatus("error", 'No se pudo enviar el mensaje. Revisá tu conexión e intentá de nuevo, o escribinos por <a data-wa href="#">WhatsApp</a>.');
        applyContactLinks(status);
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "Enviar mensaje";
      });
  });
})();
