/*
 * Carrito compartido por todas las páginas.
 * Completa precios y links desde datos.js, guarda el carrito en el navegador
 * y maneja los botones "Agregar al carrito".
 */
(function () {
  'use strict';

  var CLAVE = 'mimascota-carrito';
  var memoria = []; // respaldo si el navegador no deja guardar (modo privado, etc.)

  var formato = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  function formatear(monto) {
    return formato.format(monto);
  }

  function precioSeparado(comboId) {
    return COMBOS[comboId].incluye.reduce(function (total, parte) {
      return total + PRODUCTOS[parte.id].precio * parte.cantidad;
    }, 0);
  }

  // Precio del kit: suma de sus productos menos el descuento de kits, redondeado a $10.
  function precioCombo(comboId) {
    return Math.round(precioSeparado(comboId) * (1 - TIENDA.descuentoKits) / 10) * 10;
  }

  // Devuelve un producto o un combo por su id, con el tipo marcado.
  function buscar(id) {
    if (PRODUCTOS[id]) return Object.assign({ id: id, tipo: 'producto' }, PRODUCTOS[id]);
    if (COMBOS[id]) return Object.assign({ id: id, tipo: 'combo', variantes: [], precio: precioCombo(id) }, COMBOS[id]);
    return null;
  }

  // Se puede comprar por la web: los kits siempre; los productos si tienen foto (enWeb) y precio.
  function seVende(id) {
    var item = buscar(id);
    if (!item) return false;
    return item.tipo === 'combo' || (item.enWeb !== false && item.precio != null);
  }

  function imagenDe(item, variante) {
    return (item.imagenesPorVariante && item.imagenesPorVariante[variante]) || item.imagen;
  }

  function ahorro(comboId) {
    var separado = precioSeparado(comboId);
    var monto = separado - precioCombo(comboId);
    return { monto: monto, porcentaje: Math.round((monto / separado) * 100) };
  }

  /* ---------- Guardado ---------- */

  function leer() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE));
      if (Array.isArray(datos)) {
        return datos.filter(function (linea) { return seVende(linea.id) && linea.cantidad > 0; });
      }
      return [];
    } catch (e) {
      return memoria.slice();
    }
  }

  function guardar(lineas) {
    memoria = lineas.slice();
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lineas));
    } catch (e) { /* queda en memoria */ }
    actualizarContador();
    document.dispatchEvent(new CustomEvent('carrito:cambio'));
  }

  // Productos de un kit donde el cliente elige modelo o color (los que tienen variantes y no traen "detalle").
  function partesElegibles(comboId) {
    return COMBOS[comboId].incluye.filter(function (parte) {
      return !parte.detalle && PRODUCTOS[parte.id].variantes.length > 0;
    });
  }

  function agregar(id, variante, cantidad) {
    var lineas = leer();
    var esCombo = Boolean(COMBOS[id]);
    var existente = lineas.find(function (l) {
      return l.id === id && (esCombo || l.variante === variante);
    });
    if (existente) {
      existente.cantidad += cantidad || 1;
    } else if (esCombo) {
      var opciones = {};
      partesElegibles(id).forEach(function (parte) {
        opciones[parte.id] = PRODUCTOS[parte.id].variantes[0];
      });
      lineas.push({ id: id, variante: null, opciones: opciones, cantidad: cantidad || 1 });
    } else {
      lineas.push({ id: id, variante: variante, cantidad: cantidad || 1 });
    }
    guardar(lineas);
  }

  function cantidadTotal() {
    return leer().reduce(function (total, l) { return total + l.cantidad; }, 0);
  }

  function total() {
    return leer().reduce(function (suma, l) { return suma + buscar(l.id).precio * l.cantidad; }, 0);
  }

  /* ---------- Página ---------- */

  function actualizarContador() {
    var cantidad = cantidadTotal();
    document.querySelectorAll('[data-contador]').forEach(function (el) {
      el.textContent = cantidad;
      el.hidden = cantidad === 0;
    });
    document.querySelectorAll('[data-contador-texto]').forEach(function (el) {
      el.textContent = cantidad === 1 ? '1 producto en el carrito' : cantidad + ' productos en el carrito';
    });
  }

  function completarPrecios() {
    document.querySelectorAll('[data-precio]').forEach(function (el) {
      var item = buscar(el.dataset.precio);
      if (item) el.textContent = item.precio == null ? 'Precio a confirmar' : formatear(item.precio);
    });
    document.querySelectorAll('[data-precio-separado]').forEach(function (el) {
      el.textContent = formatear(precioSeparado(el.dataset.precioSeparado));
    });
    document.querySelectorAll('[data-ahorro]').forEach(function (el) {
      var a = ahorro(el.dataset.ahorro);
      el.textContent = 'Ahorrás ' + formatear(a.monto) + ' (' + a.porcentaje + '%)';
    });
    document.querySelectorAll('[data-ahorro-corto]').forEach(function (el) {
      var a = ahorro(el.dataset.ahorroCorto);
      el.textContent = formatear(a.monto) + ' (' + a.porcentaje + '%)';
    });
    var desde = Math.min.apply(null, Object.keys(COMBOS).map(precioCombo));
    document.querySelectorAll('[data-desde-combos]').forEach(function (el) {
      el.textContent = formatear(desde);
    });
  }

  function completarLinks() {
    var links = {
      whatsapp: 'https://wa.me/' + TIENDA.whatsapp,
      instagram: TIENDA.instagram,
      mercadolibre: TIENDA.mercadoLibre
    };
    document.querySelectorAll('[data-link]').forEach(function (el) {
      if (links[el.dataset.link]) el.href = links[el.dataset.link];
    });
  }

  var temporizadorAviso;
  function avisar(texto) {
    // Anuncio para lectores de pantalla: se vacía y se vuelve a llenar para que repita el mismo texto.
    var anuncio = document.querySelector('[data-anuncio]');
    if (anuncio) {
      anuncio.textContent = '';
      setTimeout(function () { anuncio.textContent = texto; }, 50);
    }
    var aviso = document.querySelector('[data-aviso]');
    if (!aviso) return;
    aviso.querySelector('[data-aviso-texto]').textContent = texto;
    aviso.classList.add('aviso--visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () {
      aviso.classList.remove('aviso--visible');
    }, 4000);
  }

  // Los selectores de modelo/color se llenan con las variantes de datos.js.
  // Si el producto tiene una foto por variante (como la mochila), la foto cambia con el selector.
  function completarVariantes() {
    document.querySelectorAll('select[data-variante]').forEach(function (selector) {
      var producto = PRODUCTOS[selector.dataset.variante];
      if (!producto || !producto.variantes.length) return;
      selector.innerHTML = '';
      producto.variantes.forEach(function (v) {
        selector.add(new Option(v, v));
      });
      if (producto.imagenesPorVariante) {
        selector.addEventListener('change', function () {
          var contenedor = selector.closest('[data-item]');
          var foto = contenedor && contenedor.querySelector('[data-foto]');
          if (foto) foto.src = imagenDe(producto, selector.value);
        });
      }
    });
  }

  function activarBotones() {
    document.querySelectorAll('[data-agregar]').forEach(function (boton) {
      var textoOriginal = boton.textContent;
      var temporizador;
      boton.addEventListener('click', function () {
        var id = boton.dataset.agregar;
        if (!seVende(id)) return;
        var item = buscar(id);
        var contenedor = boton.closest('[data-item]');
        var selector = contenedor && contenedor.querySelector('[data-variante]');
        var variante = selector ? selector.value : (item.variantes[0] || null);

        agregar(id, variante, 1);
        avisar('Agregaste ' + item.nombre + (variante ? ' (' + variante.toLowerCase() + ')' : '') + ' al carrito.');

        boton.textContent = 'Agregado al carrito';
        boton.classList.add('boton--agregado');
        clearTimeout(temporizador);
        temporizador = setTimeout(function () {
          boton.textContent = textoOriginal;
          boton.classList.remove('boton--agregado');
        }, 1800);
      });
    });
  }

  window.Carrito = {
    buscar: buscar,
    leer: leer,
    guardar: guardar,
    total: total,
    formatear: formatear,
    precioSeparado: precioSeparado,
    partesElegibles: partesElegibles,
    imagenDe: imagenDe
  };

  completarPrecios();
  completarVariantes();
  completarLinks();
  actualizarContador();
  activarBotones();

  // Si el carrito cambia en otra pestaña, se actualiza el contador.
  window.addEventListener('storage', function (e) {
    if (e.key === CLAVE) {
      actualizarContador();
      document.dispatchEvent(new CustomEvent('carrito:cambio'));
    }
  });
})();
