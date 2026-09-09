// =====================================================
// UNIPREP - CATÁLOGO ACADÉMICO Y RUTA DE ESTUDIO
// =====================================================

(function () {
  "use strict";

  const META = {
    rm:{nombre:"Razonamiento Matemático",icono:"🧠",color:"#9B7BFF",descripcion:"Lógica, orden, conteo, sucesiones y planteo de problemas."},
    aritmetica:{nombre:"Aritmética",icono:"🔢",color:"#55D5FF",descripcion:"Números, divisibilidad, proporcionalidad, finanzas y estadística."},
    algebra:{nombre:"Álgebra",icono:"📘",color:"#8B5CF6",descripcion:"Reales, complejos, polinomios, ecuaciones, matrices y funciones."},
    geometria:{nombre:"Geometría",icono:"📐",color:"#FF9F68",descripcion:"Geometría plana, analítica, espacial y secciones cónicas."},
    trigonometria:{nombre:"Trigonometría",icono:"📊",color:"#42D8C5",descripcion:"Medida angular, identidades, funciones y triángulos."},
    fisica:{nombre:"Física",icono:"⚛️",color:"#55A8FF",descripcion:"Movimiento, dinámica, energía, fluidos y calor."},
    quimica:{nombre:"Química",icono:"🧪",color:"#FF6F9F",descripcion:"Materia, átomo, enlaces, reacciones y química orgánica."},
    biologia:{nombre:"Biología",icono:"🧬",color:"#4ADF91",descripcion:"Célula, genética, clasificación, reproducción e inmunidad."},
    medio_ambiente:{nombre:"Medio Ambiente",icono:"🌱",color:"#45D6A7",descripcion:"Ecología, sostenibilidad, recursos y problemática ambiental."},
    anatomia:{nombre:"Anatomía",icono:"🫀",color:"#FF6B86",descripcion:"Sistemas del cuerpo humano y promoción de la salud."},
    psicologia:{nombre:"Psicología",icono:"🧠",color:"#C084FC",descripcion:"Conducta, procesos psicológicos, desarrollo y personalidad."},
    rv:{nombre:"Razonamiento Verbal",icono:"💬",color:"#D78CFF",descripcion:"Sinonimia, analogías, series verbales, cohesión y organización textual."},
    comprension_lectora:{nombre:"Comprensión Lectora",icono:"🔎",color:"#53D7FF",descripcion:"Estructura textual, ideas, inferencias, intención y lectura crítica."},
    lenguaje:{nombre:"Lenguaje",icono:"✍️",color:"#FFBF5B",descripcion:"Comunicación, fonología, gramática, semántica, oración y ortografía."},
    literatura:{nombre:"Literatura",icono:"📚",color:"#F59EBD",descripcion:"Conceptos literarios, literatura peruana y literatura universal."},
    historia:{nombre:"Historia Universal",icono:"🏛️",color:"#5CC9B4",descripcion:"Civilizaciones, revoluciones y procesos mundiales hasta la actualidad."},
    historia_peru:{nombre:"Historia del Perú",icono:"🇵🇪",color:"#F9737A",descripcion:"Del poblamiento americano al Perú del siglo XXI."},
    geografia:{nombre:"Geografía",icono:"🗺️",color:"#4DB6FF",descripcion:"Territorio peruano, cartografía, ambiente y gestión de riesgos."},
    filosofia:{nombre:"Filosofía",icono:"💡",color:"#B794F6",descripcion:"Pensamiento filosófico, ética, conocimiento, lógica y argumentación."},
    economia:{nombre:"Economía",icono:"📈",color:"#72D47D",descripcion:"Producción, mercado, precios, moneda y desarrollo."},
    civica:{nombre:"Cívica",icono:"⚖️",color:"#F39B6D",descripcion:"Desarrollo personal, ciudadanía, ética, Estado, democracia, derechos e identidad."},
    calculo:{nombre:"Cálculo",icono:"∫",color:"#4FC3F7",descripcion:"Límites, continuidad, derivadas, integrales y aplicaciones.",bancoPreguntas:1200},
    logica:{nombre:"Lógica",icono:"◇",color:"#A78BFA",descripcion:"Proposiciones, formalización, tablas de verdad e inferencias.",bancoPreguntas:180},
    actualidad:{nombre:"Actualidad",icono:"🌐",color:"#34D399",descripcion:"Política, economía, ciencia, ambiente y verificación de hechos.",bancoPreguntas:360},
    ingles:{nombre:"Inglés",icono:"EN",color:"#F59E0B",descripcion:"Comprensión y comunicación en inglés de nivel A2.",bancoPreguntas:360}
  };

  const TEMARIO = window.TEMARIO_UNAMAD || {};
  const CURSOS_PREUNI = Object.fromEntries(Object.entries(META).map(([id, meta]) => [id, {
    id,
    ...meta,
    area: TEMARIO[id]?.area || "Preuniversitario",
    preguntas: Number(meta.bancoPreguntas) || (TEMARIO[id]?.temas?.length || 0) * 60,
    temas: TEMARIO[id]?.temas || []
  }]));

  const PESOS_RUTA = {
    P:{rm:8,aritmetica:8,algebra:8,geometria:7,trigonometria:7,rv:8,comprension_lectora:6,lenguaje:3,literatura:3,geografia:2,economia:2,filosofia:2,quimica:4,biologia:2,medio_ambiente:3,fisica:4,civica:3},
    Q:{rm:8,aritmetica:5,algebra:5,rv:8,comprension_lectora:6,lenguaje:3,literatura:3,economia:2,filosofia:3,quimica:8,biologia:8,medio_ambiente:3,anatomia:8,psicologia:4,fisica:3,civica:3},
    R:{rm:8,aritmetica:5,algebra:5,rv:8,comprension_lectora:8,lenguaje:6,literatura:6,historia:4,historia_peru:4,geografia:3,economia:6,filosofia:5,medio_ambiente:4,psicologia:4,civica:4},
    S:{rm:8,aritmetica:4,algebra:4,geometria:4,trigonometria:4,rv:8,comprension_lectora:7,lenguaje:3,literatura:3,historia:3,historia_peru:3,geografia:3,economia:3,filosofia:3,quimica:8,biologia:8,medio_ambiente:4,anatomia:8,psicologia:4,fisica:5,civica:3}
  };

  const CURSO_MATRIZ = {
    medio_ambiente:"biologia", anatomia:"biologia", psicologia:"biologia",
    geografia:"historia", filosofia:"historia", historia_peru:"historia",
    comprension_lectora:"lenguaje", literatura:"lenguaje"
  };

  function pesoMatriz(pesos, idCurso) {
    return Number(pesos?.[idCurso] ?? pesos?.[CURSO_MATRIZ[idCurso]]) || 0;
  }

  let usuarioActual = null;

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  async function obtenerUsuario() {
    if (typeof window.obtenerUsuarioActivo !== "function") return null;
    try { return await window.obtenerUsuarioActivo(); } catch (_) { return null; }
  }

  function progresoCurso(usuario, idCurso) {
    return Math.max(0, Math.min(100, Math.round(Number(usuario?.progreso?.[idCurso]) || 0)));
  }

  function filtrosActuales() {
    return {
      texto:(document.getElementById("courses-search")?.value || "").trim().toLowerCase(),
      area:document.getElementById("courses-area-filter")?.value || "todas"
    };
  }

  function seleccionAdmision() {
    return window.obtenerSeleccionAdmision?.() || null;
  }

  function cursoParaRuta(cursoOId) {
    const curso = typeof cursoOId === "string" ? (CURSOS_PREUNI[cursoOId] || cursoOId) : cursoOId;
    return window.obtenerCursoTemarioAdmision?.(curso) || curso;
  }

  function catalogoParaRuta() {
    return window.obtenerCatalogoTemarioAdmision?.(CURSOS_PREUNI) || Object.values(CURSOS_PREUNI).map(cursoParaRuta).filter(Boolean);
  }

  function cursoPermitido(idCurso) {
    return window.cursoPermitidoAdmision?.(idCurso) !== false;
  }

  function pesoActivo(idCurso, pesosRespaldo = null) {
    const seleccion = seleccionAdmision();
    if (seleccion) return Number(window.pesoCursoAdmision?.(idCurso)) || pesoMatriz(seleccion.pesos, idCurso);
    return pesoMatriz(pesosRespaldo, idCurso);
  }

  function etiquetaPesoRuta(idCurso) {
    const seleccion = seleccionAdmision();
    const detalle = window.detallePesoCursoAdmision?.(idCurso);
    if (!seleccion || !detalle) return "Ruta general";
    if (seleccion.tipoPeso === "preguntas") return `${detalle.peso} pregunta${detalle.peso === 1 ? "" : "s"}`;
    return detalle.nombre || detalle.etiqueta || "Curso de la ruta";
  }

  function renderizarResumenRutaUniversitaria() {
    const contenedor = document.getElementById("university-route-summary");
    if (!contenedor) return;
    const seleccion = seleccionAdmision();
    if (!seleccion) {
      contenedor.className = "university-route-summary empty";
      contenedor.innerHTML = `<div class="route-summary-copy"><span class="route-summary-mark">RUTA</span><div><small>CONFIGURACIÓN PENDIENTE</small><h3>Elige universidad y carrera</h3><p>UniPrep necesita ese objetivo para mostrar los cursos, temas, videos y preguntas que realmente corresponden.</p></div></div><div class="route-summary-action"><b>Evita estudiar contenido innecesario</b><span>La carrera determina automáticamente el área o grupo de admisión.</span><button type="button" onclick="abrirConfiguracionAdmision()">Configurar mi ruta</button></div>`;
      return;
    }
    const cursos = catalogoParaRuta().filter(curso=>cursoPermitido(curso.id));
    const temas = cursos.reduce((total,curso)=>total+(curso.temarioOficial || curso.temas).length,0);
    const pruebas = seleccion.bloques?.length || 1;
    const principales = [...cursos].sort((a,b)=>pesoActivo(b.id)-pesoActivo(a.id)).slice(0,5);
    contenedor.className = "university-route-summary";
    contenedor.innerHTML = `<div class="route-summary-copy"><span class="route-summary-mark">${esc(seleccion.universidadCorta)}</span><div><small>RUTA DETECTADA POR CARRERA</small><h3>${esc(seleccion.carrera)} · ${esc(seleccion.grupo)}</h3><p>${esc(seleccion.descripcionGrupo || "Temario organizado según el área de admisión seleccionada.")}</p><div class="route-summary-tags"><span>${cursos.length} cursos</span><span>${temas} temas</span><span>${pruebas} ${pruebas===1?"bloque":"bloques"}</span>${principales.map(curso=>`<span>${esc(curso.nombre)}</span>`).join("")}</div></div></div><div class="route-summary-action"><b>Temario completo y trazable</b><span>Comprueba qué estudiar, el peso de cada curso y todos los temas habilitados antes de grabar tu video.</span><button type="button" onclick="abrirTemarioUniversitario()">Ver cursos y temas</button><button class="secondary" type="button" onclick="abrirConfiguracionAdmision()">Cambiar universidad o carrera</button></div>`;
  }

  function abrirTemarioUniversitario() {
    const seleccion = seleccionAdmision();
    if (!seleccion) return window.abrirConfiguracionAdmision?.();
    const cursos = catalogoParaRuta().filter(curso=>cursoPermitido(curso.id)).sort((a,b)=>pesoActivo(b.id)-pesoActivo(a.id));
    const porId = new Map(cursos.map(curso=>[curso.id,curso]));
    const bloquesBase = seleccion.bloques?.length ? seleccion.bloques : [{id:"ruta",nombre:"Cursos de la ruta",descripcion:seleccion.descripcionGrupo,cursos:cursos.map(curso=>curso.id)}];
    const totalTemas = cursos.reduce((total,curso)=>total+(curso.temarioOficial || curso.temas).length,0);
    const totalPreguntas = cursos.reduce((total,curso)=>total+curso.preguntas,0);
    let modal = document.getElementById("university-syllabus-layer");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "university-syllabus-layer";
      modal.className = "university-syllabus-layer";
      document.body.appendChild(modal);
      modal.addEventListener("click",evento=>{if(evento.target===modal)cerrarTemarioUniversitario()});
    }
    const fuente = seleccion.fuente || seleccion.fuenteMatriz || "";
    const notaPeso = seleccion.tipoPeso === "preguntas" ? "Las cantidades corresponden a la matriz declarada en el perfil." : "Las prioridades ordenan el estudio; no se presentan como cantidades oficiales de preguntas.";
    const bloques = bloquesBase.map((bloque,indice)=>{
      const lista = bloque.cursos.map(id=>porId.get(id)).filter(Boolean);
      if (!lista.length) return "";
      return `<section class="university-syllabus-block"><header><span>${esc(bloque.etiqueta || `BLOQUE ${indice+1}`)}</span><div><h3>${esc(bloque.nombre)}</h3><p>${esc(bloque.descripcion || "Cursos correspondientes a esta parte de la evaluación.")}</p></div></header><div class="university-syllabus-courses">${lista.map(curso=>{const temas=curso.temarioOficial || curso.temas.map(tema=>tema.titulo);return `<article class="university-syllabus-course" style="--course-color:${curso.color}"><header><span class="icon">${curso.icono}</span><div><h4>${esc(curso.nombre)}</h4><small>${temas.length} temas UNI · ${curso.preguntas || 0} preguntas vinculadas</small></div><span class="weight">${esc(etiquetaPesoRuta(curso.id))}</span></header>${curso.notaTemario?`<p class="university-course-source-note">${esc(curso.notaTemario)}</p>`:""}<div class="university-topic-list">${temas.map((tema,temaIndice)=>`<div class="university-topic-reference"><b>${String(temaIndice+1).padStart(2,"0")} · ${esc(typeof tema==="string"?tema:tema.titulo)}</b><small>${esc(curso.etiquetaTemario || "Temario UNI 2026-2")}</small></div>`).join("")}</div></article>`}).join("")}</div></section>`;
    }).join("");
    modal.innerHTML = `<section class="university-syllabus-dialog" role="dialog" aria-modal="true" aria-labelledby="university-syllabus-title"><header class="university-syllabus-head"><div><small>${esc(seleccion.universidadCorta)} · ${esc(seleccion.vigencia || "RUTA VIGENTE")}</small><h2 id="university-syllabus-title">${esc(seleccion.carrera)}</h2><p>${esc(seleccion.grupo)} · cursos y temas habilitados automáticamente</p></div><button type="button" onclick="cerrarTemarioUniversitario()" aria-label="Cerrar">×</button></header><div class="university-syllabus-proof"><div><b>${cursos.length}</b><span>cursos de la ruta</span></div><div><b>${totalTemas}</b><span>temas habilitados</span></div><div><b>${totalPreguntas.toLocaleString("es-PE")}</b><span>preguntas disponibles</span></div><div><b>${bloquesBase.length}</b><span>bloques de evaluación</span></div></div><div class="university-syllabus-note"><b>Cómo leer esta ruta:</b> ${esc(notaPeso)} Los videos son apoyo por tema y las preguntas son ejercicios de entrenamiento elaborados por UniPrep, no preguntas oficiales.${fuente?` <a href="${esc(fuente)}" target="_blank" rel="noopener">Consultar fuente institucional ↗</a>`:""}</div><div class="university-syllabus-blocks">${bloques}</div><footer class="university-syllabus-footer"><span>${esc(seleccion.notaMatriz || seleccion.avisoCarrera || "La ruta se actualiza al cambiar universidad o carrera.")}</span><button type="button" onclick="cerrarTemarioUniversitario();abrirPlanEstudios()">Crear plan con esta ruta</button></footer></section>`;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function cerrarTemarioUniversitario() {
    document.getElementById("university-syllabus-layer")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  function claveBloques() {
    const seleccion = seleccionAdmision();
    return `uniprep_bloques_cursos_${seleccion?.universidadId || "general"}_${seleccion?.grupoId || "todos"}`;
  }

  function estadoBloques() {
    return window.uniprepStorage?.leer(claveBloques(), {}) || {};
  }

  function tarjetaCurso(curso) {
    const progreso = progresoCurso(usuarioActual, curso.id);
    const detalle = window.detallePesoCursoAdmision?.(curso.id);
    const prioridad = seleccionAdmision() && detalle ? `<span class="course-route-priority ${detalle.clase}"><b>${esc(detalle.etiqueta)}</b><small>${esc(detalle.nombre)} en tu examen</small></span>` : "";
    const etiquetaTemario = curso.temarioPersonalizado ? "temario específico" : "temario de la ruta";
    const temasRuta = curso.temarioOficial || curso.temas;
    const accion = curso.temarioSoloReferencia ? "abrirTemarioUniversitario()" : `abrirCurso('${curso.id}',0)`;
    return `<button class="course-card course-card-ultra" style="--course-color:${curso.color}" type="button" onclick="${accion}">
      <span class="course-card-head"><span class="course-icon">${curso.icono}</span><span class="course-cloud" title="Progreso sincronizado">☁ ${progreso}%</span></span>
      <span class="course-area">${esc(curso.area)}</span>
      <span class="course-name">${esc(curso.nombre)}</span>
      ${prioridad}
      <span class="course-desc">${esc(curso.descripcion)}</span>
      <span class="course-meta-ultra"><b>${temasRuta.length} temas</b><span>${curso.preguntas} ejercicios · ${curso.temarioSoloReferencia?"banco en preparación":etiquetaTemario}</span></span>
      <span class="pbar"><span class="pbar-fill" style="width:${progreso}%;background:${curso.color}"></span></span>
      <span class="course-card-action">Explorar temario <b>→</b></span>
    </button>`;
  }

  function alternarBloqueCursos(idBloque) {
    const panel = document.getElementById(`course-block-panel-${idBloque}`);
    const boton = document.querySelector(`[data-course-block-button="${idBloque}"]`);
    if (!panel || !boton) return;
    const abrir = panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute("aria-expanded", String(abrir));
    boton.closest(".course-exam-block")?.classList.toggle("open", abrir);
    const estados = estadoBloques();
    estados[idBloque] = abrir;
    window.uniprepStorage?.guardar(claveBloques(), estados);
  }

  async function renderizarCursos() {
    const contenedor = document.getElementById("course-grid");
    const resumen = document.getElementById("courses-summary");
    if (!contenedor) return;

    usuarioActual = await obtenerUsuario();
    renderizarResumenRutaUniversitaria();
    const {texto, area} = filtrosActuales();
    const cursosActivos = catalogoParaRuta()
      .filter(curso => cursoPermitido(curso.id))
      .sort((a,b) => pesoActivo(b.id) - pesoActivo(a.id));
    const cursos = cursosActivos.filter(curso => {
      const coincideTexto = !texto || `${curso.nombre} ${curso.descripcion} ${curso.area} ${curso.temas.map(t => t.titulo).join(" ")}`.toLowerCase().includes(texto);
      const coincideArea = area === "todas" || curso.area === area;
      return coincideTexto && coincideArea;
    });

    if (resumen) {
      const temas = cursosActivos.reduce((suma, curso) => suma + curso.temas.length, 0);
      const seleccion = seleccionAdmision();
      const totalMatriz = Object.values(seleccion?.pesos || {}).reduce((suma, valor) => suma + Number(valor || 0), 0);
      const extra = (seleccion?.otrosComponentes || []).reduce((suma, item) => suma + Number(item.preguntas || 0), 0);
      const matriz = seleccion?.tipoPeso === "preguntas" ? ` · matriz: ${totalMatriz}${extra ? ` + ${extra} adicional` : ""} preguntas` : "";
      const ejercicios=cursosActivos.reduce((suma,curso)=>suma+curso.preguntas,0);
      resumen.textContent = `${cursosActivos.length} cursos de tu ruta · ${temas} temas · ${ejercicios.toLocaleString("es-PE")} ejercicios${seleccion ? ` · ${seleccion.universidadCorta} ${seleccion.grupoId}${matriz}` : ""}`;
    }

    if (!cursos.length) {
      contenedor.innerHTML = '<div class="card courses-empty">No encontramos cursos o temas con ese filtro.</div>';
      return;
    }

    const seleccion = seleccionAdmision();
    const bloques = seleccion?.bloques || [];
    const porId = new Map(cursos.map(curso => [curso.id, curso]));
    const estados = estadoBloques();
    if (bloques.length) {
      const extras = (seleccion.otrosComponentes || []).map(item => `<span><b>${Number(item.preguntas) || ""}</b> ${esc(item.nombre)}</span>`).join("");
      const notaExtra = extras ? `<div class="course-route-extras"><strong>También se evalúa</strong>${extras}<small>Se muestra como componente de la convocatoria, no como curso inventado.</small></div>` : "";
      contenedor.classList.add("course-grid-grouped");
      contenedor.innerHTML = notaExtra + bloques.map((bloque, indice) => {
        const cursosBloque = bloque.cursos.map(id => porId.get(id)).filter(Boolean);
        if (!cursosBloque.length) return "";
        const idSeguro = `${seleccion.universidadId}-${seleccion.grupoId}-${bloque.id}`.replace(/[^a-zA-Z0-9_-]/g, "-");
        const forzarAbierto = Boolean(texto || area !== "todas");
        const abierto = forzarAbierto || (estados[idSeguro] ?? indice === 0);
        const temasBloque = cursosBloque.reduce((suma, curso) => suma + curso.temas.length, 0);
        return `<section class="course-exam-block${abierto ? " open" : ""}">
          <button class="course-block-toggle" type="button" data-course-block-button="${idSeguro}" aria-expanded="${abierto}" aria-controls="course-block-panel-${idSeguro}" onclick="alternarBloqueCursos('${idSeguro}')">
            <span class="course-block-index">${esc(bloque.etiqueta || String(indice + 1).padStart(2,"0"))}</span>
            <span class="course-block-copy"><b>${esc(bloque.nombre)}</b><small>${esc(bloque.descripcion)}</small></span>
            <span class="course-block-count"><b>${cursosBloque.length}</b> curso${cursosBloque.length === 1 ? "" : "s"} · ${temasBloque} temas</span>
            <span class="course-block-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="course-block-panel" id="course-block-panel-${idSeguro}"${abierto ? "" : " hidden"}>
            <div class="course-block-grid">${cursosBloque.map(tarjetaCurso).join("")}</div>
          </div>
        </section>`;
      }).join("");
    } else {
      contenedor.classList.remove("course-grid-grouped");
      contenedor.innerHTML = cursos.map(tarjetaCurso).join("");
    }

    renderizarRecomendados(usuarioActual);
  }

  function renderizarRecomendados(usuario) {
    const contenedor = document.getElementById("courses-recommended");
    if (!contenedor) return;
    const seleccion = seleccionAdmision();
    const ruta = window.uniprepStorage?.leerTexto("uniprep_ruta_unamad", "P") || "P";
    const pesos = seleccion?.pesos || PESOS_RUTA[ruta] || PESOS_RUTA.P;
    const recomendados = catalogoParaRuta()
      .filter(curso => cursoPermitido(curso.id) && pesoMatriz(pesos, curso.id) > 0)
      .sort((a,b) => (pesoMatriz(pesos,b.id) * (100 - progresoCurso(usuario,b.id))) - (pesoMatriz(pesos,a.id) * (100 - progresoCurso(usuario,a.id))))
      .slice(0,4);

    contenedor.innerHTML = recomendados.map((curso, indice) => {
      const fila = usuario?.progresoDetallado?.find(item => item.course_id === curso.id);
      const temaIndice = Math.min(Number(fila?.last_topic_index) || 0, Math.max(0,curso.temas.length - 1));
      const tema = curso.temas[temaIndice] || curso.temas[0];
      return `<button class="lesson-card recommended-topic" type="button" onclick="abrirCurso('${curso.id}',${temaIndice})">
        <span class="lesson-thumb" style="background:${curso.color}18">${curso.icono}</span>
        <span class="recommended-copy"><b>${esc(tema.titulo)}</b><small>${esc(curso.nombre)} · ${esc(tema.subarea)} · ${tema.duracion}</small></span>
        <span class="recommended-rank">${indice === 0 ? "Prioridad de hoy" : `Prioridad ${indice + 1}`}</span><span class="recommended-arrow">→</span>
      </button>`;
    }).join("");
    const rutaNombre = document.getElementById("courses-route-label");
    if (rutaNombre) rutaNombre.textContent = seleccion ? `${seleccion.universidadCorta} · ${seleccion.grupoId}` : `Ruta UNAMAD ${ruta}`;
  }

  function abrirCurso(idCurso, indiceTema = 0) {
    const curso = cursoParaRuta(idCurso);
    if (!curso) return;
    if (!cursoPermitido(idCurso)) {
      mostrarToast("Ese curso no pertenece a tu grupo actual. Puedes cambiar tu objetivo académico desde Mi perfil.");
      window.abrirConfiguracionAdmision?.();
      return;
    }
    if (!curso.temas.length) {
      mostrarToast("Este curso no tiene temas habilitados en el temario de tu ruta actual.");
      return;
    }
    const indice = Math.max(0, Math.min(Number(indiceTema) || 0, curso.temas.length - 1));
    const tema = curso.temas[indice] || curso.temas[0];
    window.uniprepStorage?.guardar("preuni_curso_actual", {cursoId:idCurso,indiceTema:indice});
    pintarCursoSeleccionado(curso, tema, indice);
    if (typeof window.go === "function") window.go("videoclase", null);
  }

  function pintarCursoSeleccionado(curso, tema, indiceTema) {
    cambiarTexto("lesson-page-title", `${curso.nombre} — ${tema.titulo}`);
    cambiarTexto("lesson-page-subtitle", `Tema ${indiceTema + 1} de ${curso.temas.length} · ${tema.subarea} · Temario alineado a tu ruta`);
    cambiarTexto("lesson-video-title", tema.titulo);
    cambiarTexto("lesson-video-subtitle", tema.subarea);
    cambiarTexto("lesson-description", tema.descripcion);
    cambiarTexto("lesson-course-badge", `📚 ${curso.nombre}`);
    cambiarTexto("lesson-duration", `⏱ ${tema.duracion}`);
    cambiarTexto("lesson-exercises", `📝 Banco del curso: ${curso.preguntas}`);

    const anterior = document.getElementById("lesson-prev-btn");
    const siguiente = document.getElementById("lesson-next-btn");
    if (anterior) anterior.disabled = indiceTema <= 0;
    if (siguiente) siguiente.disabled = indiceTema >= curso.temas.length - 1;

    renderizarTemasDelCurso(curso, indiceTema);
    if (typeof window.renderizarContenidoAprendizaje === "function") window.renderizarContenidoAprendizaje(curso.id, indiceTema);
  }

  function renderizarTemasDelCurso(curso, indiceActivo) {
    const contenedor = document.getElementById("lesson-topics");
    if (!contenedor) return;
    let ultimaSubarea = "";
    contenedor.innerHTML = curso.temas.map((tema, indice) => {
      const cabecera = tema.subarea !== ultimaSubarea ? `<div class="lesson-topic-group">${esc(tema.subarea)}</div>` : "";
      ultimaSubarea = tema.subarea;
      return `${cabecera}<button type="button" class="lesson-topic-button${indice === indiceActivo ? " active" : ""}" onclick="abrirCurso('${curso.id}',${indice})">
        <span class="lesson-topic-number">${String(indice + 1).padStart(2,"0")}</span>
        <span class="lesson-topic-info"><strong>${esc(tema.titulo)}</strong><small>${tema.duracion} · Contenido preuniversitario</small></span>
        <span class="topic-official-check">✓</span>
      </button>`;
    }).join("");
    contenedor.querySelector(".lesson-topic-button.active")?.scrollIntoView({block:"nearest"});
  }

  function cambiarTemaCurso(desplazamiento) {
    try {
      const datos = window.uniprepStorage?.leer("preuni_curso_actual", null);
      const curso = cursoParaRuta(datos?.cursoId);
      if (!curso || !cursoPermitido(curso.id) || !curso.temas.length) return;
      abrirCurso(curso.id, Math.max(0, Math.min(curso.temas.length - 1, Number(datos.indiceTema || 0) + Number(desplazamiento || 0))));
    } catch (_) {}
  }

  function reproducirClaseActual() {
    const iframe = document.querySelector("#lesson-video-container iframe");
    if (iframe) {
      iframe.scrollIntoView({behavior:"smooth",block:"center"});
      iframe.focus();
      return;
    }
    const busqueda = document.querySelector("#lesson-video-container .video-search-resource a");
    if (busqueda) {
      busqueda.click();
      mostrarToast("Abriendo videoclases del mismo curso y tema.");
      return;
    }
    mostrarToast("No se pudo abrir el recurso audiovisual. Revisa tu conexión e inténtalo nuevamente.");
  }

  function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.className = "premium-toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3700);
  }

  function cargarUltimoCurso() {
    try {
      const datos = window.uniprepStorage?.leer("preuni_curso_actual", null);
      const curso = cursoParaRuta(datos?.cursoId);
      if (!curso || !cursoPermitido(curso.id) || !curso.temas.length) return;
      const indice = Math.min(Number(datos.indiceTema) || 0, curso.temas.length - 1);
      pintarCursoSeleccionado(curso, curso.temas[indice], indice);
    } catch (_) {}
  }

  function abrirPlanEstudios() {
    const seleccion = seleccionAdmision();
    let modal = document.getElementById("study-plan-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "study-plan-modal";
      modal.className = "study-plan-modal";
      modal.innerHTML = `<section class="study-plan-dialog" role="dialog" aria-modal="true" aria-labelledby="study-plan-title">
        <div class="study-plan-head"><div><small>PLANIFICADOR INTELIGENTE</small><h2 id="study-plan-title">Tu ruta de admisión</h2><p id="study-plan-copy">Prioriza cursos según tu grupo y tu avance real.</p></div><button type="button" onclick="cerrarPlanEstudios()" aria-label="Cerrar">×</button></div>
        <div class="study-route-picker" id="study-route-picker"></div>
        <div id="study-plan-insights" class="study-plan-insights"></div>
        <div id="study-plan-days" class="study-plan-days"></div>
        <div class="study-plan-actions"><button class="btn btn-ghost" type="button" onclick="cerrarPlanEstudios()">Cerrar</button><button class="btn btn-primary" type="button" onclick="guardarPlanEstudios()">Guardar plan de 7 días</button></div>
      </section>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", evento => { if (evento.target === modal) cerrarPlanEstudios(); });
    }
    const selector = modal.querySelector("#study-route-picker");
    if (selector) {
      selector.innerHTML = seleccion
        ? `<button type="button" class="active" data-ruta="${esc(seleccion.grupoId)}">${esc(seleccion.grupoId)} <span>${esc(seleccion.universidadCorta)} · ${esc(seleccion.grupo.replace(/^.*?·\s*/, ""))}</span></button><button type="button" onclick="cerrarPlanEstudios();abrirConfiguracionAdmision()">⚙ <span>Cambiar objetivo</span></button>`
        : `<button type="button" data-ruta="P">P <span>Ingenierías</span></button><button type="button" data-ruta="Q">Q <span>Salud</span></button><button type="button" data-ruta="R">R <span>Sociales</span></button><button type="button" data-ruta="S">S <span>Medicina</span></button>`;
      selector.querySelectorAll("[data-ruta]").forEach(boton => boton.addEventListener("click", () => seleccionarRuta(boton.dataset.ruta)));
    }
    cambiarTexto("study-plan-title", seleccion ? `${seleccion.universidadCorta} · ${seleccion.grupo}` : "Tu ruta UNAMAD");
    cambiarTexto("study-plan-copy", seleccion ? `${seleccion.carrera}. Solo se priorizan los cursos que corresponden a esta área.` : "Prioriza cursos según el número de preguntas y tu avance real.");
    modal.classList.add("open");
    seleccionarRuta(seleccion?.grupoId || window.uniprepStorage?.leerTexto("uniprep_ruta_unamad", "P") || "P");
  }

  function seleccionarRuta(ruta) {
    const modal = document.getElementById("study-plan-modal");
    const seleccion = seleccionAdmision();
    const pesos = seleccion?.pesos || PESOS_RUTA[ruta];
    if (!modal || !pesos) return;
    modal.dataset.ruta = ruta;
    modal.querySelectorAll("[data-ruta]").forEach(boton => boton.classList.toggle("active", boton.dataset.ruta === ruta));
    const orden = catalogoParaRuta().filter(curso => cursoPermitido(curso.id) && pesoActivo(curso.id, pesos) > 0).sort((a,b) => {
      const riesgoA = pesoActivo(a.id, pesos) * (100 - progresoCurso(usuarioActual,a.id));
      const riesgoB = pesoActivo(b.id, pesos) * (100 - progresoCurso(usuarioActual,b.id));
      return riesgoB - riesgoA;
    });
    const totalPreguntas = Object.values(pesos).reduce((a,b) => a + Number(b || 0), 0);
    const totalTemas = orden.reduce((suma, curso) => suma + curso.temas.length, 0);
    document.getElementById("study-plan-insights").innerHTML = `<div><b>${esc(seleccion?.universidadCorta || "UNAMAD")}</b><span>universidad</span></div><div><b>${esc(ruta)}</b><span>área o grupo</span></div><div><b>${orden.length}</b><span>cursos priorizados</span></div><div><b>${totalTemas}</b><span>temas disponibles</span></div>`;
    document.getElementById("study-plan-days").innerHTML = Array.from({length:7},(_,indice) => {
      const curso = orden[indice % orden.length];
      const tema = curso.temas[indice % curso.temas.length];
      return `<button type="button" onclick="cerrarPlanEstudios();abrirCurso('${curso.id}',${indice % curso.temas.length})"><span>DÍA ${indice + 1}</span><i style="background:${curso.color}18">${curso.icono}</i><b>${esc(tema.titulo)}</b><small>${esc(curso.nombre)} · prioridad ${pesoActivo(curso.id, pesos)}</small><em>Estudiar →</em></button>`;
    }).join("");
  }

  function guardarPlanEstudios() {
    const ruta = document.getElementById("study-plan-modal")?.dataset.ruta || "P";
    const seleccion = seleccionAdmision();
    if (!seleccion) window.uniprepStorage?.guardarTexto("uniprep_ruta_unamad", ruta);
    window.uniprepStorage?.guardar("uniprep_plan_actual", {ruta,universidad:seleccion?.universidadCorta || "UNAMAD",carrera:seleccion?.carrera || "",creado:new Date().toISOString(),dias:7});
    cerrarPlanEstudios();
    renderizarCursos();
    mostrarToast(`Plan ${seleccion?.universidadCorta || "UNAMAD"} ${ruta} guardado. Tus recomendaciones ya fueron reorganizadas.`);
  }

  function cerrarPlanEstudios() {
    document.getElementById("study-plan-modal")?.classList.remove("open");
  }

  function cambiarTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = texto;
  }

  window.CURSOS_PREUNI = CURSOS_PREUNI;
  window.obtenerCursoRuta = idCurso => cursoParaRuta(idCurso);
  window.PESOS_RUTA_UNAMAD = PESOS_RUTA;
  window.renderizarCursos = renderizarCursos;
  window.filtrarCursos = renderizarCursos;
  window.abrirCurso = abrirCurso;
  window.cambiarTemaCurso = cambiarTemaCurso;
  window.reproducirClaseActual = reproducirClaseActual;
  window.cargarUltimoCurso = cargarUltimoCurso;
  window.alternarBloqueCursos = alternarBloqueCursos;
  window.abrirPlanEstudios = abrirPlanEstudios;
  window.cerrarPlanEstudios = cerrarPlanEstudios;
  window.guardarPlanEstudios = guardarPlanEstudios;
  window.abrirTemarioUniversitario = abrirTemarioUniversitario;
  window.cerrarTemarioUniversitario = cerrarTemarioUniversitario;

  const moduloAprendizaje = document.createElement("script");
  moduloAprendizaje.src = "js/learning-content.js?v=2026.43.0";
  moduloAprendizaje.onload = () => {
    if (typeof window.inicializarModulosAprendizaje === "function") window.inicializarModulosAprendizaje();
    cargarUltimoCurso();
  };
  document.head.appendChild(moduloAprendizaje);

  document.addEventListener("DOMContentLoaded", () => {
    renderizarCursos();
    cargarUltimoCurso();
  });
  document.addEventListener("uniprep:admission-ready", renderizarCursos);
  document.addEventListener("uniprep:admission-change", renderizarCursos);
  document.addEventListener("uniprep:syllabus-ready", () => {
    renderizarCursos();
    cargarUltimoCurso();
  });
})();
