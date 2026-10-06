/*
 * Datos de la tienda Mi mascota.
 * Este es el único archivo que hay que tocar para cambiar precios, links o el número de WhatsApp.
 * Los precios son en pesos argentinos, sin puntos ni signos: 12900 = $12.900.
 * Salen de la lista de precios de la tienda, con un 10% de aumento.
 */

var TIENDA = {
  // Número de WhatsApp con código de país (54), 9 y código de área, sin espacios ni "+": 342 6507504
  whatsapp: '5493426507504',
  // Cuenta de Instagram: @mimascota.stafe
  instagram: 'https://www.instagram.com/mimascota.stafe/',
  // EDITAR: link a la tienda de Mercado Libre
  mercadoLibre: 'https://www.mercadolibre.com.ar/',
  // Descuento de los kits sobre la suma de sus productos (0.10 = 10%). El precio se redondea a $10.
  descuentoKits: 0.10
};

/*
 * Productos. "codigo" es el código interno del producto.
 * enWeb: false = no tiene foto individual todavía: no se vende suelto, pero su precio cuenta para los kits.
 * precio: null = precio a confirmar (se muestra "Precio a confirmar" y no se vende por la web).
 */
var PRODUCTOS = {
  'palita': {
    codigo: 'MM-01',
    nombre: 'Palita para excremento',
    precio: 27870,
    imagen: 'img/palita.jpg',
    variantes: []
  },
  'cepillo': {
    codigo: 'MM-02',
    nombre: 'Cepillo con botón retráctil',
    precio: 9240,
    imagen: 'img/cepillo-retractil.jpg',
    variantes: []
  },
  'guante-quitapelos': {
    codigo: 'MM-03',
    nombre: 'Guante quita pelos', // el de malla negro, todavía sin foto individual
    precio: 3080,
    enWeb: false,
    variantes: []
  },
  'porta-bolsas': {
    codigo: 'MM-04',
    nombre: 'Porta bolsas verde',
    precio: 5230, // precio confirmado (en la lista figura cruzado con el de linterna)
    imagen: 'img/porta-bolsas-verde.jpg',
    variantes: []
  },
  'correa': {
    codigo: 'MM-05',
    nombre: 'Correa con porta bolsas',
    precio: 8800,
    imagen: 'img/correa-porta-bolsas.jpg',
    variantes: []
  },
  'toallas': {
    codigo: 'MM-06',
    nombre: 'Toalla',
    precio: 7590,
    enWeb: false,
    variantes: []
  },
  'porta-linterna': {
    codigo: 'MM-07',
    nombre: 'Porta bolsas con linterna',
    precio: 8140, // precio confirmado (en la lista figura cruzado con el verde)
    imagen: 'img/porta-bolsas-linterna.jpg',
    variantes: []
  },
  'guantes-bano': {
    codigo: 'MM-08',
    nombre: 'Guante para baño', // el azul con negro, de cinco dedos
    precio: 5960,
    imagen: 'img/guante-bano.jpg',
    variantes: []
  },
  'guante-cepillo': {
    codigo: 'MM-09',
    nombre: 'Guante cepillo',
    precio: 10990,
    enWeb: false,
    variantes: []
  },
  'alicate': {
    codigo: 'MM-10',
    nombre: 'Alicate para uñas',
    precio: 4510,
    imagen: 'img/alicate-unas.jpg',
    variantes: []
  },
  'alicate-luz': {
    codigo: 'MM-11',
    nombre: 'Alicate con luz',
    precio: 12100,
    enWeb: false,
    variantes: []
  },
  'comedero-doble': {
    codigo: 'MM-12',
    nombre: 'Comedero doble',
    precio: 19360,
    enWeb: false,
    variantes: []
  },
  'comedero-chico': {
    codigo: 'MM-13',
    nombre: 'Comedero chico',
    precio: 5230,
    imagen: 'img/comedero-chico.jpg',
    variantes: []
  },
  'comedero-grande': {
    codigo: 'MM-14',
    nombre: 'Comedero grande',
    precio: 6590,
    imagen: 'img/comedero-grande.jpg',
    variantes: []
  },
  'mochila': {
    codigo: 'MM-15',
    nombre: 'Mochila transportadora con visor',
    precio: 59400,
    imagen: 'img/mochila-rosa.jpg',
    etiquetaVariante: 'Color',
    variantes: ['Rosa', 'Negra'],
    imagenesPorVariante: { 'Rosa': 'img/mochila-rosa.jpg', 'Negra': 'img/mochila-negra.jpg' }
  }
};

/*
 * Kits. El precio no se escribe: es la suma de sus productos menos TIENDA.descuentoKits.
 * Si un producto del kit tiene variantes y no lleva "detalle", el cliente elige el modelo o color al comprar.
 */
var COMBOS = {
  'kit-bano': {
    nombre: 'Kit Baño y Cepillado',
    imagen: 'img/kit-bano.jpg',
    incluye: [
      { id: 'toallas', cantidad: 1 },
      { id: 'guante-cepillo', cantidad: 1 },
      { id: 'guantes-bano', cantidad: 1 }
    ]
  },
  'kit-toallas': {
    nombre: 'Kit Toallas',
    imagen: 'img/kit-toallas.jpg',
    incluye: [
      { id: 'toallas', cantidad: 2 }
    ]
  },
  'kit-cuidado': {
    nombre: 'Kit Cuidado Diario',
    imagen: 'img/kit-cuidado.jpg',
    incluye: [
      { id: 'cepillo', cantidad: 1 },
      { id: 'alicate-luz', cantidad: 1 }
    ]
  },
  'kit-cepillado-paseo': {
    nombre: 'Kit Cepillado y Paseo',
    imagen: 'img/kit-cepillado-paseo.jpg',
    incluye: [
      { id: 'guante-quitapelos', cantidad: 1, detalle: 'de malla negro' },
      { id: 'cepillo', cantidad: 1 },
      { id: 'porta-bolsas', cantidad: 1 }
    ]
  },
  'kit-paseo-unas': {
    nombre: 'Kit Paseo y Uñas',
    imagen: 'img/kit-paseo-unas.jpg',
    incluye: [
      { id: 'porta-linterna', cantidad: 1 },
      { id: 'alicate', cantidad: 1 }
    ]
  },
  'kit-comederos': {
    nombre: 'Kit Comederos',
    imagen: 'img/kit-comederos.jpg',
    incluye: [
      { id: 'comedero-grande', cantidad: 1 },
      { id: 'comedero-chico', cantidad: 1 }
    ]
  }
};
