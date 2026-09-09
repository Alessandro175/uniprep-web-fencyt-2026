(function () {
  "use strict";

  const TOTAL_PREGUNTAS = 12660;
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
    {id:"civica",nombre:"Cívica",icono:"⚖️",color:"#f39b6d"},
    {id:"calculo",nombre:"Cálculo",icono:"∫",color:"#4fc3f7"},
    {id:"logica",nombre:"Lógica",icono:"◇",color:"#a78bfa"},
    {id:"actualidad",nombre:"Actualidad",icono:"🌐",color:"#34d399"},
    {id:"ingles",nombre:"Inglés",icono:"EN",color:"#f59e0b"}
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
      badge.textContent = "12,660";
      badge.title = "12,660 preguntas disponibles";
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
    const cantidadDeclarada = Number(window.CURSOS_PREUNI?.[id]?.bancoPreguntas) || 0;
    if (cantidadDeclarada) return cantidadDeclarada;
    return (curso?.temas?.length || 0) * 60;
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

  async function iniciarPracticaTemaNivel(cursoId, temaReferencia, nivel="todos", cantidad=15) {
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

  function figuraPregunta(pregunta) {
    const figura = pregunta?.figura || figuraAlgebraAutomatica(pregunta);
    if (!figura || typeof figura !== "object") return "";
    const numero = (valor, respaldo = 0) => Number.isFinite(Number(valor)) ? Number(valor) : respaldo;
    const texto = valor => escapar(String(valor ?? ""));
    const envoltura = (clase, etiqueta, svg, pie = "") => `<div class="question-figure ${clase}" role="img" aria-label="${texto(etiqueta)}">${svg}${pie ? `<span>${texto(pie)}</span>` : ""}</div>`;
    const svg = contenido => `<svg viewBox="0 0 320 210" aria-hidden="true">${contenido}</svg>`;
    if (figura.tipo === "formula") {
      return `<div class="question-figure formula-figure" role="img" aria-label="Expresión matemática"><small>EXPRESIÓN MATEMÁTICA</small><strong>${texto(figura.contenido)}</strong></div>`;
    }
    if (figura.tipo === "reloj") {
      const hora = Math.max(0, Math.min(11, Number(figura.hora) || 0));
      const minuto = Math.max(0, Math.min(59, Number(figura.minuto) || 0));
      const giroHora = hora * 30 + minuto * 0.5;
      const giroMinuto = minuto * 6;
      return `<div class="question-figure clock-figure" role="img" aria-label="Reloj que marca ${hora}:${String(minuto).padStart(2,"0")}">
        <div class="clock-face"><span class="clock-number n12">12</span><span class="clock-number n3">3</span><span class="clock-number n6">6</span><span class="clock-number n9">9</span><i class="clock-hand hour" style="transform:translateX(-50%) rotate(${giroHora}deg)"></i><i class="clock-hand minute" style="transform:translateX(-50%) rotate(${giroMinuto}deg)"></i><i class="clock-pin"></i></div>
        <strong>${hora}:${String(minuto).padStart(2,"0")}</strong></div>`;
    }
    if (figura.tipo === "trigonometrica") {
      const funcion = ["sen","cos"].includes(figura.funcion) ? figura.funcion : "sen";
      const amplitud = Math.max(0.1, Math.min(99, Number(figura.amplitud) || 1));
      const periodo = Math.max(0.25, Math.min(20, Number(figura.periodoPi) || 2));
      const points = Array.from({length:49},(_,i)=>{
        const x=24+i/48*272, rad=i/48*Math.PI*2;
        const y=70-(funcion==="sen"?Math.sin(rad):Math.cos(rad))*48;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return `<div class="question-figure trig-figure" role="img" aria-label="Gráfica de una función ${funcion}usoidal con amplitud ${amplitud} y periodo ${periodo} pi"><svg viewBox="0 0 320 150" aria-hidden="true"><path d="M24 70H304M24 10V132" class="axis"></path><path d="M160 66V74M296 66V74" class="tick"></path><text x="7" y="25">${texto(amplitud)}</text><text x="3" y="123">−${texto(amplitud)}</text><text x="148" y="91">${texto(periodo/2)}π</text><text x="282" y="91">${texto(periodo)}π</text><polyline points="${points}" class="wave"></polyline></svg><span>y = ${amplitud}${funcion}(2πx/${periodo}π) · amplitud ${amplitud} · periodo ${periodo}π</span></div>`;
    }
    if (figura.tipo === "triangulo_bisectriz") {
      const a=numero(figura.razonAB,3),b=numero(figura.razonAC,4),bc=numero(figura.base,14),dx=45+230*a/Math.max(1,a+b);
      return envoltura("geometry-figure","Triángulo ABC con bisectriz AD",svg(`<path d="M45 175L155 25L275 175Z" class="shape"></path><path d="M155 25L${dx.toFixed(1)} 175" class="guide"></path><path d="M145 42A22 22 0 0 1 159 52M160 52A22 22 0 0 1 172 42" class="angle"></path><text x="150" y="18">A</text><text x="30" y="194">B</text><text x="278" y="194">C</text><text x="${(dx-4).toFixed(1)}" y="194">D</text><text x="72" y="88">${texto(a)}</text><text x="230" y="92">${texto(b)}</text><text x="128" y="165">BC = ${texto(bc)}</text>`),`AB : AC = ${a} : ${b}`);
    }
    if (figura.tipo === "triangulo_rectangulo") {
      const c1=numero(figura.cateto1),c2=numero(figura.cateto2);
      return envoltura("geometry-figure","Triángulo rectángulo con catetos indicados",svg(`<path d="M55 175H270L270 35Z" class="shape"></path><path d="M250 175V155H270" class="right-mark"></path><text x="145" y="198">${texto(c1)}</text><text x="278" y="110">${texto(c2)}</text><text x="37" y="190">A</text><text x="275" y="193">B</text><text x="275" y="31">C</text>`),`Catetos: ${c1} y ${c2}`);
    }
    if (figura.tipo === "triangulo_oblicuo") {
      const l1=numero(figura.lado1),l2=numero(figura.lado2),ang=numero(figura.angulo,60);
      return envoltura("geometry-figure","Triángulo con dos lados y ángulo comprendido",svg(`<path d="M55 175H275L130 38Z" class="shape"></path><path d="M78 175A28 28 0 0 1 74 155" class="angle"></path><text x="92" y="160">${texto(ang)}°</text><text x="93" y="102">${texto(l1)}</text><text x="174" y="198">${texto(l2)}</text><text x="40" y="194">A</text><text x="278" y="194">B</text><text x="124" y="30">C</text>`),`Lados ${l1} y ${l2} · ángulo comprendido ${ang}°`);
    }
    if (figura.tipo === "circulo_cuerda") {
      const r=numero(figura.radio),d=numero(figura.distancia);
      return envoltura("geometry-figure","Circunferencia, cuerda y distancia perpendicular al centro",svg(`<circle cx="160" cy="105" r="78" class="shape"></circle><path d="M220 55V155M160 105H220M160 105L202 42" class="guide"></path><path d="M207 105V92H220" class="right-mark"></path><circle cx="160" cy="105" r="4" class="point"></circle><text x="146" y="124">O</text><text x="178" y="99">d = ${texto(d)}</text><text x="169" y="68">r = ${texto(r)}</text>`),`Radio ${r} · distancia del centro a la cuerda ${d}`);
    }
    if (figura.tipo === "tangente_secante") {
      const e=numero(figura.externo),i=numero(figura.interno);
      return envoltura("geometry-figure","Tangente y secante trazadas desde un punto exterior",svg(`<circle cx="185" cy="105" r="68" class="shape"></circle><circle cx="42" cy="154" r="4" class="point"></circle><path d="M42 154L146 51M42 154L251 91" class="guide"></path><text x="27" y="178">P</text><text x="83" y="139">ext. ${texto(e)}</text><text x="170" y="116">int. ${texto(i)}</text>`),`Segmento externo ${e} · segmento interno ${i}`);
    }
    if (figura.tipo === "trapecio") {
      const B=numero(figura.baseMayor),b=numero(figura.baseMenor),h=numero(figura.altura),m=numero(figura.mediana,(B+b)/2);
      return envoltura("geometry-figure","Trapecio con bases, altura y mediana",svg(`<path d="M45 170H280L230 42H100Z" class="shape"></path><path d="M72 106H255M100 42V170" class="guide"></path><path d="M100 150H120V170" class="right-mark"></path><text x="145" y="194">B = ${texto(B)}</text><text x="145" y="34">b = ${texto(b)}</text><text x="154" y="98">m = ${texto(m)}</text><text x="105" y="112">h = ${texto(h)}</text>`),"Las medidas conservan las relaciones del enunciado");
    }
    if (figura.tipo === "poligono") {
      const lados=Math.max(3,Math.min(20,Math.round(numero(figura.lados,5))));
      const puntos=Array.from({length:lados},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/lados;return [160+78*Math.cos(a),105+78*Math.sin(a)]});
      const vertices=puntos.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" ");
      const diagonales=puntos.slice(2,Math.min(lados-1,7)).map(p=>`<path d="M${puntos[0][0].toFixed(1)} ${puntos[0][1].toFixed(1)}L${p[0].toFixed(1)} ${p[1].toFixed(1)}" class="guide"></path>`).join("");
      return envoltura("geometry-figure","Polígono convexo de lados indicados",svg(`<polygon points="${vertices}" class="shape"></polygon>${diagonales}<text x="139" y="202">n = ${texto(lados)} lados</text>`),`Polígono convexo de ${lados} lados`);
    }
    if (figura.tipo === "movimiento_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("physics-figure","Esquema de movimiento rectilíneo con los datos del problema",svg(`<path d="M35 158H285" class="axis"></path><path d="M50 151L72 131H112L132 151Z" class="shape"></path><circle cx="77" cy="158" r="10" class="point"></circle><circle cx="112" cy="158" r="10" class="point"></circle><path d="M145 106H264M248 94L264 106L248 118" class="guide"></path><text x="166" y="92">${valores[0] || "movimiento"}</text><text x="168" y="135">${valores.slice(1).join(" · ")}</text>`),"Diagrama referencial; usa las magnitudes indicadas en el enunciado");
    }
    if (figura.tipo === "fuerzas_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("physics-figure","Diagrama de cuerpo libre de un bloque",svg(`<path d="M35 165H285" class="axis"></path><rect x="120" y="90" width="80" height="75" rx="6" class="shape"></rect><path d="M160 88V30M151 44L160 30L169 44M160 167V204M151 190L160 204L169 190M202 126H278M264 117L278 126L264 135M118 126H48M62 117L48 126L62 135" class="guide"></path><text x="126" y="120">${valores[0] || "m"}</text><text x="207" y="112">${valores[1] || "F"}</text><text x="55" y="112">fricción</text>`),valores.length?`Datos: ${valores.join(" · ")}`:"Identifica las fuerzas y sus sentidos");
    }
    if (figura.tipo === "onda_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      const pts=Array.from({length:49},(_,i)=>`${(24+i*5.7).toFixed(1)},${(105-42*Math.sin(i/48*Math.PI*4)).toFixed(1)}`).join(" ");
      return envoltura("physics-figure","Representación de una onda",svg(`<path d="M22 105H300" class="axis"></path><polyline points="${pts}" class="wave"></polyline><path d="M92 45V165M230 45V165" class="guide"></path><text x="142" y="190">λ</text><text x="30" y="30">${valores.join(" · ")}</text>`),"Esquema de amplitud, longitud de onda y propagación");
    }
    if (figura.tipo === "circuito_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("physics-figure","Circuito eléctrico simple",svg(`<path d="M55 55H135M185 55H270V165H55V55" class="shape"></path><path d="M135 55L145 40L155 70L165 40L175 70L185 55" class="guide"></path><path d="M55 88H85M55 132H85M70 88V132" class="guide"></path><text x="140" y="30">R</text><text x="92" y="116">V</text><text x="112" y="195">${valores.join(" · ")}</text>`),"Circuito referencial con los valores del enunciado");
    }
    if (figura.tipo === "fluido_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("physics-figure","Recipiente con fluido y profundidad indicada",svg(`<path d="M75 35V180H250V35M75 82H250" class="shape"></path><path d="M88 93H237M88 112H237M88 131H237M88 150H237M88 169H237" class="guide"></path><path d="M270 82V180M260 94L270 82L280 94M260 168L270 180L280 168" class="guide"></path><text x="278" y="137">h</text><text x="103" y="68">${valores.join(" · ")}</text>`),"Esquema hidrostático referencial");
    }
    if (figura.tipo === "termica_fisica") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("physics-figure","Representación térmica del sistema",svg(`<rect x="72" y="70" width="176" height="105" rx="10" class="shape"></rect><path d="M115 70V35M160 70V25M205 70V35" class="guide"></path><path d="M105 48L115 35L125 48M150 38L160 25L170 38M195 48L205 35L215 48" class="guide"></path><text x="98" y="125">Q → sistema</text><text x="98" y="154">${valores.join(" · ")}</text>`),"Intercambio de energía y datos térmicos del problema");
    }
    if (figura.tipo === "cuadricula_rm") {
      const filas=Math.max(1,Math.min(8,Math.round(numero(figura.filas,3)))), columnas=Math.max(1,Math.min(10,Math.round(numero(figura.columnas,4))));
      const x=55,y=35,w=210,h=140, lines=[...Array(columnas+1)].map((_,i)=>`<path d="M${x+i*w/columnas} ${y}V${y+h}" class="guide"></path>`).join("")+[...Array(filas+1)].map((_,i)=>`<path d="M${x} ${y+i*h/filas}H${x+w}" class="guide"></path>`).join("");
      return envoltura("reasoning-figure",`Cuadrícula de ${filas} por ${columnas}`,svg(lines),`${filas} filas × ${columnas} columnas`);
    }
    if (figura.tipo === "rectas_rm") {
      const v=Math.max(1,Math.min(8,Math.round(numero(figura.verticales,3)))),h=Math.max(1,Math.min(8,Math.round(numero(figura.horizontales,4))));
      const lines=[...Array(v)].map((_,i)=>`<path d="M${60+i*200/Math.max(1,v-1)} 30V180" class="guide"></path>`).join("")+[...Array(h)].map((_,i)=>`<path d="M40 ${45+i*120/Math.max(1,h-1)}H280" class="guide"></path>`).join("");
      return envoltura("reasoning-figure","Familias de rectas verticales y horizontales",svg(lines),`${v} verticales · ${h} horizontales`);
    }
    if (["puntos_circulo_rm","asientos_circulares_rm"].includes(figura.tipo)) {
      const n=Math.max(3,Math.min(12,Math.round(numero(figura.puntos ?? figura.personas,5))));
      const dots=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=160+75*Math.cos(a),y=105+75*Math.sin(a);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" class="point"></circle><text x="${(x-4).toFixed(1)}" y="${(y-12).toFixed(1)}">${i+1}</text>`}).join("");
      return envoltura("reasoning-figure","Elementos distribuidos sobre una circunferencia",svg(`<circle cx="160" cy="105" r="75" class="shape"></circle>${dots}`),`${n} elementos en disposición circular`);
    }
    if (figura.tipo === "engranajes_rm") {
      const n=Math.max(2,Math.min(5,Math.round(numero(figura.cantidad,3))));
      const gears=Array.from({length:n},(_,i)=>`<circle cx="${75+i*58}" cy="108" r="31" class="shape"></circle><circle cx="${75+i*58}" cy="108" r="6" class="point"></circle><path d="M${75+i*58} 77V139M${44+i*58} 108H${106+i*58}" class="guide"></path>`).join("");
      return envoltura("reasoning-figure","Sistema de engranajes o ruedas enlazadas",svg(gears),"Determina el sentido o la relación de giro");
    }
    if (figura.tipo === "venn_rm") {
      const valores=(figura.valores || []).slice(0,4).map(texto);
      return envoltura("reasoning-figure","Diagrama de conjuntos superpuestos",svg(`<circle cx="125" cy="108" r="68" class="shape"></circle><circle cx="195" cy="108" r="68" class="shape"></circle><text x="90" y="65">A</text><text x="218" y="65">B</text><text x="82" y="113">${valores[1] || "A"}</text><text x="150" y="113">${valores[3] || "A∩B"}</text><text x="218" y="113">${valores[2] || "B"}</text>`),valores.length?`Datos: ${valores.join(" · ")}`:"Organiza los datos antes de operar");
    }
    return "";
  }

  function figuraAlgebraAutomatica(pregunta) {
    if (pregunta?.courseId !== "algebra") return null;
    const enunciado = String(pregunta?.pregunta || "");
    if (!/[=√²³⁴⁵⁶⁷⁸⁹]|\|[^|]+\||≤|≥/.test(enunciado)) return null;
    const partes = enunciado.split(/\.\s+/).map(item=>item.trim()).filter(item=>/[=√²³⁴⁵⁶⁷⁸⁹]|\|[^|]+\||≤|≥/.test(item));
    const contenido = (partes.sort((a,b)=>b.length-a.length)[0] || enunciado).replace(/^Tema [^.]+\.\s*/i, "").slice(0, 260);
    return {tipo:"formula", contenido};
  }

  function enunciadoClaro(pregunta) {
    const original = String(pregunta?.pregunta ?? pregunta?.q ?? "");
    if (typeof window.UniprepUGEL?.limpiarEnunciado === "function") {
      return window.UniprepUGEL.limpiarEnunciado(original, pregunta?.tema || "");
    }
    const sinNivel = original.replace(/^\s*\[[^\]]+\]\s*/, "").trim();
    const prefijoTema = `Tema ${pregunta?.tema || ""}.`;
    return sinNivel.toLowerCase().startsWith(prefijoTema.toLowerCase())
      ? sinNivel.slice(prefijoTema.length).trim()
      : sinNivel;
  }

  function usarOpcionesCompactas(opciones) {
    if (typeof window.UniprepUGEL?.opcionesCompactas === "function") {
      return window.UniprepUGEL.opcionesCompactas(opciones);
    }
    return Array.isArray(opciones) && opciones.every(opcion => String(opcion).length <= 34);
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
    const enunciado = enunciadoClaro(pregunta);
    const compactas = usarOpcionesCompactas(pregunta.alternativas || []);
    sesion.respondida = false;
    sesion.inicioPregunta = Date.now();

    raiz().innerHTML = `
      <div class="practice-session">
        <div class="practice-session-top">
          <button class="practice-exit" type="button" onclick="salirPractica()" aria-label="Salir de la práctica">✕</button>
          <div><div class="practice-session-meta"><span>Pregunta <b>${sesion.indice+1}</b> de ${sesion.preguntas.length}</span><span>${escapar(sesion.titulo)}</span></div><div class="practice-session-progress"><span style="width:${progreso}%"></span></div></div>
          <div class="practice-clock" id="practice-clock">⏱ ${formatearTiempo(segundosSesion())}</div>
        </div>

        <article class="practice-question-card" tabindex="-1" aria-labelledby="practice-question-title">
          <button class="practice-favorite ${esFavorita(pregunta)?"active":""}" id="practice-favorite-btn" type="button" onclick="alternarFavoritaPractica()" aria-label="Guardar como favorita">${esFavorita(pregunta)?"★":"☆"}</button>
          <div class="practice-question-heading">
            <div><span class="practice-question-number">PREGUNTA ${sesion.indice+1}</span><span class="practice-question-guide">Lee con calma y selecciona una sola alternativa.</span></div>
            <div class="practice-question-tools"><button class="practice-read-button" type="button" onclick="leerPreguntaVisible()">🔊 Leer</button><button class="practice-hint-button" type="button" onclick="consultarTutorPreguntaActual('pista')">✦ Pista con IA</button></div>
          </div>
          <div class="practice-question-tags"><span class="practice-tag">${escapar(pregunta.curso)}</span><span class="practice-tag">${escapar(pregunta.tema)}</span><span class="practice-tag level">${escapar(nivel.corto)}</span>${pregunta.universidadReferencia?`<span class="practice-tag">Estilo ${escapar(pregunta.universidadReferencia)}</span>`:""}</div>
          ${figuraPregunta(pregunta)}
          ${estimuloPregunta(pregunta) ? `<div class="practice-question-stimulus"><b>Material de lectura</b><p>${escapar(estimuloPregunta(pregunta))}</p></div>` : ""}
          <p class="practice-question-text" id="practice-question-title">${escapar(enunciado)}</p>
        </article>

        <div class="practice-options ${compactas?"compact-options":""}" id="practice-options" role="group" aria-label="Alternativas de la pregunta">
          ${(pregunta.alternativas||[]).map((opcion,indice)=>`<button class="practice-option" type="button" onclick="responderPractica(${indice})" aria-label="Alternativa ${"ABCDE"[indice]||indice+1}: ${escapar(opcion)}"><span class="practice-option-letter">${"ABCDE"[indice]||indice+1}</span><span class="practice-option-text">${escapar(opcion)}</span></button>`).join("")}
        </div>

        <div class="practice-feedback" id="practice-feedback" role="status" aria-live="polite"></div>
        <div class="practice-session-actions">
          <div class="practice-session-stats"><span class="practice-mini-stat"><b id="practice-correct-count">${sesion.correctas}</b> correctas</span><span class="practice-mini-stat"><b id="practice-wrong-count">${sesion.incorrectas}</b> errores</span><span class="practice-mini-stat"><b id="practice-xp-count">+${sesion.xp}</b> XP</span></div>
          <button class="practice-main-btn" id="practice-next-btn" type="button" onclick="siguientePreguntaPractica()" disabled>${sesion.indice===sesion.preguntas.length-1?"Ver resultado":"Siguiente pregunta →"}</button>
        </div>
      </div>`;
    requestAnimationFrame(() => raiz()?.querySelector(".practice-question-card")?.focus({preventScroll:true}));
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
    feedback.innerHTML = `<h3>${correcto?`✓ ¡Correcto! +${xp} XP`:`✕ Aún no. La respuesta es ${"ABCDE"[indiceCorrecto]||indiceCorrecto+1}.`}</h3>${pregunta.solucion?`<p><b>Solución paso a paso:</b> ${escapar(pregunta.solucion)}</p>`:""}<p><b>¿Por qué?</b> ${escapar(pregunta.explicacion||"Revisa la teoría y vuelve a intentarlo.")}</p><button class="practice-tutor-btn" type="button" onclick="consultarTutorPreguntaActual('explica')">✦ Profundizar con el Tutor IA</button>`;

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

  function consultarTutorPreguntaActual(modo = "explica") {
    const pregunta = estado.sesion?.preguntas?.[estado.sesion.indice];
    if (!pregunta || typeof window.abrirTutorConContexto !== "function") return;
    const enunciado = enunciadoClaro(pregunta);
    const solicitud = modo === "pista"
      ? `Dame una pista gradual para resolver esta pregunta sin decirme todavía la alternativa correcta: ${enunciado}`
      : `Explícame esta pregunta paso a paso y ayúdame a comprobar la respuesta: ${enunciado}`;
    window.abrirTutorConContexto({courseId:pregunta.courseId,tema:pregunta.tema,pregunta:solicitud,modo});
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
      if (typeof window.registrarEventoPuntaje === "function") await window.registrarEventoPuntaje({tipo:"practica",puntos:sesion.xp,correctas:sesion.correctas,incorrectas:sesion.preguntas.length-sesion.correctas,total:sesion.preguntas.length,universidadId:window.obtenerSeleccionAdmision?.()?.universidadId||"general"});
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
        ${errores.length?`<div class="practice-section-head"><div><h2>Revisión de errores</h2><p>Estas preguntas ya están en tu ruta de mejora.</p></div><span>${errores.length} preguntas</span></div><div class="practice-review">${errores.map((respuesta,i)=>`<div class="practice-review-item"><strong>${i+1}. ${escapar(enunciadoClaro(respuesta.pregunta))}</strong><p><b>Respuesta correcta:</b> ${"ABCDE"[respuesta.pregunta.respuesta]}. ${escapar(respuesta.pregunta.alternativas[respuesta.pregunta.respuesta])}</p><p><b>Explicación:</b> ${escapar(respuesta.pregunta.explicacion||respuesta.pregunta.solucion||"")}</p></div>`).join("")}</div>`:`<div class="practice-empty card" style="margin-top:16px"><div class="practice-empty-icon">🏆</div><h2>Sesión perfecta</h2><p>No tuviste errores en esta práctica.</p></div>`}
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
