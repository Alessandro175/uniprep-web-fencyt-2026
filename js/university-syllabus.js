// =====================================================
// UNIPREP - TEMARIO Y PERFIL DE PREGUNTAS POR UNIVERSIDAD
// =====================================================
(function () {
  "use strict";

  const UNIVERSIDADES = ["UNAMAD", "UNSAAC", "UNMSM", "UNSA", "UNI", "PUCP", "UCSM"];
  let catalogo = {version:"", actualizado:"", aviso:"", perfiles:{}};
  let temarioUni = {version:"", cursos:[]};

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
    const contarPreguntas = tema => Object.values(tema?.niveles || {})
      .reduce((total, nivel) => total + (Array.isArray(nivel) ? nivel.length : 0), 0);
    const oficial = siglaActual() === "UNI" ? temarioUni.cursos?.find(item => item.id === curso.id) : null;
    return {
      ...curso,
      temas,
      temarioOficial: oficial?.temas || null,
      fuenteTemario: oficial ? temarioUni.fuente : null,
      preguntas: temas.reduce((total, tema) => total + contarPreguntas(tema), 0),
      temasBase: (curso.temas || []).length,
      temarioPersonalizado: temas.length !== (curso.temas || []).length
    };
  }

  function obtenerCatalogoRuta(cursosBase) {
    const base = cursosBase || {};
    if (siglaActual() !== "UNI" || !temarioUni.cursos?.length) return Object.values(base).map(obtenerCursoRuta).filter(Boolean);
    const estilos = {
      calculo:{icono:"∫",color:"#5B8CFF",descripcion:"Límites, derivadas, integrales y sus aplicaciones."},
      actualidad:{icono:"📰",color:"#36C6A3",descripcion:"Hechos nacionales e internacionales verificados."},
      logica:{icono:"⚙️",color:"#A678FF",descripcion:"Proposiciones, inferencias, tablas de verdad y silogismos."},
      ingles:{icono:"🇬🇧",color:"#FF8B70",descripcion:"Gramática, vocabulario y comprensión básica."}
    };
    return temarioUni.cursos.map(oficial => {
      const existente = base[oficial.id];
      if (existente) return {...obtenerCursoRuta(existente),nombre:oficial.nombre,area:oficial.area,temarioOficial:oficial.temas,fuenteTemario:temarioUni.fuente};
      const estilo = estilos[oficial.id] || {icono:"📘",color:"#6C8CFF",descripcion:"Contenido exclusivo del temario UNI."};
      return {id:oficial.id,nombre:oficial.nombre,area:oficial.area,...estilo,temas:[],temarioOficial:oficial.temas,fuenteTemario:temarioUni.fuente,preguntas:0,temasBase:0,temarioPersonalizado:true,temarioSoloReferencia:true};
    });
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
      const [respuesta, respuestaUni] = await Promise.all([
        fetch("json/university-exam-profiles.json", {cache:"no-store"}),
        fetch("json/syllabus-uni-2026-2.json", {cache:"no-store"})
      ]);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      catalogo = await respuesta.json();
      if (respuestaUni.ok) temarioUni = await respuestaUni.json();
      window.UNIPREP_EXAM_PROFILES = catalogo;
    } catch (error) {
      console.warn("UniPrep: no se pudo cargar el perfil detallado de exámenes.", error);
    }
    document.dispatchEvent(new CustomEvent("uniprep:syllabus-ready", {detail:perfilActual()}));
  }

  window.obtenerPerfilPreguntasAdmision = perfilActual;
  window.filtrarTemasAdmision = filtrarTemas;
  window.obtenerCursoTemarioAdmision = obtenerCursoRuta;
  window.obtenerCatalogoTemarioAdmision = obtenerCatalogoRuta;
  window.filtrarPreguntasAdmision = filtrarPreguntas;
  window.ordenarPreguntasAdmision = ordenarPreguntas;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
