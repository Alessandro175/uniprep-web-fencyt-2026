// =====================================================
// UNIPREP - TEMARIO Y PERFIL DE PREGUNTAS POR UNIVERSIDAD
// =====================================================
(function () {
  "use strict";

  const UNIVERSIDADES = ["UNAMAD", "UNSAAC", "UNMSM", "UNSA", "UNI", "PUCP", "UCSM"];
  let catalogo = {version:"", actualizado:"", aviso:"", perfiles:{}};

  function normalizar(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function seleccionActual() {
    return window.obtenerSeleccionAdmision?.() || null;
  }

  function siglaActual() {
    const valor = String(seleccionActual()?.universidadCorta || "GENERAL").toUpperCase();
    return UNIVERSIDADES.includes(valor) ? valor : "GENERAL";
  }

  function perfilActual() {
    const sigla = siglaActual();
    const base = catalogo.perfiles?.[sigla] || catalogo.perfiles?.GENERAL || {};
    const seleccion = seleccionActual();
    return {
      ...base,
      sigla,
      universidad: seleccion?.universidad || (sigla === "GENERAL" ? "Preparación general" : sigla),
      grupoId: seleccion?.grupoId || "GENERAL",
      grupo: seleccion?.grupo || "Ruta general",
      carrera: seleccion?.carrera || "Carrera por definir",
      pesos: {...(seleccion?.pesos || {})},
      tipoPeso: seleccion?.tipoPeso || "prioridad",
      aviso: catalogo.aviso || "",
      actualizado: catalogo.actualizado || ""
    };
  }

  function reglasCurso(cursoId) {
    return perfilActual().reglasTemario?.[cursoId] || null;
  }

  function filtrarTemas(cursoId, temas) {
    const lista = Array.isArray(temas) ? temas : [];
    const reglas = reglasCurso(cursoId);
    if (!reglas) return [...lista];
    const incluir = new Set((reglas.incluir || []).map(normalizar));
    const excluir = new Set((reglas.excluir || []).map(normalizar));
    return lista.filter(tema => {
      const titulo = normalizar(tema?.titulo || tema?.tema);
      if (incluir.size && !incluir.has(titulo)) return false;
      return !excluir.has(titulo);
    });
  }

  function obtenerCursoRuta(curso) {
    if (!curso) return null;
    const temas = filtrarTemas(curso.id, curso.temas || []);
    return {
      ...curso,
      temas,
      preguntas: temas.length * 40,
      temasBase: (curso.temas || []).length,
      temarioPersonalizado: temas.length !== (curso.temas || []).length
    };
  }

  function neutralizarPregunta(pregunta) {
    const patron = new RegExp(`perfil\\s+(?:${UNIVERSIDADES.join("|")})`, "gi");
    const patronReferencia = new RegExp(`Referencia de estilo:\\s*(?:${UNIVERSIDADES.join("|")});?`, "gi");
    return {
      ...pregunta,
      universidadReferencia:"GENERAL",
      pregunta:String(pregunta.pregunta || "").replace(patron, "práctica general"),
      explicacion:String(pregunta.explicacion || "").replace(patronReferencia, "Práctica general;"),
      alineacionUniversitaria:"Ejercicio general de preparación preuniversitaria elaborado por UniPrep"
    };
  }

  function filtrarPreguntas(cursoId, preguntas) {
    const lista = Array.isArray(preguntas) ? preguntas : [];
    const temasUnicos = [...new Map(lista.map(item => [normalizar(item.tema), {titulo:item.tema}])).values()];
    const permitidos = new Set(filtrarTemas(cursoId, temasUnicos).map(item => normalizar(item.titulo)));
    const porTema = lista.filter(item => !permitidos.size || permitidos.has(normalizar(item.tema)));
    const sigla = siglaActual();
    if (sigla === "GENERAL") return porTema;
    const alineadas = porTema.filter(item => {
      const referencia = String(item.universidadReferencia || "GENERAL").toUpperCase();
      return referencia === sigla || referencia === "GENERAL";
    });
    // Algunos bancos antiguos no tenían una rotación por universidad. En ese caso
    // se conservan como práctica general, sin atribuir falsamente su autoría o estilo.
    return alineadas.length ? alineadas : porTema.map(neutralizarPregunta);
  }

  function ordenarPreguntas(preguntas, priorizarNivel = true) {
    const perfil = perfilActual();
    const prioridad = perfil.nivelPredeterminado === "exigente"
      ? {admision:4,avanzado:3,intermedio:2,basico:1}
      : {admision:4,intermedio:3,avanzado:2,basico:1};
    return [...preguntas].sort((a,b) => {
      const exactaA = String(a.universidadReferencia || "").toUpperCase() === perfil.sigla ? 1 : 0;
      const exactaB = String(b.universidadReferencia || "").toUpperCase() === perfil.sigla ? 1 : 0;
      if (exactaA !== exactaB) return exactaB - exactaA;
      return priorizarNivel ? (prioridad[b.nivel] || 0) - (prioridad[a.nivel] || 0) : 0;
    });
  }

  async function iniciar() {
    try {
      const respuesta = await fetch("json/university-exam-profiles.json", {cache:"no-store"});
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      catalogo = await respuesta.json();
      window.UNIPREP_EXAM_PROFILES = catalogo;
    } catch (error) {
      console.warn("UniPrep: no se pudo cargar el perfil detallado de exámenes.", error);
    }
    document.dispatchEvent(new CustomEvent("uniprep:syllabus-ready", {detail:perfilActual()}));
  }

  window.obtenerPerfilPreguntasAdmision = perfilActual;
  window.filtrarTemasAdmision = filtrarTemas;
  window.obtenerCursoTemarioAdmision = obtenerCursoRuta;
  window.filtrarPreguntasAdmision = filtrarPreguntas;
  window.ordenarPreguntasAdmision = ordenarPreguntas;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
