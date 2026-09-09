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

  const ESTILOS_UNI = {
    calculo:{icono:"∫",color:"#5B8CFF",descripcion:"Límites, derivadas, integrales y sus aplicaciones."},
    actualidad:{icono:"📰",color:"#36C6A3",descripcion:"Hechos nacionales e internacionales verificados."},
    logica:{icono:"⚙️",color:"#A678FF",descripcion:"Proposiciones, inferencias, tablas de verdad y silogismos."},
    ingles:{icono:"🇬🇧",color:"#FF8B70",descripcion:"Gramática, vocabulario y comprensión básica."}
  };

  const DESCRIPCIONES_UNI_POR_CURSO = {
    aritmetica:titulo=>`Estudia ${titulo.toLowerCase()} mediante definiciones, propiedades, algoritmos de cálculo y resolución de problemas numéricos aplicados.`,
    algebra:titulo=>`Desarrolla ${titulo.toLowerCase()} usando lenguaje simbólico, equivalencias, operaciones algebraicas, representaciones gráficas y métodos de solución.`,
    geometria:titulo=>`Aborda ${titulo.toLowerCase()} mediante definiciones, teoremas y construcciones para determinar relaciones, medidas, áreas o volúmenes.`,
    trigonometria:titulo=>`Estudia ${titulo.toLowerCase()} relacionando ángulos, razones, identidades y funciones para resolver situaciones geométricas y analíticas.`,
    calculo:titulo=>`Explica ${titulo.toLowerCase()} a partir del comportamiento de funciones y de procedimientos para analizar variación, acumulación y aplicaciones geométricas.`,
    fisica:titulo=>`Analiza ${titulo.toLowerCase()} mediante magnitudes, leyes, modelos matemáticos y problemas que describen fenómenos del mundo físico.`,
    quimica:titulo=>`Estudia ${titulo.toLowerCase()} considerando la composición, propiedades y transformaciones de la materia, su representación y sus aplicaciones.`,
    rm:titulo=>`Entrena ${titulo.toLowerCase()} con estrategias de análisis, reconocimiento de patrones, organización de datos y solución lógica de problemas.`,
    rv:titulo=>`Desarrolla ${titulo.toLowerCase()} para comprender relaciones entre palabras y textos, elegir expresiones precisas y organizar información coherente.`,
    lenguaje:titulo=>`Estudia ${titulo.toLowerCase()} desde las reglas y estructuras del español para comprender, analizar y producir mensajes correctamente.`,
    literatura:titulo=>`Examina ${titulo.toLowerCase()} mediante su contexto, autores, obras, géneros, recursos expresivos y aportes a la tradición literaria.`,
    historia:titulo=>`Analiza ${titulo.toLowerCase()} identificando su contexto, causas, etapas, protagonistas, transformaciones y consecuencias históricas.`,
    geografia:titulo=>`Estudia ${titulo.toLowerCase()} relacionando territorio, sociedad, ambiente, recursos y procesos espaciales del Perú y del mundo.`,
    economia:titulo=>`Explica ${titulo.toLowerCase()} mediante conceptos, agentes, decisiones e indicadores que permiten comprender el funcionamiento económico.`,
    civica:titulo=>`Aborda ${titulo.toLowerCase()} para comprender derechos, deberes, convivencia democrática, instituciones y participación ciudadana.`,
    psicologia:titulo=>`Estudia ${titulo.toLowerCase()} considerando procesos mentales, bases biológicas, conducta, aprendizaje y relaciones sociales.`,
    filosofia:titulo=>`Reflexiona sobre ${titulo.toLowerCase()} mediante problemas, conceptos, autores y argumentos relacionados con el conocimiento, los valores y la realidad.`,
    logica:titulo=>`Desarrolla ${titulo.toLowerCase()} mediante proposiciones, simbolización, reglas de inferencia y evaluación de la validez de argumentos.`,
    actualidad:titulo=>`Examina hechos recientes de ${titulo.toLowerCase()}, reconociendo actores, causas, consecuencias y la confiabilidad de las fuentes consultadas.`,
    ingles:titulo=>`Desarrolla ${titulo} mediante vocabulario, estructuras gramaticales, comprensión de textos y producción oral y escrita en situaciones comunicativas.`
  };

  function descripcionTemaUni(cursoId, titulo) {
    const crear = DESCRIPCIONES_UNI_POR_CURSO[cursoId];
    return crear ? crear(String(titulo)) : `Explica en qué consiste ${String(titulo).toLowerCase()}, sus conceptos principales y sus aplicaciones dentro del curso.`;
  }

  function temaOficialUni(cursoOficial, cursoBase, titulo, indice) {
    const temaBase = (cursoBase?.temas || []).find(tema => normalizar(tema?.titulo) === normalizar(titulo));
    const detalle = cursoOficial?.detalles?.[titulo] || {};
    const bloqueCalculo = cursoOficial.id === "calculo" ? (indice <= 10 ? "Cálculo diferencial" : "Cálculo integral") : "";
    const minutos = 32 + ((indice * 7 + String(titulo).length) % 20);
    return {
      ...(temaBase || {}),
      id:`uni-${cursoOficial.id}-${indice + 1}`,
      titulo,
      subarea:detalle.subarea || bloqueCalculo || `${cursoOficial.area} · Temario UNI`,
      descripcion:detalle.descripcion || descripcionTemaUni(cursoOficial.id, titulo),
      duracion:detalle.duracion || temaBase?.duracion || `${minutos} min`,
      oficial:true,
      fuente:cursoOficial.fuente || temarioUni.fuente,
      puntos:detalle.puntos || temaBase?.puntos || [
        `Fundamentos y propiedades de ${titulo}`,
        "Procedimientos y casos frecuentes",
        "Aplicación en problemas de admisión UNI"
      ]
    };
  }

  function construirCursoUni(cursoOficial, cursoBase = null) {
    const estilo = ESTILOS_UNI[cursoOficial.id] || {icono:"📘",color:"#6C8CFF",descripcion:"Contenido exclusivo del temario UNI."};
    const temas = (cursoOficial.temas || []).map((titulo, indice) => temaOficialUni(cursoOficial, cursoBase, titulo, indice));
    return {
      ...(cursoBase || {}),
      id:cursoOficial.id,
      nombre:cursoOficial.nombre,
      area:cursoOficial.area,
      icono:cursoBase?.icono || estilo.icono,
      color:cursoBase?.color || estilo.color,
      descripcion:cursoBase?.descripcion || estilo.descripcion,
      temas,
      temarioOficial:[...(cursoOficial.temas || [])],
      fuenteTemario:cursoOficial.fuente || temarioUni.fuente,
      etiquetaTemario:cursoOficial.etiquetaTemario || "Temario UNI 2026-2",
      notaTemario:cursoOficial.nota || "",
      preguntas:Number(cursoBase?.preguntas) || 0,
      temasBase:cursoBase?.temas?.length || 0,
      temarioPersonalizado:true,
      // Los cursos sin banco también se pueden abrir para estudiar su temario.
      // Las preguntas y videoclases se incorporarán después sin mezclar materias.
      temarioSoloReferencia:false
    };
  }

  function obtenerCursoRuta(curso) {
    const cursoId = typeof curso === "string" ? curso : curso?.id;
    const cursoBase = typeof curso === "string" ? null : curso;
    const oficial = siglaActual() === "UNI" ? temarioUni.cursos?.find(item => item.id === cursoId) : null;
    if (oficial) return construirCursoUni(oficial, cursoBase);
    if (!cursoBase) return null;
    const temas = filtrarTemas(cursoBase.id, cursoBase.temas || []);
    const contarPreguntas = tema => Object.values(tema?.niveles || {})
      .reduce((total, nivel) => total + (Array.isArray(nivel) ? nivel.length : 0), 0);
    return {
      ...cursoBase,
      temas,
      temarioOficial:null,
      fuenteTemario:null,
      preguntas: temas.reduce((total, tema) => total + contarPreguntas(tema), 0),
      temasBase:(cursoBase.temas || []).length,
      temarioPersonalizado:temas.length !== (cursoBase.temas || []).length
    };
  }

  function obtenerCatalogoRuta(cursosBase) {
    const base = cursosBase || {};
    if (siglaActual() !== "UNI" || !temarioUni.cursos?.length) return Object.values(base).map(obtenerCursoRuta).filter(Boolean);
    return temarioUni.cursos.map(oficial => {
      const existente = base[oficial.id];
      return construirCursoUni(oficial, existente || null);
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
