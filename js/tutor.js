(function () {
  "use strict";

  const CLAVES = {
    historial: "uniprep_tutor_history_v1",
    notas: "uniprep_course_notes_v1",
    curso: "uniprep_tutor_course_v1"
  };
  const estado = {
    cursoId: window.uniprepStorage?.leerTexto(CLAVES.curso, "rm") || "rm",
    temaIndice: 0,
    mensajes: leer(CLAVES.historial, []),
    usuario: null,
    enviando: false,
    segundos: 25 * 60,
    temporizador: null,
    contextoPendiente: null
  };

  function leer(clave, respaldo) {
    return window.uniprepStorage?.leer(clave, respaldo) ?? respaldo;
  }

  function guardar(clave, dato) {
    window.uniprepStorage?.guardar(clave, dato);
  }

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function cursos() {
    return Object.values(window.CURSOS_PREUNI || {})
      .filter(curso => window.cursoPermitidoAdmision?.(curso.id) !== false)
      .sort((a,b) => (Number(window.pesoCursoAdmision?.(b.id)) || 0) - (Number(window.pesoCursoAdmision?.(a.id)) || 0));
  }

  function cursoActual() {
    return window.CURSOS_PREUNI?.[estado.cursoId] || cursos()[0] || {
      id: "rm", nombre: "Razonamiento Matemático", icono: "🧠", temas: [], descripcion: "Preparación preuniversitaria"
    };
  }

  function temaActual() {
    const curso = cursoActual();
    return curso.temas?.[estado.temaIndice] || curso.temas?.[0] || {
      titulo: "Tema general", descripcion: curso.descripcion, puntos: []
    };
  }

  async function obtenerUsuario() {
    if (typeof window.obtenerUsuarioActivo !== "function") return null;
    try { return await window.obtenerUsuarioActivo(); } catch (_) { return null; }
  }

  async function abrirTutorAcademico(elemento) {
    window.go?.("tutor", elemento || null);
    await renderizarTutor();
  }

  async function renderizarTutor() {
    const raiz = document.getElementById("tutor-academic-root");
    if (!raiz) return;
    estado.usuario = await obtenerUsuario();
    if (!cursos().some(curso => curso.id === estado.cursoId)) estado.cursoId = cursos()[0]?.id || "rm";
    const curso = cursoActual();
    const foco = cursoPrioritario(estado.usuario);

    raiz.innerHTML = `<section class="tutor-head"><div><small>ACOMPAÑAMIENTO PERSONAL</small><h1>Tu espacio para entender, no memorizar.</h1><p>Pide una pista, revisa un concepto, organiza tus apuntes y activa sesiones de concentración. Si el servicio de IA está configurado, recibirás explicaciones generadas para tu curso y tema.</p></div><div class="tutor-head-status"><span>🧠</span><b>Tutor académico</b><em id="tutor-service-status">Guía local disponible</em></div></section>
      <div class="tutor-layout"><section class="tutor-chat"><div class="tutor-context"><label>Curso<select id="tutor-course-select" onchange="cambiarCursoTutor(this.value)">${cursos().map(item=>`<option value="${item.id}"${item.id===curso.id?" selected":""}>${item.icono} ${esc(item.nombre)}</option>`).join("")}</select></label><label>Tema<select id="tutor-topic-select" onchange="cambiarTemaTutor(this.value)">${opcionesTemas(curso)}</select></label></div>
      <div class="tutor-quick-actions"><button type="button" onclick="usarAccionTutor('explica')">Explícame paso a paso</button><button type="button" onclick="usarAccionTutor('pista')">Dame una pista</button><button type="button" onclick="usarAccionTutor('ejemplo')">Crea un ejemplo</button><button type="button" onclick="usarAccionTutor('plan')">Plan para dominarlo</button><button type="button" onclick="limpiarTutor()">Limpiar conversación</button></div>
      <div class="tutor-messages" id="tutor-messages">${renderizarMensajes()}</div>
      <form class="tutor-compose" onsubmit="enviarPreguntaTutor(event)"><textarea id="tutor-question" maxlength="1800" placeholder="Escribe tu duda. Ejemplo: ¿por qué al factorizar cambia el signo?"></textarea><button id="tutor-send-btn" type="submit">Preguntar</button><small class="tutor-compose-note">Las respuestas sirven para estudiar y deben contrastarse con tu material académico.</small></form></section>
      <aside class="tutor-side"><section class="tutor-tool tutor-focus"><div class="tutor-tool-head"><span>ENFOQUE DE HOY</span><button type="button" onclick="actualizarFocoTutor()">Actualizar</button></div><div id="tutor-focus-content">${renderizarFoco(foco)}</div></section>
      <section class="tutor-tool tutor-pomodoro"><div class="tutor-tool-head"><span>CONCENTRACIÓN</span><small>25 / 5</small></div><div class="tutor-timer" id="tutor-timer">${formatearTiempo(estado.segundos)}</div><div class="tutor-timer-label" id="tutor-timer-label">Sesión de estudio</div><div class="tutor-timer-actions"><button class="primary" id="tutor-timer-toggle" type="button" onclick="alternarTemporizadorTutor()">Iniciar</button><button type="button" onclick="reiniciarTemporizadorTutor()">Reiniciar</button></div></section>
      <section class="tutor-tool tutor-notes"><div class="tutor-tool-head"><span>MIS APUNTES</span><small id="tutor-notes-course">${esc(curso.nombre)}</small></div><textarea id="tutor-notes" maxlength="5000" placeholder="Escribe fórmulas, reglas o dudas de este curso…">${esc(notaCurso(curso.id))}</textarea><button type="button" onclick="guardarNotaTutor()">Guardar apuntes</button><div class="tutor-note-status" id="tutor-note-status"></div></section>
      <div class="tutor-privacy"><b>Privacidad:</b> la clave de IA nunca se guarda en el navegador. UniPrep utiliza una función privada del servidor y la sesión de Supabase.</div></aside></div>`;

    if (estado.contextoPendiente) aplicarContextoPendiente();
    desplazarMensajes();
  }

  function opcionesTemas(curso) {
    return (curso.temas || []).map((tema, indice)=>`<option value="${indice}"${indice===estado.temaIndice?" selected":""}>${esc(tema.titulo)}</option>`).join("");
  }

  function renderizarMensajes() {
    if (!estado.mensajes.length) return '<div class="tutor-empty"><span>💡</span><b>¿Qué necesitas entender hoy?</b><p>Selecciona un curso y un tema. Puedes pedir una explicación, una pista, un ejemplo o un plan corto de estudio.</p></div>';
    return estado.mensajes.map(mensaje=>`<article class="tutor-message ${mensaje.rol}"><small>${mensaje.rol==="user"?"TÚ":mensaje.rol==="ai"?"TUTOR IA":"GUÍA ACADÉMICA LOCAL"}</small>${esc(mensaje.texto)}</article>`).join("");
  }

  function cursoPrioritario(usuario) {
    const lista = cursos();
    if (!lista.length) return cursoActual();
    return [...lista].sort((a,b)=>{
      const riesgoA=(Number(window.pesoCursoAdmision?.(a.id))||1)*(100-(Number(usuario?.progreso?.[a.id])||0));
      const riesgoB=(Number(window.pesoCursoAdmision?.(b.id))||1)*(100-(Number(usuario?.progreso?.[b.id])||0));
      return riesgoB-riesgoA;
    })[0];
  }

  function renderizarFoco(curso) {
    const progreso = Math.round(Number(estado.usuario?.progreso?.[curso.id]) || 0);
    const fila = estado.usuario?.progresoDetallado?.find(item=>item.course_id===curso.id);
    const respuestas = Number(fila?.total_answers) || 0;
    const precision = respuestas ? Math.round((Number(fila?.correct_answers)||0)/respuestas*100) : 0;
    const indice = Math.min(Number(fila?.last_topic_index)||0, Math.max(0,(curso.temas?.length||1)-1));
    const tema = curso.temas?.[indice] || curso.temas?.[0];
    return `<h3>${curso.icono} ${esc(curso.nombre)}</h3><p>${esc(tema?.titulo || curso.descripcion)} es tu siguiente oportunidad de avance.</p><div class="tutor-focus-meta"><span><b>${progreso}%</b>cobertura</span><span><b>${precision}%</b>precisión</span></div><button type="button" onclick="iniciarPracticaCursoNivel('${curso.id}','todos',10)">Practicar 10 preguntas →</button>`;
  }

  async function actualizarFocoTutor() {
    estado.usuario = await obtenerUsuario();
    const contenedor = document.getElementById("tutor-focus-content");
    if (contenedor) contenedor.innerHTML = renderizarFoco(cursoPrioritario(estado.usuario));
  }

  function cambiarCursoTutor(id) {
    if (!cursos().some(curso => curso.id === id)) return;
    estado.cursoId = id;
    estado.temaIndice = 0;
    window.uniprepStorage?.guardarTexto(CLAVES.curso, id);
    const selector = document.getElementById("tutor-topic-select");
    if (selector) selector.innerHTML = opcionesTemas(cursoActual());
    const notas = document.getElementById("tutor-notes");
    if (notas) notas.value = notaCurso(id);
    const etiqueta = document.getElementById("tutor-notes-course");
    if (etiqueta) etiqueta.textContent = cursoActual().nombre;
  }

  function cambiarTemaTutor(valor) {
    estado.temaIndice = Math.max(0, Number(valor) || 0);
  }

  function usarAccionTutor(tipo) {
    const tema = temaActual().titulo;
    const textos = {
      explica:`Explícame ${tema} paso a paso y señala los errores más comunes.`,
      pista:`Dame una pista para empezar un ejercicio de ${tema}, sin revelar todo de inmediato.`,
      ejemplo:`Crea un ejemplo preuniversitario de ${tema} y resuélvelo de forma ordenada.`,
      plan:`Hazme un plan corto para dominar ${tema} y luego practicarlo.`
    };
    const campo = document.getElementById("tutor-question");
    if (campo) { campo.value = textos[tipo] || ""; campo.focus(); }
  }

  async function enviarPreguntaTutor(evento) {
    evento?.preventDefault?.();
    if (estado.enviando) return;
    const campo = document.getElementById("tutor-question");
    const pregunta = (campo?.value || "").trim();
    if (pregunta.length < 4) return;
    agregarMensaje("user", pregunta);
    if (campo) campo.value = "";
    estado.enviando = true;
    actualizarEstadoEnvio(true);

    try {
      const respuesta = await consultarTutorIA(pregunta);
      agregarMensaje("ai", respuesta);
      cambiarEstadoServicio("IA conectada", true);
    } catch (error) {
      agregarMensaje("guide", respuestaLocal(pregunta));
      cambiarEstadoServicio(error?.message === "SIN_SESION" ? "Inicia sesión para usar IA" : "Guía local activa", false);
    } finally {
      estado.enviando = false;
      actualizarEstadoEnvio(false);
    }
  }

  async function consultarTutorIA(pregunta) {
    const sesion = await window.supabaseClient?.auth?.getSession?.();
    const token = sesion?.data?.session?.access_token;
    if (!token) throw new Error("SIN_SESION");
    const controlador = new AbortController();
    const limite = setTimeout(()=>controlador.abort(), 30000);
    try {
      const respuesta = await fetch("/api/tutor", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body:JSON.stringify({curso:cursoActual().nombre,tema:temaActual().titulo,pregunta}),
        signal:controlador.signal
      });
      const datos = await respuesta.json().catch(()=>({}));
      if (!respuesta.ok || !datos.answer) throw new Error(datos.code || "IA_NO_CONFIGURADA");
      return datos.answer;
    } finally {
      clearTimeout(limite);
    }
  }

  function respuestaLocal(pregunta) {
    const curso = cursoActual();
    const tema = temaActual();
    const base = tema.descripcion || curso.descripcion || "Revisa los conceptos esenciales y aplica el procedimiento con orden.";
    if (/pista|empezar|inicio/i.test(pregunta)) return `Pista para ${tema.titulo}: identifica primero qué datos entrega el problema y qué te pide. Luego relaciona esos datos con una propiedad básica del tema. No reemplaces valores hasta escribir la relación principal.`;
    if (/plan|dominar|estudiar/i.test(pregunta)) return `Plan corto para ${tema.titulo}:\n1. Repasa los conceptos esenciales durante 15 minutos.\n2. Escribe una regla o fórmula con tus propias palabras.\n3. Resuelve 5 preguntas básicas del mismo curso.\n4. Corrige los errores y explica por qué fallaste.\n5. Termina con 5 preguntas intermedias.\nBase del tema: ${base}`;
    if (/ejemplo/i.test(pregunta)) return `Para construir un ejemplo de ${tema.titulo}, parte de un caso sencillo, identifica los datos, aplica una sola propiedad y comprueba el resultado. Después cambia un dato y observa qué parte del procedimiento se modifica. Base conceptual: ${base}`;
    return `${tema.titulo} pertenece a ${curso.nombre}. ${base}\n\nRuta recomendada: define el concepto central, identifica los datos, elige la propiedad adecuada, desarrolla cada paso y comprueba el resultado. Si compartes el ejercicio completo, el Tutor IA podrá darte una explicación personalizada cuando el servicio esté activado.`;
  }

  function agregarMensaje(rol, texto) {
    estado.mensajes.push({rol,texto:String(texto).slice(0,6000),fecha:new Date().toISOString(),cursoId:estado.cursoId,tema:temaActual().titulo});
    estado.mensajes = estado.mensajes.slice(-24);
    guardar(CLAVES.historial, estado.mensajes);
    const contenedor = document.getElementById("tutor-messages");
    if (contenedor) contenedor.innerHTML = renderizarMensajes();
    desplazarMensajes();
  }

  function actualizarEstadoEnvio(cargando) {
    const boton = document.getElementById("tutor-send-btn");
    if (boton) { boton.disabled = cargando; boton.textContent = cargando ? "Pensando…" : "Preguntar"; }
    const contenedor = document.getElementById("tutor-messages");
    if (cargando && contenedor) contenedor.insertAdjacentHTML("beforeend",'<div class="tutor-writing" id="tutor-writing"><i></i>Preparando una explicación…</div>');
    else document.getElementById("tutor-writing")?.remove();
    desplazarMensajes();
  }

  function cambiarEstadoServicio(texto, activo) {
    const estadoServicio = document.getElementById("tutor-service-status");
    if (estadoServicio) { estadoServicio.textContent = texto; estadoServicio.style.color = activo ? "var(--green)" : ""; }
  }

  function limpiarTutor() {
    if (estado.mensajes.length && !window.confirm("¿Limpiar la conversación del tutor?")) return;
    estado.mensajes = [];
    guardar(CLAVES.historial, []);
    const contenedor = document.getElementById("tutor-messages");
    if (contenedor) contenedor.innerHTML = renderizarMensajes();
  }

  function notaCurso(id) {
    return leer(CLAVES.notas, {})[id] || "";
  }

  function guardarNotaTutor() {
    const notas = leer(CLAVES.notas, {});
    notas[estado.cursoId] = (document.getElementById("tutor-notes")?.value || "").trim();
    guardar(CLAVES.notas, notas);
    const estadoNota = document.getElementById("tutor-note-status");
    if (estadoNota) { estadoNota.textContent = "✓ Guardado en este dispositivo"; setTimeout(()=>{if(estadoNota)estadoNota.textContent=""},2200); }
  }

  function formatearTiempo(segundos) {
    return `${String(Math.floor(segundos/60)).padStart(2,"0")}:${String(segundos%60).padStart(2,"0")}`;
  }

  function pintarTemporizador() {
    const reloj = document.getElementById("tutor-timer");
    if (reloj) reloj.textContent = formatearTiempo(estado.segundos);
    const boton = document.getElementById("tutor-timer-toggle");
    if (boton) boton.textContent = estado.temporizador ? "Pausar" : "Iniciar";
  }

  function alternarTemporizadorTutor() {
    if (estado.temporizador) {
      clearInterval(estado.temporizador);
      estado.temporizador = null;
      pintarTemporizador();
      return;
    }
    estado.temporizador = setInterval(()=>{
      estado.segundos = Math.max(0,estado.segundos-1);
      pintarTemporizador();
      if (estado.segundos === 0) {
        clearInterval(estado.temporizador);
        estado.temporizador = null;
        window.registrarNotificacion?.({tipo:"estudio",titulo:"Sesión de concentración completada",cuerpo:"Terminaste 25 minutos de estudio. Toma una pausa de 5 minutos."});
        estado.segundos = 5*60;
        const etiqueta = document.getElementById("tutor-timer-label");
        if (etiqueta) etiqueta.textContent = "Pausa activa";
        pintarTemporizador();
      }
    },1000);
    pintarTemporizador();
  }

  function reiniciarTemporizadorTutor() {
    if (estado.temporizador) clearInterval(estado.temporizador);
    estado.temporizador = null;
    estado.segundos = 25*60;
    const etiqueta = document.getElementById("tutor-timer-label");
    if (etiqueta) etiqueta.textContent = "Sesión de estudio";
    pintarTemporizador();
  }

  async function abrirTutorConContexto(contexto) {
    estado.contextoPendiente = contexto || {};
    if (contexto?.courseId && cursos().some(curso => curso.id === contexto.courseId)) {
      estado.cursoId = contexto.courseId;
      const curso = cursoActual();
      const indice = curso.temas?.findIndex(tema=>tema.titulo===contexto.tema);
      estado.temaIndice = indice >= 0 ? indice : 0;
    }
    await abrirTutorAcademico(null);
  }

  function aplicarContextoPendiente() {
    const campo = document.getElementById("tutor-question");
    if (campo) campo.value = `Ayúdame a entender esta pregunta de ${estado.contextoPendiente.tema || temaActual().titulo}: ${estado.contextoPendiente.pregunta || ""}`.trim();
    estado.contextoPendiente = null;
    campo?.focus();
  }

  function desplazarMensajes() {
    const contenedor = document.getElementById("tutor-messages");
    if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;
  }

  document.addEventListener("DOMContentLoaded",()=>{
    const pantalla = document.getElementById("tutor");
    if (pantalla) new MutationObserver(()=>{if(pantalla.classList.contains("active"))renderizarTutor()}).observe(pantalla,{attributes:true,attributeFilter:["class"]});
  });
  document.addEventListener("uniprep:admission-change",()=>{
    if (!cursos().some(curso => curso.id === estado.cursoId)) estado.cursoId = cursos()[0]?.id || "rm";
    if (document.getElementById("tutor")?.classList.contains("active")) renderizarTutor();
  });

  window.abrirTutorAcademico = abrirTutorAcademico;
  window.renderizarTutorAcademico = renderizarTutor;
  window.cambiarCursoTutor = cambiarCursoTutor;
  window.cambiarTemaTutor = cambiarTemaTutor;
  window.usarAccionTutor = usarAccionTutor;
  window.enviarPreguntaTutor = enviarPreguntaTutor;
  window.limpiarTutor = limpiarTutor;
  window.guardarNotaTutor = guardarNotaTutor;
  window.actualizarFocoTutor = actualizarFocoTutor;
  window.alternarTemporizadorTutor = alternarTemporizadorTutor;
  window.reiniciarTemporizadorTutor = reiniciarTemporizadorTutor;
  window.abrirTutorConContexto = abrirTutorConContexto;
})();
