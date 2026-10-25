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
      id: 'corte',
      category: 'Barbería',
      name: 'Corte de cabello',
      description: 'Diseño y terminación precisa, adaptados a tus facciones y a tu estilo.',
      price: 22000,
      duration: null,
      active: true
    },
    {
      id: 'corte-barba',
      category: 'Barbería',
      name: 'Corte + barba',
      description: 'Corte, barba y detalles del rostro en una sola visita.',
      price: 30000,
      duration: null,
      active: true
    },
    {
      id: 'facial-express',
      category: 'Cuidado facial',
      name: 'Limpieza facial express',
      description: 'Una pausa de cuidado para limpiar la piel y recuperar una apariencia fresca.',
      price: 15000,
      duration: null,
      active: true
    },
    {
      id: 'facial-deluxe',
      category: 'Cuidado facial',
      name: 'Limpieza facial deluxe',
      description: 'Un protocolo más completo, adaptado a tu tipo de piel.',
      price: 27000,
      duration: null,
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
    items: []
  }
};
