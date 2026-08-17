// =====================================================
// UNIPREP 2 - TUTORIAL DE PRIMER INGRESO
// =====================================================
(function () {
  "use strict";

  const VERSION_TUTORIAL = "2026.12";
  const CLAVE_TUTORIAL = "uniprep_tutorial";
  const ESPERA_INICIAL_MS = 850;

  let pasoActual = 0;
  let tutorialAbierto = false;
  let inicioAutomaticoProcesado = false;
  let temporizadorInicio = null;
  let rafReposicion = 0;

  const pasos = [
    {
      pantalla: "home",
      selector: "#home .welcome-banner",
      icono: "🚀",
      titulo: nombre => `¡Bienvenido a UniPrep, ${nombre}!`,
      texto: "Este es tu panel de misión. Aquí verás qué estudiar, cuánto avanzaste y cuál es tu siguiente acción para acercarte a tu universidad."
    },
    {
      pantalla: "cursos",
      selector: "#admission-active-route",
      respaldo: "#cursos .courses-command-center",
      icono: "🎯",
      titulo: "Tu ruta universitaria",
      texto: "UniPrep usa la universidad, carrera y grupo que elegiste para priorizar los cursos que realmente vienen en tu examen de admisión."
    },
    {
      pantalla: "cursos",
      selector: "#course-grid .course-card, #course-grid .course-exam-block",
      respaldo: "#cursos .courses-toolbar",
      icono: "📚",
      titulo: "Cursos y ejercicios",
      texto: "Entra a cada curso para revisar temas, teoría, videos y preguntas. Tu avance queda separado y guardado en tu cuenta."
    },
    {
      pantalla: "exams",
      selector: "#exams .exam-reference-grid",
      respaldo: "#exams .page-header",
      icono: "📝",
      titulo: "Simulacros según tu examen",
      texto: "Practica con modelos organizados por universidad. En la UNI verás sus tres pruebas por separado; en otras rutas aparecerá el formato que corresponda."
    },
    {
      pantalla: "biblioteca",
      selector: "#biblioteca .library-route-note",
      respaldo: "[data-screen='biblioteca']",
      icono: "🗂️",
      titulo: "Biblioteca personalizada",
      texto: "SuperBiblioteca y Academias están disponibles para todos. Las colecciones UNI o San Marcos solo aparecen cuando esa es tu universidad elegida."
    },
    {
      pantalla: "agenda",
      selector: "#agenda .calendar-wrapper",
      respaldo: "#agenda .page-header",
      icono: "🔥",
      titulo: "Agenda y racha de estudio",
      texto: "Organiza tu semana y estudia con constancia. Cada día de actividad fortalece tu racha y hace más visible tu disciplina."
    },
    {
      pantalla: "ranking",
      selector: "#ranking .grid.g4",
      respaldo: "#ranking .page-header",
      icono: "🏆",
      titulo: "Puntaje, progreso y ranking",
      texto: "Tus resultados reales actualizan el progreso y el ranking. Tu primera misión es simple: resuelve cinco preguntas y descubre tu punto de partida.",
      final: true
    }
  ];

  function esc(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function primerNombre() {
    const nombre = document.querySelector(".user-name")?.textContent?.trim() || "estudiante";
    return nombre.split(/\s+/)[0] || "estudiante";
  }

  function crearInterfaz() {
    if (document.getElementById("uniprep-onboarding")) return;

    const tutorial = document.createElement("div");
    tutorial.id = "uniprep-onboarding";
    tutorial.className = "onboarding-layer";
    tutorial.hidden = true;
    tutorial.setAttribute("aria-hidden", "true");
    tutorial.innerHTML = `
      <div class="onboarding-spotlight" aria-hidden="true"></div>
      <section class="onboarding-card" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="onboarding-title" aria-describedby="onboarding-copy">
        <div class="onboarding-card-head">
          <span class="onboarding-mission-label">PRIMERA MISIÓN · GUÍA RÁPIDA</span>
          <button class="onboarding-close" type="button" aria-label="Omitir tutorial" title="Omitir tutorial">×</button>
        </div>
        <div class="onboarding-step-icon" aria-hidden="true">🚀</div>
        <div class="onboarding-step-count">PASO 1 DE ${pasos.length}</div>
        <h2 id="onboarding-title">Bienvenido a UniPrep</h2>
        <p id="onboarding-copy"></p>
        <div class="onboarding-dots" aria-hidden="true"></div>
        <div class="onboarding-actions">
          <button class="onboarding-skip" type="button">Omitir</button>
          <div>
            <button class="onboarding-prev" type="button">← Anterior</button>
            <button class="onboarding-next" type="button">Siguiente →</button>
          </div>
        </div>
      </section>`;

    document.body.appendChild(tutorial);
    tutorial.querySelector(".onboarding-close")?.addEventListener("click", () => cerrarTutorial(true));
    tutorial.querySelector(".onboarding-skip")?.addEventListener("click", () => cerrarTutorial(true));
    tutorial.querySelector(".onboarding-prev")?.addEventListener("click", () => cambiarPaso(-1));
    tutorial.querySelector(".onboarding-next")?.addEventListener("click", avanzarTutorial);
    tutorial.addEventListener("pointerdown", evento => {
      if (evento.target === tutorial) tutorial.querySelector(".onboarding-card")?.classList.add("onboarding-nudge");
    });
    tutorial.addEventListener("animationend", () => tutorial.querySelector(".onboarding-card")?.classList.remove("onboarding-nudge"));
  }

  function obtenerElementoPaso(paso) {
    const principal = document.querySelector(paso.selector);
    if (principal && principal.getBoundingClientRect().width > 0) return principal;
    const respaldo = paso.respaldo ? document.querySelector(paso.respaldo) : null;
    return respaldo && respaldo.getBoundingClientRect().width > 0 ? respaldo : null;
  }

  function navegarAPantalla(pantalla) {
    if (!pantalla || !document.getElementById(pantalla)) return;
    const item = document.querySelector(`.nav-item[data-screen="${pantalla}"], .nav-item[onclick*="'${pantalla}'"]`);
    if (typeof window.go === "function") window.go(pantalla, item || null);
  }

  function esperarPintado() {
    return new Promise(resolver => requestAnimationFrame(() => requestAnimationFrame(resolver)));
  }

  function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), Math.max(minimo, maximo));
  }

  function posicionarTarjeta(elemento) {
    const capa = document.getElementById("uniprep-onboarding");
    const foco = capa?.querySelector(".onboarding-spotlight");
    const tarjeta = capa?.querySelector(".onboarding-card");
    if (!capa || !foco || !tarjeta) return;

    if (!elemento) {
      foco.classList.add("sin-objetivo");
      tarjeta.style.left = "50%";
      tarjeta.style.top = "50%";
      tarjeta.style.transform = "translate(-50%, -50%)";
      return;
    }

    foco.classList.remove("sin-objetivo");
    tarjeta.style.transform = "none";
    const margen = 10;
    const rect = elemento.getBoundingClientRect();
    const izquierda = limitar(rect.left - margen, 8, window.innerWidth - 24);
    const arriba = limitar(rect.top - margen, 8, window.innerHeight - 24);
    const ancho = limitar(rect.width + margen * 2, 34, window.innerWidth - izquierda - 8);
    const alto = limitar(rect.height + margen * 2, 34, window.innerHeight - arriba - 8);

    foco.style.left = `${izquierda}px`;
    foco.style.top = `${arriba}px`;
    foco.style.width = `${ancho}px`;
    foco.style.height = `${alto}px`;

    if (window.innerWidth <= 680) {
      tarjeta.style.left = "12px";
      tarjeta.style.top = "auto";
      tarjeta.style.bottom = "12px";
      return;
    }

    tarjeta.style.bottom = "auto";
    const cajaTarjeta = tarjeta.getBoundingClientRect();
    let x;
    let y;

    if (rect.left < 285 && window.innerWidth > 780) {
      x = rect.right + 22;
      y = rect.top - 18;
    } else if (window.innerHeight - rect.bottom >= cajaTarjeta.height + 28) {
      x = rect.left;
      y = rect.bottom + 20;
    } else if (rect.top >= cajaTarjeta.height + 28) {
      x = rect.left;
      y = rect.top - cajaTarjeta.height - 20;
    } else {
      x = rect.left > window.innerWidth / 2 ? 24 : window.innerWidth - cajaTarjeta.width - 24;
      y = (window.innerHeight - cajaTarjeta.height) / 2;
    }

    tarjeta.style.left = `${limitar(x, 16, window.innerWidth - cajaTarjeta.width - 16)}px`;
    tarjeta.style.top = `${limitar(y, 16, window.innerHeight - cajaTarjeta.height - 16)}px`;
  }

  async function mostrarPaso(indice) {
    if (!tutorialAbierto) return;
    pasoActual = limitar(indice, 0, pasos.length - 1);
    const paso = pasos[pasoActual];
    navegarAPantalla(paso.pantalla);
    await esperarPintado();

    let elemento = obtenerElementoPaso(paso);
    elemento?.scrollIntoView?.({behavior: "auto", block: "center", inline: "nearest"});
    await esperarPintado();
    elemento = obtenerElementoPaso(paso);

    const capa = document.getElementById("uniprep-onboarding");
    if (!capa || !tutorialAbierto) return;
    const titulo = typeof paso.titulo === "function" ? paso.titulo(primerNombre()) : paso.titulo;
    capa.querySelector(".onboarding-step-icon").textContent = paso.icono;
    capa.querySelector(".onboarding-step-count").textContent = `PASO ${pasoActual + 1} DE ${pasos.length}`;
    capa.querySelector("#onboarding-title").textContent = titulo;
    capa.querySelector("#onboarding-copy").textContent = paso.texto;
    capa.querySelector(".onboarding-prev").disabled = pasoActual === 0;
    capa.querySelector(".onboarding-next").textContent = paso.final ? "Empezar misión →" : "Siguiente →";
    capa.querySelector(".onboarding-dots").innerHTML = pasos.map((_, i) => `<span class="${i === pasoActual ? "activo" : i < pasoActual ? "completo" : ""}"></span>`).join("");
    posicionarTarjeta(elemento);
    capa.querySelector(".onboarding-next")?.focus({preventScroll: true});
  }

  function cambiarPaso(cambio) {
    mostrarPaso(pasoActual + cambio).catch(error => console.warn("No se pudo cambiar el paso del tutorial:", error));
  }

  async function avanzarTutorial() {
    if (pasoActual < pasos.length - 1) {
      await mostrarPaso(pasoActual + 1);
      return;
    }
    await cerrarTutorial(true);
    if (typeof window.abrirCentroPractica === "function") window.abrirCentroPractica(null);
    else window.go?.("cursos", null);
  }

  async function marcarTutorialCompletado() {
    const estado = {completado: true, version: VERSION_TUTORIAL, fecha: new Date().toISOString()};
    try {
      window.uniprepStorage?.guardar(CLAVE_TUTORIAL, estado);
    } catch (_) {}

    try {
      if (!window.supabaseClient?.auth) return;
      const {data} = await window.supabaseClient.auth.getUser();
      const usuario = data?.user;
      if (!usuario) return;
      const metadata = usuario.user_metadata || {};
      const {error} = await window.supabaseClient.auth.updateUser({
        data: {...metadata, tutorial_completado: true, tutorial_version: VERSION_TUTORIAL}
      });
      if (error) throw error;
    } catch (error) {
      console.warn("El tutorial se guardó en este dispositivo y se sincronizará en otro ingreso.", error);
    }
  }

  async function cerrarTutorial(guardar = false) {
    if (!tutorialAbierto) return;
    tutorialAbierto = false;
    cancelAnimationFrame(rafReposicion);
    const capa = document.getElementById("uniprep-onboarding");
    if (capa) {
      capa.classList.remove("visible");
      capa.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (!tutorialAbierto) capa.hidden = true;
      }, 220);
    }
    document.documentElement.classList.remove("onboarding-activo");
    if (guardar) marcarTutorialCompletado();
  }

  async function iniciarTutorial(opciones = {}) {
    const forzar = Boolean(opciones?.forzar);
    if (tutorialAbierto) return;
    if (!forzar) {
      const local = window.uniprepStorage?.leer(CLAVE_TUTORIAL, null);
      if (local?.completado) return;
    }

    const authScreen = document.getElementById("auth-screen");
    if (!forzar && authScreen && getComputedStyle(authScreen).display !== "none") return;

    crearInterfaz();
    const capa = document.getElementById("uniprep-onboarding");
    if (!capa) return;
    tutorialAbierto = true;
    pasoActual = 0;
    capa.hidden = false;
    capa.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("onboarding-activo");
    requestAnimationFrame(() => capa.classList.add("visible"));
    await mostrarPaso(0);
  }

  async function programarInicioAutomatico() {
    if (inicioAutomaticoProcesado) return;
    inicioAutomaticoProcesado = true;
    clearTimeout(temporizadorInicio);

    try {
      const local = window.uniprepStorage?.leer(CLAVE_TUTORIAL, null);
      if (local?.completado) return;
      const {data} = await window.supabaseClient?.auth?.getUser?.() || {};
      const usuario = data?.user;
      if (!usuario || usuario.user_metadata?.tutorial_completado !== false) return;
      temporizadorInicio = setTimeout(() => {
        iniciarTutorial().catch(error => console.warn("No se pudo abrir el tutorial:", error));
      }, ESPERA_INICIAL_MS);
    } catch (error) {
      console.warn("El tutorial no interrumpirá el ingreso:", error);
    }
  }

  function alCambiarVentana() {
    if (!tutorialAbierto) return;
    cancelAnimationFrame(rafReposicion);
    rafReposicion = requestAnimationFrame(() => posicionarTarjeta(obtenerElementoPaso(pasos[pasoActual])));
  }

  function alPresionarTecla(evento) {
    if (!tutorialAbierto) return;
    if (evento.key === "Escape") {
      evento.preventDefault();
      cerrarTutorial(true);
    }
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      avanzarTutorial();
    }
    if (evento.key === "ArrowLeft" && pasoActual > 0) {
      evento.preventDefault();
      cambiarPaso(-1);
    }
  }

  window.iniciarTutorialUniPrep = iniciarTutorial;
  window.cerrarTutorialUniPrep = cerrarTutorial;
  document.addEventListener("uniprep:user-ready", programarInicioAutomatico);
  window.addEventListener("resize", alCambiarVentana, {passive: true});
  window.addEventListener("keydown", alPresionarTecla);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", crearInterfaz);
  else crearInterfaz();
})();
