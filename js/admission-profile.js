// =====================================================
// UNIPREP - PERFIL DE ADMISIÓN POR UNIVERSIDAD Y CARRERA
// =====================================================
(function () {
  "use strict";

  const CLAVE = "uniprep_admission_profile_v1";
  const CURSO_MATRIZ = {
    medio_ambiente:"biologia", anatomia:"biologia", psicologia:"biologia",
    geografia:"historia", filosofia:"historia", historia_peru:"historia",
    comprension_lectora:"lenguaje", literatura:"lenguaje"
  };
  const ESTRUCTURAS_ACADEMICAS = {
    unamad: [
      {id:"razonamiento-comunicacion", nombre:"Razonamiento y Comunicación", descripcion:"Aptitud, comprensión y dominio del lenguaje.", cursos:["rm","rv","comprension_lectora","lenguaje","literatura"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Cursos matemáticos que corresponden al tema elegido.", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"ciencias-salud", nombre:"Ciencias y Salud", descripcion:"Ciencias naturales y de la salud según la carrera.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia","psicologia"]},
      {id:"humanidades-sociales", nombre:"Humanidades y Ciencias Sociales", descripcion:"Formación social, ciudadana y humanística del grupo.", cursos:["historia","historia_peru","geografia","filosofia","economia","civica"]}
    ],
    unsaac: [
      {id:"competencia-linguistica", nombre:"Competencia Lingüística", descripcion:"Comprensión, razonamiento verbal y uso del lenguaje.", cursos:["comprension_lectora","lenguaje","rv","literatura"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Asignaturas matemáticas incluidas en el área elegida.", cursos:["rm","aritmetica","algebra","geometria","trigonometria"]},
      {id:"ciencias", nombre:"Ciencias", descripcion:"Ciencias básicas, biológicas y de la salud del área.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia","psicologia"]},
      {id:"sociales-humanidades", nombre:"Ciencias Sociales y Humanidades", descripcion:"Cursos sociales y humanísticos que corresponden al área.", cursos:["historia","historia_peru","geografia","economia","filosofia","civica"]}
    ],
    unmsm: [
      {id:"habilidades", nombre:"Habilidades", descripcion:"Habilidad verbal, comprensión y habilidad lógico-matemática.", cursos:["rm","rv","comprension_lectora"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Conocimientos matemáticos evaluados según el área.", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"humanidades", nombre:"Comunicación, Humanidades y Sociales", descripcion:"Conocimientos humanísticos y sociales del examen.", cursos:["lenguaje","literatura","historia","historia_peru","geografia","filosofia","economia","civica","psicologia"]},
      {id:"ciencias", nombre:"Ciencias", descripcion:"Conocimientos científicos con peso distinto por área.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia"]}
    ],
    unsa: [
      {id:"aptitud-comunicacion", nombre:"Aptitud Académica y Comunicación", descripcion:"Razonamiento, comprensión y comunicación.", cursos:["rm","rv","comprension_lectora","lenguaje","literatura"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Cursos matemáticos de la matriz del área.", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"ciencias", nombre:"Ciencias", descripcion:"Ciencias básicas, ambientales y de la salud.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia","psicologia"]},
      {id:"sociales-humanidades", nombre:"Ciencias Sociales y Humanidades", descripcion:"Cursos sociales, ciudadanos y humanísticos.", cursos:["historia","historia_peru","geografia","filosofia","economia","civica"]}
    ],
    uni: [
      {id:"aptitud-humanidades", nombre:"Aptitud Académica y Humanidades", descripcion:"Primera prueba: aptitud académica y formación humanística.", etiqueta:"PRUEBA 1", cursos:["rm","rv","comprension_lectora","lenguaje","literatura","historia","historia_peru","geografia","filosofia","economia","civica"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Segunda prueba: contenidos matemáticos.", etiqueta:"PRUEBA 2", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"fisica-quimica", nombre:"Física y Química", descripcion:"Tercera prueba: únicamente Física y Química.", etiqueta:"PRUEBA 3", cursos:["fisica","quimica"]}
    ],
    pucp: [
      {id:"comprension", nombre:"Comprensión de Lectura", descripcion:"Área de lectura, interpretación e inferencia.", etiqueta:"ÁREA 1", cursos:["comprension_lectora"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Área de competencia matemática.", etiqueta:"ÁREA 2", cursos:["rm","aritmetica","algebra","geometria","trigonometria"]}
    ],
    ucsm: [
      {id:"razonamiento-comunicacion", nombre:"Razonamiento y Comunicación", descripcion:"Comprensión, razonamiento y comunicación.", cursos:["rm","rv","comprension_lectora","lenguaje","literatura"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Cursos matemáticos del perfil de preparación.", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"ciencias", nombre:"Ciencias", descripcion:"Ciencias básicas y de la salud según la carrera.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia","psicologia"]},
      {id:"sociales-humanidades", nombre:"Ciencias Sociales y Humanidades", descripcion:"Cursos sociales, ciudadanos y humanísticos.", cursos:["historia","historia_peru","geografia","filosofia","economia","civica"]}
    ],
    otra: [
      {id:"razonamiento-comunicacion", nombre:"Razonamiento y Comunicación", descripcion:"Cursos generales de aptitud y comunicación.", cursos:["rm","rv","comprension_lectora","lenguaje","literatura"]},
      {id:"matematica", nombre:"Matemática", descripcion:"Cursos generales de matemática.", cursos:["aritmetica","algebra","geometria","trigonometria"]},
      {id:"ciencias", nombre:"Ciencias", descripcion:"Cursos generales de ciencias y salud.", cursos:["fisica","quimica","biologia","medio_ambiente","anatomia","psicologia"]},
      {id:"sociales-humanidades", nombre:"Ciencias Sociales y Humanidades", descripcion:"Cursos generales sociales y humanísticos.", cursos:["historia","historia_peru","geografia","filosofia","economia","civica"]}
    ]
  };
  let catalogo = null;

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function leerSeleccion() {
    const dato = window.uniprepStorage?.leer(CLAVE, null);
    return dato && typeof dato === "object" ? dato : null;
  }

  function universidadPorId(id) {
    return catalogo?.universidades?.find(item => item.id === id) || null;
  }

  function grupoPorId(universidadId, grupoId) {
    return universidadPorId(universidadId)?.grupos?.find(item => item.id === grupoId) || null;
  }

  function grupoPorCarrera(universidadId, carrera, grupoPreferido = "") {
    const universidad = universidadPorId(universidadId);
    if (!universidad || !carrera) return null;
    const preferido = universidad.grupos?.find(grupo => grupo.id === grupoPreferido && grupo.carreras?.includes(carrera));
    return preferido || universidad.grupos?.find(grupo => grupo.carreras?.includes(carrera)) || null;
  }

  function enriquecerSeleccion(datos) {
    if (!datos) return null;
    const universidad = universidadPorId(datos.universidadId);
    if (!universidad) return null;
    // La carrera manda: corrige automáticamente perfiles antiguos cuyo grupo cambió.
    const detectado = grupoPorCarrera(universidad.id, datos.carrera, datos.grupoId);
    const grupo = detectado || grupoPorId(universidad.id, datos.grupoId);
    if (!grupo) return null;
    const carrera = grupo.carreras?.includes(datos.carrera) ? datos.carrera : grupo.carreras?.[0] || "Carrera por definir";
    let cursos = [...(grupo.cursos || [])];
    let pesos = {...(grupo.pesos || {})};
    // La evaluación académica PUCP tiene dos áreas. Los cursos lingüísticos del
    // banco sirven como apoyo, pero no deben mostrarse como pruebas independientes.
    if (universidad.id === "pucp") {
      cursos = cursos.filter(id => !["rv","lenguaje","literatura"].includes(id));
      pesos = Object.fromEntries(Object.entries(pesos).filter(([id]) => !["rv","lenguaje","literatura"].includes(id)));
      pesos.comprension_lectora = grupo.id === "C" || grupo.id === "ARQ" ? 40 : 50;
    }
    const asignados = new Set();
    const bloques = (ESTRUCTURAS_ACADEMICAS[universidad.id] || ESTRUCTURAS_ACADEMICAS.otra).map(bloque => {
      const cursosBloque = bloque.cursos.filter(id => cursos.includes(id));
      cursosBloque.forEach(id => asignados.add(id));
      return {...bloque, cursos:cursosBloque};
    }).filter(bloque => bloque.cursos.length);
    const sinBloque = cursos.filter(id => !asignados.has(id));
    if (sinBloque.length) bloques.push({id:"complementarios",nombre:"Cursos complementarios",descripcion:"Contenidos adicionales de esta ruta.",cursos:sinBloque});
    return {
      universidadId: universidad.id,
      universidad: universidad.nombre,
      universidadCorta: universidad.corto,
      grupoId: grupo.id,
      grupo: grupo.nombre,
      descripcionGrupo: grupo.descripcion,
      carrera,
      procedencia: datos.procedencia || "",
      cursos,
      pesos,
      bloques,
      tipoPeso: grupo.tipoPeso || "prioridad",
      otrosComponentes: [...(grupo.otrosComponentes || [])],
      notaMatriz: grupo.notaMatriz || "",
      avisoCarrera: grupo.avisosCarrera?.[carrera] || "",
      vigencia: universidad.vigencia || "",
      fuente: universidad.fuente || "",
      fuenteMatriz: universidad.fuenteMatriz || "",
      actualizadoEn: datos.actualizadoEn || null
    };
  }

  function obtenerSeleccion() {
    return enriquecerSeleccion(leerSeleccion());
  }

  function guardarSeleccion(datos, notificar = true) {
    const enriquecida = enriquecerSeleccion(datos);
    if (!enriquecida) return null;
    const base = {
      universidadId: enriquecida.universidadId,
      grupoId: enriquecida.grupoId,
      carrera: enriquecida.carrera,
      procedencia: enriquecida.procedencia,
      actualizadoEn: new Date().toISOString()
    };
    window.uniprepStorage?.guardar(CLAVE, base);
    actualizarIndicadores();
    if (notificar) document.dispatchEvent(new CustomEvent("uniprep:admission-change", {detail: enriquecida}));
    return enriquecida;
  }

  function obtenerCursosActivos() {
    const seleccion = obtenerSeleccion();
    return seleccion?.cursos?.length ? seleccion.cursos : Object.keys(window.CURSOS_PREUNI || {});
  }

  function cursoPermitido(id) {
    const seleccion = obtenerSeleccion();
    return !seleccion?.cursos?.length || seleccion.cursos.includes(id);
  }

  function pesoCurso(id) {
    const seleccion = obtenerSeleccion();
    const fuente = Object.hasOwn(seleccion?.pesos || {}, id) ? id : CURSO_MATRIZ[id] || id;
    return Number(seleccion?.pesos?.[fuente]) || (cursoPermitido(id) ? 1 : 0);
  }

  function detallePesoCurso(id) {
    const seleccion = obtenerSeleccion();
    const fuente = Object.hasOwn(seleccion?.pesos || {}, id) ? id : CURSO_MATRIZ[id] || id;
    const peso = Number(seleccion?.pesos?.[fuente]) || 0;
    if (!seleccion || !peso) return {peso, etiqueta:"Ruta general", clase:"base", esOficial:false};
    const maximo = Math.max(...Object.values(seleccion.pesos).map(Number), 1);
    const proporcion = peso / maximo;
    const clase = proporcion >= .7 ? "alta" : proporcion >= .4 ? "media" : "complementaria";
    const nombre = clase === "alta" ? "Prioridad alta" : clase === "media" ? "Prioridad media" : "Complementaria";
    return {
      peso,
      clase,
      esOficial: seleccion.tipoPeso === "preguntas",
      etiqueta: seleccion.tipoPeso === "preguntas" ? `${CURSO_MATRIZ[id] ? "Área " : ""}${peso} preg.` : nombre,
      nombre: CURSO_MATRIZ[id] ? `${nombre} · matriz agrupada` : nombre
    };
  }

  function seleccionDesdeMetadata(usuario) {
    const meta = usuario?.user_metadata || {};
    if (!meta.universidad_id || !meta.carrera) return null;
    return enriquecerSeleccion({
      universidadId: meta.universidad_id,
      grupoId: meta.grupo_admision || "",
      carrera: meta.carrera,
      procedencia: meta.procedencia || ""
    });
  }

  async function sincronizarDesdeSesion() {
    try {
      const {data} = await window.supabaseClient?.auth?.getUser?.() || {};
      const remota = seleccionDesdeMetadata(data?.user);
      if (remota) guardarSeleccion(remota, false);
    } catch (_) {}
  }

  function opciones(items, valor, etiqueta) {
    return `<option value="">${esc(etiqueta)}</option>${items.map(item => `<option value="${esc(item.valor)}"${item.valor === valor ? " selected" : ""}>${esc(item.texto)}</option>`).join("")}`;
  }

  function llenarUniversidades(select, valor = "") {
    if (!select || !catalogo) return;
    select.innerHTML = opciones(catalogo.universidades.map(item => ({valor:item.id,texto:`${item.corto} · ${item.nombre}`})), valor, "Selecciona tu universidad");
  }

  function llenarDepartamentos(select, valor = "") {
    if (!select || !catalogo) return;
    select.innerHTML = opciones(catalogo.departamentos.map(item => ({valor:item,texto:item})), valor, "Selecciona tu departamento");
  }

  function llenarGrupos(select, universidadId, valor = "") {
    if (!select) return;
    const universidad = universidadPorId(universidadId);
    select.disabled = true;
    select.innerHTML = opciones((universidad?.grupos || []).map(item => ({valor:item.id,texto:item.nombre})), valor, universidad ? "Se detecta al elegir carrera" : "Primero elige universidad");
  }

  function llenarCarreras(select, universidadId, valor = "", grupoPreferido = "") {
    if (!select) return;
    const universidad = universidadPorId(universidadId);
    select.disabled = !universidad;
    if (!universidad) {
      select.innerHTML = '<option value="">Primero elige universidad</option>';
      return;
    }
    let html = '<option value="">Selecciona tu carrera</option>';
    universidad.grupos.forEach(grupo => {
      html += `<optgroup label="${esc(grupo.nombre)}">`;
      html += grupo.carreras.map(carrera => `<option value="${esc(carrera)}" data-grupo="${esc(grupo.id)}"${carrera === valor && (!grupoPreferido || grupo.id === grupoPreferido) ? " selected" : ""}>${esc(carrera)}</option>`).join("");
      html += "</optgroup>";
    });
    select.innerHTML = html;
  }

  function resumenEvaluacion(grupo) {
    if (!grupo) return "";
    const total = Object.values(grupo.pesos || {}).reduce((suma, valor) => suma + Number(valor || 0), 0);
    const extras = (grupo.otrosComponentes || []).reduce((suma, item) => suma + Number(item.preguntas || 0), 0);
    if (grupo.tipoPeso !== "preguntas") return `${grupo.cursos.length} cursos organizados por prioridad`;
    return extras ? `${total} preguntas académicas + ${extras} de ${grupo.otrosComponentes.map(item => item.nombre.toLowerCase()).join(" y ")}` : `${total} preguntas de la matriz`;
  }

  function actualizarNota(prefijo, universidadId, grupoId, carrera = "") {
    const nota = document.getElementById(`${prefijo}-route-note`);
    if (!nota) return;
    const grupo = grupoPorId(universidadId, grupoId);
    const aviso = grupo?.avisosCarrera?.[carrera] || "";
    nota.classList.remove("error");
    nota.classList.toggle("visible", Boolean(grupo));
    nota.innerHTML = grupo ? `<b>✓ ${esc(grupo.nombre)} detectada automáticamente</b><span>${esc(grupo.descripcion)} · ${esc(resumenEvaluacion(grupo))}.${aviso ? ` ${esc(aviso)}` : ""}</span>` : "";
  }

  function aplicarCarrera(prefijo) {
    const universidad = document.getElementById(`${prefijo}-universidad`);
    const grupo = document.getElementById(`${prefijo}-grupo-admision`);
    const carrera = document.getElementById(`${prefijo}-carrera`);
    if (!universidad || !grupo || !carrera) return;
    const grupoId = carrera.selectedOptions?.[0]?.dataset?.grupo || "";
    llenarGrupos(grupo, universidad.value, grupoId);
    actualizarNota(prefijo, universidad.value, grupoId, carrera.value);
  }

  function conectarSelectores(prefijo, inicial = null) {
    const universidad = document.getElementById(`${prefijo}-universidad`);
    const grupo = document.getElementById(`${prefijo}-grupo-admision`);
    const carrera = document.getElementById(`${prefijo}-carrera`);
    const procedencia = document.getElementById(`${prefijo}-procedencia`);
    if (!universidad || !grupo || !carrera) return;

    const corregida = enriquecerSeleccion(inicial);
    llenarUniversidades(universidad, corregida?.universidadId || inicial?.universidadId || "");
    llenarDepartamentos(procedencia, corregida?.procedencia || inicial?.procedencia || "");
    llenarCarreras(carrera, universidad.value, corregida?.carrera || inicial?.carrera || "", corregida?.grupoId || inicial?.grupoId || "");
    llenarGrupos(grupo, universidad.value, corregida?.grupoId || inicial?.grupoId || "");
    actualizarNota(prefijo, universidad.value, grupo.value, carrera.value);

    if (universidad.dataset.admissionBound === "true") return;
    universidad.dataset.admissionBound = "true";
    universidad.addEventListener("change", () => {
      llenarCarreras(carrera, universidad.value);
      llenarGrupos(grupo, universidad.value);
      actualizarNota(prefijo, universidad.value, "");
      carrera.focus();
    });
    carrera.addEventListener("change", () => aplicarCarrera(prefijo));
  }

  function seleccionDesdeFormulario(prefijo = "reg") {
    const carrera = document.getElementById(`${prefijo}-carrera`);
    const grupoId = carrera?.selectedOptions?.[0]?.dataset?.grupo || document.getElementById(`${prefijo}-grupo-admision`)?.value || "";
    return enriquecerSeleccion({
      universidadId: document.getElementById(`${prefijo}-universidad`)?.value || "",
      grupoId,
      carrera: carrera?.value || "",
      procedencia: document.getElementById(`${prefijo}-procedencia`)?.value || ""
    });
  }

  function reiniciarFormularioRegistro() {
    llenarUniversidades(document.getElementById("reg-universidad"));
    llenarDepartamentos(document.getElementById("reg-procedencia"));
    llenarGrupos(document.getElementById("reg-grupo-admision"), "");
    llenarCarreras(document.getElementById("reg-carrera"), "");
    actualizarNota("reg", "", "");
  }

  function instalarBotonPerfil() {
    const acciones = document.querySelector("#perfil .profile-actions");
    if (!acciones || document.getElementById("profile-admission-btn")) return;
    const boton = document.createElement("button");
    boton.id = "profile-admission-btn";
    boton.className = "btn btn-ghost";
    boton.type = "button";
    boton.innerHTML = "🎓 Mi objetivo de admisión";
    boton.addEventListener("click", abrirConfiguracion);
    acciones.insertBefore(boton, acciones.lastElementChild);
  }

  function crearModal() {
    let modal = document.getElementById("admission-profile-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "admission-profile-modal";
    modal.className = "admission-profile-modal";
    modal.innerHTML = `<section class="admission-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="admission-profile-title">
      <header><div><small>RUTA PERSONALIZADA</small><h2 id="admission-profile-title">Tu objetivo de admisión</h2><p>Elige universidad y carrera. UniPrep detectará el área oficial y reorganizará cursos, prácticas, tutor, simulacros y recomendaciones.</p></div><button type="button" data-admission-close aria-label="Cerrar">×</button></header>
      <div class="admission-form-grid">
        <label class="admission-field admission-full">Universidad<span class="admission-select"><i>▦</i><select id="edit-universidad" required></select></span></label>
        <label class="admission-field admission-full">Carrera objetivo<span class="admission-select"><i>⌁</i><select id="edit-carrera" required disabled></select></span></label>
        <label class="admission-field">Área detectada automáticamente<span class="admission-select admission-detected"><i>✓</i><select id="edit-grupo-admision" required disabled></select></span></label>
        <label class="admission-field">Departamento desde donde estudias<span class="admission-select"><i>⌖</i><select id="edit-procedencia" required></select></span></label>
      </div>
      <div id="edit-route-note" class="admission-route-note"></div>
      <div class="admission-privacy"><span>◉</span><p><b>Privacidad clara.</b> Solo se guarda el departamento que seleccionas; UniPrep no solicita GPS ni tu ubicación exacta.</p></div>
      <div class="admission-actions"><button class="btn btn-ghost" type="button" data-admission-close>Cancelar</button><button class="btn btn-primary" type="button" id="admission-save">Activar mi ruta y ver cursos</button></div>
    </section>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-admission-close]").forEach(boton => boton.addEventListener("click", cerrarConfiguracion));
    modal.addEventListener("click", evento => { if (evento.target === modal) cerrarConfiguracion(); });
    modal.querySelector("#admission-save")?.addEventListener("click", guardarDesdeModal);
    return modal;
  }

  function abrirConfiguracion() {
    if (!catalogo) return;
    const modal = crearModal();
    conectarSelectores("edit", obtenerSeleccion());
    modal.classList.add("open");
    setTimeout(() => document.getElementById("edit-universidad")?.focus(), 40);
  }

  function cerrarConfiguracion() {
    document.getElementById("admission-profile-modal")?.classList.remove("open");
  }

  function mostrarErrorModal(mensaje) {
    const nota = document.getElementById("edit-route-note");
    if (!nota) return;
    nota.classList.add("visible", "error");
    nota.innerHTML = `<b>Falta completar tu ruta</b><span>${esc(mensaje)}</span>`;
  }

  function abrirRuta() {
    if (typeof window.go === "function") window.go("cursos", null);
    setTimeout(() => {
      window.renderizarCursos?.();
      document.getElementById("admission-active-route")?.scrollIntoView({behavior:"smooth", block:"start"});
    }, 80);
  }

  async function guardarDesdeModal() {
    const seleccion = seleccionDesdeFormulario("edit");
    const procedencia = document.getElementById("edit-procedencia")?.value || "";
    if (!seleccion || !procedencia) return mostrarErrorModal("Selecciona universidad, carrera y departamento; el área se detectará sola.");
    seleccion.procedencia = procedencia;
    guardarSeleccion(seleccion);
    cerrarConfiguracion();
    abrirRuta();
    toast(`${seleccion.carrera}: ${seleccion.grupo} activada.`);

    try {
      const usuario = await window.obtenerUsuarioActivo?.();
      if (usuario) {
        usuario.carrera = seleccion.carrera;
        usuario.universidad = seleccion.universidadCorta;
        await window.actualizarUsuario?.(usuario);
      }
      if (window.supabaseClient?.auth) {
        const {data} = await window.supabaseClient.auth.getUser();
        const metadata = data?.user?.user_metadata || {};
        await window.supabaseClient.auth.updateUser({data:{...metadata,carrera:seleccion.carrera,universidad:seleccion.universidadCorta,universidad_id:seleccion.universidadId,grupo_admision:seleccion.grupoId,procedencia:seleccion.procedencia}});
      }
    } catch (error) {
      console.warn("La ruta se guardó localmente, pero no pudo sincronizarse todavía:", error);
    }
    window.cargarPerfilUsuario?.();
    window.cargarDashboard?.();
  }

  function toast(mensaje) {
    const elemento = document.createElement("div");
    elemento.className = "premium-toast";
    elemento.textContent = mensaje;
    document.body.appendChild(elemento);
    setTimeout(() => elemento.remove(), 3800);
  }

  function actualizarIndicadores() {
    const seleccion = obtenerSeleccion();
    const centro = document.querySelector(".courses-command-center");
    let banner = document.getElementById("admission-active-route");
    if (centro && !banner) {
      banner = document.createElement("div");
      banner.id = "admission-active-route";
      banner.className = "admission-active-route";
      centro.insertAdjacentElement("afterend", banner);
    }
    if (banner) {
      const extra = seleccion?.otrosComponentes?.length ? ` · + ${seleccion.otrosComponentes.map(item => `${item.preguntas} ${item.nombre}`).join(" + ")}` : "";
      const perfilExamen = window.obtenerPerfilPreguntasAdmision?.();
      const formato = perfilExamen?.formato ? ` · ${perfilExamen.formato}` : "";
      banner.innerHTML = seleccion ? `<span class="admission-route-icon">🎯</span><span><small>RUTA DETECTADA POR TU CARRERA</small><b>${esc(seleccion.carrera)} → ${esc(seleccion.grupo)}</b><em>${esc(seleccion.universidadCorta)} · ${seleccion.cursos.length} cursos priorizados${esc(extra)}${esc(formato)}</em></span><button type="button" onclick="abrirConfiguracionAdmision()">Cambiar objetivo</button>` : `<span class="admission-route-icon">🎓</span><span><small>PERSONALIZA UNIPREP</small><b>Selecciona universidad y carrera</b><em>Detectaremos el área, el temario, el nivel y el tipo de preguntas que corresponden.</em></span><button type="button" onclick="abrirConfiguracionAdmision()">Configurar ahora</button>`;
    }
    const etiqueta = document.getElementById("courses-route-label");
    if (etiqueta) etiqueta.textContent = seleccion ? `${seleccion.universidadCorta} · ${seleccion.grupoId}` : "Configurar mi ruta";
    const kicker = document.querySelector(".courses-command-kicker");
    if (kicker) kicker.textContent = seleccion ? `RUTA ${seleccion.universidadCorta} ${seleccion.grupoId} · ${seleccion.vigencia || "ADMISIÓN"}` : "RUTA SEGÚN TU UNIVERSIDAD Y CARRERA";
    const estadisticas = document.querySelectorAll(".courses-command-stats b");
    if (estadisticas[2]) estadisticas[2].textContent = seleccion?.cursos?.length || 21;
    const insignia = document.querySelector('.nav-item[onclick*="cursos"] .nav-badge');
    if (insignia) insignia.textContent = seleccion?.cursos?.length || 21;
  }

  async function iniciar() {
    try {
      const respuesta = await fetch("json/admission-profiles.json", {cache:"no-store"});
      if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo de admisión");
      catalogo = await respuesta.json();
    } catch (error) {
      console.error(error);
      return;
    }
    window.ADMISSION_CATALOG = catalogo;
    await sincronizarDesdeSesion();
    conectarSelectores("reg", obtenerSeleccion());
    instalarBotonPerfil();
    actualizarIndicadores();
    document.dispatchEvent(new CustomEvent("uniprep:admission-ready", {detail: obtenerSeleccion()}));

    window.supabaseClient?.auth?.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_OUT") {
        window.uniprepStorage?.eliminar(CLAVE);
        reiniciarFormularioRegistro();
        actualizarIndicadores();
        document.dispatchEvent(new CustomEvent("uniprep:admission-change", {detail:null}));
      }
      if (evento === "SIGNED_IN" && sesion?.user) {
        const remota = seleccionDesdeMetadata(sesion.user);
        if (remota) guardarSeleccion(remota);
      }
    });
  }

  window.obtenerSeleccionAdmision = obtenerSeleccion;
  window.obtenerCursosActivosAdmision = obtenerCursosActivos;
  window.cursoPermitidoAdmision = cursoPermitido;
  window.pesoCursoAdmision = pesoCurso;
  window.detallePesoCursoAdmision = detallePesoCurso;
  window.guardarSeleccionAdmision = guardarSeleccion;
  window.seleccionAdmisionDesdeFormulario = seleccionDesdeFormulario;
  window.abrirConfiguracionAdmision = abrirConfiguracion;
  window.cerrarConfiguracionAdmision = cerrarConfiguracion;
  window.abrirRutaAdmision = abrirRuta;

  document.addEventListener("DOMContentLoaded", iniciar);
  document.addEventListener("uniprep:syllabus-ready", actualizarIndicadores);
})();
