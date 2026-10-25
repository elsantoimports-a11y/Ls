# Catálogo, medición y automatización — estado real

Última revisión: 2026-10-25. Nada de lo marcado "pendiente" está conectado ni probado.

## Qué funciona hoy (verificado en navegador local)
| Función | Estado |
|---|---|
| Catálogo editable (`assets/js/config.js`) | Funciona. Precios actuales **provisionales**. |
| Elegir servicio → resumen en la sección de reserva y mensaje de WhatsApp con el servicio | Funciona. |
| Calendario Google embebido (escritorio) / apertura del flujo oficial (móvil) | El enlace y el iframe están implementados; la disponibilidad real depende de Google y **no se pudo probar desde el entorno de desarrollo** (sin acceso a internet general). Probar en producción. |
| Aviso si el calendario no carga (12 s) + alternativa WhatsApp | Implementado (detección best-effort: un iframe de otro dominio no permite saber si hubo error). |
| Servicio elegido → Google Calendar | **No se transmite.** La página de citas de Google no acepta parámetros de servicio. Se avisa al usuario. |
| Mapa y "Cómo llegar" (Google Maps) | Implementado: mapa embebido por dirección (sin clave) y ruta con la API de URLs de Maps. Marca la dirección escrita, no la ficha del negocio. No probado contra Google desde el entorno de desarrollo. |
| Reseñas | Cargadas pero **ocultas** (`verified:false`). Ver más abajo. |

## Ampliar el catálogo
1. Copiar un bloque de `catalog` en `config.js`, nuevo `id`, `category`, `name`, `description`, `price`.
2. `duration`: solo si está confirmada; si no, `null`.
3. Si se usará el backend, agregar el mismo `name` y `price` en `LSOS_SERVICES` de `Code.gs`.
4. Ejecutar `node scripts/check.mjs` (también corre en cada despliegue y lo frena si hay incoherencias).

## Medición (GA4)
Eventos preparados: `cta_reservar`, `cta_servicios`, `select_service`, `open_calendar`, `calendar_loaded`, `whatsapp_click`, `directions_click`.
Eventos adicionales: `maps_open`.
**Estado:** el ID `G-NKMN85MRQG` está cargado en `analytics.ga4MeasurementId` (2026-10-25) y el despliegue terminó en éxito. **Falta confirmar en GA4 > Informes > Tiempo real** que llegan visitas y eventos. Vacío el campo = no se carga nada. Con `?lsdebug=1` los eventos se ven en la consola.
**No medibles hoy:** inicio del flujo dentro del calendario y confirmación real (ocurren dentro de Google). Revisar consentimiento/política de privacidad antes de activar GA4.

## Automatización (pendiente, requiere decisiones del titular)
- `Code.gs` (Apps Script): consulta horarios y crea eventos "pendientes". **No está desplegado ni probado** y `booking.apiUrl` está vacío a propósito. Además sus duraciones (45/60/40/60 min) no están confirmadas.
- Integrar web ↔ Apps Script exige resolver CORS/lectura segura de respuestas, anti-spam y política de datos; hoy el sistema oficial de reservas es Google Calendar.
- Confirmaciones/recordatorios por WhatsApp requieren la API oficial de WhatsApp Business (no conectada).
- Pasos de despliegue de Apps Script: ver README.

## Reseñas
Reseñas "en vivo" desde Google requieren clave de Google Places API (con facturación) y el Place ID, y devuelven máximo 5; alternativa: widget de terceros. No implementado.

Para mostrar una: confirmar que es pública y real, completar `reviews.sourceUrl` con el enlace a su plataforma, y poner `verified: true`.
