// =====================================================
// UNIPREP - FORMULARIO MAESTRO SEGÚN RUTA DE ADMISIÓN
// =====================================================
(function () {
  "use strict";

  const estado = {datos:null, vista:"formulas", curso:"todos", busqueda:"", abiertos:new Set(), inicializado:false};

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function seleccion() {
    return window.obtenerSeleccionAdmision?.() || null;
  }

  function cursosActivos() {
    return Object.values(window.CURSOS_PREUNI || {})
      .filter(curso => window.cursoPermitidoAdmision?.(curso.id) !== false && estado.datos?.cursos?.[curso.id])
      .sort((a,b) => (Number(window.pesoCursoAdmision?.(b.id)) || 0) - (Number(window.pesoCursoAdmision?.(a.id)) || 0));
  }

  function detalle(id) {
    return window.detallePesoCursoAdmision?.(id) || {peso:1,etiqueta:"Ruta general",clase:"base",nombre:"Incluido"};
  }

  function textoFormulario(curso, contenido) {
    return `${curso.nombre} ${contenido.resumen || ""} ${contenido.formulas.map(x=>`${x.tipo || ""} ${x.nombre} ${x.expresion} ${x.variables || ""} ${x.condicion || ""}`).join(" ")}`.toLowerCase();
  }

  function coincide(curso, contenido) {
    if (estado.curso !== "todos" && curso.id !== estado.curso) return false;
    return !estado.busqueda || textoFormulario(curso, contenido).includes(estado.busqueda);
  }

  function formulasVisibles(contenido) {
    if (!estado.busqueda) return contenido.formulas;
    return contenido.formulas.filter(item => `${item.tipo || ""} ${item.nombre} ${item.expresion} ${item.variables || ""} ${item.condicion || ""}`.toLowerCase().includes(estado.busqueda));
  }

  function resumenMatriz(ruta) {
    if (!ruta) return "Activa tu universidad y carrera para ordenar este centro según tu examen.";
    const total = Object.values(ruta.pesos || {}).reduce((suma, valor) => suma + Number(valor || 0), 0);
    const extra = (ruta.otrosComponentes || []).reduce((suma, item) => suma + Number(item.preguntas || 0), 0);
    return ruta.tipoPeso === "preguntas"
      ? `${total} preguntas académicas${extra ? ` + ${extra} de componente adicional` : ""}`
      : `${ruta.cursos.length} cursos ordenados por prioridad del temario`;
  }

  function renderizar() {
    const raiz = document.getElementById("formula-center-root");
    if (!raiz || !estado.datos) return;
    const ruta = seleccion();
    const cursos = cursosActivos();
    const formulas = cursos.reduce((suma, curso) => suma + estado.datos.cursos[curso.id].formulas.length, 0);
    const prioritario = cursos[0];

    raiz.innerHTML = `<section class="formula-smart-hero">
      <div class="formula-smart-copy"><span>FORMULARIO MAESTRO DE ADMISIÓN</span><h1>Fórmulas y reglas que debes <em>dominar</em></h1><p>${ruta ? `${esc(ruta.universidadCorta)} · ${esc(ruta.grupo)} · ${esc(ruta.carrera)} · ${esc(resumenMatriz(ruta))}` : esc(resumenMatriz(null))}. Cada ficha indica el nombre, la expresión, el significado de sus símbolos y la condición correcta de uso.</p><div class="formula-smart-actions"><button class="btn btn-primary" type="button" onclick="expandirTodoFormulario()">▣ Abrir todo</button><button class="btn btn-ghost" type="button" onclick="abrirHorarioPersonalizado()">▦ Crear mi horario</button></div></div>
      <div class="formula-smart-stats"><div><b>${cursos.length}</b><span>cursos de tu ruta</span></div><div><b>${formulas}</b><span>fórmulas, reglas y esquemas</span></div><div><b>Sin relleno</b><span>consulta directa, sin ejemplos extensos</span></div><div><b>${esc(prioritario?.nombre || "General")}</b><span>prioridad principal</span></div></div>
    </section>
    <div class="formula-truth-note"><span>✓</span><p><b>Contenido académico claro:</b> Matemática y Ciencia muestran fórmulas verificables; Comunicación y Humanidades presentan reglas, estructuras y criterios. No se inventan ecuaciones para cursos que no las necesitan.</p></div>
    <div class="formula-smart-toolbar">
      <div class="formula-tabs"><button class="${estado.vista==="formulas"?"active":""}" onclick="cambiarVistaFormulario('formulas')">Formulario completo</button><button class="${estado.vista==="ruta"?"active":""}" onclick="cambiarVistaFormulario('ruta')">Mi prioridad</button></div>
      <label class="formula-search"><span>⌕</span><input type="search" value="${esc(estado.busqueda)}" placeholder="Buscar fórmula, regla, símbolo o tema…" oninput="filtrarFormulario(this.value)"></label>
    </div>
    <div class="formula-course-filter"><button class="${estado.curso==="todos"?"active":""}" onclick="seleccionarCursoFormulario('todos')">Todos</button>${cursos.map(curso=>`<button class="${estado.curso===curso.id?"active":""}" onclick="seleccionarCursoFormulario('${curso.id}')">${curso.icono} ${esc(curso.nombre)}</button>`).join("")}</div>
    <div id="formula-smart-content">${renderizarVista(cursos, ruta)}</div>`;
  }

  function renderizarVista(cursos, ruta) {
    const filtrados = cursos.filter(curso => coincide(curso, estado.datos.cursos[curso.id]));
    if (!filtrados.length) return '<div class="formula-empty">No encontramos fórmulas o reglas con ese filtro.</div>';
    if (estado.vista === "formulas") return renderizarFormulas(filtrados);
    return renderizarRuta(filtrados, ruta);
  }

  function renderizarRuta(cursos, ruta) {
    const maximo = Math.max(...cursos.map(curso => detalle(curso.id).peso || 1), 1);
    const extras = ruta?.otrosComponentes?.length ? `<div class="formula-extra-components"><b>También considera</b>${ruta.otrosComponentes.map(item=>`<span>${esc(item.nombre)} · ${item.preguntas} preguntas</span>`).join("")}</div>` : "";
    return `<div class="formula-route-layout"><section class="formula-route-priorities"><div class="formula-section-head"><div><span>MATRIZ ACTIVA</span><h2>Prioridades de ${esc(ruta?.grupo || "tu preparación general")}</h2></div><small>Ordenadas por peso</small></div>${cursos.map((curso, indice) => {
      const info = estado.datos.cursos[curso.id], peso = detalle(curso.id), ancho = Math.max(8, Math.round((peso.peso || 1) / maximo * 100));
      return `<article class="formula-priority-row"><span class="formula-priority-number">${String(indice+1).padStart(2,"0")}</span><i style="--formula-color:${curso.color}">${curso.icono}</i><div><div class="formula-priority-title"><b>${esc(curso.nombre)}</b><em class="${peso.clase}">${esc(peso.etiqueta)}</em></div><p>${info.formulas.length} fórmulas y reglas de consulta</p><span class="formula-weight-bar"><i style="width:${ancho}%;background:${curso.color}"></i></span></div><button type="button" onclick="abrirCursoFormulario('${curso.id}')">Ver formulario →</button></article>`;
    }).join("")}</section><aside class="formula-route-side"><div class="formula-focus-card"><span>ENFOQUE RECOMENDADO</span><div>${cursos[0].icono}</div><h3>${esc(cursos[0].nombre)}</h3><p>Empieza por el curso con mayor peso en tu ruta y guarda una sesión de repaso en tu horario.</p><button class="btn btn-primary btn-sm" onclick="abrirCursoFormulario('${cursos[0].id}')">Ver sus fórmulas</button><button class="btn btn-ghost btn-sm" onclick="agendarDesdeFormulario('${cursos[0].id}','Repaso de formulario')">Añadir al horario</button></div>${extras}<div class="formula-source-card"><b>Cómo se calcula</b><p>La prioridad combina la matriz de ${esc(ruta?.universidadCorta || "tu ruta")} con el área detectada por tu carrera. No se mezclan cursos de otras áreas.</p></div></aside></div>`;
  }

  function renderizarFormulas(cursos) {
    if (!estado.inicializado && cursos[0]) {
      estado.abiertos.add(cursos[0].id);
      estado.inicializado = true;
    }
    const total = cursos.reduce((suma, curso) => suma + formulasVisibles(estado.datos.cursos[curso.id]).length, 0);
    return `<section class="formula-library">
      <div class="formula-library-head"><div><span>CONSULTA RÁPIDA</span><h2>${total} fórmulas, reglas y esquemas</h2><p>Toca un curso para abrirlo. Las fichas no contienen ejercicios resueltos ni texto innecesario.</p></div><div class="formula-library-actions"><button type="button" onclick="expandirTodoFormulario()">Abrir todo</button><button type="button" onclick="contraerTodoFormulario()">Contraer</button></div></div>
      <div class="formula-library-grid">${cursos.map(curso => renderizarCursoFormulario(curso)).join("")}</div>
    </section>`;
  }

  function renderizarCursoFormulario(curso) {
    const info = estado.datos.cursos[curso.id];
    const items = formulasVisibles(info);
    const abierto = estado.busqueda || estado.abiertos.has(curso.id);
    return `<article class="formula-course-accordion ${abierto ? "open" : ""}" style="--formula-color:${curso.color}">
      <button class="formula-course-toggle" type="button" onclick="alternarCursoFormulario('${curso.id}')" aria-expanded="${abierto}">
        <i>${curso.icono}</i><span><small>${esc(curso.categoria || "FORMULARIO")}</small><b>${esc(curso.nombre)}</b></span><em>${items.length} fichas</em><strong>⌄</strong>
      </button>
      <div class="formula-course-body"><div><div class="formula-course-formulas">${items.map(item => renderizarFicha(curso,item)).join("")}</div></div></div>
    </article>`;
  }

  function renderizarFicha(curso, item) {
    const objetivo = encodeURIComponent(item.nombre);
    return `<article class="formula-sheet-card" style="--formula-color:${curso.color}">
      <header><span>${esc(item.tipo || "REGLA")}</span><button type="button" title="Añadir al horario" aria-label="Añadir ${esc(item.nombre)} al horario" onclick="agendarDesdeFormulario('${curso.id}',decodeURIComponent('${objetivo}'))">＋</button></header>
      <h3>${esc(item.nombre)}</h3>
      <div class="formula-sheet-expression">${esc(item.expresion)}</div>
      <dl><div><dt>SÍMBOLOS / ELEMENTOS</dt><dd>${esc(item.variables || "No requiere variables.")}</dd></div><div><dt>CONDICIÓN O USO CORRECTO</dt><dd>${esc(item.condicion || "Aplicar según el enunciado.")}</dd></div></dl>
      <button class="formula-practice-link" type="button" onclick="practicarDesdeFormulario('${curso.id}')">Practicar ${esc(curso.nombre)} →</button>
    </article>`;
  }

  function cambiarVista(vista) {
    if (!["ruta","formulas"].includes(vista)) return;
    estado.vista = vista;
    renderizar();
  }

  function seleccionarCurso(id) {
    estado.curso = id;
    if (id !== "todos") estado.abiertos.add(id);
    renderizar();
  }

  function abrirCurso(id) {
    estado.curso = id;
    estado.vista = "formulas";
    estado.abiertos.add(id);
    renderizar();
  }

  function alternarCurso(id) {
    if (estado.abiertos.has(id)) estado.abiertos.delete(id); else estado.abiertos.add(id);
    renderizar();
  }

  function expandirTodo() {
    cursosActivos().filter(curso => estado.curso === "todos" || estado.curso === curso.id).forEach(curso => estado.abiertos.add(curso.id));
    estado.vista = "formulas";
    renderizar();
  }

  function contraerTodo() {
    estado.abiertos.clear();
    renderizar();
  }

  function filtrar(texto) {
    estado.busqueda = String(texto || "").trim().toLowerCase();
    renderizar();
    document.querySelector("#formula-center-root .formula-search input")?.focus();
  }

  function practicar(cursoId) {
    if (typeof window.configurarPractica === "function") return window.configurarPractica(cursoId);
    window.go?.("ejercicios", null);
  }

  function agendar(cursoId, objetivo) {
    window.abrirHorarioPersonalizado?.({cursoId, objetivo});
  }

  async function iniciar() {
    try {
      const [respuestaBase,respuestaAvanzada] = await Promise.all([
        fetch("json/formulario-inteligente.json", {cache:"no-store"}),
        fetch("json/formulario-avanzado.json", {cache:"no-store"})
      ]);
      if (!respuestaBase.ok || !respuestaAvanzada.ok) throw new Error("No se pudo cargar el formulario maestro");
      const base = await respuestaBase.json();
      const avanzado = await respuestaAvanzada.json();
      for (const [id, formulas] of Object.entries(avanzado.cursos || {})) {
        if (base.cursos[id]) base.cursos[id].formulas = formulas;
      }
      base.versionFormulario = avanzado.version;
      estado.datos = base;
      renderizar();
    } catch (error) {
      console.error(error);
      const raiz = document.getElementById("formula-center-root");
      if (raiz) raiz.innerHTML = '<div class="formula-empty">No se pudo cargar el formulario maestro. Abre UniPrep con Live Server o Vercel.</div>';
    }
  }

  window.renderizarFormularioInteligente = renderizar;
  window.cambiarVistaFormulario = cambiarVista;
  window.seleccionarCursoFormulario = seleccionarCurso;
  window.abrirCursoFormulario = abrirCurso;
  window.alternarCursoFormulario = alternarCurso;
  window.expandirTodoFormulario = expandirTodo;
  window.contraerTodoFormulario = contraerTodo;
  window.filtrarFormulario = filtrar;
  window.practicarDesdeFormulario = practicar;
  window.agendarDesdeFormulario = agendar;

  document.addEventListener("DOMContentLoaded", iniciar);
  document.addEventListener("uniprep:admission-ready", renderizar);
  document.addEventListener("uniprep:admission-change", () => { estado.curso="todos"; estado.abiertos.clear(); estado.inicializado=false; renderizar(); });
})();
