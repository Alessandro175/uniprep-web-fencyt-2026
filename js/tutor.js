(function () {
  "use strict";

  const CLAVES = {
    historial: "uniprep_tutor_history_v1",
    notas: "uniprep_course_notes_v1",
    curso: "uniprep_tutor_course_v1",
    modo: "uniprep_tutor_mode_v2",
    profundidad: "uniprep_tutor_depth_v2",
    ambito: "uniprep_tutor_scope_v1",
    perfil: "uniprep_tutor_learning_profile_v1",
    favoritos: "uniprep_tutor_favorites_v1"
  };
  const estado = {
    cursoId: window.uniprepStorage?.leerTexto(CLAVES.curso, "rm") || "rm",
    temaIndice: 0,
    mensajes: leer(CLAVES.historial, []),
    usuario: null,
    enviando: false,
    segundos: 25 * 60,
    temporizador: null,
    contextoPendiente: null,
    modo: window.uniprepStorage?.leerTexto(CLAVES.modo, "paso") || "paso",
    profundidad: window.uniprepStorage?.leerTexto(CLAVES.profundidad, "normal") || "normal",
    ambito: window.uniprepStorage?.leerTexto(CLAVES.ambito, "libre") || "libre",
    perfilAprendizaje: window.uniprepStorage?.leerTexto(CLAVES.perfil, "visual") || "visual",
    imagen: null,
    reconocimiento: null
  };
  const MODOS = {
    facil:{nombre:"Fácil",icono:"🧩",plantilla:tema=>`Explícame ${tema} con palabras sencillas, una idea a la vez, y comprueba si entendí.`},
    paso:{nombre:"Paso a paso",icono:"🪜",plantilla:tema=>`Explícame ${tema} paso a paso y señala los errores más comunes.`},
    pista:{nombre:"Solo pista",icono:"💡",plantilla:tema=>`Dame una pista gradual para empezar un ejercicio de ${tema}, sin revelar la respuesta final.`},
    socratico:{nombre:"Pregúntame",icono:"🧠",plantilla:tema=>`Ayúdame a descubrir cómo resolver ${tema} haciéndome una pregunta corta cada vez.`},
    ejemplo:{nombre:"Con ejemplo",icono:"✍️",plantilla:tema=>`Crea un ejemplo preuniversitario similar de ${tema} y explícalo de forma ordenada.`},
    plan:{nombre:"Plan de estudio",icono:"🎯",plantilla:tema=>`Hazme un plan breve y concreto para dominar ${tema} y practicarlo.`}
  };
  const INICIOS = {
    tarea:{icono:"📚",titulo:"Entender una tarea",texto:"Ayúdame a entender esta tarea sin hacerla por mí. Primero pregúntame qué he intentado."},
    proyecto:{icono:"🚀",titulo:"Crear un proyecto",texto:"Ayúdame a convertir mi idea en un proyecto escolar con objetivo, etapas, materiales y una forma de demostrar resultados."},
    redaccion:{icono:"✍️",titulo:"Mejorar un texto",texto:"Ayúdame a mejorar la claridad, ortografía y organización de este texto. Explícame cada cambio importante: "},
    ciencia:{icono:"🔬",titulo:"Explorar ciencia",texto:"Explícame un fenómeno científico con un ejemplo cotidiano y luego propón una actividad segura para comprobarlo."},
    orientacion:{icono:"🧭",titulo:"Orientación personal",texto:"Ayúdame a explorar carreras relacionadas con mis intereses. Hazme preguntas breves antes de sugerir opciones."},
    practicar:{icono:"🎯",titulo:"Practicar un tema",texto:"Crea cinco preguntas progresivas sobre el tema que te indicaré, espera mi respuesta y corrige una por una."}
  };
  if (!MODOS[estado.modo]) estado.modo = "paso";
  if (!["breve","normal","profunda"].includes(estado.profundidad)) estado.profundidad = "normal";
  if (!["libre","curso","material"].includes(estado.ambito)) estado.ambito = "libre";
  if (!["visual","practico","teorico"].includes(estado.perfilAprendizaje)) estado.perfilAprendizaje = "visual";

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

  function formatoMensaje(valor) {
    return esc(valor)
      .replace(/^#{1,3}\s+(.+)$/gm, '<b class="tutor-message-heading">$1</b>')
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
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
    if (await window.UniprepTutorStudio?.renderIfNeeded?.(raiz, estado.usuario)) return;
    const curso = cursoActual();
    const foco = cursoPrioritario(estado.usuario);

    const primerNombre = String(estado.usuario?.nombre || "").trim().split(/\s+/)[0];
    raiz.innerHTML = `<section class="tutor-head tutor-head-evolution"><div class="tutor-head-copy"><small>UNI · COMPAÑERA DE APRENDIZAJE</small><h1>${primerNombre ? `Hola, ${esc(primerNombre)}. ` : ""}Pregunta, crea y aprende sin miedo.</h1><p>Úsala para tareas, proyectos, redacción, ciencia, orientación o preparación preuniversitaria. Tú decides el tema; Uni te acompaña con explicaciones, preguntas y práctica.</p><div class="tutor-head-badges"><span>Consulta libre</span><span>Imagen y voz</span><span>Guía local de respaldo</span></div></div><div class="tutor-ai-orbit"><span>✦</span><i></i><i></i><i></i><div class="tutor-head-status"><b>Uni está contigo</b><em id="tutor-service-status">Comprobando servicio…</em></div></div></section>
      ${window.UniprepTutorStudio?.renderNav?.() || ""}
      <section class="tutor-launchpad"><header><div><span>¿QUÉ QUIERES HACER HOY?</span><h2>Empieza con una idea o escribe lo que necesites.</h2></div><button type="button" onclick="enfocarPreguntaTutor()">Escribir libremente ↓</button></header><div>${Object.entries(INICIOS).map(([id,item])=>`<button type="button" onclick="usarInicioTutor('${id}')"><i>${item.icono}</i><span><b>${item.titulo}</b><small>${id === "tarea" ? "Comprende sin copiar" : id === "proyecto" ? "De la idea al plan" : id === "redaccion" ? "Claridad y ortografía" : id === "ciencia" ? "Pregunta y comprueba" : id === "orientacion" ? "Explora posibilidades" : "Avanza paso a paso"}</small></span><em>→</em></button>`).join("")}</div></section>
      <div class="tutor-layout"><section class="tutor-chat tutor-chat-evolution"><div class="tutor-scope-switch" role="group" aria-label="Alcance de la conversación"><button type="button" class="${estado.ambito==="libre"?"active":""}" onclick="cambiarAmbitoTutor('libre')"><i>✦</i><span><b>Consulta libre</b><small>Cualquier tema educativo</small></span></button><button type="button" class="${estado.ambito==="curso"?"active":""}" onclick="cambiarAmbitoTutor('curso')"><i>📘</i><span><b>Mi curso</b><small>Con temario UniPrep</small></span></button><button type="button" class="${estado.ambito==="material"?"active":""}" onclick="cambiarAmbitoTutor('material')"><i>📎</i><span><b>Mi material</b><small>Usa un espacio guardado</small></span></button></div>
      <div class="tutor-context tutor-context-smart"><label>Curso<select id="tutor-course-select" onchange="cambiarCursoTutor(this.value)">${cursos().map(item=>`<option value="${item.id}"${item.id===curso.id?" selected":""}>${item.icono} ${esc(item.nombre)}</option>`).join("")}</select></label><label>Tema<select id="tutor-topic-select" onchange="cambiarTemaTutor(this.value)">${opcionesTemas(curso)}</select></label><label>Aprendo mejor<select id="tutor-learning-profile" onchange="cambiarPerfilAprendizajeTutor(this.value)"><option value="visual"${estado.perfilAprendizaje==="visual"?" selected":""}>Con esquemas y analogías</option><option value="practico"${estado.perfilAprendizaje==="practico"?" selected":""}>Practicando con ejemplos</option><option value="teorico"${estado.perfilAprendizaje==="teorico"?" selected":""}>Con conceptos y precisión</option></select></label></div>
      <div class="tutor-help-config"><div><span>¿CÓMO QUIERES QUE TE AYUDE?</span><div class="tutor-mode-grid">${Object.entries(MODOS).map(([id,item])=>`<button type="button" data-tutor-mode="${id}" class="${estado.modo===id?"active":""}" onclick="usarAccionTutor('${id}')"><i>${item.icono}</i>${item.nombre}</button>`).join("")}</div></div><label>Profundidad<select id="tutor-depth-select" onchange="cambiarProfundidadTutor(this.value)"><option value="breve"${estado.profundidad==="breve"?" selected":""}>Breve y directa</option><option value="normal"${estado.profundidad==="normal"?" selected":""}>Normal</option><option value="profunda"${estado.profundidad==="profunda"?" selected":""}>Profunda</option></select></label></div>
      <div class="tutor-chat-tools"><span id="tutor-active-mode">${MODOS[estado.modo]?.icono || "🪜"} ${esc(MODOS[estado.modo]?.nombre || "Paso a paso")}</span><div><button type="button" onclick="exportarConversacionTutor()">⇩ Exportar</button><button type="button" onclick="compartirConversacionTutor()">↗ Compartir</button><button type="button" onclick="limpiarTutor()">Limpiar</button></div></div>
      <div class="tutor-messages" id="tutor-messages">${renderizarMensajes()}</div>
      <form class="tutor-compose tutor-compose-evolution" onsubmit="enviarPreguntaTutor(event)"><div id="tutor-image-preview" class="tutor-image-preview" ${estado.imagen?"":"hidden"}>${estado.imagen?`<img src="${estado.imagen.data}" alt="Imagen lista para consultar"><span><b>${esc(estado.imagen.name)}</b><small>La imagen se enviará solo con esta pregunta.</small></span><button type="button" onclick="quitarImagenTutor()" aria-label="Quitar imagen">×</button>`:""}</div><div class="tutor-compose-shell"><textarea id="tutor-question" maxlength="1800" oninput="actualizarContadorTutor(this)" placeholder="Pregúntame cualquier tema educativo, pega un ejercicio o cuéntame tu idea…"></textarea><div class="tutor-compose-actions"><label class="tutor-compose-icon" title="Adjuntar imagen">🖼️<input id="tutor-chat-image" type="file" accept="image/png,image/jpeg,image/webp" hidden onchange="adjuntarImagenTutor(this.files[0])"></label><button class="tutor-compose-icon" id="tutor-voice-btn" type="button" onclick="alternarVozTutor()" title="Dictar pregunta">🎙️</button><span id="tutor-char-count">0/1800</span><button id="tutor-send-btn" class="tutor-send-evolution" type="submit"><span>Enviar</span><i>➤</i></button></div></div><small class="tutor-compose-note"><b>Privacidad:</b> no compartas datos personales. La IA puede equivocarse; verifica decisiones importantes.</small></form></section>
      <aside class="tutor-side">${renderizarPresupuestoIA()}<section class="tutor-tool tutor-focus"><div class="tutor-tool-head"><span>ENFOQUE DE HOY</span><button type="button" onclick="actualizarFocoTutor()">Actualizar</button></div><div id="tutor-focus-content">${renderizarFoco(foco)}</div></section>
      <section class="tutor-tool tutor-pomodoro"><div class="tutor-tool-head"><span>CONCENTRACIÓN</span><small>25 / 5</small></div><div class="tutor-timer" id="tutor-timer">${formatearTiempo(estado.segundos)}</div><div class="tutor-timer-label" id="tutor-timer-label">Sesión de estudio</div><div class="tutor-timer-actions"><button class="primary" id="tutor-timer-toggle" type="button" onclick="alternarTemporizadorTutor()">Iniciar</button><button type="button" onclick="reiniciarTemporizadorTutor()">Reiniciar</button></div></section>
      <section class="tutor-tool tutor-notes"><div class="tutor-tool-head"><span>MIS APUNTES</span><small id="tutor-notes-course">${esc(curso.nombre)}</small></div><textarea id="tutor-notes" maxlength="5000" placeholder="Escribe fórmulas, reglas o dudas de este curso…">${esc(notaCurso(curso.id))}</textarea><button type="button" onclick="guardarNotaTutor()">Guardar apuntes</button><div class="tutor-note-status" id="tutor-note-status"></div></section>
      <div class="tutor-privacy"><b>Conectado de forma segura:</b> la clave de IA permanece en el servidor. Preferencias, materiales y consumo estimado se sincronizan con Supabase cuando la migración está instalada.</div></aside></div>`;

    if (estado.contextoPendiente) aplicarContextoPendiente();
    desplazarMensajes();
    verificarEstadoIA();
  }

  function opcionesTemas(curso) {
    return (curso.temas || []).map((tema, indice)=>`<option value="${indice}"${indice===estado.temaIndice?" selected":""}>${esc(tema.titulo)}</option>`).join("");
  }

  function renderizarPresupuestoIA() {
    const uso = window.UniPrepCloud?.localUsageSummary?.() || {requests:0,inputTokens:0,outputTokens:0,estimatedUsd:0};
    const soles = Number(uso.estimatedUsd || 0) * 3.75;
    const porcentaje = Math.min(100, soles / 250 * 100);
    return `<section class="tutor-tool tutor-budget"><div class="tutor-tool-head"><span>PILOTO IA · 3 MESES</span><small>Meta S/250</small></div><div class="tutor-budget-money"><b>S/${soles.toFixed(soles < 1 ? 2 : 1)}</b><span>consumo estimado en este dispositivo</span></div><div class="tutor-budget-track"><span style="width:${Math.max(1,porcentaje)}%"></span></div><div class="tutor-budget-meta"><span><b>${Number(uso.requests)||0}</b> consultas</span><span><b>${Math.max(0,250-soles).toFixed(0)}</b> soles estimados restantes</span></div><p>Referencia con GPT-5.6 Luna y cambio S/3.75. La facturación real se revisa en OpenAI.</p></section>`;
  }

  function actualizarTarjetaPresupuesto() {
    const actual = document.querySelector(".tutor-budget");
    if (actual) actual.outerHTML = renderizarPresupuestoIA();
  }

  function renderizarMensajes() {
    if (!estado.mensajes.length) return '<div class="tutor-empty tutor-empty-evolution"><span>✦</span><b>Este espacio es tuyo.</b><p>Pregunta algo, dicta con el micrófono o adjunta una foto. Puedes hablar de una tarea, un proyecto, una idea o cualquier tema educativo.</p><div><button type="button" onclick="usarInicioTutor(\'tarea\')">Entender una tarea</button><button type="button" onclick="usarInicioTutor(\'proyecto\')">Crear un proyecto</button></div></div>';
    return estado.mensajes.map((mensaje,indice)=>{
      const id = mensaje.id || `message_${indice}`;
      const acciones = mensaje.rol === "user"
        ? `<div class="tutor-message-actions compact"><button type="button" onclick="copiarTextoMensajeTutor(${indice})">Copiar</button>${mensaje.hasImage?"<span>🖼️ Imagen enviada</span>":""}</div>`
        : `<div class="tutor-message-actions"><button type="button" onclick="leerMensajeTutor(${indice})">🔊 Leer</button><button type="button" onclick="copiarTextoMensajeTutor(${indice})">⧉ Copiar</button><button type="button" onclick="copiarMensajeTutor(${indice})">＋ Apuntes</button><button type="button" class="${mensaje.favorito?"active":""}" onclick="favoritoMensajeTutor(${indice})">${mensaje.favorito?"★ Guardado":"☆ Guardar"}</button><button type="button" class="${mensaje.valoracion===1?"active":""}" onclick="valorarMensajeTutor(${indice},1)" aria-label="Respuesta útil">👍</button><button type="button" class="${mensaje.valoracion===-1?"active":""}" onclick="valorarMensajeTutor(${indice},-1)" aria-label="Respuesta poco útil">👎</button><button type="button" onclick="continuarTutor('facil')">Más fácil</button><button type="button" onclick="continuarTutor('ejemplo')">Otro ejemplo</button></div>`;
      return `<article class="tutor-message ${mensaje.rol}" data-message-id="${esc(id)}"><header><small>${mensaje.rol==="user"?"TÚ":mensaje.rol==="ai"?"UNI · IA":"UNI · GUÍA LOCAL"}</small><time>${mensaje.fecha?new Date(mensaje.fecha).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):""}</time></header><div class="tutor-message-content">${formatoMensaje(mensaje.texto)}</div>${acciones}</article>`;
    }).join("");
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
    guardarConfiguracionTutor();
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
    if (!MODOS[tipo]) return;
    estado.modo = tipo;
    window.uniprepStorage?.guardarTexto(CLAVES.modo, tipo);
    guardarConfiguracionTutor();
    document.querySelectorAll("[data-tutor-mode]").forEach(boton=>boton.classList.toggle("active",boton.dataset.tutorMode===tipo));
    const indicador = document.getElementById("tutor-active-mode");
    if (indicador) indicador.textContent = `${MODOS[tipo].icono} Modo ${MODOS[tipo].nombre}`;
    const campo = document.getElementById("tutor-question");
    if (campo && !campo.value.trim()) campo.value = MODOS[tipo].plantilla(temaActual().titulo);
    campo?.focus();
  }

  function cambiarProfundidadTutor(valor) {
    if (!["breve","normal","profunda"].includes(valor)) return;
    estado.profundidad = valor;
    window.uniprepStorage?.guardarTexto(CLAVES.profundidad, valor);
    guardarConfiguracionTutor();
  }

  function guardarConfiguracionTutor() {
    window.UniPrepCloud?.savePreferencesSoon?.({tutor:{ambito:estado.ambito, modo:estado.modo, profundidad:estado.profundidad, perfilAprendizaje:estado.perfilAprendizaje, cursoId:estado.cursoId}}, 800);
  }

  function cambiarAmbitoTutor(valor) {
    if (!["libre","curso","material"].includes(valor)) return;
    if (valor === "material" && !window.UniprepTutorStudio?.getActiveContext?.()) {
      estado.ambito = valor;
      window.uniprepStorage?.guardarTexto(CLAVES.ambito, valor);
      guardarConfiguracionTutor();
      window.UniprepTutorStudio?.setView?.("materiales");
      return;
    }
    estado.ambito = valor;
    window.uniprepStorage?.guardarTexto(CLAVES.ambito, valor);
    guardarConfiguracionTutor();
    renderizarTutor();
  }

  function cambiarPerfilAprendizajeTutor(valor) {
    if (!["visual","practico","teorico"].includes(valor)) return;
    estado.perfilAprendizaje = valor;
    window.uniprepStorage?.guardarTexto(CLAVES.perfil, valor);
    guardarConfiguracionTutor();
  }

  function usarInicioTutor(id) {
    const inicio = INICIOS[id];
    if (!inicio) return;
    estado.ambito = id === "practicar" ? "curso" : "libre";
    window.uniprepStorage?.guardarTexto(CLAVES.ambito, estado.ambito);
    if (id === "orientacion") estado.modo = "socratico";
    if (id === "proyecto") estado.modo = "plan";
    if (id === "tarea") estado.modo = "pista";
    window.uniprepStorage?.guardarTexto(CLAVES.modo, estado.modo);
    document.querySelectorAll("[data-tutor-mode]").forEach(boton => boton.classList.toggle("active", boton.dataset.tutorMode === estado.modo));
    const indicador = document.getElementById("tutor-active-mode");
    if (indicador) indicador.textContent = `${MODOS[estado.modo]?.icono || "✦"} ${MODOS[estado.modo]?.nombre || "Ayuda"}`;
    guardarConfiguracionTutor();
    const campo = document.getElementById("tutor-question");
    if (campo) {
      campo.value = inicio.texto;
      actualizarContadorTutor(campo);
      campo.focus();
      campo.scrollIntoView({behavior:"smooth", block:"center"});
    }
  }

  function enfocarPreguntaTutor() {
    const campo = document.getElementById("tutor-question");
    campo?.scrollIntoView({behavior:"smooth", block:"center"});
    setTimeout(() => campo?.focus(), 260);
  }

  function actualizarContadorTutor(campo) {
    const contador = document.getElementById("tutor-char-count");
    if (contador) contador.textContent = `${String(campo?.value || "").length}/1800`;
  }

  function alternarVozTutor() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const boton = document.getElementById("tutor-voice-btn");
    if (!Recognition) return window.UniprepUGEL?.mostrarToast?.("El dictado no está disponible en este navegador.");
    if (estado.reconocimiento) {
      estado.reconocimiento.stop();
      return;
    }
    const reconocimiento = new Recognition();
    reconocimiento.lang = "es-PE";
    reconocimiento.interimResults = true;
    reconocimiento.continuous = false;
    const campo = document.getElementById("tutor-question");
    const inicial = campo?.value.trim() || "";
    estado.reconocimiento = reconocimiento;
    boton?.classList.add("recording");
    reconocimiento.onresult = evento => {
      const texto = [...evento.results].map(resultado => resultado[0]?.transcript || "").join(" ");
      if (campo) campo.value = [inicial, texto].filter(Boolean).join(inicial ? " " : "").slice(0, 1800);
      actualizarContadorTutor(campo);
    };
    reconocimiento.onerror = () => window.UniprepUGEL?.mostrarToast?.("No se pudo usar el micrófono. Revisa el permiso del navegador.");
    reconocimiento.onend = () => { estado.reconocimiento = null; boton?.classList.remove("recording"); campo?.focus(); };
    reconocimiento.start();
  }

  function leerArchivoComoDataURL(archivo) {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader(); lector.onload = () => resolver(String(lector.result || "")); lector.onerror = rechazar; lector.readAsDataURL(archivo);
    });
  }

  function comprimirImagenTutor(archivo) {
    return new Promise(async (resolver, rechazar) => {
      const url = await leerArchivoComoDataURL(archivo).catch(rechazar);
      if (!url) return;
      const imagen = new Image();
      imagen.onload = () => {
        const escala = Math.min(1, 1280 / imagen.width, 1280 / imagen.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(imagen.width * escala)); canvas.height = Math.max(1, Math.round(imagen.height * escala));
        canvas.getContext("2d")?.drawImage(imagen, 0, 0, canvas.width, canvas.height);
        resolver(canvas.toDataURL("image/jpeg", .78));
      };
      imagen.onerror = rechazar; imagen.src = url;
    });
  }

  async function adjuntarImagenTutor(archivo) {
    const input = document.getElementById("tutor-chat-image");
    if (!archivo) return;
    if (!/^image\/(?:png|jpeg|webp)$/i.test(archivo.type) || archivo.size > 7 * 1024 * 1024) {
      if (input) input.value = "";
      return window.UniprepUGEL?.mostrarToast?.("Usa una imagen JPG, PNG o WebP de máximo 7 MB.");
    }
    try {
      const data = await comprimirImagenTutor(archivo);
      if (data.length > 2_500_000) throw new Error("IMAGE_TOO_LARGE");
      estado.imagen = {name:String(archivo.name || "imagen").slice(0,120), mime:"image/jpeg", data};
      renderizarTutor();
      setTimeout(() => document.getElementById("tutor-question")?.focus(), 0);
    } catch (_) {
      window.UniprepUGEL?.mostrarToast?.("No se pudo preparar la imagen. Prueba con una más pequeña.");
    } finally { if (input) input.value = ""; }
  }

  function quitarImagenTutor() {
    estado.imagen = null;
    const vista = document.getElementById("tutor-image-preview");
    if (vista) { vista.hidden = true; vista.innerHTML = ""; }
  }

  async function enviarPreguntaTutor(evento) {
    evento?.preventDefault?.();
    if (estado.enviando) return;
    const campo = document.getElementById("tutor-question");
    const pregunta = (campo?.value || "").trim();
    if (pregunta.length < 4) return;
    const imagen = estado.imagen;
    agregarMensaje("user", pregunta, {hasImage:Boolean(imagen)});
    if (campo) campo.value = "";
    estado.imagen = null;
    const vistaImagen = document.getElementById("tutor-image-preview");
    if (vistaImagen) { vistaImagen.hidden = true; vistaImagen.innerHTML = ""; }
    estado.enviando = true;
    actualizarEstadoEnvio(true);

    try {
      const respuesta = await consultarTutorIA(pregunta, imagen);
      agregarMensaje("ai", respuesta.answer, {model:respuesta.model});
      await window.UniPrepCloud?.trackUsage?.(respuesta.usage, respuesta.model, "chat");
      actualizarTarjetaPresupuesto();
      cambiarEstadoServicio("IA conectada", true);
    } catch (error) {
      agregarMensaje("guide", respuestaLocal(pregunta));
      cambiarEstadoServicio(error?.message === "SIN_SESION" ? "Inicia sesión para usar IA" : "Guía local activa", false);
    } finally {
      estado.enviando = false;
      actualizarEstadoEnvio(false);
    }
  }

  async function consultarTutorIA(pregunta, imagen = null) {
    const sesion = await window.supabaseClient?.auth?.getSession?.();
    const token = sesion?.data?.session?.access_token;
    if (!token) throw new Error("SIN_SESION");
    const controlador = new AbortController();
    const limite = setTimeout(()=>controlador.abort(), 45000);
    try {
      const historial = estado.mensajes.slice(0,-1).filter(m=>["user","ai","guide"].includes(m.rol)).slice(-8).map(m=>({rol:m.rol==="user"?"user":"assistant",texto:String(m.texto||"").slice(0,1800)}));
      const fila = estado.usuario?.progresoDetallado?.find(item=>item.course_id===estado.cursoId);
      const perfil = {
        progreso:Math.round(Number(estado.usuario?.progreso?.[estado.cursoId])||0),
        precision:Number(fila?.total_answers)>0?Math.round(Number(fila.correct_answers||0)/Number(fila.total_answers)*100):0,
        respuestas:Math.max(0,Number(fila?.total_answers)||0)
      };
      const contextoMaterial = estado.ambito === "material" ? (window.UniprepTutorStudio?.getActiveContext?.() || "") : "";
      const respuesta = await fetch("/api/tutor", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body:JSON.stringify({curso:estado.ambito === "libre" ? "Consulta educativa libre" : cursoActual().nombre,tema:estado.ambito === "libre" ? "Tema elegido por el estudiante" : temaActual().titulo,pregunta,modo:estado.modo,profundidad:estado.profundidad,ambito:estado.ambito,perfilAprendizaje:estado.perfilAprendizaje,historial,perfil,contextoMaterial,imagen:imagen?{name:imagen.name,mime:imagen.mime,data:imagen.data}:null}),
        signal:controlador.signal
      });
      const datos = await respuesta.json().catch(()=>({}));
      if (!respuesta.ok || !datos.answer) throw new Error(datos.code || "IA_NO_CONFIGURADA");
      return {answer:datos.answer, usage:datos.usage || null, model:datos.model || "gpt-5.6-luna"};
    } finally {
      clearTimeout(limite);
    }
  }

  function leerMensajeTutor(indice) {
    const mensaje = estado.mensajes[indice];
    if (mensaje?.texto) window.leerTextoUniPrep?.(mensaje.texto);
  }

  function copiarMensajeTutor(indice) {
    const mensaje = estado.mensajes[indice];
    const campo = document.getElementById("tutor-notes");
    if (!mensaje?.texto || !campo) return;
    const encabezado = `${temaActual().titulo} · ${new Date().toLocaleDateString("es-PE")}`;
    campo.value = [campo.value.trim(), `${encabezado}\n${mensaje.texto}`].filter(Boolean).join("\n\n").slice(0,5000);
    guardarNotaTutor();
  }

  async function copiarTextoMensajeTutor(indice) {
    const texto = estado.mensajes[indice]?.texto;
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      window.UniprepUGEL?.mostrarToast?.("Respuesta copiada.");
    } catch (_) {
      const area = document.createElement("textarea"); area.value = texto; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
      window.UniprepUGEL?.mostrarToast?.("Respuesta copiada.");
    }
  }

  function favoritoMensajeTutor(indice) {
    const mensaje = estado.mensajes[indice];
    if (!mensaje || mensaje.rol === "user") return;
    mensaje.favorito = !mensaje.favorito;
    guardar(CLAVES.historial, estado.mensajes);
    const favoritos = estado.mensajes.filter(item => item.favorito).map(item => ({id:item.id,texto:item.texto,fecha:item.fecha,tema:item.tema,cursoId:item.cursoId})).slice(-40);
    guardar(CLAVES.favoritos, favoritos);
    const contenedor = document.getElementById("tutor-messages"); if (contenedor) contenedor.innerHTML = renderizarMensajes();
    desplazarMensajes();
    window.UniprepUGEL?.mostrarToast?.(mensaje.favorito ? "Respuesta guardada en favoritos." : "Respuesta retirada de favoritos.");
  }

  function valorarMensajeTutor(indice, rating) {
    const mensaje = estado.mensajes[indice];
    if (!mensaje || mensaje.rol === "user") return;
    mensaje.valoracion = Number(rating) === -1 ? -1 : 1;
    guardar(CLAVES.historial, estado.mensajes);
    window.UniPrepCloud?.saveFeedback?.({messageId:mensaje.id, rating:mensaje.valoracion, courseId:mensaje.cursoId, mode:estado.modo});
    const contenedor = document.getElementById("tutor-messages"); if (contenedor) contenedor.innerHTML = renderizarMensajes();
    desplazarMensajes();
    window.UniprepUGEL?.mostrarToast?.("Gracias. Tu opinión ayuda a mejorar Uni.");
  }

  function textoConversacion() {
    const cabecera = `UniPrep · Conversación con Uni\nFecha: ${new Date().toLocaleString("es-PE")}\n\n`;
    return cabecera + estado.mensajes.map(mensaje => `${mensaje.rol === "user" ? "ESTUDIANTE" : mensaje.rol === "ai" ? "UNI · IA" : "UNI · GUÍA LOCAL"}\n${mensaje.texto}`).join("\n\n------------------------------\n\n");
  }

  function exportarConversacionTutor() {
    if (!estado.mensajes.length) return window.UniprepUGEL?.mostrarToast?.("Todavía no hay conversación para exportar.");
    const blob = new Blob([textoConversacion()], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob); const enlace = document.createElement("a"); enlace.href = url; enlace.download = `uniprep-conversacion-${new Date().toISOString().slice(0,10)}.txt`; document.body.appendChild(enlace); enlace.click(); enlace.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function compartirConversacionTutor() {
    if (!estado.mensajes.length) return window.UniprepUGEL?.mostrarToast?.("Todavía no hay conversación para compartir.");
    const texto = textoConversacion().slice(0,12000);
    try {
      if (navigator.share) await navigator.share({title:"Mi conversación de estudio en UniPrep", text:texto});
      else { await navigator.clipboard.writeText(texto); window.UniprepUGEL?.mostrarToast?.("Conversación copiada para compartir."); }
    } catch (error) { if (error?.name !== "AbortError") window.UniprepUGEL?.mostrarToast?.("No se pudo compartir la conversación."); }
  }

  function continuarTutor(tipo) {
    usarAccionTutor(tipo);
    const campo = document.getElementById("tutor-question");
    if (!campo) return;
    campo.value = tipo === "ejemplo"
      ? "Dame otro ejemplo parecido, pero con datos distintos, y explícame cada paso."
      : "No lo entendí todavía. Explícamelo con palabras más sencillas y pregúntame una cosa a la vez.";
    campo.focus();
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

  function agregarMensaje(rol, texto, extra = {}) {
    estado.mensajes.push({id:`msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,rol,texto:String(texto).slice(0,6000),fecha:new Date().toISOString(),cursoId:estado.cursoId,tema:temaActual().titulo,...extra});
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

  async function verificarEstadoIA() {
    const controlador = new AbortController();
    const limite = setTimeout(()=>controlador.abort(), 4500);
    try {
      const respuesta = await fetch("/api/tutor", {method:"GET",headers:{"Accept":"application/json"},signal:controlador.signal});
      const datos = await respuesta.json().catch(()=>({}));
      cambiarEstadoServicio(datos.available ? "IA lista para ayudarte" : "Guía local disponible", Boolean(datos.available));
    } catch (_) {
      cambiarEstadoServicio("Guía local disponible", false);
    } finally {
      clearTimeout(limite);
    }
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
    window.UniprepTutorStudio?.setView?.("preguntar", true);
    estado.contextoPendiente = {...(contexto || {}), modo:contexto?.modo === "explica" ? "paso" : contexto?.modo};
    if (contexto?.courseId && cursos().some(curso => curso.id === contexto.courseId)) {
      estado.cursoId = contexto.courseId;
      const curso = cursoActual();
      const indice = curso.temas?.findIndex(tema=>tema.titulo===contexto.tema);
      estado.temaIndice = indice >= 0 ? indice : 0;
    }
    await abrirTutorAcademico(null);
  }

  function aplicarContextoPendiente() {
    if (MODOS[estado.contextoPendiente.modo]) usarAccionTutor(estado.contextoPendiente.modo);
    const campo = document.getElementById("tutor-question");
    if (campo) campo.value = estado.contextoPendiente.modo
      ? String(estado.contextoPendiente.pregunta || "").trim()
      : `Ayúdame a entender esta pregunta de ${estado.contextoPendiente.tema || temaActual().titulo}: ${estado.contextoPendiente.pregunta || ""}`.trim();
    estado.contextoPendiente = null;
    campo?.focus();
  }

  function desplazarMensajes() {
    const contenedor = document.getElementById("tutor-messages");
    if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;
  }

  function recargarAmbitoTutor() {
    estado.mensajes = leer(CLAVES.historial, []);
    estado.cursoId = window.uniprepStorage?.leerTexto(CLAVES.curso, estado.cursoId) || estado.cursoId;
    estado.modo = window.uniprepStorage?.leerTexto(CLAVES.modo, "paso") || "paso";
    estado.profundidad = window.uniprepStorage?.leerTexto(CLAVES.profundidad, "normal") || "normal";
    estado.ambito = window.uniprepStorage?.leerTexto(CLAVES.ambito, "libre") || "libre";
    estado.perfilAprendizaje = window.uniprepStorage?.leerTexto(CLAVES.perfil, "visual") || "visual";
    if (!MODOS[estado.modo]) estado.modo = "paso";
    if (!["breve","normal","profunda"].includes(estado.profundidad)) estado.profundidad = "normal";
    if (!["libre","curso","material"].includes(estado.ambito)) estado.ambito = "libre";
    if (!["visual","practico","teorico"].includes(estado.perfilAprendizaje)) estado.perfilAprendizaje = "visual";
    if (document.getElementById("tutor")?.classList.contains("active")) renderizarTutor();
  }

  async function sincronizarConfiguracionTutorNube() {
    const row = await window.UniPrepCloud?.getPreferences?.();
    const tutor = row?.tutor;
    if (!tutor || typeof tutor !== "object") return;
    if (["libre","curso","material"].includes(tutor.ambito)) estado.ambito = tutor.ambito;
    if (MODOS[tutor.modo]) estado.modo = tutor.modo;
    if (["breve","normal","profunda"].includes(tutor.profundidad)) estado.profundidad = tutor.profundidad;
    if (["visual","practico","teorico"].includes(tutor.perfilAprendizaje)) estado.perfilAprendizaje = tutor.perfilAprendizaje;
    if (tutor.cursoId && cursos().some(curso => curso.id === tutor.cursoId)) estado.cursoId = tutor.cursoId;
    window.uniprepStorage?.guardarTexto(CLAVES.ambito, estado.ambito);
    window.uniprepStorage?.guardarTexto(CLAVES.modo, estado.modo);
    window.uniprepStorage?.guardarTexto(CLAVES.profundidad, estado.profundidad);
    window.uniprepStorage?.guardarTexto(CLAVES.perfil, estado.perfilAprendizaje);
    if (document.getElementById("tutor")?.classList.contains("active")) renderizarTutor();
  }

  document.addEventListener("DOMContentLoaded",()=>{
    const pantalla = document.getElementById("tutor");
    if (pantalla) new MutationObserver(()=>{if(pantalla.classList.contains("active"))renderizarTutor()}).observe(pantalla,{attributes:true,attributeFilter:["class"]});
  });
  document.addEventListener("uniprep:admission-change",()=>{
    if (!cursos().some(curso => curso.id === estado.cursoId)) estado.cursoId = cursos()[0]?.id || "rm";
    if (document.getElementById("tutor")?.classList.contains("active")) renderizarTutor();
  });
  document.addEventListener("uniprep:storage-scope-change", recargarAmbitoTutor);
  document.addEventListener("uniprep:user-ready", () => { recargarAmbitoTutor(); sincronizarConfiguracionTutorNube(); });
  document.addEventListener("uniprep:ai-usage", actualizarTarjetaPresupuesto);

  window.abrirTutorAcademico = abrirTutorAcademico;
  window.renderizarTutorAcademico = renderizarTutor;
  window.cambiarCursoTutor = cambiarCursoTutor;
  window.cambiarTemaTutor = cambiarTemaTutor;
  window.usarAccionTutor = usarAccionTutor;
  window.cambiarProfundidadTutor = cambiarProfundidadTutor;
  window.enviarPreguntaTutor = enviarPreguntaTutor;
  window.limpiarTutor = limpiarTutor;
  window.guardarNotaTutor = guardarNotaTutor;
  window.actualizarFocoTutor = actualizarFocoTutor;
  window.alternarTemporizadorTutor = alternarTemporizadorTutor;
  window.reiniciarTemporizadorTutor = reiniciarTemporizadorTutor;
  window.abrirTutorConContexto = abrirTutorConContexto;
  window.leerMensajeTutor = leerMensajeTutor;
  window.copiarMensajeTutor = copiarMensajeTutor;
  window.continuarTutor = continuarTutor;
  window.cambiarAmbitoTutor = cambiarAmbitoTutor;
  window.cambiarPerfilAprendizajeTutor = cambiarPerfilAprendizajeTutor;
  window.usarInicioTutor = usarInicioTutor;
  window.enfocarPreguntaTutor = enfocarPreguntaTutor;
  window.actualizarContadorTutor = actualizarContadorTutor;
  window.alternarVozTutor = alternarVozTutor;
  window.adjuntarImagenTutor = adjuntarImagenTutor;
  window.quitarImagenTutor = quitarImagenTutor;
  window.copiarTextoMensajeTutor = copiarTextoMensajeTutor;
  window.favoritoMensajeTutor = favoritoMensajeTutor;
  window.valorarMensajeTutor = valorarMensajeTutor;
  window.exportarConversacionTutor = exportarConversacionTutor;
  window.compartirConversacionTutor = compartirConversacionTutor;
})();
