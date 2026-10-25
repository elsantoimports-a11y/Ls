# Asistente IA — Los Santos Studio

## Estado real
- La web pública ya está desplegada.
- El chat visual está en la web, pero **la IA no responde todavía** porque falta desplegar el backend y conectar su URL.
- El modelo configurado es Claude Haiku 5.5 mediante Cloudflare AI. No hace falta poner una clave de Anthropic en el código público.
- La configuración del Worker está preparada en `wrangler.toml`; el código del asistente está en `backend/ai-worker.js`.

## Lo único que falta hacer en Cloudflare
1. Entrá a https://dash.cloudflare.com/ e iniciá sesión o creá una cuenta.
2. Abrí **Workers & Pages** y creá un Worker.
3. Si aparece la opción de conectar un repositorio Git, elegí el repositorio `elsantoimports-a11y/Ls`. Cloudflare debe usar el archivo `wrangler.toml` del repositorio para desplegar el Worker.
4. Si el flujo de Git no está disponible, creá el Worker desde el editor y pegá el contenido de `backend/ai-worker.js`. Después agregá el binding de Workers AI con nombre exacto `AI` y la variable `ALLOWED_ORIGIN` con valor `https://elsantoimports-a11y.github.io`; guardá y desplegá.
5. Copiá la dirección HTTPS que Cloudflare le asignó al Worker. Suele terminar en `.workers.dev`. **Compartime solo esa dirección pública, nunca contraseñas ni tokens.**

## Conectar la web (puedo hacerlo cuando me pases la dirección)
La dirección del Worker se coloca en `assets/js/config.js`, en `ai.endpoint`. Después se publica la web y se prueban preguntas como “¿cuánto sale una limpieza facial?”, “quiero corte y barba” y “quiero reservar”.

## Límites y seguridad
- El asistente responde consultas usando el catálogo y dirige a la agenda oficial o WhatsApp.
- **No crea ni confirma turnos**: la reserva se completa en Google Calendar.
- Los precios del catálogo están marcados como provisionales y deben confirmarse antes de promocionarlos.
- El control de origen no es una protección completa contra abuso. Antes de promocionar el chat, conviene configurar límites de uso y revisar consumo/facturación en Cloudflare.
- El uso de IA puede generar cargos o consumir créditos según el plan y la configuración de Cloudflare.
