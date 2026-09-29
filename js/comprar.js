/*
 * Página Comprar: resumen del pedido, validación del formulario y envío por WhatsApp.
 * Usa window.Carrito (carrito.js).
 */
(function () {
  'use strict';

  var lista = document.querySelector('[data-lineas]');
  var bloqueVacio = document.querySelector('[data-vacio]');
  var bloqueProductos = document.querySelector('[data-con-productos]');
  var totalEl = document.querySelector('[data-total]');
  var formulario = document.querySelector('[data-formulario]');
  var errores = document.querySelector('[data-errores]');
  var listaErrores = document.querySelector('[data-errores-lista]');
  var compra = document.querySelector('[data-compra]');
  var confirmacion = document.querySelector('[data-confirmacion]');

  function icono(nombre) {
    return '<svg class="icono" aria-hidden="true"><use href="#i-' + nombre + '"/></svg>';
  }

  function escapar(texto) {
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  /* ---------- Resumen del pedido ---------- */

  function selector(indice, parte, etiqueta, opciones, elegida, etiquetaVisible) {
    var id = 'var-' + indice + (parte ? '-' + parte : '');
    var html = '<label class="' + (etiquetaVisible ? 'linea__etiqueta' : 'sr-only') + '" for="' + id + '">' + escapar(etiqueta) + '</label>' +
      '<select id="' + id + '" data-indice="' + indice + '"' + (parte ? ' data-parte="' + parte + '"' : '') + '>';
    opciones.forEach(function (op) {
      html += '<option' + (op === elegida ? ' selected' : '') + '>' + escapar(op) + '</option>';
    });
    return html + '</select>';
  }

  function dibujar() {
    var lineas = Carrito.leer();
    bloqueVacio.hidden = lineas.length > 0;
    bloqueProductos.hidden = lineas.length === 0;
    if (!lineas.length) return;

    lista.innerHTML = lineas.map(function (linea, i) {
      var item = Carrito.buscar(linea.id);
      var selectores = '';

      if (item.tipo === 'producto' && item.variantes.length) {
        selectores = selector(i, null, (item.etiquetaVariante || 'Modelo') + ' de ' + item.nombre, item.variantes, linea.variante);
      }
      if (item.tipo === 'combo') {
        Carrito.partesElegibles(linea.id).forEach(function (parte) {
          var producto = PRODUCTOS[parte.id];
          var etiqueta = (producto.etiquetaVariante || 'Modelo') + ' de ' + producto.nombre.toLowerCase();
          var elegida = (linea.opciones && linea.opciones[parte.id]) || producto.variantes[0];
          selectores += selector(i, parte.id, etiqueta, producto.variantes, elegida, true);
        });
      }

      var nombre = escapar(item.nombre);
      return '<li class="linea">' +
        '<img src="' + Carrito.imagenDe(item, linea.variante) + '" width="64" height="64" alt="">' +
        '<div>' +
          '<p class="linea__nombre">' + nombre + '</p>' +
          '<p class="linea__unitario">' + Carrito.formatear(item.precio) + ' c/u</p>' +
          selectores +
        '</div>' +
        '<div class="linea__controles">' +
          '<div class="cantidad-control">' +
            '<button type="button" data-accion="menos" data-indice="' + i + '" aria-label="Restar una unidad de ' + nombre + '"' + (linea.cantidad <= 1 ? ' disabled' : '') + '>' + icono('menos') + '</button>' +
            '<output aria-label="Cantidad de ' + nombre + '">' + linea.cantidad + '</output>' +
            '<button type="button" data-accion="mas" data-indice="' + i + '" aria-label="Sumar una unidad de ' + nombre + '">' + icono('mas') + '</button>' +
          '</div>' +
          '<p class="precio linea__subtotal">' + Carrito.formatear(item.precio * linea.cantidad) + '</p>' +
          '<button type="button" class="quitar" data-accion="quitar" data-indice="' + i + '" aria-label="Quitar ' + nombre + ' del pedido">' + icono('tacho') + '</button>' +
        '</div>' +
      '</li>';
    }).join('');

    totalEl.textContent = Carrito.formatear(Carrito.total());
  }

  function anunciar(texto) {
    var anuncio = document.querySelector('[data-anuncio]');
    anuncio.textContent = '';
    setTimeout(function () { anuncio.textContent = texto; }, 50);
  }

  lista.addEventListener('click', function (e) {
    var boton = e.target.closest('button[data-accion]');
    if (!boton) return;
    var i = Number(boton.dataset.indice);
    var accion = boton.dataset.accion;
    var lineas = Carrito.leer();
    var linea = lineas[i];
    if (!linea) return;
    var nombre = Carrito.buscar(linea.id).nombre;

    if (accion === 'mas') linea.cantidad += 1;
    if (accion === 'menos' && linea.cantidad > 1) linea.cantidad -= 1;
    if (accion === 'quitar') lineas.splice(i, 1);

    Carrito.guardar(lineas);

    // Después de redibujar, el foco vuelve a un lugar lógico.
    if (accion === 'quitar') {
      anunciar('Quitaste ' + nombre + ' del pedido.');
      var siguiente = lista.querySelectorAll('.quitar')[Math.min(i, lineas.length - 1)];
      (siguiente || document.getElementById('resumen')).focus();
    } else {
      anunciar(nombre + ': ' + linea.cantidad + (linea.cantidad === 1 ? ' unidad.' : ' unidades.'));
      var mismo = lista.querySelector('[data-accion="' + accion + '"][data-indice="' + i + '"]');
      if (mismo && !mismo.disabled) {
        mismo.focus();
      } else {
        var otro = lista.querySelector('[data-accion="mas"][data-indice="' + i + '"]');
        if (otro) otro.focus();
      }
    }
  });

  lista.addEventListener('change', function (e) {
    var select = e.target.closest('select[data-indice]');
    if (!select) return;
    var i = Number(select.dataset.indice);
    var lineas = Carrito.leer();
    var linea = lineas[i];
    if (!linea) return;

    if (select.dataset.parte) {
      linea.opciones = linea.opciones || {};
      linea.opciones[select.dataset.parte] = select.value;
    } else {
      // Si ya hay una línea del mismo producto con esa variante, se juntan.
      var igual = lineas.findIndex(function (l, j) {
        return j !== i && l.id === linea.id && l.variante === select.value;
      });
      if (igual !== -1) {
        lineas[igual].cantidad += linea.cantidad;
        lineas.splice(i, 1);
      } else {
        linea.variante = select.value;
      }
    }
    Carrito.guardar(lineas);
    var mismo = document.getElementById(select.id);
    if (mismo) mismo.focus();
  });

  document.addEventListener('carrito:cambio', dibujar);
  dibujar();

  /* ---------- Validación ---------- */

  var reglas = {
    nombre: function (v) {
      return v ? '' : 'Escribí tu nombre y apellido.';
    },
    telefono: function (v) {
      if (!v) return 'Escribí tu teléfono para que podamos coordinar el envío.';
      if (v.replace(/\D/g, '').length < 8) return 'El teléfono tiene que tener al menos 8 números, con el código de área.';
      return '';
    },
    email: function (v) {
      if (!v) return 'Escribí tu correo electrónico.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Revisá el correo: tiene que tener el formato nombre@ejemplo.com.';
      return '';
    },
    direccion: function (v) {
      return v ? '' : 'Escribí la dirección de entrega, con calle y número.';
    },
    localidad: function (v) {
      return v ? '' : 'Escribí tu localidad.';
    }
  };

  function mostrarError(campo, mensaje) {
    var error = document.getElementById('error-' + campo.id);
    var descripciones = (campo.getAttribute('aria-describedby') || '').split(' ').filter(function (d) {
      return d && d !== error.id;
    });
    if (mensaje) {
      error.innerHTML = icono('alerta') + '<span>' + escapar(mensaje) + '</span>';
      error.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      descripciones.push(error.id);
    } else {
      error.hidden = true;
      error.textContent = '';
      campo.removeAttribute('aria-invalid');
    }
    if (descripciones.length) {
      campo.setAttribute('aria-describedby', descripciones.join(' '));
    } else {
      campo.removeAttribute('aria-describedby');
    }
  }

  function validar(campo) {
    var mensaje = reglas[campo.id](campo.value.trim());
    mostrarError(campo, mensaje);
    return mensaje;
  }

  Object.keys(reglas).forEach(function (id) {
    var campo = document.getElementById(id);
    // Se valida al salir del campo, y si ya tenía un error, se corrige mientras escribís.
    campo.addEventListener('blur', function () {
      if (campo.value.trim() || campo.dataset.tocado) validar(campo);
      campo.dataset.tocado = 'si';
    });
    campo.addEventListener('input', function () {
      if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
    });
  });

  listaErrores.addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="#"]');
    if (!enlace) return;
    e.preventDefault();
    var destino = document.getElementById(enlace.getAttribute('href').slice(1));
    if (destino) destino.focus();
  });

  /* ---------- Envío por WhatsApp ---------- */

  function texto(monto) {
    return Carrito.formatear(monto).replace(/ /g, ' ');
  }

  function armarMensaje(datos) {
    var lineas = Carrito.leer().map(function (linea) {
      var item = Carrito.buscar(linea.id);
      var detalle = '';
      if (linea.variante) detalle = ' (' + linea.variante + ')';
      if (linea.opciones && Object.keys(linea.opciones).length) {
        detalle = ' (' + Object.keys(linea.opciones).map(function (id) {
          return PRODUCTOS[id].nombre + ': ' + linea.opciones[id];
        }).join(', ') + ')';
      }
      return '• ' + linea.cantidad + ' × ' + item.nombre + detalle + ': ' + texto(item.precio * linea.cantidad);
    });

    var direccion = datos.direccion + ', ' + datos.localidad + (datos.cp ? ' (CP ' + datos.cp + ')' : '');

    return [
      '¡Hola, Mi mascota! Quiero hacer este pedido:',
      '',
      lineas.join('\n'),
      '',
      'Total: ' + texto(Carrito.total()),
      '',
      'Mis datos:',
      'Nombre: ' + datos.nombre,
      'Teléfono: ' + datos.telefono,
      'Correo: ' + datos.email,
      'Dirección: ' + direccion,
      'Pago: ' + datos.pago
    ].concat(datos.comentarios ? ['Comentarios: ' + datos.comentarios] : []).join('\n');
  }

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    var problemas = [];
    if (!Carrito.leer().length) {
      problemas.push({ id: 'resumen', mensaje: 'Tu carrito está vacío. Agregá al menos un producto.' });
    }
    Object.keys(reglas).forEach(function (id) {
      var campo = document.getElementById(id);
      campo.dataset.tocado = 'si';
      var mensaje = validar(campo);
      if (mensaje) problemas.push({ id: id, mensaje: mensaje });
    });

    if (problemas.length) {
      listaErrores.innerHTML = problemas.map(function (p) {
        return '<li><a href="#' + p.id + '">' + escapar(p.mensaje) + '</a></li>';
      }).join('');
      errores.hidden = false;
      errores.focus();
      return;
    }
    errores.hidden = true;

    var datos = {};
    new FormData(formulario).forEach(function (valor, clave) {
      datos[clave] = String(valor).trim();
    });

    var url = 'https://wa.me/' + TIENDA.whatsapp + '?text=' + encodeURIComponent(armarMensaje(datos));
    window.open(url, '_blank', 'noopener');

    confirmacion.querySelector('[data-enlace-whatsapp]').href = url;
    compra.hidden = true;
    confirmacion.hidden = false;
    confirmacion.querySelector('h2').focus();
    formulario.reset();
    Carrito.guardar([]);
  });
})();
