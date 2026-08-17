// =====================================================
// UNIPREP — ORIENTACIÓN VOCACIONAL Y MAPA UNIVERSITARIO
// =====================================================

(function () {
  "use strict";

  const ESTADO = {
    datos: null,
    cargando: null,
    raiz: null,
    publico: false,
    indice: 0,
    respuestas: {},
    resultado: null,
    carrera: "",
    departamento: "todos",
    tipo: "todos",
    busqueda: "",
    comparar: new Set()
  };

  const CLAVE_RESULTADO = "uniprep_resultado_chaside_98_v2";
  const CLAVE_FAVORITA = "uniprep_carrera_favorita_v1";

  function esc(valor = "") {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function normalizar(valor = "") {
    return String(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function fechaCorta(fecha) {
    try {
      return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(fecha));
    } catch (_) {
      return "resultado guardado";
    }
  }

  async function cargarDatos() {
    if (ESTADO.datos) return ESTADO.datos;
    if (ESTADO.cargando) return ESTADO.cargando;
    ESTADO.cargando = Promise.all([
      fetch("json/vocational-data.json", { cache: "no-store" }),
      fetch("json/chaside-data.json", { cache: "no-store" })
    ])
      .then(async ([base, chaside]) => {
        if (!base.ok || !chaside.ok) throw new Error("No se pudo cargar la base vocacional CHASIDE.");
        return [await base.json(), await chaside.json()];
      })
      .then(([datos, chaside]) => {
        const areas = Object.keys(chaside.areas);
        const preguntas = [];
        let id = 1;
        for (let indice = 0; indice < chaside.estructura.interesesPorArea; indice++) {
          areas.forEach(area => preguntas.push({ id: id++, perfil: area, tipo: "interes", texto: chaside.bloques[area].intereses[indice] }));
        }
        for (let indice = 0; indice < chaside.estructura.aptitudesPorArea; indice++) {
          areas.forEach(area => preguntas.push({ id: id++, perfil: area, tipo: "aptitud", texto: chaside.bloques[area].aptitudes[indice] }));
        }
        datos.version = chaside.version;
        datos.nombre = chaside.nombre;
        datos.aviso = chaside.aviso;
        datos.perfiles = chaside.areas;
        datos.preguntas = preguntas;
        datos.estructuraChaside = chaside.estructura;
        datos.fuenteChaside = chaside.fuenteEstructura;
        datos.fuentes = [chaside.fuenteEstructura, ...datos.fuentes];
        datos.carreras.forEach(carrera => { carrera.perfiles = chaside.carreras[carrera.id] || {}; });
        ESTADO.datos = datos;
        return datos;
      })
      .finally(() => { ESTADO.cargando = null; });
    return ESTADO.cargando;
  }

  function resultadoGuardado() {
    try {
      const guardado = window.uniprepStorage?.leer(CLAVE_RESULTADO, null);
      return guardado && guardado.version === 2 && guardado.tipo === "CHASIDE-98" ? guardado : null;
    } catch (_) {
      return null;
    }
  }

  function asegurarModalPublico() {
    let modal = document.getElementById("vocational-public-modal");
    if (modal) return modal;
    modal = document.createElement("section");
    modal.id = "vocational-public-modal";
    modal.className = "vocational-public-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="vocational-public-shell" role="dialog" aria-modal="true" aria-labelledby="vocational-public-title">
        <header class="vocational-public-header">
          <button class="vocational-brand" type="button" onclick="mostrarInicioVocacional()"><span>U</span><b id="vocational-public-title">UniPrep Orienta</b></button>
          <div class="vocational-public-actions">
            <a href="https://www.fcad.uner.edu.ar/extension/test-de-orientacion-vocacional-chaside/" target="_blank" rel="noopener noreferrer">Referencia universitaria CHASIDE ↗</a>
            <button type="button" onclick="cerrarOrientacionVocacional()" aria-label="Cerrar orientación vocacional">×</button>
          </div>
        </header>
        <div id="vocational-public-root" class="vocational-public-content"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", evento => {
      if (evento.target === modal) cerrarOrientacionVocacional();
    });
    return modal;
  }

  async function prepararRaiz(raiz, publico) {
    ESTADO.raiz = raiz;
    ESTADO.publico = publico;
    raiz.innerHTML = `<div class="vocational-loading"><span></span><b>Preparando tu brújula vocacional</b><small>Cargando carreras y universidades del Perú…</small></div>`;
    try {
      await cargarDatos();
      return true;
    } catch (error) {
      console.error("UniPrep Orienta:", error);
      raiz.innerHTML = `<div class="vocational-error"><b>No pudimos cargar la orientación vocacional.</b><p>Abre UniPrep con Live Server y vuelve a intentarlo.</p><button type="button" onclick="mostrarInicioVocacional()">Reintentar</button></div>`;
      return false;
    }
  }

  async function abrirOrientacionVocacional(modo = "inicio") {
    const modal = asegurarModalPublico();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("vocational-modal-open");
    const raiz = document.getElementById("vocational-public-root");
    if (!await prepararRaiz(raiz, true)) return;
    enrutarModo(modo);
  }

  function cerrarOrientacionVocacional() {
    const modal = document.getElementById("vocational-public-modal");
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("vocational-modal-open");
  }

  async function abrirCentroVocacional(elemento, modo = "inicio") {
    if (typeof window.go === "function") window.go("vocacional", elemento || null);
    const raiz = document.getElementById("vocational-root");
    if (!raiz || !await prepararRaiz(raiz, false)) return;
    enrutarModo(modo);
  }

  function enrutarModo(modo) {
    if (modo === "test") return iniciarTestVocacional();
    if (modo === "explorar") return mostrarExploradorVocacional();
    if (modo === "resultado" && (ESTADO.resultado || resultadoGuardado())) return mostrarResultadoVocacional();
    mostrarInicioVocacional();
  }

  function encabezadoInterno(ceja, titulo, texto, acciones = "") {
    return `<header class="vocational-page-head">
      <div><span>${esc(ceja)}</span><h1>${esc(titulo)}</h1><p>${esc(texto)}</p></div>
      <div class="vocational-page-actions">${acciones}</div>
    </header>`;
  }

  function mostrarInicioVocacional() {
    if (!ESTADO.raiz || !ESTADO.datos) return;
    const guardado = resultadoGuardado();
    const top = guardado?.carreras?.[0] ? ESTADO.datos.carreras.find(c => c.id === guardado.carreras[0].id) : null;
    const cantidadDepartamentos = new Set(ESTADO.datos.universidades.map(u => u.departamento)).size;
    ESTADO.raiz.innerHTML = `
      <div class="vocational-home">
        ${encabezadoInterno("TEST VOCACIONAL CHASIDE", "Descubre una carrera que encaje contigo", "Responde 98 preguntas de Sí o No, compara tus intereses y aptitudes y encuentra dónde estudiar en el Perú.")}
        <section class="vocational-hero">
          <div class="vocational-hero-copy">
            <span class="vocational-pill">CHASIDE COMPLETO · 98 PREGUNTAS · SÍ O NO</span>
            <h2>Conoce lo que te interesa<br><strong>y aquello para lo que destacas.</strong></h2>
            <p>La adaptación digital evalúa siete áreas CHASIDE y presenta por separado tus intereses y aptitudes antes de recomendar carreras.</p>
            <div class="vocational-hero-buttons">
              <button class="vocational-primary" type="button" onclick="iniciarTestVocacional()"><span>◎</span><b>Comenzar Test CHASIDE</b><small>98 preguntas · Sí/No · 15–25 minutos</small></button>
              <button class="vocational-secondary" type="button" onclick="mostrarExploradorVocacional()"><span>⌖</span><b>Explorar carreras y universidades</b><small>Busca por carrera, región o gestión</small></button>
            </div>
            ${guardado && top ? `<button class="vocational-saved-result" type="button" onclick="mostrarResultadoVocacional()"><span>✓</span><span><b>Continuar con mi resultado</b><small>${esc(top.nombre)} · ${guardado.carreras[0].afinidad}% · ${fechaCorta(guardado.fecha)}</small></span><em>Ver análisis →</em></button>` : ""}
          </div>
          <div class="vocational-orbit-card">
            <div class="vocational-compass"><span>C</span><span>H</span><span>A</span><span>S</span><span>I</span><span>D</span><span>E</span><b>U</b></div>
            <div class="vocational-orbit-stats"><div><b>${ESTADO.datos.carreras.length}</b><span>carreras explicadas</span></div><div><b>${ESTADO.datos.universidades.length}</b><span>universidades base</span></div><div><b>${cantidadDepartamentos}</b><span>departamentos</span></div></div>
          </div>
        </section>
        <section class="vocational-method-grid">
          <article><span>01</span><b>Responde</b><p>Completa las 98 preguntas con Sí o No, sin omitir ninguna y sin buscar la respuesta “correcta”.</p></article>
          <article><span>02</span><b>Compara</b><p>Observa por separado lo que te interesa y las aptitudes que reconoces en ti.</p></article>
          <article><span>03</span><b>Investiga</b><p>Revisa materias, campo laboral, exigencias y universidades antes de elegir.</p></article>
          <article><span>04</span><b>Verifica</b><p>Contrasta la oferta vigente en Mi Carrera del MTPE y TUNI/SUNEDU.</p></article>
        </section>
        <section class="vocational-trust-banner"><span>i</span><div><b>Una brújula, no una sentencia</b><p>${esc(ESTADO.datos.aviso)}</p></div><a href="${esc(ESTADO.datos.fuenteChaside.url)}" target="_blank" rel="noopener noreferrer">Consultar referencia universitaria ↗</a></section>
      </div>`;
  }

  function iniciarTestVocacional() {
    if (!ESTADO.datos || !ESTADO.raiz) return;
    ESTADO.indice = 0;
    ESTADO.respuestas = {};
    ESTADO.resultado = null;
    renderizarPreguntaVocacional();
  }

  function renderizarPreguntaVocacional() {
    const preguntas = ESTADO.datos.preguntas;
    const pregunta = preguntas[ESTADO.indice];
    const progreso = Math.round((ESTADO.indice / preguntas.length) * 100);
    ESTADO.raiz.innerHTML = `
      <div class="vocational-test-shell">
        <header class="vocational-test-top"><button type="button" onclick="mostrarInicioVocacional()">← Salir</button><div><b>Test CHASIDE · UniPrep</b><small>98 preguntas de Sí o No · responde con sinceridad.</small></div><span>${ESTADO.indice + 1}/${preguntas.length}</span></header>
        <div class="vocational-test-progress"><span style="width:${progreso}%"></span></div>
        <main class="vocational-question-card">
          <span class="vocational-question-kicker">${pregunta.tipo === "interes" ? "INTERESES · LO QUE TE GUSTA" : "APTITUDES · LO QUE RECONOCES EN TI"}</span>
          <h2>${esc(pregunta.texto)}</h2>
          <div class="vocational-binary"><button type="button" class="yes" onclick="responderPreguntaVocacional(true)"><span>✓</span><b>Sí</b><small>Me interesa o me describe</small></button><button type="button" class="no" onclick="responderPreguntaVocacional(false)"><span>×</span><b>No</b><small>No me interesa o no me describe</small></button></div>
          <div class="vocational-question-help"><span>SÍ</span> Responde con sinceridad y no omitas ninguna pregunta <span>NO</span></div>
        </main>
        <footer class="vocational-test-footer"><button type="button" ${ESTADO.indice === 0 ? "disabled" : ""} onclick="retrocederPreguntaVocacional()">← Anterior</button><p>Tu resultado se guarda únicamente al terminar.</p><button type="button" onclick="mostrarExploradorVocacional()">Explorar sin test →</button></footer>
      </div>`;
  }

  function responderPreguntaVocacional(valor) {
    const pregunta = ESTADO.datos.preguntas[ESTADO.indice];
    ESTADO.respuestas[pregunta.id] = valor === true;
    if (ESTADO.indice < ESTADO.datos.preguntas.length - 1) {
      ESTADO.indice++;
      renderizarPreguntaVocacional();
    } else {
      calcularResultadoVocacional();
    }
  }

  function retrocederPreguntaVocacional() {
    if (ESTADO.indice <= 0) return;
    ESTADO.indice--;
    renderizarPreguntaVocacional();
  }

  function calcularResultadoVocacional() {
    const ids = Object.keys(ESTADO.datos.perfiles);
    const intereses = Object.fromEntries(ids.map(id => [id, 0]));
    const aptitudes = Object.fromEntries(ids.map(id => [id, 0]));
    ESTADO.datos.preguntas.forEach(pregunta => {
      if (ESTADO.respuestas[pregunta.id] === true) {
        if (pregunta.tipo === "interes") intereses[pregunta.perfil]++;
        else aptitudes[pregunta.perfil]++;
      }
    });
    const porcentajesInteres = Object.fromEntries(ids.map(id => [id, Math.round(intereses[id] / ESTADO.datos.estructuraChaside.interesesPorArea * 100)]));
    const porcentajesAptitud = Object.fromEntries(ids.map(id => [id, Math.round(aptitudes[id] / ESTADO.datos.estructuraChaside.aptitudesPorArea * 100)]));
    const porcentajes = Object.fromEntries(ids.map(id => [id, Math.round(porcentajesInteres[id] * .65 + porcentajesAptitud[id] * .35)]));
    const ordenPerfiles = Object.entries(porcentajes).sort((a, b) => b[1] - a[1]);
    const carreras = ESTADO.datos.carreras.map(carrera => {
      const entradas = Object.entries(carrera.perfiles);
      const pesoTotal = entradas.reduce((suma, [, peso]) => suma + peso, 0);
      const afinidad = Math.round(entradas.reduce((suma, [id, peso]) => suma + porcentajes[id] * peso, 0) / pesoTotal);
      return { id: carrera.id, afinidad };
    }).sort((a, b) => b.afinidad - a.afinidad);
    ESTADO.resultado = {
      version: 2,
      tipo: "CHASIDE-98",
      fecha: new Date().toISOString(),
      codigo: ordenPerfiles.slice(0, 2).map(([id]) => id).join("–"),
      intereses: porcentajesInteres,
      aptitudes: porcentajesAptitud,
      perfiles: porcentajes,
      carreras
    };
    window.uniprepStorage?.guardar(CLAVE_RESULTADO, ESTADO.resultado);
    mostrarResultadoVocacional();
  }

  function perfilBarra(id, valor, interes, aptitud) {
    const perfil = ESTADO.datos.perfiles[id];
    return `<div class="vocational-profile-bar vocational-profile-dual" style="--profile-color:${perfil.color}"><span>${perfil.icono}</span><div><b>${id} · ${esc(perfil.nombre)}</b><label>Interés <i><em style="width:${interes}%"></em></i><small>${interes}%</small></label><label>Aptitud <i><em style="width:${aptitud}%"></em></i><small>${aptitud}%</small></label></div><strong>${valor}%<small>afinidad</small></strong></div>`;
  }

  function tarjetaCarrera(item, indice = 0) {
    const carrera = ESTADO.datos.carreras.find(c => c.id === item.id);
    const universidades = ESTADO.datos.universidades.filter(u => u.carreras.includes(carrera.id)).length;
    return `<article class="vocational-career-card ${indice === 0 ? "top" : ""}">
      <header><span>${esc(carrera.icono)}</span><div><small>${indice === 0 ? "MEJOR COINCIDENCIA" : `ALTERNATIVA ${indice + 1}`}</small><h3>${esc(carrera.nombre)}</h3></div><strong>${item.afinidad}%</strong></header>
      <p>${esc(carrera.resumen)}</p>
      <div class="vocational-career-tags"><span>${esc(carrera.duracion)}</span><span>${universidades} universidades en la base</span></div>
      <footer><button type="button" onclick="verCarreraVocacional('${carrera.id}')">Conocer la carrera</button><button type="button" onclick="mostrarExploradorVocacional('${carrera.id}')">Dónde estudiarla →</button></footer>
    </article>`;
  }

  function mostrarResultadoVocacional() {
    const resultado = ESTADO.resultado || resultadoGuardado();
    if (!resultado || !ESTADO.datos || !ESTADO.raiz) return iniciarTestVocacional();
    ESTADO.resultado = resultado;
    const orden = Object.entries(resultado.perfiles).sort((a, b) => b[1] - a[1]);
    const [idPrincipal, valorPrincipal] = orden[0];
    const principal = ESTADO.datos.perfiles[idPrincipal];
    const topCarreras = resultado.carreras.slice(0, 5);
    ESTADO.raiz.innerHTML = `
      <div class="vocational-result-page">
        ${encabezadoInterno("TU RESULTADO CHASIDE", `Perfil vocacional ${resultado.codigo}`, "Compara las siete áreas, observando por separado tus intereses y aptitudes antes de elegir.", `<button type="button" onclick="iniciarTestVocacional()">Repetir test</button><button type="button" onclick="imprimirResultadoVocacional()">Imprimir resultado</button>`)}
        <section class="vocational-result-hero" style="--profile-color:${principal.color}">
          <div class="vocational-result-code"><span>${principal.icono}</span><small>ÁREAS DOMINANTES</small><b>${resultado.codigo}</b><em>${valorPrincipal}% de afinidad combinada</em></div>
          <div><h2>${esc(principal.nombre)}</h2><p>${esc(principal.resumen)}</p><div>${principal.fortalezas.map(f => `<span>${esc(f)}</span>`).join("")}</div></div>
        </section>
        <div class="vocational-result-grid">
          <section class="vocational-profile-panel"><header><div><span>LECTURA COMPLETA</span><h3>Tus siete áreas CHASIDE</h3></div><small>Interés: 10 ítems · Aptitud: 4 ítems por área</small></header>${orden.map(([id, valor]) => perfilBarra(id, valor, resultado.intereses[id], resultado.aptitudes[id])).join("")}</section>
          <aside class="vocational-next-panel"><span>PRÓXIMO PASO RECOMENDADO</span><h3>Investiga antes de elegir</h3><ol><li>Compara tu interés y aptitud dominante.</li><li>Revisa las cinco carreras sugeridas.</li><li>Filtra universidades por región.</li><li>Habla con un orientador o profesional.</li></ol><a href="${esc(ESTADO.datos.fuenteChaside.url)}" target="_blank" rel="noopener noreferrer">Referencia universitaria CHASIDE ↗</a></aside>
        </div>
        <section class="vocational-results-list"><header><div><span>CARRERAS COMPATIBLES</span><h2>Opciones para investigar</h2></div><button type="button" onclick="mostrarExploradorVocacional()">Ver todo el catálogo →</button></header><div>${topCarreras.map(tarjetaCarrera).join("")}</div></section>
        <section class="vocational-seven-days"><header><span>PLAN DE DECISIÓN</span><h2>Siete días para comprobar tu resultado</h2></header><div>${[
          ["Día 1", "Lee la malla curricular de tus dos carreras principales."],
          ["Día 2", "Resuelve una actividad relacionada con cada carrera."],
          ["Día 3", "Compara universidades, ciudades y costos directos."],
          ["Día 4", "Pregunta a un estudiante o profesional cómo es su rutina."],
          ["Día 5", "Revisa empleabilidad y remuneración en Mi Carrera."],
          ["Día 6", "Identifica qué materias necesitas reforzar."],
          ["Día 7", "Elige tres opciones: principal, alternativa y respaldo."]
        ].map(([dia, tarea]) => `<article><b>${dia}</b><p>${tarea}</p></article>`).join("")}</div></section>
        <div class="vocational-disclaimer"><b>Importante:</b> ${esc(ESTADO.datos.aviso)}</div>
      </div>`;
  }

  function carreraPorId(id) {
    return ESTADO.datos?.carreras.find(carrera => carrera.id === id) || null;
  }

  function guardarCarreraFavorita(id) {
    const carrera = carreraPorId(id);
    if (!carrera) return;
    window.uniprepStorage?.guardar(CLAVE_FAVORITA, { id, nombre: carrera.nombre, fecha: new Date().toISOString() });
    const boton = document.querySelector(`[data-save-career="${CSS.escape(id)}"]`);
    if (boton) boton.innerHTML = "✓ Guardada como favorita";
    window.mostrarToastPremium?.(`${carrera.nombre} guardada como carrera favorita.`);
  }

  function detalleCarreraHtml(carrera) {
    const afinidad = (ESTADO.resultado || resultadoGuardado())?.carreras?.find(item => item.id === carrera.id)?.afinidad;
    const favorita = window.uniprepStorage?.leer(CLAVE_FAVORITA, null)?.id === carrera.id;
    return `<section class="vocational-career-detail">
      <header><button type="button" onclick="mostrarExploradorVocacional('${carrera.id}')">← Universidades</button><span>${esc(carrera.icono)}</span><div><small>${afinidad != null ? `${afinidad}% DE COMPATIBILIDAD` : "FICHA DE CARRERA"}</small><h1>${esc(carrera.nombre)}</h1><p>${esc(carrera.resumen)}</p></div><button data-save-career="${carrera.id}" type="button" onclick="guardarCarreraFavorita('${carrera.id}')">${favorita ? "✓ Guardada como favorita" : "☆ Guardar como favorita"}</button></header>
      <div class="vocational-career-facts"><article><span>⏱</span><b>Duración referencial</b><p>${esc(carrera.duracion)}</p></article><article><span>◉</span><b>Materias frecuentes</b><p>${carrera.materias.map(esc).join(" · ")}</p></article><article><span>↗</span><b>Habilidades importantes</b><p>${carrera.habilidades.map(esc).join(" · ")}</p></article></div>
      <div class="vocational-detail-columns"><article><span>QUÉ ESTUDIARÁS</span><ul>${carrera.materias.map(item => `<li>${esc(item)}</li>`).join("")}</ul></article><article><span>DÓNDE PODRÍAS TRABAJAR</span><ul>${carrera.campo.map(item => `<li>${esc(item)}</li>`).join("")}</ul></article><article class="warning"><span>ANTES DE DECIDIR</span><ul>${carrera.considera.map(item => `<li>${esc(item)}</li>`).join("")}</ul></article></div>
      <div class="vocational-prep-route"><div><span>RUTA UNIPREP SUGERIDA</span><h3>Cursos que conviene reforzar</h3></div><div>${carrera.cursosUniPrep.map(id => { const curso = window.CURSOS_PREUNI?.[id]; return curso ? `<button type="button" onclick="cerrarOrientacionVocacional();abrirCurso('${id}',0)">${curso.icono} ${esc(curso.nombre)}</button>` : `<span>${esc(id.replaceAll("_", " "))}</span>`; }).join("")}</div></div>
    </section>`;
  }

  function verCarreraVocacional(id) {
    const carrera = carreraPorId(id);
    if (!carrera || !ESTADO.raiz) return;
    ESTADO.raiz.innerHTML = `<div class="vocational-detail-page">${detalleCarreraHtml(carrera)}<section class="vocational-university-preview"><header><div><span>OFERTA EN EL PERÚ</span><h2>Universidades relacionadas</h2></div><button type="button" onclick="mostrarExploradorVocacional('${carrera.id}')">Filtrar universidades →</button></header>${tarjetasUniversidad(filtrarUniversidades(carrera.id).slice(0, 6))}</section><div class="vocational-disclaimer">La oferta puede cambiar por sede y proceso de admisión. Verifica el programa en la web institucional y en TUNI/SUNEDU antes de postular.</div></div>`;
  }

  function departamentosDisponibles() {
    return [...new Set(ESTADO.datos.universidades.map(u => u.departamento))].sort((a, b) => a.localeCompare(b, "es"));
  }

  function filtrarUniversidades(carreraId = ESTADO.carrera) {
    const q = normalizar(ESTADO.busqueda);
    return ESTADO.datos.universidades.filter(universidad => {
      const coincideCarrera = !carreraId || universidad.carreras.includes(carreraId);
      const coincideDepartamento = ESTADO.departamento === "todos" || universidad.departamento === ESTADO.departamento;
      const coincideTipo = ESTADO.tipo === "todos" || universidad.tipo === ESTADO.tipo;
      const coincideTexto = !q || normalizar(`${universidad.nombre} ${universidad.corto} ${universidad.ciudad} ${universidad.departamento}`).includes(q);
      return coincideCarrera && coincideDepartamento && coincideTipo && coincideTexto;
    }).sort((a, b) => a.departamento.localeCompare(b.departamento, "es") || a.nombre.localeCompare(b.nombre, "es"));
  }

  function tarjetasUniversidad(universidades) {
    if (!universidades.length) return `<div class="vocational-empty"><span>⌕</span><b>No encontramos coincidencias</b><p>Prueba con otro departamento, tipo de gestión o carrera.</p></div>`;
    return `<div class="vocational-university-grid">${universidades.map(universidad => {
      const seleccionada = ESTADO.comparar.has(universidad.id);
      return `<article class="vocational-university-card">
        <header><span>${universidad.corto.slice(0, 4)}</span><div><b>${esc(universidad.corto)}</b><small>${esc(universidad.tipo)}</small></div><button type="button" class="${seleccionada ? "selected" : ""}" onclick="alternarComparacionUniversidad('${universidad.id}')" title="Agregar al comparador">${seleccionada ? "✓" : "+"}</button></header>
        <h3>${esc(universidad.nombre)}</h3><p><span>⌖</span>${esc(universidad.ciudad)} · ${esc(universidad.departamento)}</p>
        <footer><a href="${esc(universidad.web)}" target="_blank" rel="noopener noreferrer">Sitio institucional ↗</a><a href="https://www.tuni.pe/" target="_blank" rel="noopener noreferrer">Verificar en TUNI ↗</a></footer>
      </article>`;
    }).join("")}</div>`;
  }

  function mostrarExploradorVocacional(carreraId = "") {
    if (!ESTADO.datos || !ESTADO.raiz) return;
    if (carreraId) ESTADO.carrera = carreraId;
    else if (!ESTADO.carrera) ESTADO.carrera = (ESTADO.resultado || resultadoGuardado())?.carreras?.[0]?.id || "";
    const carrera = carreraPorId(ESTADO.carrera);
    const universidades = filtrarUniversidades();
    ESTADO.raiz.innerHTML = `
      <div class="vocational-explorer-page">
        ${encabezadoInterno("DIRECTORIO NACIONAL", "Carreras y universidades del Perú", "Filtra la oferta referencial por carrera, departamento y gestión. Confirma siempre la sede y convocatoria vigente.", `<button type="button" onclick="mostrarInicioVocacional()">Inicio</button>${(ESTADO.resultado || resultadoGuardado()) ? `<button type="button" onclick="mostrarResultadoVocacional()">Mi resultado</button>` : ""}`)}
        <section class="vocational-explorer-command">
          <label><span>Carrera</span><select id="vocational-career-filter" onchange="actualizarFiltroVocacional('carrera',this.value)"><option value="">Todas las carreras</option>${ESTADO.datos.carreras.map(item => `<option value="${item.id}" ${item.id === ESTADO.carrera ? "selected" : ""}>${esc(item.nombre)}</option>`).join("")}</select></label>
          <label><span>Departamento</span><select onchange="actualizarFiltroVocacional('departamento',this.value)"><option value="todos">Todo el Perú</option>${departamentosDisponibles().map(item => `<option value="${esc(item)}" ${item === ESTADO.departamento ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label>
          <label><span>Gestión</span><select onchange="actualizarFiltroVocacional('tipo',this.value)"><option value="todos">Públicas y privadas</option><option value="Pública" ${ESTADO.tipo === "Pública" ? "selected" : ""}>Públicas</option><option value="Privada" ${ESTADO.tipo === "Privada" ? "selected" : ""}>Privadas</option></select></label>
          <label class="search"><span>Buscar universidad o ciudad</span><input type="search" value="${esc(ESTADO.busqueda)}" placeholder="Ej. Arequipa, UNMSM…" oninput="actualizarFiltroVocacional('busqueda',this.value)"></label>
        </section>
        ${carrera ? `<section class="vocational-selected-career"><span>${esc(carrera.icono)}</span><div><small>CARRERA SELECCIONADA</small><h2>${esc(carrera.nombre)}</h2><p>${esc(carrera.resumen)}</p></div><button type="button" onclick="verCarreraVocacional('${carrera.id}')">Ver ficha completa</button></section>` : ""}
        <section class="vocational-university-results"><header><div><b id="vocational-university-count">${universidades.length}</b><span>universidades encontradas</span></div><p>${carrera ? `Para ${esc(carrera.nombre)}` : "Catálogo nacional de referencia"}</p><button type="button" onclick="mostrarComparacionUniversidades()" ${ESTADO.comparar.size < 2 ? "disabled" : ""}>Comparar seleccionadas (${ESTADO.comparar.size})</button></header><div id="vocational-university-list">${tarjetasUniversidad(universidades)}</div></section>
        <section class="vocational-official-sources"><div><span>FUENTES PARA VERIFICAR</span><h3>Comprueba antes de postular</h3><p>UniPrep organiza una base orientativa. La autorización del programa, la sede, modalidad, vacantes y costos pueden cambiar.</p></div>${ESTADO.datos.fuentes.map(fuente => `<a href="${esc(fuente.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(fuente.nombre)}</b><small>${esc(fuente.uso)}</small><em>Consultar ↗</em></a>`).join("")}</section>
      </div>`;
  }

  function actualizarFiltroVocacional(tipo, valor) {
    if (tipo === "carrera") ESTADO.carrera = valor;
    if (tipo === "departamento") ESTADO.departamento = valor;
    if (tipo === "tipo") ESTADO.tipo = valor;
    if (tipo === "busqueda") ESTADO.busqueda = valor;
    if (tipo === "busqueda") {
      const lista = document.getElementById("vocational-university-list");
      const contador = document.getElementById("vocational-university-count");
      const universidades = filtrarUniversidades();
      if (lista) lista.innerHTML = tarjetasUniversidad(universidades);
      if (contador) contador.textContent = universidades.length;
      return;
    }
    mostrarExploradorVocacional(ESTADO.carrera);
  }

  function alternarComparacionUniversidad(id) {
    if (ESTADO.comparar.has(id)) ESTADO.comparar.delete(id);
    else if (ESTADO.comparar.size < 3) ESTADO.comparar.add(id);
    else return alert("Puedes comparar hasta tres universidades a la vez.");
    mostrarExploradorVocacional(ESTADO.carrera);
  }

  function mostrarComparacionUniversidades() {
    const seleccionadas = [...ESTADO.comparar].map(id => ESTADO.datos.universidades.find(u => u.id === id)).filter(Boolean);
    if (seleccionadas.length < 2) return alert("Selecciona al menos dos universidades con el botón +.");
    let modal = document.getElementById("vocational-compare-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "vocational-compare-modal";
      modal.className = "vocational-compare-modal";
      document.body.appendChild(modal);
    }
    const carrera = carreraPorId(ESTADO.carrera);
    modal.innerHTML = `<div class="vocational-compare-dialog"><header><div><span>COMPARADOR</span><h2>${carrera ? esc(carrera.nombre) : "Universidades seleccionadas"}</h2></div><button type="button" onclick="cerrarComparacionUniversidades()">×</button></header><div class="vocational-compare-grid">${seleccionadas.map(u => `<article><span>${esc(u.corto)}</span><h3>${esc(u.nombre)}</h3><dl><div><dt>Gestión</dt><dd>${esc(u.tipo)}</dd></div><div><dt>Departamento</dt><dd>${esc(u.departamento)}</dd></div><div><dt>Ciudad</dt><dd>${esc(u.ciudad)}</dd></div><div><dt>Oferta en UniPrep</dt><dd>${u.carreras.length} carreras relacionadas</dd></div></dl><a href="${esc(u.web)}" target="_blank" rel="noopener noreferrer">Visitar universidad ↗</a><a href="https://www.tuni.pe/" target="_blank" rel="noopener noreferrer">Verificar programa en TUNI ↗</a></article>`).join("")}</div><footer><p>La comparación no incluye costos ni vacantes porque cambian por convocatoria. Revisa siempre la fuente institucional.</p><button type="button" onclick="cerrarComparacionUniversidades()">Cerrar comparación</button></footer></div>`;
    modal.classList.add("open");
  }

  function cerrarComparacionUniversidades() {
    document.getElementById("vocational-compare-modal")?.classList.remove("open");
  }

  function imprimirResultadoVocacional() {
    const resultado = ESTADO.resultado || resultadoGuardado();
    if (!resultado) return;
    const ventana = window.open("", "_blank", "noopener,noreferrer");
    if (!ventana) return alert("El navegador bloqueó la ventana de impresión.");
    const carreras = resultado.carreras.slice(0, 5).map(item => ({ ...item, carrera: carreraPorId(item.id) })).filter(item => item.carrera);
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Resultado CHASIDE UniPrep</title><style>body{font-family:Arial,sans-serif;color:#17203b;margin:40px;line-height:1.5}h1{margin-bottom:4px}.code{font-size:42px;font-weight:800;color:#6d4aff}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0}.grid div,.career{border:1px solid #d9ddeb;border-radius:12px;padding:14px}.career{margin:10px 0}.career b{float:right;color:#6d4aff}.note{font-size:12px;color:#667085;margin-top:28px}@media print{button{display:none}}</style></head><body><small>UNIPREP ORIENTA · CHASIDE 98 · ${new Date(resultado.fecha).toLocaleDateString("es-PE")}</small><h1>Resultado vocacional CHASIDE</h1><div class="code">${esc(resultado.codigo)}</div><p>Intereses y aptitudes autopercibidas en siete áreas vocacionales.</p><div class="grid">${Object.entries(resultado.perfiles).sort((a,b)=>b[1]-a[1]).map(([id,v])=>`<div><strong>${id} · ${esc(ESTADO.datos.perfiles[id].nombre)}</strong><br>Interés: ${resultado.intereses[id]}% · Aptitud: ${resultado.aptitudes[id]}% · Afinidad: ${v}%</div>`).join("")}</div><h2>Carreras para investigar</h2>${carreras.map(item=>`<div class="career"><b>${item.afinidad}%</b><strong>${esc(item.carrera.nombre)}</strong><p>${esc(item.carrera.resumen)}</p></div>`).join("")}<p class="note">${esc(ESTADO.datos.aviso)} Verifica la oferta en Mi Carrera del MTPE y TUNI/SUNEDU.</p><script>window.onload=()=>window.print()<\/script></body></html>`);
    ventana.document.close();
  }

  window.abrirOrientacionVocacional = abrirOrientacionVocacional;
  window.cerrarOrientacionVocacional = cerrarOrientacionVocacional;
  window.abrirCentroVocacional = abrirCentroVocacional;
  window.mostrarInicioVocacional = mostrarInicioVocacional;
  window.iniciarTestVocacional = iniciarTestVocacional;
  window.responderPreguntaVocacional = responderPreguntaVocacional;
  window.retrocederPreguntaVocacional = retrocederPreguntaVocacional;
  window.mostrarResultadoVocacional = mostrarResultadoVocacional;
  window.mostrarExploradorVocacional = mostrarExploradorVocacional;
  window.actualizarFiltroVocacional = actualizarFiltroVocacional;
  window.verCarreraVocacional = verCarreraVocacional;
  window.guardarCarreraFavorita = guardarCarreraFavorita;
  window.alternarComparacionUniversidad = alternarComparacionUniversidad;
  window.mostrarComparacionUniversidades = mostrarComparacionUniversidades;
  window.cerrarComparacionUniversidades = cerrarComparacionUniversidades;
  window.imprimirResultadoVocacional = imprimirResultadoVocacional;

  document.addEventListener("keydown", evento => {
    if (evento.key !== "Escape") return;
    if (document.getElementById("vocational-compare-modal")?.classList.contains("open")) cerrarComparacionUniversidades();
    else if (document.getElementById("vocational-public-modal")?.classList.contains("open")) cerrarOrientacionVocacional();
  });
})();
