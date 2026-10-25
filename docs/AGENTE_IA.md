# Asistente IA — Los Santos Studio (Cloudflare Workers AI)

## Estado
- La web admite un endpoint configurable en `assets/js/config.js` → `ai.endpoint`.
- El backend está en `backend/ai-worker.js` y usa el binding `env.AI` de Cloudflare Workers AI.
- **No está activo en producción hasta crear/desplegar el Worker y poner su URL en `ai.endpoint`.** Si está vacío, la web usa el flujo guiado local.
- Esta variante no requiere una clave de OpenAI: usa el servicio Workers AI de Cloudflare y queda sujeta a la disponibilidad, límites y facturación de tu cuenta.

## 1. Crear el Worker
1. En Cloudflare Dashboard, entrá a **Workers & Pages** y creá un Worker.
2. Pegá el contenido de `backend/ai-worker.js` y desplegalo.
3. En la configuración del Worker, agregá el binding de **Workers AI** con el nombre exacto `AI`. El código lo consume como `env.AI`.
4. Agregá la variable de entorno `ALLOWED_ORIGIN` con el valor `https://elsantoimports-a11y.github.io`.
5. Guardá y desplegá de nuevo. No agregues claves de API a los archivos públicos.

## 2. Conectar la web
1. Copiá la URL HTTPS del Worker que te asignó Cloudflare (por ejemplo, una URL `workers.dev`).
2. En `assets/js/config.js`, cambiá `ai.endpoint: ''` por esa URL.
3. Guardá el cambio en GitHub y esperá a que termine correctamente el workflow de Pages.
4. Probá en la web preguntas como “¿cuánto sale una limpieza facial?”, “quiero corte y barba” y “quiero reservar”. Verificá que el agente lleve a la agenda oficial y nunca diga que el turno quedó confirmado.

## Seguridad y límites
- El Worker solo acepta peticiones desde el origen configurado, limita método, tamaño de solicitud y longitud del mensaje, y no expone detalles internos de errores.
- La validación de origen ayuda a limitar llamadas casuales desde otros sitios, pero no es autenticación ni protección completa contra abuso/costos. Antes de promocionar el agente, configurá rate limiting y monitoreá el uso en Cloudflare.
- El asistente conversa y guía a la reserva. **No crea ni confirma turnos**; la agenda oficial sigue siendo Google Calendar.
- Los precios del catálogo están marcados como provisionales en el repositorio. Confirmalos antes de tratarlos como tarifas definitivas.
