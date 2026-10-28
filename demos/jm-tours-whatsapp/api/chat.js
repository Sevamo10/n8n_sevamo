import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const MAX_TURNS = 40;
const MAX_CHARS = 600;
const MAX_TARIFARIO = 4000;

const RULES = `Eres Sofía, asistente virtual de JM Tours del Quindío en WhatsApp. Atiendes turistas que quieren conocer el Eje Cafetero. Tu meta: que reserven pagando el anticipo, con trato cálido y sin presión.
Estilo: mensajes cortos (máximo 3 líneas cada uno), una sola pregunta por mensaje, tono cálido del Quindío, máximo 1 emoji en toda la respuesta, responde en el idioma del cliente (español o inglés).
Cómo vender: 1) si el primer mensaje trae un código REF-, habla de ese tour; 2) recoge, uno a la vez: fecha, adultos, niños y edades, dónde se hospedan; 3) recomienda 1 tour (máximo 2 opciones); 4) da el precio total con lo que incluye, usando SOLO el tarifario, y escribe el total en una línea propia: "Total: $[valor] COP"; 5) pregunta si quieren asegurar el cupo; si sí, envía este link de pago de ejemplo: pagos.ejemplo/jmtours y pide el comprobante por el chat.
Objeciones: si dicen que está caro, recuerda lo que incluye y ofrece la opción más económica; nunca des descuentos.
Nunca inventes precios, horarios ni políticas que no estén en el tarifario; nunca prometas cupos; nunca confirmes pagos.
pasar_a_humano es false por defecto. Solo es true si: grupo de 8 o más o empresa, piden descuento, cambio o reembolso, hay queja, envían comprobante, o piden hablar con una persona. En ese caso tu único mensaje es: "Te comunico con Laura, nuestra asesora, que te ayuda en unos minutos." Preguntar precios, fechas, horarios o pedir el link de pago NO es motivo para pasar a un asesor.
Campos: llena solo lo que el cliente dijo; deja "" si no se sabe. total_cop es el total en pesos como número entero cuando diste un Total, si no 0. etapa es "Calificado" cuando ya se sabe fecha y adultos, "Cotizado" cuando diste el Total, si no "Nuevo".`;

const text = { type: "string" };
const SCHEMA = {
  type: "object",
  properties: {
    mensajes: { type: "array", items: text },
    campos: {
      type: "object",
      properties: {
        nombre: text, tour: text, fecha: text, adultos: text, ninos: text,
        hospedaje: text, total_cop: { type: "integer" }, idioma: text,
      },
      required: ["nombre", "tour", "fecha", "adultos", "ninos", "hospedaje", "total_cop", "idioma"],
      additionalProperties: false,
    },
    etapa: { type: "string", enum: ["Nuevo", "Calificado", "Cotizado"] },
    pasar_a_humano: { type: "boolean" },
    motivo: text,
  },
  required: ["mensajes", "campos", "etapa", "pasar_a_humano", "motivo"],
  additionalProperties: false,
};

const WHO = { cliente: "Cliente", bot: "Sofía", asesor: "Laura (asesora)" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST." });

  const code = process.env.DEMO_CODE;
  if (code && req.headers["x-demo-code"] !== code) {
    return res.status(401).json({ error: "codigo" });
  }

  const { history, fields, stage, tarifario } = req.body || {};
  if (!Array.isArray(history) || !history.length) return res.status(400).json({ error: "Falta la conversación." });
  if (history.length > MAX_TURNS) return res.status(429).json({ error: "limite" });

  const transcript = history
    .filter(m => WHO[m && m.who])
    .map(m => `${WHO[m.who]}: ${String(m.text || "").slice(0, MAX_CHARS)}`)
    .join("\n");

  const prompt = `TARIFARIO (único dato válido de precios):
${String(tarifario || "").slice(0, MAX_TARIFARIO)}

DATOS YA GUARDADOS EN EL CRM: ${JSON.stringify(fields || {}).slice(0, 1000)}
ETAPA ACTUAL: ${String(stage || "ninguna").slice(0, 40)}

CONVERSACIÓN HASTA AHORA:
${transcript}

Escribe la siguiente respuesta de Sofía (1 a 3 mensajes cortos de WhatsApp) y los datos para el CRM.`;

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: RULES,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") return res.status(422).json({ error: "rechazo" });
    const block = response.content.find(b => b.type === "text");
    if (!block) return res.status(502).json({ error: "vacio" });
    return res.status(200).json(JSON.parse(block.text));
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "ocupado" });
    if (error instanceof Anthropic.AuthenticationError) return res.status(500).json({ error: "clave" });
    if (error instanceof SyntaxError) return res.status(502).json({ error: "formato" });
    console.error(error);
    return res.status(502).json({ error: "servicio" });
  }
}
