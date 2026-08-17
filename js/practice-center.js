(function () {
  "use strict";

  const TOTAL_PREGUNTAS = 6480;
  const CLAVES = {
    errores: "uniprep_practice_errors_v1",
    favoritos: "uniprep_practice_favorites_v1",
    historial: "uniprep_practice_history_v1"
  };

  const CURSOS = [
    {id:"rm",nombre:"Razonamiento Matemático",icono:"🧠",color:"#8b6cff"},
    {id:"aritmetica",nombre:"Aritmética",icono:"🔢",color:"#55d5ff"},
    {id:"algebra",nombre:"Álgebra",icono:"📘",color:"#9d7cff"},
    {id:"geometria",nombre:"Geometría",icono:"📐",color:"#ff9f68"},
    {id:"trigonometria",nombre:"Trigonometría",icono:"📊",color:"#42d8c5"},
    {id:"fisica",nombre:"Física",icono:"⚛️",color:"#55a8ff"},
    {id:"quimica",nombre:"Química",icono:"🧪",color:"#ff6f9f"},
    {id:"biologia",nombre:"Biología",icono:"🧬",color:"#4adf91"},
    {id:"medio_ambiente",nombre:"Medio Ambiente",icono:"🌱",color:"#45d6a7"},
    {id:"anatomia",nombre:"Anatomía",icono:"🫀",color:"#ff6b86"},
    {id:"psicologia",nombre:"Psicología",icono:"🧠",color:"#c084fc"},
    {id:"rv",nombre:"Razonamiento Verbal",icono:"💬",color:"#d78cff"},
    {id:"comprension_lectora",nombre:"Comprensión Lectora",icono:"🔎",color:"#53d7ff"},
    {id:"lenguaje",nombre:"Lenguaje",icono:"✍️",color:"#ffbf5b"},
    {id:"literatura",nombre:"Literatura",icono:"📚",color:"#f59ebd"},
    {id:"historia",nombre:"Historia Universal",icono:"🏛️",color:"#5cc9b4"},
    {id:"historia_peru",nombre:"Historia del Perú",icono:"🇵🇪",color:"#f9737a"},
    {id:"geografia",nombre:"Geografía",icono:"🗺️",color:"#4db6ff"},
    {id:"filosofia",nombre:"Filosofía",icono:"💡",color:"#b794f6"},
    {id:"economia",nombre:"Economía",icono:"📈",color:"#72d47d"},
    {id:"civica",nombre:"Educación Cívica",icono:"⚖️",color:"#f39b6d"}
  ];

  const NIVELES = {
    basico: {nombre:"Base preuniversitaria",corto:"Básico",xp:8},
    intermedio: {nombre:"Razonamiento aplicado",corto:"Intermedio",xp:12},
    avanzado: {nombre:"Avanzado",corto:"Avanzado",xp:18},
    admision: {nombre:"Admisión por universidad",corto:"Admisión",xp:24}
  };

  const cacheBancos = new Map();
  const estado = { bancoConfig:null, cursoConfig:null, sesion:null, reloj:null };
  let colaProgreso = Promise.resolve();

  function raiz() {
    return document.getElementById("practice-center-root");
  }

  function iniciar() {
    const badge = document.getElementById("practice-nav-badge");
    if (badge) {
      badge.textContent = "6.5K";
      badge.title = "6,480 preguntas disponibles";
    }
    renderizarInicio();
  }

  function leerLista(clave) {
    const datos = window.uniprepStorage?.leer(clave, []);
    return Array.isArray(datos) ? datos : [];
  }

  function guardarLista(clave, datos) {
    window.uniprepStorage?.guardar(clave, datos);
  }

  function escapar(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function mezclar(datos) {
    const copia = [...datos];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function cursoPorId(id) {
    return cursosDisponibles().find(curso => curso.id === id) || cursosDisponibles()[0] || CURSOS[0];
  }

  function cursosDisponibles() {
    return CURSOS
      .filter(curso => window.cursoPermitidoAdmision?.(curso.id) !== false)
      .sort((a,b) => (Number(window.pesoCursoAdmision?.(b.id)) || 0) - (Number(window.pesoCursoAdmision?.(a.id)) || 0));
  }

  function cursoDisponible(id) {
    return cursosDisponibles().some(curso => curso.id === id);
  }

  function totalPreguntasCurso(id) {
    const curso = window.obtenerCursoRuta?.(id) || window.CURSOS_PREUNI?.[id];
    const porTema = universidadObjetivo() === "GENERAL" ? 40 : 10;
    return (curso?.temas?.length || 0) * porTema;
  }

  function universidadObjetivo() {
    const valor = String(window.obtenerSeleccionAdmision?.()?.universidadCorta || "GENERAL").toUpperCase();
    return valor === "OTRA" ? "GENERAL" : valor;
  }

  function perfilPreguntas() {
    return window.obtenerPerfilPreguntasAdmision?.() || {
      sigla:universidadObjetivo(),
      formato:"Ruta general de preparación preuniversitaria.",
      tipoPreguntas:["razonamiento", "conocimientos"],
      nivelPredeterminado:"todos",
      ritmo:"adaptativo"
    };
  }

  function preguntasAlineadas(cursoId, preguntas) {
    return window.filtrarPreguntasAdmision?.(cursoId, preguntas) || preguntas;
  }

  function ordenarParaRuta(preguntas, priorizarNivel = false) {
    const mezcladas = mezclar(preguntas);
    if (typeof window.ordenarPreguntasAdmision === "function") {
      return window.ordenarPreguntasAdmision(mezcladas, priorizarNivel);
    }
    return mezcladas;
  }

  function clavePregunta(pregunta) {
    return `${pregunta.courseId}:${pregunta.id}`;
  }

  function mostrarCargando(titulo = "Preparando tu práctica", texto = "Conectando con los bancos de preguntas…") {
    if (!raiz()) return;
    raiz().innerHTML = `<div class="practice-loading card"><span class="practice-loading-mark">✦</span><div><strong>${escapar(titulo)}</strong><small>${escapar(texto)}</small></div></div>`;
  }

  function resumenHistorial() {
    const historial = leerLista(CLAVES.historial);
    const respondidas = historial.reduce((suma, item) => suma + Number(item.total || 0), 0);
    const correctas = historial.reduce((suma, item) => suma + Number(item.correctas || 0), 0);
    return {
      historial,
      respondidas,
      precision: respondidas ? Math.round(correctas / respondidas * 100) : 0
    };
  }

  function renderizarInicio() {
    detenerReloj();
    estado.sesion = null;
    if (!raiz()) return;

    const errores = leerLista(CLAVES.errores);
    const favoritos = leerLista(CLAVES.favoritos);
    const resumen = resumenHistorial();
    const disponibles = cursosDisponibles();
    const perfil = perfilPreguntas();
    const guardado = window.uniprepStorage?.leerTexto("uniprep_last_practice_course", "") || "";
    const ultimoCurso = cursoDisponible(guardado) ? guardado : disponibles[0]?.id || "rm";
    const preguntasRuta = disponibles.reduce((suma,curso)=>suma+totalPreguntasCurso(curso.id),0);

    raiz().innerHTML = `
      <div class="practice-page-head">
        <div>
          <div class="practice-eyebrow">ENTRENAMIENTO ADAPTATIVO</div>
          <h1>Centro de Práctica</h1>
          <p>Entrena con los cursos, temas y niveles que corresponden a tu universidad y carrera. Cada ejercicio incluye solución desarrollada.</p>
        </div>
        <span class="practice-live-badge">Banco conectado</span>
      </div>

      <section class="practice-route-profile">
        <div class="practice-route-profile-mark">🎓</div>
        <div><small>PERFIL ACTIVO · ${escapar(perfil.sigla)} ${escapar(perfil.grupoId || "")}</small><strong>${escapar(perfil.formato)}</strong><p>${(perfil.tipoPreguntas || []).map(tipo=>`<span>${escapar(tipo)}</span>`).join("")}</p></div>
        <em>Ritmo ${escapar(perfil.ritmo || "adaptativo")}</em>
      </section>

      <section class="practice-hero">
        <div class="practice-hero-copy">
          <div class="practice-hero-kicker">RETO RECOMENDADO</div>
          <h2>Diez preguntas. <span>Un nivel más cerca.</span></h2>
          <p>Entrena un curso a la vez para que tus resultados, errores y recomendaciones permanezcan organizados. Cada respuesta correcta suma XP y mantiene tu racha.</p>
          <label class="practice-quick-picker">Curso del reto
            <select id="practice-quick-course">${disponibles.map(curso=>`<option value="${curso.id}"${curso.id===ultimoCurso?" selected":""}>${curso.icono} ${curso.nombre}</option>`).join("")}</select>
          </label>
          <div class="practice-hero-actions">
            <button class="practice-main-btn" type="button" onclick="iniciarPracticaRapida(document.getElementById('practice-quick-course')?.value)">⚡ Comenzar reto de 10</button>
            <button class="practice-secondary-btn" type="button" onclick="configurarPractica('${ultimoCurso}')">Personalizar entrenamiento</button>
          </div>
        </div>
        <div class="practice-hero-panel">
          <span>Banco de entrenamiento alineado</span>
          <strong>${preguntasRuta.toLocaleString("es-PE")}</strong>
          <span>ejercicios estimados de tu ruta</span>
          <div class="practice-bank-bar"><span></span></div>
          <div class="practice-bank-note"><span>${disponibles.length} cursos activos</span><span>4 niveles de reto</span></div>
        </div>
      </section>

      <div class="practice-metrics">
        ${tarjetaMetrica("🎯",resumen.respondidas.toLocaleString("es-PE"),"Respondidas en prácticas","rgba(124,92,255,.18)")}
        ${tarjetaMetrica("◎",`${resumen.precision}%`,"Precisión acumulada","rgba(66,200,255,.18)")}
        ${tarjetaMetrica("↻",errores.length,"Errores por dominar","rgba(255,95,143,.17)")}
        ${tarjetaMetrica("★",favoritos.length,"Preguntas favoritas","rgba(255,195,70,.16)")}
      </div>

      <div class="practice-section-head"><div><h2>Elige cómo entrenar</h2><p>Cuatro rutas con objetivos diferentes.</p></div><span>${resumen.historial.length} sesiones registradas</span></div>
      <div class="practice-actions-grid">
        ${tarjetaAccion("⚡","Reto rápido","10 preguntas del último curso elegido. Sin mezclar materias.","10 preguntas · 1 curso","#55d5ff","rgba(66,200,255,.17)","iniciarPracticaRapida()")}
        ${tarjetaAccion("⚙","Práctica personalizada","Elige curso, tema, dificultad y cantidad exacta de preguntas.","Control total","#a993ff","rgba(124,92,255,.18)",`configurarPractica('${disponibles[0]?.id || "rm"}')`)}
        ${tarjetaAccion("↻","Corregir mis errores","Vuelve a resolver las preguntas que fallaste hasta dominarlas.",`${errores.length} pendientes`,"#ff739d","rgba(255,95,143,.17)","iniciarColeccionPractica('errores')")}
        ${tarjetaAccion("★","Mis favoritas","Guarda ejercicios importantes y crea tu propio banco de repaso.",`${favoritos.length} guardadas`,"#ffd166","rgba(255,193,80,.16)","iniciarColeccionPractica('favoritos')")}
      </div>

      <div class="practice-section-head"><div><h2>Practicar por curso</h2><p>${preguntasRuta.toLocaleString("es-PE")} ejercicios estimados, separados por materia y tema. UniPrep oculta los contenidos que no corresponden a tu ruta.</p></div><span>Banco base: básico · intermedio · avanzado · admisión</span></div>
      <div class="practice-course-grid">
        ${disponibles.map(tarjetaCurso).join("")}
      </div>`;
  }

  function tarjetaMetrica(icono, valor, etiqueta, brillo) {
    return `<div class="practice-metric" style="--metric-glow:${brillo}"><div class="practice-metric-icon">${icono}</div><b>${valor}</b><span>${etiqueta}</span></div>`;
  }

  function tarjetaAccion(icono, titulo, texto, meta, color, brillo, accion) {
    return `<button class="practice-action-card" style="--action-color:${color};--action-glow:${brillo}" type="button" onclick="${accion}"><span class="practice-action-icon">${icono}</span><h3>${titulo}</h3><p>${texto}</p><span class="practice-action-meta"><span>${meta}</span><span>Entrar →</span></span></button>`;
  }

  function tarjetaCurso(curso) {
    const cursoRuta=window.obtenerCursoRuta?.(curso.id)||window.CURSOS_PREUNI?.[curso.id];
    const oficiales=cursoRuta?.temas?.length||0;
    const detalle=window.detallePesoCursoAdmision?.(curso.id);
    const ruta=detalle ? ` · ${detalle.etiqueta}` : "";
    return `<button class="practice-course-card" style="--course-color:${curso.color}" type="button" onclick="configurarPractica('${curso.id}')"><span class="practice-course-top"><span class="practice-course-icon">${curso.icono}</span><span class="practice-course-count">${totalPreguntasCurso(curso.id).toLocaleString("es-PE")} alineadas</span></span><h3>${curso.nombre}</h3><p>${oficiales} temas de tu temario${ruta}</p><span class="practice-course-line"><span></span></span></button>`;
  }

  function opcionesTemasBanco(banco) {
    const grupos = new Map();
    const temasRuta = new Set((window.filtrarTemasAdmision?.(banco.courseId, banco.temas || []) || banco.temas || []).map(tema=>tema.id || tema.titulo));
    const alineadas = preguntasAlineadas(banco.courseId, banco.preguntas || []);
    (banco.temas||[]).forEach((tema,i)=>{
      if (!temasRuta.has(tema.id || tema.titulo)) return;
      const subarea=tema.subarea||"Temario";
      if(!grupos.has(subarea))grupos.set(subarea,[]);
      grupos.get(subarea).push({tema,i});
    });
    return [...grupos.entries()].map(([subarea,temas])=>`<optgroup label="${escapar(subarea)}">${temas.map(({tema,i})=>{const cantidad=alineadas.filter(p=>Number(p.temaIndice)===i).length;return `<option value="${i}">${escapar(tema.titulo)} · ${cantidad} alineadas</option>`}).join("")}</optgroup>`).join("");
  }

  async function cargarBanco(cursoId) {
    if (cacheBancos.has(cursoId)) return cacheBancos.get(cursoId);
    const respuesta = await fetch(`json/quiz-cursos/${cursoId}.json`, {cache:"no-store"});
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${cursoId}.json`);
    const datos = await respuesta.json();
    const preguntas = [];
    (datos.temas || []).forEach((tema, temaIndice) => {
      Object.entries(tema.niveles || {}).forEach(([nivel, grupo]) => {
        (grupo || []).forEach(pregunta => preguntas.push({
          ...pregunta,
          courseId:cursoId,
          curso:datos.nombre || cursoPorId(cursoId).nombre,
          tema:tema.titulo,
          temaIndice,
          nivel
        }));
      });
    });
    const banco = {...datos, preguntas};
    cacheBancos.set(cursoId, banco);
    return banco;
  }

  async function configurarPractica(cursoId) {
    if (!cursoDisponible(cursoId)) {
      mostrarVacio("🎓","Curso fuera de tu grupo","Este curso no forma parte de tu área de admisión actual. Cambia tu objetivo desde Mi perfil si lo necesitas.");
      return;
    }
    if (typeof window.go === "function") window.go("ejercicios", null);
    mostrarCargando("Abriendo configuración", `Cargando ${cursoPorId(cursoId).nombre}…`);
    try {
      const banco = await cargarBanco(cursoId);
      window.uniprepStorage?.guardarTexto("uniprep_last_practice_course", cursoId);
      estado.bancoConfig = banco;
      estado.cursoConfig = cursoId;
      renderizarConfigurador(banco);
    } catch (error) {
      console.error(error);
      mostrarVacio("⚠️","No pudimos abrir este banco","Usa Live Server o Vercel para que UniPrep pueda leer los archivos JSON.");
    }
  }

  function renderizarConfigurador(banco) {
    const curso = cursoPorId(banco.courseId);
    const perfil = perfilPreguntas();
    const nivelInicial = perfil.nivelPredeterminado || "todos";
    const disponiblesRuta = preguntasAlineadas(banco.courseId, banco.preguntas || []);
    raiz().innerHTML = `
      <div class="practice-config-shell">
        <button class="practice-back" type="button" onclick="renderizarCentroPractica()">← Volver al Centro de Práctica</button>
        <section class="practice-config-card" style="--course-color:${curso.color}">
          <div class="practice-config-banner">
            <span class="practice-config-icon">${curso.icono}</span>
            <div><div class="practice-eyebrow">CONFIGURA TU SESIÓN</div><h1>${escapar(curso.nombre)}</h1><p>Selecciona exactamente qué deseas entrenar.</p></div>
          </div>
          <div class="practice-config-body">
            <div class="practice-config-route"><small>${escapar(perfil.sigla)} · ${escapar(perfil.grupoId || "RUTA GENERAL")}</small><strong>${escapar(perfil.formato)}</strong><span>Tipo de pregunta: ${escapar((perfil.tipoPreguntas || []).join(" · "))}</span></div>
            <div class="practice-form-grid">
              <div class="practice-field"><label for="practice-topic-select">Tema</label><select id="practice-topic-select" onchange="actualizarDisponibilidadPractica()"><option value="todos">Todos los temas del curso</option>${opcionesTemasBanco(banco)}</select></div>
              <div class="practice-field"><label for="practice-level-select">Dificultad</label><select id="practice-level-select" onchange="actualizarDisponibilidadPractica()"><option value="todos"${nivelInicial==="todos"?" selected":""}>Diagnóstico mixto</option><option value="basico"${nivelInicial==="basico"?" selected":""}>Base preuniversitaria</option><option value="intermedio"${nivelInicial==="intermedio"?" selected":""}>Intermedio · razonamiento aplicado</option><option value="avanzado"${nivelInicial==="avanzado"?" selected":""}>Avanzado · mayor exigencia</option><option value="admision"${nivelInicial==="admision"?" selected":""}>Admisión · perfil ${escapar(universidadObjetivo())}</option><option value="exigente"${nivelInicial==="exigente"?" selected":""}>Modo exigente · avanzado + admisión</option></select></div>
              <div class="practice-field"><label for="practice-count-select">Cantidad</label><select id="practice-count-select" onchange="actualizarDisponibilidadPractica()"><option value="10" selected>10 preguntas</option><option value="20">20 preguntas</option><option value="30">30 preguntas</option><option value="40">Hasta 40 preguntas</option><option value="60">Hasta 60 preguntas</option></select></div>
              <div class="practice-field"><label for="practice-order-select">Selección</label><select id="practice-order-select"><option value="adaptativo">Adaptativa · sube la exigencia</option><option value="aleatorio">Aleatoria</option><option value="banco">Orden del banco</option></select></div>
            </div>
            <div class="practice-availability"><div><b id="practice-available-count">${disponiblesRuta.length} alineadas</b><span id="practice-session-summary">Selección filtrada para ${escapar(perfil.sigla)}</span></div><span>Solución y explicación incluidas</span></div>
            <div class="practice-config-actions"><button class="practice-secondary-btn" type="button" onclick="renderizarCentroPractica()">Cancelar</button><button class="practice-main-btn" type="button" onclick="comenzarPracticaPersonalizada()">Comenzar práctica →</button></div>
          </div>
        </section>
      </div>`;
    actualizarDisponibilidadPractica();
  }

  function preguntasFiltradasConfigurador() {
    if (!estado.bancoConfig) return [];
    const tema = document.getElementById("practice-topic-select")?.value || "todos";
    const nivel = document.getElementById("practice-level-select")?.value || "todos";
    return preguntasAlineadas(estado.cursoConfig, estado.bancoConfig.preguntas).filter(pregunta =>
      (tema === "todos" || Number(tema) === Number(pregunta.temaIndice)) &&
      (nivel === "todos" || nivel === pregunta.nivel || (nivel === "exigente" && ["avanzado","admision"].includes(pregunta.nivel)))
    );
  }

  function actualizarDisponibilidadPractica() {
    const preguntas = preguntasFiltradasConfigurador();
    const temaSelect = document.getElementById("practice-topic-select");
    const nivelSelect = document.getElementById("practice-level-select");
    const cantidad = Number(document.getElementById("practice-count-select")?.value || 10);
    const contador = document.getElementById("practice-available-count");
    const resumen = document.getElementById("practice-session-summary");
    if (contador) contador.textContent = `${preguntas.length} disponibles`;
    if (resumen) resumen.textContent = `${temaSelect?.selectedOptions[0]?.textContent || "Todos los temas"} · ${nivelSelect?.selectedOptions[0]?.textContent || "Todas las dificultades"} · ${Math.min(cantidad,preguntas.length)} preguntas`;
  }

  function comenzarPracticaPersonalizada() {
    let preguntas = preguntasFiltradasConfigurador();
    const cantidad = Number(document.getElementById("practice-count-select")?.value || 10);
    const orden = document.getElementById("practice-order-select")?.value || "adaptativo";
    if (orden === "aleatorio") preguntas = mezclar(preguntas);
    if (orden === "adaptativo") {
      preguntas = ordenarParaRuta(preguntas, true);
    }
    preguntas = preguntas.slice(0, Math.min(cantidad, preguntas.length));
    const curso = cursoPorId(estado.cursoConfig);
    comenzarSesion(preguntas, `Práctica de ${curso.nombre}`, "personalizada");
  }

  async function iniciarPracticaRapida(cursoId) {
    if (typeof window.go === "function") window.go("ejercicios", null);
    const guardado = window.uniprepStorage?.leerTexto("uniprep_last_practice_course", "") || "";
    const idElegido = cursoDisponible(cursoId) ? cursoId : (cursoDisponible(guardado) ? guardado : cursosDisponibles()[0]?.id || "rm");
    const curso = cursoPorId(idElegido);
    window.uniprepStorage?.guardarTexto("uniprep_last_practice_course", idElegido);
    mostrarCargando("Creando tu reto inteligente",`Seleccionando preguntas solo de ${curso.nombre}…`);
    try {
      const banco = await cargarBanco(idElegido);
      const preguntas = preguntasAlineadas(idElegido, banco.preguntas);
      comenzarSesion(ordenarParaRuta(preguntas, true).slice(0, 10), `Reto rápido · ${curso.nombre} · ${universidadObjetivo()}`, "rapida");
    } catch (error) {
      console.error(error);
      mostrarVacio("⚠️","No pudimos crear el reto","Abre UniPrep con Live Server o desde Vercel para cargar los bancos JSON.");
    }
  }

  async function iniciarPracticaCursoNivel(cursoId, nivel="todos", cantidad=10) {
    if (!cursoDisponible(cursoId)) {
      mostrarVacio("🎓","Curso fuera de tu grupo","Este banco no pertenece a tu ruta de admisión actual.");
      return;
    }
    if (typeof window.go === "function") window.go("ejercicios", null);
    const curso=cursoPorId(cursoId);
    mostrarCargando("Preparando entrenamiento",`Cargando ${curso.nombre}…`);
    try{
      const banco=await cargarBanco(cursoId);
      let preguntas=preguntasAlineadas(cursoId,banco.preguntas).filter(p=>nivel==="todos"||p.nivel===nivel||(nivel==="exigente"&&["avanzado","admision"].includes(p.nivel)));
      preguntas=ordenarParaRuta(preguntas,nivel==="todos"||nivel==="exigente").slice(0,Math.min(Number(cantidad)||10,preguntas.length));
      comenzarSesion(preguntas,`${curso.nombre} · ${nivel==="todos"?"nivel mixto":nivel==="exigente"?"modo exigente":NIVELES[nivel]?.corto||nivel}`,"curso");
    }catch(error){
      console.error(error);
      mostrarVacio("⚠️","No pudimos abrir el banco","Abre UniPrep con Live Server o desde Vercel para cargar los archivos JSON.");
    }
  }

  async function iniciarPracticaTemaNivel(cursoId, temaReferencia, nivel="todos", cantidad=10) {
    if (!cursoDisponible(cursoId)) {
      mostrarVacio("🎓","Curso fuera de tu grupo","Este banco no pertenece a tu ruta de admisión actual.");
      return;
    }
    if (typeof window.go === "function") window.go("ejercicios", null);
    const curso=cursoPorId(cursoId);
    mostrarCargando("Preparando un solo tema",`Separando las preguntas de ${curso.nombre}…`);
    try {
      const banco=await cargarBanco(cursoId);
      const indice=Number.isInteger(Number(temaReferencia))&&String(temaReferencia).trim()!==""?Number(temaReferencia):banco.temas.findIndex(t=>String(t.titulo).toLowerCase()===String(temaReferencia||"").toLowerCase());
      const tema=banco.temas[indice];
      if(!tema)throw new Error("Tema no encontrado en el banco");
      let preguntas=preguntasAlineadas(cursoId,banco.preguntas).filter(p=>p.temaIndice===indice&&(nivel==="todos"||p.nivel===nivel||(nivel==="exigente"&&["avanzado","admision"].includes(p.nivel))));
      const limite=nivel==="todos"?40:nivel==="exigente"?20:10;
      const solicitadas=Math.min(Number(cantidad)||limite,limite,preguntas.length);
      preguntas=ordenarParaRuta(preguntas,nivel==="todos"||nivel==="exigente").slice(0,solicitadas);
      comenzarSesion(preguntas,`${tema.subarea||curso.nombre} · ${tema.titulo} · ${nivel==="todos"?"tema completo":NIVELES[nivel]?.corto||nivel}`,"tema");
    } catch(error) {
      console.error(error);
      mostrarVacio("⚠️","No pudimos abrir este tema","Actualiza la página con Live Server para cargar el banco académico renovado.");
    }
  }

  function iniciarColeccionPractica(tipo, cursoId = null) {
    const clave = tipo === "errores" ? CLAVES.errores : CLAVES.favoritos;
    const coleccion = leerLista(clave);
    const esError = tipo === "errores";
    if (!coleccion.length) {
      mostrarVacio(esError ? "✓" : "☆", esError ? "No tienes errores pendientes" : "Todavía no tienes favoritas", esError ? "Cuando falles una pregunta aparecerá aquí para que puedas dominarla." : "Pulsa la estrella durante una práctica para crear tu colección personal.");
      return;
    }
    const cursosColeccion = [...new Set(coleccion.map(pregunta=>pregunta.courseId).filter(id=>id && cursoDisponible(id)))];
    if (!cursosColeccion.length) {
      mostrarVacio("🎓","Colección fuera de tu ruta","Tus preguntas guardadas pertenecen a otros grupos. Puedes cambiar tu objetivo para volver a verlas.");
      return;
    }
    if (!cursoId && cursosColeccion.length > 1) {
      mostrarSelectorColeccion(tipo, coleccion, cursosColeccion);
      return;
    }
    const idElegido = cursoId || cursosColeccion[0];
    const preguntas = idElegido ? coleccion.filter(pregunta=>pregunta.courseId===idElegido) : coleccion;
    window.uniprepStorage?.guardarTexto("uniprep_last_practice_course", idElegido || "rm");
    comenzarSesion(mezclar(preguntas), esError ? "Repaso de errores" : "Preguntas favoritas", tipo);
  }

  function mostrarSelectorColeccion(tipo, coleccion, cursosDisponibles) {
    const esError = tipo === "errores";
    if (typeof window.go === "function") window.go("ejercicios", null);
    raiz().innerHTML = `<div class="practice-config-shell"><button class="practice-back" type="button" onclick="renderizarCentroPractica()">← Volver</button><section class="practice-config-card"><div class="practice-config-banner"><span class="practice-config-icon">${esError?"↻":"★"}</span><div><div class="practice-eyebrow">BANCO PERSONAL ORGANIZADO</div><h1>${esError?"Corregir mis errores":"Mis favoritas"}</h1><p>Elige una materia. UniPrep nunca mezclará cursos dentro de esta sesión.</p></div></div><div class="practice-collection-courses">${cursosDisponibles.map(id=>{const curso=cursoPorId(id);const cantidad=coleccion.filter(p=>p.courseId===id).length;return `<button type="button" style="--course-color:${curso.color}" onclick="iniciarColeccionPractica('${tipo}','${id}')"><span>${curso.icono}</span><b>${escapar(curso.nombre)}</b><small>${cantidad} pregunta${cantidad===1?"":"s"}</small><em>Practicar →</em></button>`}).join("")}</div></section></div>`;
  }

  function mostrarVacio(icono, titulo, texto) {
    if (typeof window.go === "function") window.go("ejercicios", null);
    raiz().innerHTML = `<div class="practice-empty card"><div class="practice-empty-icon">${icono}</div><h2>${escapar(titulo)}</h2><p>${escapar(texto)}</p><button class="practice-main-btn" type="button" onclick="renderizarCentroPractica()">Volver al centro</button></div>`;
  }

  function comenzarSesion(preguntas, titulo, modo) {
    if (!Array.isArray(preguntas) || !preguntas.length) {
      mostrarVacio("⌁","No hay preguntas con estos filtros","Cambia el tema, la dificultad o la cantidad e inténtalo otra vez.");
      return;
    }
    const cursosSesion = [...new Set(preguntas.map(pregunta=>pregunta.courseId).filter(Boolean))];
    if (cursosSesion.length > 1) {
      mostrarVacio("▦","Selecciona un solo curso","Para mantener tus resultados ordenados, cada práctica utiliza preguntas de una sola materia.");
      return;
    }
    if (typeof window.go === "function") window.go("ejercicios", null);
    estado.sesion = {
      preguntas:preguntas.map(pregunta => ({...pregunta})),
      titulo,
      modo,
      indice:0,
      correctas:0,
      incorrectas:0,
      xp:0,
      combo:0,
      respuestas:[],
      respondida:false,
      inicio:Date.now(),
      inicioPregunta:Date.now()
    };
    iniciarReloj();
    renderizarPregunta();
  }

  function iniciarReloj() {
    detenerReloj();
    estado.reloj = setInterval(actualizarReloj, 1000);
  }

  function detenerReloj() {
    if (estado.reloj) clearInterval(estado.reloj);
    estado.reloj = null;
  }

  function segundosSesion() {
    return estado.sesion ? Math.max(0, Math.floor((Date.now() - estado.sesion.inicio) / 1000)) : 0;
  }

  function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return `${String(minutos).padStart(2,"0")}:${String(resto).padStart(2,"0")}`;
  }

  function estimuloPregunta(pregunta) {
    const valor = pregunta?.estimulo ?? pregunta?.texto ?? pregunta?.lectura ?? pregunta?.caso ?? pregunta?.tabla ?? pregunta?.grafico ?? pregunta?.imagen;
    if (valor == null || valor === "") return "";
    return typeof valor === "string" ? valor : JSON.stringify(valor, null, 2);
  }

  function actualizarReloj() {
    const reloj = document.getElementById("practice-clock");
    if (reloj) reloj.textContent = `⏱ ${formatearTiempo(segundosSesion())}`;
  }

  function renderizarPregunta() {
    const sesion = estado.sesion;
    if (!sesion || !raiz()) return;
    const pregunta = sesion.preguntas[sesion.indice];
    const nivel = NIVELES[pregunta.nivel] || {corto:pregunta.nivel || "Mixto"};
    const progreso = Math.round((sesion.indice + 1) / sesion.preguntas.length * 100);
    sesion.respondida = false;
    sesion.inicioPregunta = Date.now();

    raiz().innerHTML = `
      <div class="practice-session">
        <div class="practice-session-top">
          <button class="practice-exit" type="button" onclick="salirPractica()" aria-label="Salir de la práctica">✕</button>
          <div><div class="practice-session-meta"><span>Pregunta <b>${sesion.indice+1}</b> de ${sesion.preguntas.length}</span><span>${escapar(sesion.titulo)}</span></div><div class="practice-session-progress"><span style="width:${progreso}%"></span></div></div>
          <div class="practice-clock" id="practice-clock">⏱ ${formatearTiempo(segundosSesion())}</div>
        </div>

        <article class="practice-question-card">
          <button class="practice-favorite ${esFavorita(pregunta)?"active":""}" id="practice-favorite-btn" type="button" onclick="alternarFavoritaPractica()" aria-label="Guardar como favorita">${esFavorita(pregunta)?"★":"☆"}</button>
          <div class="practice-question-tags"><span class="practice-tag">${escapar(pregunta.curso)}</span><span class="practice-tag">${escapar(pregunta.tema)}</span><span class="practice-tag level">${escapar(nivel.corto)}</span>${pregunta.universidadReferencia?`<span class="practice-tag">Estilo ${escapar(pregunta.universidadReferencia)}</span>`:""}</div>
          ${estimuloPregunta(pregunta) ? `<div class="practice-question-stimulus"><b>Material de lectura</b><p>${escapar(estimuloPregunta(pregunta))}</p></div>` : ""}
          <p class="practice-question-text">${escapar(pregunta.pregunta)}</p>
        </article>

        <div class="practice-options" id="practice-options">
          ${(pregunta.alternativas||[]).map((opcion,indice)=>`<button class="practice-option" type="button" onclick="responderPractica(${indice})"><span class="practice-option-letter">${"ABCDE"[indice]||indice+1}</span><span class="practice-option-text">${escapar(opcion)}</span></button>`).join("")}
        </div>

        <div class="practice-feedback" id="practice-feedback"></div>
        <div class="practice-session-actions">
          <div class="practice-session-stats"><span class="practice-mini-stat"><b id="practice-correct-count">${sesion.correctas}</b> correctas</span><span class="practice-mini-stat"><b id="practice-wrong-count">${sesion.incorrectas}</b> errores</span><span class="practice-mini-stat"><b id="practice-xp-count">+${sesion.xp}</b> XP</span></div>
          <button class="practice-main-btn" id="practice-next-btn" type="button" onclick="siguientePreguntaPractica()" disabled>${sesion.indice===sesion.preguntas.length-1?"Ver resultado":"Siguiente pregunta →"}</button>
        </div>
      </div>`;
  }

  function responderPractica(indiceSeleccionado) {
    const sesion = estado.sesion;
    if (!sesion || sesion.respondida) return;
    const pregunta = sesion.preguntas[sesion.indice];
    const indiceCorrecto = Number(pregunta.respuesta);
    const correcto = indiceSeleccionado === indiceCorrecto;
    const botones = [...document.querySelectorAll("#practice-options .practice-option")];
    const segundos = Math.max(1, Math.round((Date.now() - sesion.inicioPregunta) / 1000));
    const xp = correcto ? (NIVELES[pregunta.nivel]?.xp || 10) : 0;

    sesion.respondida = true;
    sesion.correctas += correcto ? 1 : 0;
    sesion.incorrectas += correcto ? 0 : 1;
    sesion.xp += xp;
    sesion.combo = correcto ? sesion.combo + 1 : 0;
    sesion.respuestas.push({pregunta:{...pregunta},seleccion:indiceSeleccionado,correcto,segundos});

    botones.forEach((boton, indice) => {
      boton.disabled = true;
      if (indice === indiceCorrecto) boton.classList.add("correct");
      else if (indice === indiceSeleccionado) boton.classList.add("wrong");
    });

    const feedback = document.getElementById("practice-feedback");
    feedback.className = `practice-feedback show ${correcto?"good":"bad"}`;
    feedback.innerHTML = `<h3>${correcto?`✓ ¡Correcto! +${xp} XP`:`✕ Aún no. La respuesta es ${"ABCDE"[indiceCorrecto]||indiceCorrecto+1}.`}</h3>${pregunta.solucion?`<p><b>Solución:</b> ${escapar(pregunta.solucion)}</p>`:""}<p><b>Explicación:</b> ${escapar(pregunta.explicacion||"Revisa la teoría y vuelve a intentarlo.")}</p><button class="practice-tutor-btn" type="button" onclick="consultarTutorPreguntaActual()">💡 Entender con el Tutor académico</button>`;

    document.getElementById("practice-correct-count").textContent = sesion.correctas;
    document.getElementById("practice-wrong-count").textContent = sesion.incorrectas;
    document.getElementById("practice-xp-count").textContent = `+${sesion.xp}`;
    document.getElementById("practice-next-btn").disabled = false;

    if (correcto && typeof window.celebrarRespuestaCorrecta === "function") {
      window.celebrarRespuestaCorrecta({xp,combo:sesion.combo,nivel:pregunta.nivel,universidad:pregunta.universidadReferencia});
    }

    actualizarErrores(pregunta, correcto);
    registrarProgreso(pregunta, correcto, xp, segundos);
  }

  function registrarProgreso(pregunta, correcto, xp, segundos) {
    const area = areaDeCurso(pregunta.courseId);
    colaProgreso = colaProgreso.then(async () => {
      if (typeof window.registrarResultadoEjercicio === "function") {
        await window.registrarResultadoEjercicio({correcto,area,cursoId:pregunta.courseId,tema:pregunta.tema,preguntaId:pregunta.id,xpGanado:xp,tiempoSegundos:segundos});
      }
      if (typeof window.cargarDashboard === "function") await window.cargarDashboard();
    }).catch(error => console.warn("No se pudo registrar el progreso de práctica:", error));
  }

  function areaDeCurso(cursoId) {
    if (["rm","aritmetica","algebra","geometria","trigonometria"].includes(cursoId)) return "matematica";
    if (["comprension_lectora","lenguaje","literatura","rv"].includes(cursoId)) return "lenguaje";
    if (["historia","historia_peru","geografia","filosofia","economia","civica","psicologia"].includes(cursoId)) return "historia";
    if (["biologia","medio_ambiente","anatomia"].includes(cursoId)) return "biologia";
    return cursoId;
  }

  function actualizarErrores(pregunta, correcto) {
    const errores = leerLista(CLAVES.errores);
    const clave = clavePregunta(pregunta);
    const restantes = errores.filter(item => clavePregunta(item) !== clave);
    if (!correcto) restantes.unshift({...pregunta,guardadaEn:new Date().toISOString()});
    guardarLista(CLAVES.errores, restantes.slice(0, 250));
  }

  function esFavorita(pregunta) {
    const clave = clavePregunta(pregunta);
    return leerLista(CLAVES.favoritos).some(item => clavePregunta(item) === clave);
  }

  function alternarFavoritaPractica() {
    const sesion = estado.sesion;
    if (!sesion) return;
    const pregunta = sesion.preguntas[sesion.indice];
    const clave = clavePregunta(pregunta);
    const favoritas = leerLista(CLAVES.favoritos);
    const indice = favoritas.findIndex(item => clavePregunta(item) === clave);
    if (indice >= 0) favoritas.splice(indice, 1);
    else favoritas.unshift({...pregunta,guardadaEn:new Date().toISOString()});
    guardarLista(CLAVES.favoritos, favoritas.slice(0, 250));
    const boton = document.getElementById("practice-favorite-btn");
    if (boton) {
      const activa = indice < 0;
      boton.classList.toggle("active", activa);
      boton.textContent = activa ? "★" : "☆";
    }
  }

  function siguientePreguntaPractica() {
    const sesion = estado.sesion;
    if (!sesion || !sesion.respondida) return;
    if (sesion.indice >= sesion.preguntas.length - 1) {
      finalizarPractica();
      return;
    }
    sesion.indice += 1;
    renderizarPregunta();
  }

  function consultarTutorPreguntaActual() {
    const pregunta = estado.sesion?.preguntas?.[estado.sesion.indice];
    if (!pregunta || typeof window.abrirTutorConContexto !== "function") return;
    window.abrirTutorConContexto({courseId:pregunta.courseId,tema:pregunta.tema,pregunta:pregunta.pregunta});
  }

  async function finalizarPractica() {
    const sesion = estado.sesion;
    if (!sesion) return;
    detenerReloj();
    await colaProgreso;
    const segundos = segundosSesion();
    const porcentaje = Math.round(sesion.correctas / sesion.preguntas.length * 100);
    const historial = leerLista(CLAVES.historial);
    historial.unshift({
      fecha:new Date().toISOString(),
      titulo:sesion.titulo,
      modo:sesion.modo,
      total:sesion.preguntas.length,
      correctas:sesion.correctas,
      porcentaje,
      xp:sesion.xp,
      segundos
    });
    guardarLista(CLAVES.historial, historial.slice(0, 30));

    try {
      if (typeof window.actualizarRachaEstudio === "function") await window.actualizarRachaEstudio();
      if (typeof window.registrarActividad === "function") await window.registrarActividad({tipo:"practica",titulo:sesion.titulo,descripcion:`${porcentaje}% · ${sesion.correctas}/${sesion.preguntas.length} correctas`,xpGanado:sesion.xp});
      if (typeof window.registrarNotificacion === "function") window.registrarNotificacion({tipo:"practica",titulo:"Práctica completada",cuerpo:`Obtuviste ${porcentaje}% y ganaste ${sesion.xp} XP.`});
    } catch (error) {
      console.warn("La práctica terminó, pero no se pudo registrar una actividad secundaria:", error);
    }
    renderizarResultado(porcentaje, segundos);
  }

  function renderizarResultado(porcentaje, segundos) {
    const sesion = estado.sesion;
    const errores = sesion.respuestas.filter(respuesta => !respuesta.correcto);
    const mensaje = porcentaje >= 85 ? "Dominio excelente" : porcentaje >= 65 ? "Buen avance" : "Tu siguiente mejora empieza aquí";
    raiz().innerHTML = `
      <div class="practice-result">
        <section class="practice-result-hero">
          <div class="practice-eyebrow">SESIÓN COMPLETADA</div>
          <div class="practice-result-ring" style="--score:${porcentaje}%"><b>${porcentaje}%</b></div>
          <h1>${mensaje}</h1>
          <p>${escapar(sesion.titulo)}. Tus errores quedaron guardados automáticamente para un futuro repaso.</p>
        </section>
        <div class="practice-result-grid">
          <div class="practice-result-stat"><b>${sesion.correctas}</b><span>Correctas</span></div>
          <div class="practice-result-stat"><b>${sesion.incorrectas}</b><span>Errores</span></div>
          <div class="practice-result-stat"><b>+${sesion.xp}</b><span>XP ganados</span></div>
          <div class="practice-result-stat"><b>${formatearTiempo(segundos)}</b><span>Tiempo</span></div>
        </div>
        ${errores.length?`<div class="practice-section-head"><div><h2>Revisión de errores</h2><p>Estas preguntas ya están en tu ruta de mejora.</p></div><span>${errores.length} preguntas</span></div><div class="practice-review">${errores.map((respuesta,i)=>`<div class="practice-review-item"><strong>${i+1}. ${escapar(respuesta.pregunta.pregunta)}</strong><p><b>Respuesta correcta:</b> ${"ABCDE"[respuesta.pregunta.respuesta]}. ${escapar(respuesta.pregunta.alternativas[respuesta.pregunta.respuesta])}</p><p><b>Explicación:</b> ${escapar(respuesta.pregunta.explicacion||respuesta.pregunta.solucion||"")}</p></div>`).join("")}</div>`:`<div class="practice-empty card" style="margin-top:16px"><div class="practice-empty-icon">🏆</div><h2>Sesión perfecta</h2><p>No tuviste errores en esta práctica.</p></div>`}
        <div class="practice-result-actions"><button class="practice-secondary-btn" type="button" onclick="repetirPractica()">Repetir sesión</button>${errores.length?`<button class="practice-secondary-btn" type="button" onclick="iniciarColeccionPractica('errores')">Repasar errores</button>`:""}<button class="practice-main-btn" type="button" onclick="renderizarCentroPractica()">Volver al centro</button></div>
      </div>`;
  }

  function repetirPractica() {
    if (!estado.sesion) return;
    comenzarSesion(mezclar(estado.sesion.preguntas), estado.sesion.titulo, estado.sesion.modo);
  }

  function salirPractica() {
    if (estado.sesion && (estado.sesion.indice > 0 || estado.sesion.respondida)) {
      const salir = window.confirm("¿Salir de esta práctica? El progreso de la sesión actual no se guardará.");
      if (!salir) return;
    }
    renderizarInicio();
  }

  function abrirCentroPractica(elemento) {
    if (typeof window.go === "function") window.go("ejercicios", elemento || null);
    renderizarInicio();
  }

  document.addEventListener("keydown", evento => {
    const pantalla = document.getElementById("ejercicios");
    const sesion = estado.sesion;
    if (!pantalla?.classList.contains("active") || !sesion) return;
    const tecla = evento.key.toLowerCase();
    if (!sesion.respondida && /^[1-5]$/.test(tecla)) responderPractica(Number(tecla)-1);
    else if (!sesion.respondida && /^[a-e]$/.test(tecla)) responderPractica("abcde".indexOf(tecla));
    else if (sesion.respondida && tecla === "enter") siguientePreguntaPractica();
    else if (tecla === "f") alternarFavoritaPractica();
  });

  window.abrirCentroPractica = abrirCentroPractica;
  window.renderizarCentroPractica = renderizarInicio;
  window.configurarPractica = configurarPractica;
  window.actualizarDisponibilidadPractica = actualizarDisponibilidadPractica;
  window.comenzarPracticaPersonalizada = comenzarPracticaPersonalizada;
  window.iniciarPracticaRapida = iniciarPracticaRapida;
  window.iniciarPracticaCursoNivel = iniciarPracticaCursoNivel;
  window.iniciarPracticaTemaNivel = iniciarPracticaTemaNivel;
  window.iniciarColeccionPractica = iniciarColeccionPractica;
  window.responderPractica = responderPractica;
  window.siguientePreguntaPractica = siguientePreguntaPractica;
  window.alternarFavoritaPractica = alternarFavoritaPractica;
  window.consultarTutorPreguntaActual = consultarTutorPreguntaActual;
  window.repetirPractica = repetirPractica;
  window.salirPractica = salirPractica;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
  document.addEventListener("uniprep:admission-ready", renderizarInicio);
  document.addEventListener("uniprep:admission-change", renderizarInicio);
  document.addEventListener("uniprep:syllabus-ready", renderizarInicio);
})();
