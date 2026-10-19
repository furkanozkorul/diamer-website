/*
 * INVENTARIO
 * Para agregar un lote, copie un bloque { ... } y cambie sus datos.
 * Para quitar un lote, borre su bloque.
 *
 * categoria: "calzado" | "ropa" | "bolsos" | "hogar" | "mixta"
 * destacado: true = aparece también en la página de inicio (máx. 3)
 */
window.DIAMER_LOTES = [
  {
    titulo: "Pallet de calzado de marcas",
    categoria: "calzado",
    imagen: "assets/img/lote-6.jpg",
    descripcion: "Calzado deportivo, casual y de vestir en sus cajas originales. Tallas y estilos surtidos.",
    venta: "Pallet",
    tipo: "Surtido",
    procedencia: "Estados Unidos",
    destacado: true,
  },
  {
    titulo: "Calzado deportivo por caja",
    categoria: "calzado",
    imagen: "assets/img/lote-7.jpg",
    descripcion: "Tenis y calzado deportivo de marcas reconocidas. Ideal para tiendas de calzado y emprendedores.",
    venta: "Caja o pallet",
    tipo: "Surtido",
    procedencia: "Estados Unidos",
    destacado: false,
  },
  {
    titulo: "Lote amplio de calzado",
    categoria: "calzado",
    imagen: "assets/img/lote-8.jpg",
    descripcion: "Gran variedad de calzado deportivo, de vestir, de fiesta y de oficina. Disponible por caja.",
    venta: "Caja",
    tipo: "Surtido",
    procedencia: "Estados Unidos",
    destacado: false,
  },
  {
    titulo: "Mercancía general de grandes cadenas",
    categoria: "mixta",
    imagen: "assets/img/lote-1.jpg",
    descripcion: "Devoluciones y sobreinventario de tiendas de EE. UU. Buena variedad para tiendas de descuento.",
    venta: "Pallet",
    tipo: "En crudo, sin clasificar",
    procedencia: "Estados Unidos",
    destacado: true,
  },
  {
    titulo: "Artículos de cocina y hogar",
    categoria: "hogar",
    imagen: "assets/img/lote-cocina.jpg",
    descripcion: "Cafeteras, utensilios y pequeños electrodomésticos de cocina provenientes de devoluciones.",
    venta: "Pallet",
    tipo: "Surtido",
    procedencia: "Estados Unidos",
    destacado: true,
  },
  {
    titulo: "Caja de artículos para el hogar",
    categoria: "hogar",
    imagen: "assets/img/lote-2.jpg",
    descripcion: "Baterías de cocina, organizadores y artículos para el hogar en empaque original.",
    venta: "Caja",
    tipo: "Surtido",
    procedencia: "Estados Unidos",
    destacado: false,
  },
  {
    titulo: "Caja de mercancía mixta",
    categoria: "mixta",
    imagen: "assets/img/lote-3.jpg",
    descripcion: "Productos de cuidado personal, bebé, juguetes y accesorios. El contenido varía en cada caja.",
    venta: "Caja",
    tipo: "En crudo, sin clasificar",
    procedencia: "Estados Unidos",
    destacado: false,
  },
  {
    titulo: "Pallets de mercancía general",
    categoria: "mixta",
    imagen: "assets/img/lote-4.jpg",
    descripcion: "Carga mixta de artículos para el hogar, juguetes y productos de temporada.",
    venta: "Pallet",
    tipo: "En crudo, sin clasificar",
    procedencia: "Estados Unidos",
    destacado: false,
  },
  {
    titulo: "Carga completa de devoluciones",
    categoria: "mixta",
    imagen: "assets/img/lote-5.jpg",
    descripcion: "Cajas de devoluciones de plataformas de venta en línea. Se vende por pallet.",
    venta: "Pallet",
    tipo: "En crudo, sin clasificar",
    procedencia: "Estados Unidos",
    destacado: false,
  },
];

(function () {
  "use strict";
  var lotes = window.DIAMER_LOTES;
  var nombres = { calzado: "Calzado", ropa: "Ropa", bolsos: "Bolsos y accesorios", hogar: "Hogar", mixta: "Carga mixta" };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function card(l) {
    var msg = "Hola DIAMER, me interesa el lote: " + l.titulo + ". ¿Está disponible?";
    return (
      '<article class="lot" data-categoria="' + esc(l.categoria) + '">' +
        '<div class="lot-media"><img src="' + esc(l.imagen) + '" alt="' + esc(l.titulo) + '" loading="lazy" width="600" height="600"></div>' +
        '<div class="lot-body">' +
          '<h3 class="lot-title">' + esc(l.titulo) + "</h3>" +
          '<p class="lot-desc">' + esc(l.descripcion) + "</p>" +
          '<dl class="lot-specs">' +
            "<div><dt>Categoría</dt><dd>" + esc(nombres[l.categoria] || l.categoria) + "</dd></div>" +
            "<div><dt>Se vende por</dt><dd>" + esc(l.venta) + "</dd></div>" +
            "<div><dt>Presentación</dt><dd>" + esc(l.tipo) + "</dd></div>" +
            "<div><dt>Procedencia</dt><dd>" + esc(l.procedencia) + "</dd></div>" +
          "</dl>" +
          '<a class="btn btn-wa lot-cta" data-wa="' + esc(msg) + '" href="contacto.html">' +
            '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><use href="#i-whatsapp"/></svg>' +
            "Consultar disponibilidad</a>" +
        "</div>" +
      "</article>"
    );
  }

  document.querySelectorAll("[data-lotes]").forEach(function (grid) {
    var soloDestacados = grid.getAttribute("data-lotes") === "destacados";
    var lista = soloDestacados ? lotes.filter(function (l) { return l.destacado; }).slice(0, 3) : lotes;
    grid.innerHTML = lista.map(card).join("");
    if (window.diamerApplyContactLinks) window.diamerApplyContactLinks(grid);
  });

  /* Filtros de categoría */
  var filtros = document.querySelector(".filters");
  if (!filtros) return;
  var grid = document.querySelector('[data-lotes="todos"]');
  var count = document.getElementById("lotes-conteo");
  var empty = document.getElementById("lotes-vacio");

  function aplicar(cat) {
    var visibles = 0;
    grid.querySelectorAll(".lot").forEach(function (el) {
      var show = cat === "todas" || el.getAttribute("data-categoria") === cat;
      el.hidden = !show;
      if (show) visibles++;
    });
    filtros.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filtro") === cat));
    });
    count.textContent = visibles === 1 ? "1 lote disponible" : visibles + " lotes disponibles";
    empty.hidden = visibles !== 0;
  }

  filtros.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-filtro]");
    if (b) aplicar(b.getAttribute("data-filtro"));
  });
  aplicar("todas");
})();
