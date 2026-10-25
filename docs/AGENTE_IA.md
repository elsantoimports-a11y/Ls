# Asistente IA real — Los Santos Studio

## Estado
- La web ya admite un endpoint de IA en `assets/js/config.js` → `ai.endpoint`.
- El backend está en `backend/ai-worker.js` para Cloudflare Workers.
- **No está activo en producción hasta desplegar el Worker, cargar la clave como secret y configurar la URL.** Si `ai.endpoint` está vacío, el asistente usa su flujo guiado local.

## 1. Crear el backend (Cloudflare Workers)
1. Entrá a Cloudflare Dashboard → Workers & Pages → Create → Worker.
2. Pegá el contenido de `backend/ai-worker.js` en el editor y desplegalo.
3. En Settings → Variables and Secrets, agregá:
   - Secret `OPENAI_API_KEY`: tu clave de API de OpenAI.
   - Variable `ALLOWED_ORIGIN`: `https://elsantoimports-a11y.github.io`.
   - Opcional `OPENAI_MODEL`: `gpt-4o-mini`.
4. Volvé a desplegar después de guardar los secrets. No pegues la clave en GitHub, HTML, JavaScript público ni en el chat.

## 2. Conectar la web
1. Copiá la URL HTTPS del Worker (por ejemplo, la URL `workers.dev` que te asigna Cloudflare).
2. En `assets/js/config.js`, cambiá `ai.endpoint: ''` por esa URL.
3. Guardá el cambio en GitHub. El workflow publicará la web.
4. Probá en la web preguntas como “¿cuánto sale una limpieza facial?”, “quiero corte y barba” y “quiero reservar”. Comprobá que el asistente no afirme que reservó: debe llevar a la agenda oficial.

## Seguridad y límites
- La clave vive únicamente como secret del Worker.
- El Worker limita método, origen, tamaño del cuerpo y longitud del mensaje; devuelve respuestas JSON y no expone errores del proveedor.
- El control por origen reduce llamadas desde otros sitios, pero no es autenticación ni una defensa completa contra abuso/costos. Antes de promocionar el agente públicamente, agregar rate limiting en Cloudflare y monitorear el consumo de la API.
- Este agente conversa y guía a la reserva. **No crea ni confirma turnos**; la agenda oficial sigue siendo Google Calendar.
- Los precios en el catálogo están marcados como provisionales en el repositorio: confirmalos antes de presentar el sitio como tarifa definitiva.
