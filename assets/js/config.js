/*
 * LOS SANTOS STUDIO — datos editables.
 * Todo lo que cambia con frecuencia (precios, servicios, contacto, reseñas) vive acá.
 * No hace falta tocar index.html para actualizarlo.
 */
window.LS_CONFIG = {
  business: {
    name: 'Los Santos Studio',
    addressLine: '25 de Mayo 18, piso 1, oficina 10',
    city: 'Córdoba Capital, Argentina',
    // Formato internacional sin "+" ni espacios (54 = Argentina, 9 = móvil).
    // CONFIRMAR con el titular: el área 2966 corresponde a Santa Cruz, no a Córdoba.
    whatsapp: '5492966685460',
    // Ver ubicación (abre Google Maps) y cómo llegar (ruta desde la ubicación del usuario).
    mapsUrl: 'https://maps.app.goo.gl/D6KoRzQW8Js8nGUj7',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-31.4150335,-64.1832367',
    // Coordenadas tomadas de la ficha real "Los Santos Studio" en Google Maps (enlace aportado por el titular). El mapa embebido no requiere clave.
    mapsEmbedUrl: 'https://www.google.com/maps?q=-31.4150335,-64.1832367&z=17&output=embed',
    // Horarios de referencia (se muestran como texto; no se calcula "abierto ahora").
    hours: [
      { days: 'Lunes a sábado', time: '10:00–13:00 y 15:00–20:00' },
      { days: 'Domingo', time: 'Cerrado' }
    ]
  },

  booking: {
    // Sistema de reservas oficial (Google Calendar, página de citas).
    url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2wd41-0TRkDGqtjj21BZ-URZPzu9_tmbaNFisHf1f77wzD5F50uIMV_KjPCvh2pYWoKB6arA_U?gv=true',
    // Segundos de espera antes de mostrar el aviso "no cargó el calendario".
    loadTimeoutSeconds: 12,
    // Endpoint de Apps Script (Code.gs). DEJAR VACÍO hasta desplegarlo y probarlo de punta a punta.
    // Mientras esté vacío, la web no intenta consultarlo. Ver docs/AUTOMATIZACION.md.
    apiUrl: ''
  },

  analytics: {
    // ID de medición de GA4 (ej. 'G-XXXXXXXXXX'). Vacío = no se carga nada y no se registra ningún dato.
    ga4MeasurementId: 'G-NKMN85MRQG'
  },

  /*
   * CATÁLOGO. Para ampliar: copiar un bloque, cambiar `id` (único, sin espacios) y completar los campos.
   *  - price: número en pesos argentinos. Precios actuales = PROVISIONALES (a confirmar por el estudio).
   *  - duration: minutos, SOLO si está confirmada. Con null no se muestra.
   *  - active: false oculta el servicio sin borrarlo.
   *  - category: agrupa visualmente (se muestran las categorías en orden de aparición).
   * El nombre `name` debe coincidir con la clave de LSOS_SERVICES en Code.gs (lo verifica scripts/check.mjs).
   */
  catalog: [
    {
      id: 'corte-autor',
      category: 'Barbería 💈',
      name: 'Corte De Autor 🇦🇷 ✂️',
      description: 'Un corte pensado para tu identidad, tus facciones y el estilo que querés transmitir.',
      price: 23000,
      duration: 40,
      extras: 5,
      depositPercent: 90,
      active: true
    },
    {
      id: 'corte-cejas',
      category: 'Barbería 💈',
      name: 'Atención - Estándar - Corte y Cejas',
      description: 'Corte preciso y cejas prolijas para un look limpio de principio a fin.',
      price: 27000,
      duration: 45,
      extras: 5,
      depositPercent: 90,
      active: true
    },
    {
      id: 'ejecutiva',
      category: 'Barbería 💈',
      name: 'Atención - Ejecutiva - Corte / Cejas / Barba 🏅',
      description: 'Un servicio integral para salir con corte, cejas y barba en sintonía.',
      price: 40000,
      duration: 40,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'deluxe',
      category: 'Barbería 💈',
      name: 'Atención - Deluxe 💎',
      description: 'Una experiencia extendida de atención premium. Consultá qué incluye antes de reservar.',
      price: 70000,
      duration: 100,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'barba-express',
      category: 'Barbería 💈',
      name: 'Arreglo de Barba Express',
      description: 'Mantenimiento y definición de barba en una visita ágil.',
      price: 15000,
      duration: 20,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'ritual-barba',
      category: 'Barbería 💈',
      name: 'Ritual de Barba (Toallas Calientes)',
      description: 'Un ritual de barba con toallas calientes para una experiencia de cuidado superior.',
      price: 18000,
      duration: 25,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'cejas',
      category: 'Barbería 💈',
      name: 'Perfilado y Diseño de Cejas',
      description: 'Diseño y perfilado para equilibrar y definir la expresión del rostro.',
      price: 5000,
      duration: 20,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'facial-deluxe',
      category: 'Tratamientos faciales 💆🏻‍♂️',
      name: 'Limpieza Facial Deluxe',
      description: 'Limpieza facial completa para una piel más cuidada y una apariencia renovada.',
      price: 35000,
      duration: 30,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'facial-express',
      category: 'Tratamientos faciales 💆🏻‍♂️',
      name: 'Limpieza Facial Express',
      description: 'Una puesta a punto de la piel en una sesión breve y enfocada.',
      price: 25000,
      duration: 20,
      extras: 0,
      depositPercent: 90,
      active: true
    },
    {
      id: 'gemas-simples',
      category: 'Gemas dentales 🦷💠',
      name: 'Cristales Simples 💠',
      description: 'Un detalle de brillo sutil para personalizar tu sonrisa.',
      price: 15000,
      duration: 15,
      extras: 3,
      depositPercent: 90,
      active: true
    },
    {
      id: 'gemas-forma',
      category: 'Gemas dentales 🦷💠',
      name: 'Cristales con Forma 💠',
      description: 'Cristales con forma para sumar un detalle distintivo a tu sonrisa.',
      price: 22000,
      duration: 15,
      extras: 2,
      depositPercent: 90,
      active: true
    },
    {
      id: 'gemas-combinaciones',
      category: 'Gemas dentales 🦷💠',
      name: 'Combinaciones de Cristales 💎🎁',
      description: 'Una combinación personalizada de cristales para un resultado con más presencia.',
      price: 30000,
      duration: 20,
      extras: 5,
      depositPercent: 90,
      active: true
    }
  ],
  /*
   * Reseñas en vivo con Google Places API (New).
   * Configurar una clave restringida por HTTP referrer a este dominio y habilitar Places API.
   * La clave no es un secreto en una web estática: restringirla por dominio y cuotas.
   */
  reviews: {
    sourceLabel: 'Google',
    sourceUrl: 'https://maps.app.goo.gl/D6KoRzQW8Js8nGUj7',
    writeUrl: 'https://g.page/r/CVgL9JOnUkAiEAE/review',
    placeId: 'ChIJz1JnvcCjMpQRWAv0k6dSQCI',
    placesApiKey: '',
    rating: 5.0,
    reviewCount: 15,
    // Reseñas que ya estaban publicadas en una versión anterior de la landing.
    // Se conservan como testimonios estáticos mientras no se configure Places API.
    items: [
      { author: 'Luis Ledesma', date: 'Marzo 2026', text: 'Siempre excelente atención. Súper conforme con el servicio.', verified: true },
      { author: 'Facu', date: 'Marzo 2026', text: 'El mejor estudio de Córdoba, muy profesional y buena atención.', verified: true },
      { author: 'Farid', date: 'Marzo 2026', text: 'Excelente atención y servicios, ambiente reconfortante.', verified: true }
    ]
  }
};
