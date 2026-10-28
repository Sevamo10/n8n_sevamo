# Simulador WhatsApp · JM Tours del Quindío

Demo para que el cliente chatee con el agente de IA desde cualquier navegador, sin cuenta de Claude. La página muestra el chat a la izquierda y, a la derecha, cómo se mueve la oportunidad en el pipeline de GoHighLevel.

- `index.html`: la página (chat, pipeline, demo guiada y tarifario editable).
- `api/chat.js`: función de servidor que llama a Claude con la clave guardada en Vercel. La clave nunca llega al navegador.

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
