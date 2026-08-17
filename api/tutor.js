/* Función privada de Vercel para el Tutor IA de UniPrep. Nunca expongas OPENAI_API_KEY en el navegador. */
const ventanas = new Map();

function responder(res, estado, cuerpo) {
  res.status(estado).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.json(cuerpo);
}

async function verificarUsuario(authorization) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_CONFIG");
  if (!authorization?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const respuesta = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {Authorization:authorization, apikey:key}
  });
  if (!respuesta.ok) throw new Error("AUTH_INVALID");
  const usuario = await respuesta.json();
  if (!usuario?.id) throw new Error("AUTH_INVALID");
  return usuario;
}

function permitirSolicitud(userId) {
  const ahora = Date.now();
  const periodo = 10 * 60 * 1000;
  const limite = 20;
  const actual = ventanas.get(userId);
  if (!actual || ahora - actual.inicio > periodo) {
    ventanas.set(userId, {inicio:ahora, cantidad:1});
    return true;
  }
  if (actual.cantidad >= limite) return false;
  actual.cantidad += 1;
  return true;
}

function extraerTexto(datos) {
  if (typeof datos?.output_text === "string") return datos.output_text.trim();
  return (datos?.output || []).flatMap(item=>item?.content || []).map(item=>item?.text || "").join("\n").trim();
}

module.exports = async function tutorHandler(req, res) {
  if (req.method !== "POST") return responder(res, 405, {code:"METHOD_NOT_ALLOWED", message:"Usa POST."});
  if (!process.env.OPENAI_API_KEY) return responder(res, 503, {code:"AI_NOT_CONFIGURED", message:"El Tutor IA todavía no está activado."});

  let usuario;
  try {
    usuario = await verificarUsuario(req.headers.authorization);
  } catch (error) {
    const configuracion = error.message === "SUPABASE_CONFIG";
    return responder(res, configuracion ? 503 : 401, {code:error.message, message:configuracion?"Falta configurar Supabase en Vercel.":"Inicia sesión para usar el Tutor IA."});
  }
  if (!permitirSolicitud(usuario.id)) return responder(res, 429, {code:"RATE_LIMIT", message:"Llegaste al límite temporal. Continúa con la guía local y vuelve a intentarlo luego."});

  let cuerpo;
  try {
    cuerpo = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (_) {
    return responder(res, 400, {code:"INVALID_JSON", message:"La solicitud no contiene un JSON válido."});
  }
  const curso = String(cuerpo.curso || "Curso preuniversitario").slice(0,120);
  const tema = String(cuerpo.tema || "Tema general").slice(0,180);
  const pregunta = String(cuerpo.pregunta || "").trim().slice(0,1800);
  if (pregunta.length < 4) return responder(res, 400, {code:"INVALID_QUESTION", message:"Escribe una pregunta más completa."});

  const instrucciones = `Eres el Tutor académico de UniPrep para estudiantes preuniversitarios del Perú. Responde siempre en español claro. Curso: ${curso}. Tema: ${tema}. Enseña el procedimiento y el porqué, no solo el resultado. Si es un ejercicio, comienza identificando datos y estrategia, desarrolla pasos verificables y termina con una comprobación o mini pregunta. No inventes fuentes, fórmulas ni datos. Si falta información, dilo. Mantén la respuesta por debajo de 550 palabras.`;

  try {
    const respuesta = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL || "gpt-5.6-luna",
        instructions:instrucciones,
        input:pregunta,
        max_output_tokens:900
      })
    });
    const datos = await respuesta.json().catch(()=>({}));
    if (!respuesta.ok) {
      console.error("OpenAI API error:", respuesta.status, datos?.error?.code || datos?.error?.message || "unknown");
      return responder(res, 502, {code:"AI_PROVIDER_ERROR", message:"El Tutor IA no respondió. Usa la guía local por ahora."});
    }
    const answer = extraerTexto(datos);
    if (!answer) return responder(res, 502, {code:"EMPTY_RESPONSE", message:"La IA devolvió una respuesta vacía."});
    return responder(res, 200, {answer, model:process.env.OPENAI_MODEL || "gpt-5.6-luna", usage:datos.usage || null});
  } catch (error) {
    console.error("Tutor IA error:", error?.message || error);
    return responder(res, 502, {code:"AI_UNAVAILABLE", message:"No se pudo conectar con la IA. La guía local continúa disponible."});
  }
};
