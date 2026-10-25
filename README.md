# Los Santos Studio — sitio web y agenda

Web responsive de captación para Los Santos Studio. El sitio y el backend de agenda se mantienen separados hasta terminar pruebas de extremo a extremo.

## Sitio web

- Diseño responsive oscuro con acentos dorados, tipografía Manrope + DM Sans.
- Secciones comerciales, servicios, formulario de solicitud, preguntas frecuentes y ubicación.
- WhatsApp configurado en `index.html` con el número proporcionado por el titular: `5492966685460`. Confirmar que el prefijo internacional/área corresponda antes de anunciar la web.
- Catálogo ampliable: editar el arreglo `CATALOG` en el JavaScript al final de `index.html`. Cada servicio tiene `id`, `category`, `name`, `description`, `price`, `duration` y `active`. Para ocultar un servicio, usar `active:false`.
- Actualizar precios y duración en `CATALOG` y en el backend `Code.gs` para que coincidan.
- El formulario actual genera una solicitud por WhatsApp; no confirma disponibilidad ni crea por sí mismo un evento de Google Calendar.

## Backend Google Calendar

`Code.gs` contiene una primera versión del backend para consultar horarios disponibles y registrar solicitudes en Google Calendar. Incluye validación de fecha, servicio, duración, horario de atención, eventos solapados y un bloqueo para reducir el riesgo de dos reservas simultáneas.

Antes de conectarlo a la web:

1. Abrir [Google Apps Script](https://script.google.com/) con la cuenta que administrará la agenda y crear un proyecto nuevo.
2. Copiar el contenido de `Code.gs` al editor. Si se usa un calendario dedicado, completar `CALENDAR_ID`; si queda vacío, se usa el calendario principal de esa cuenta.
3. Revisar zona horaria, horarios, duración y precios del objeto `LSOS_SERVICES`.
4. Ejecutar funciones de prueba con la cuenta propietaria y conceder los permisos solicitados por Google.
5. Ir a **Implementar → Nueva implementación → Aplicación web**. Ejecutar como la cuenta propietaria y definir acceso según la configuración permitida en esa cuenta.
6. Copiar la URL de producción terminada en `/exec`. No usar la URL `/dev` para clientes.
7. Probar en un calendario de prueba: consultar horarios, crear un evento ocupado, confirmar que el horario desaparece, registrar una solicitud, intentar duplicarla y comprobar el resultado.

**No pegar la URL de Apps Script en `CONFIG.apiUrl` todavía.** El formulario del sitio aún no tiene una integración cross-origin probada para leer respuestas seguras de ese endpoint. Hasta completar ese paso, el flujo de cara al cliente sigue siendo WhatsApp y el turno debe confirmarse manualmente.

El backend crea eventos con estado descrito como “pendiente de confirmación”; no envía por sí solo mensajes de confirmación, recordatorios ni cancelaciones. Esas automatizaciones requieren implementarse y probarse por separado. No hay una API de WhatsApp conectada.

## Publicación

El workflow `.github/workflows/pages.yml` prepara un despliegue con GitHub Pages. El repositorio no confirma por sí solo que Pages esté habilitado o que exista una URL publicada. Revisar **Settings → Pages** y la pestaña **Actions** del repositorio. Para conectar el dominio existente, coordinar DNS/hosting con quien lo administra.

## Antes de producción

- [ ] Confirmar el número de WhatsApp y hacer una prueba desde otro teléfono.
- [ ] Confirmar precios, horarios y duración de cada servicio.
- [ ] Configurar y verificar la publicación pública.
- [ ] Desplegar Apps Script y probar en un calendario de prueba.
- [ ] Implementar y probar la integración web ↔ agenda; no afirmar que una reserva quedó confirmada hasta leer un resultado verificable.
- [ ] Añadir política de privacidad/consentimiento adecuada para datos de contacto.
- [ ] Definir reglas para cancelaciones, ausencias y reprogramaciones.
- [ ] Considerar limitación de abuso/spam y validación adicional antes de abrir el endpoint públicamente.
