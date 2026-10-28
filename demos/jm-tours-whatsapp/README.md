# Simulador WhatsApp · JM Tours del Quindío

Demo para que el cliente chatee con el agente de IA desde cualquier navegador, sin cuenta de Claude. La página muestra el chat a la izquierda y, a la derecha, cómo se mueve la oportunidad en el pipeline de GoHighLevel.

- `index.html`: la página (chat, pipeline, demo guiada y tarifario editable).
- `lib/agent.js`: el agente. Llama a Claude con la clave guardada en el servidor; la clave nunca llega al navegador.
- `netlify/functions/chat.mjs` y `api/chat.js`: la entrada para Netlify y para Vercel. Sirve cualquiera de los dos.

## Publicarlo en Netlify (unos 10 minutos)

1. Crea una clave en https://console.anthropic.com → API Keys. Carga saldo y pon un límite de gasto mensual.
2. En https://app.netlify.com → **Add new site → Import an existing project** → GitHub → `n8n_sevamo`.
3. **Branch to deploy:** `claude/whatsapp-automation-agent-jctnmn`. **Base directory:** `demos/jm-tours-whatsapp`. Deja vacío el build command; `netlify.toml` ya dice qué publicar.
4. En **Environment variables** agrega `ANTHROPIC_API_KEY` y `DEMO_CODE` (y `CLAUDE_MODEL` si quieres otro modelo).
5. **Deploy**. Te queda un enlace tipo `jm-tours-demo.netlify.app`.

## Publicarlo en Vercel (unos 10 minutos)

1. Crea una clave en https://console.anthropic.com → API Keys. Carga saldo y pon un límite de gasto mensual (por ejemplo 20 USD).
2. Entra a https://vercel.com con tu cuenta de GitHub → **Add New → Project** → importa `n8n_sevamo`.
3. En **Root Directory** elige `demos/jm-tours-whatsapp`. Framework: **Other**.
4. En **Environment Variables** agrega:
   - `ANTHROPIC_API_KEY`: la clave del paso 1.
   - `DEMO_CODE`: un código que le darás al cliente (por ejemplo `cocora2026`). Sin código, cualquiera con el enlace gasta tu saldo.
   - `CLAUDE_MODEL` (opcional): por defecto `claude-opus-5-5`.
5. **Deploy**. Te queda un enlace tipo `jm-tours-whatsapp.vercel.app`.
6. Envíale al cliente el enlace y el código. La primera vez que escriba, la página le pide el código.

## Límites incluidos

- Código de acceso (`DEMO_CODE`).
- Máximo 40 mensajes por conversación y 600 caracteres por mensaje.
- Si Claude rechaza un mensaje, el servidor reintenta con el modelo de respaldo (`fallbacks: "default"`).

## Cambiar precios

Los precios del tarifario son de ejemplo. Edítalos en `DEFAULT_TARIFARIO` dentro de `index.html` y vuelve a publicar (Vercel publica solo al hacer push).
