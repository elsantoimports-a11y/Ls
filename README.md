# Los Santos Studio — sitio web

Sitio responsive de captación y solicitud de turnos para Los Santos Studio.

## Qué incluye

- Diseño responsive oscuro con acentos dorados, tipografía Manrope + DM Sans.
- Portada, servicios, experiencia, formulario de solicitud, preguntas frecuentes y ubicación.
- Botones de reserva y enlaces a WhatsApp.
- Servicios/precios de ejemplo precargados.
- Campos para configurar WhatsApp y la futura integración de agenda.

## Antes de publicarlo

Abrí `index.html` y buscá el objeto `CONFIG` al final:

```js
const CONFIG={
  whatsapp:'549351XXXXXXXX',
  apiUrl:'',
  openHours:[['10:00','13:00'],['15:00','20:00']],
  closedWeekday:0,
  slotMinutes:15
};
```

- Reemplazá el ejemplo por el número real de WhatsApp en formato internacional, solo dígitos. No publiques el número de ejemplo.
- Dejá `apiUrl:''` hasta desplegar y probar un backend real de reservas. Con ese campo vacío, el formulario abre WhatsApp para solicitar el turno; **no bloquea ni confirma horarios automáticamente**.
- Revisá precios, duración de servicios, horarios, dirección y textos antes de ponerlo en producción.
- Los precios de la web son editables en las tarjetas de servicios y en el selector del formulario dentro de `index.html`. Actualizá ambos lugares para que coincidan.

## Publicación

Este repositorio no publica la página por sí solo. Para una prueba pública sencilla, se puede habilitar GitHub Pages en **Settings → Pages → Deploy from a branch → main → /(root)**. Para usar el dominio existente, configurar DNS/hosting con quien administra ese dominio.

## Automatización de turnos

No se debe conectar el `Code.gs` anterior directamente sin adaptarlo y probarlo: el código inicial no valida todos los datos y su control de capacidad no evita de forma fiable reservas superpuestas. La automatización real debe validar fecha/hora, duración, horarios, solapamientos y concurrencia; además debe responder claramente si el turno quedó confirmado o solo solicitado.

## Checklist de puesta en marcha

- [ ] Confirmar número de WhatsApp.
- [ ] Confirmar precios y duración real de cada servicio.
- [ ] Probar todos los enlaces y formulario desde móvil.
- [ ] Configurar dominio/hosting.
- [ ] Integrar calendario y verificar que una reserva de prueba aparece correctamente.
- [ ] Configurar y probar confirmación, cancelación y prevención de dobles reservas.
- [ ] Revisar privacidad y consentimiento para los datos del formulario.
