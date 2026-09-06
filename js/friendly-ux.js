// =========================================================
// UNIPREP 2 · FRIENDLY PATH / FLOW 2026.24
// Organiza la experiencia sin reemplazar los módulos existentes.
// =========================================================
(function () {
  "use strict";

  const SECONDARY_SCREENS = new Set([
    "universo", "videoclase", "formulas", "biblioteca", "agenda", "vocacional", "perfil", "notificaciones"
  ]);

  const state = {
    courseId: null,
    topicIndex: 0,
    currentScreen: "home",
    previousFocus: null
  };

  function escapeHTML(value) {
    const node = document.createElement("div");
    node.textContent = String(value ?? "");
    return node.innerHTML;
  }

  function localDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getCourses() {
    return Object.values(window.CURSOS_PREUNI || {})
      .filter(course => course?.id && window.cursoPermitidoAdmision?.(course.id) !== false);
  }

  function chooseNextCourse(user) {
    const courses = getCourses();
    if (!courses.length) return null;

    const lastCourse = window.uniprepStorage?.leerTexto?.("uniprep_last_practice_course", "") || "";
    const detail = Array.isArray(user?.progresoDetallado) ? user.progresoDetallado : [];

    const ordered = [...courses].sort((a, b) => {
      const weightA = Number(window.pesoCursoAdmision?.(a.id)) || 1;
      const weightB = Number(window.pesoCursoAdmision?.(b.id)) || 1;
      const progressA = Math.max(0, Math.min(100, Number(user?.progreso?.[a.id]) || 0));
      const progressB = Math.max(0, Math.min(100, Number(user?.progreso?.[b.id]) || 0));
      const lastBoostA = a.id === lastCourse ? 8 : 0;
      const lastBoostB = b.id === lastCourse ? 8 : 0;
      return (weightB * (100 - progressB) + lastBoostB) - (weightA * (100 - progressA) + lastBoostA);
    });

    const course = ordered[0];
    const progressRow = detail.find(item => item.course_id === course.id);
    const topicIndex = Math.min(
      Math.max(0, Number(progressRow?.last_topic_index) || 0),
      Math.max(0, (course.temas?.length || 1) - 1)
    );

    return { course, topicIndex };
  }

  function pendingErrors() {
    const errors = window.uniprepStorage?.leer?.("uniprep_practice_errors_v1", []);
    return Array.isArray(errors) ? errors.length : 0;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value);
  }

  async function updateFriendlyHome(userProvided = null) {
    let user = userProvided;
    if (!user && typeof window.obtenerUsuarioActivo === "function") {
      try { user = await window.obtenerUsuarioActivo(); } catch (_) { user = null; }
    }
    if (!user) return false;

    const next = chooseNextCourse(user);
    if (next) {
      state.courseId = next.course.id;
      state.topicIndex = next.topicIndex;
      const topic = next.course.temas?.[next.topicIndex] || next.course.temas?.[0];
      setText("friendly-path-topic", topic?.titulo || `Continuar ${next.course.nombre}`);
      setText("friendly-path-course", `${next.course.nombre} · ${topic?.duracion || "lección corta"}`);
      setText("friendly-path-subtitle", `UniPrep recomienda ${next.course.nombre} según tu ruta y el peso de tu examen.`);
    }

    const errors = pendingErrors();
    setText(
      "friendly-errors-copy",
      errors > 0
        ? `${errors} pregunta${errors === 1 ? " pendiente" : "s pendientes"}`
        : "No tienes errores pendientes"
    );

    const streak = Math.max(0, Number(user.racha) || 0);
    setText("friendly-top-streak", streak);

    const completedToday = user.ultimoDiaEstudio === localDate();
    const ring = document.getElementById("friendly-goal-ring");
    if (ring) ring.style.setProperty("--friendly-goal", completedToday ? "360deg" : "0deg");
    setText("friendly-daily-progress", completedToday ? "100%" : "0%");
    setText("friendly-daily-label", completedToday ? "¡Misión completada!" : "1 misión corta");
    setText(
      "friendly-daily-note",
      completedToday ? "Tu racha está segura por hoy" : streak > 0 ? "Complétala para proteger tu racha" : "Empieza con solo unos minutos"
    );

    const firstStep = document.getElementById("friendly-step-learn");
    firstStep?.classList.toggle("done", completedToday);
    return true;
  }

  function continuePath() {
    if (state.courseId && typeof window.abrirCurso === "function") {
      window.abrirCurso(state.courseId, state.topicIndex);
      return;
    }
    window.go?.("cursos", null);
  }

  function startPathPractice() {
    if (state.courseId && typeof window.iniciarPracticaCursoNivel === "function") {
      window.iniciarPracticaCursoNivel(state.courseId, "todos", 10);
      return;
    }
    if (state.courseId && typeof window.iniciarPracticaRapida === "function") {
      window.iniciarPracticaRapida(state.courseId);
      return;
    }
    window.abrirCentroPractica?.(null);
  }

  function toolButton(icon, title, description, action, route = "") {
    const routeAttribute = route ? ` data-friendly-route="${route}"` : "";
    return `<button class="friendly-tool" type="button" data-friendly-action="${action}"${routeAttribute}><i aria-hidden="true">${icon}</i><span><b>${escapeHTML(title)}</b><small>${escapeHTML(description)}</small></span><em aria-hidden="true">›</em></button>`;
  }

  function createMorePanel() {
    if (document.getElementById("friendly-more-panel")) return;
    const layer = document.createElement("div");
    layer.id = "friendly-more-layer";
    layer.className = "friendly-more-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<section id="friendly-more-panel" class="friendly-more-panel" role="dialog" aria-modal="true" aria-labelledby="friendly-more-title">
      <header class="friendly-more-head"><div><small>TODO EN SU LUGAR</small><h2 id="friendly-more-title">Más herramientas</h2><p>Encuentra cada función según lo que quieres hacer.</p></div><button class="friendly-more-close" type="button" data-friendly-close aria-label="Cerrar">×</button></header>
      <div class="friendly-more-groups">
        <section class="friendly-more-group"><header><b>Comprueba tu avance</b><small>Evaluaciones y comparación</small></header><div class="friendly-tool-list">
          ${toolButton("🏁", "Simulacros", "Pruebas adaptadas a tu universidad", "route", "exams")}
          ${toolButton("🏆", "Ranking", "Día, semana, mes y región", "route", "ranking")}
          ${toolButton("✓", "Estado para exposición", "Comprueba app, cuentas, ranking e IA", "health")}
          ${toolButton("▶", "Guía para el jurado", "Qué hace cada función y cómo demostrarla", "exposition")}
        </div></section>
        <section class="friendly-more-group"><header><b>Aprende y repasa</b><small>Materiales para comprender mejor</small></header><div class="friendly-tool-list">
          ${toolButton("✦", "Universo UniPrep", "Misiones, mundos y funciones experimentales", "route", "universo")}
          ${toolButton("▶", "Videoclases", "Explicaciones organizadas por tema", "route", "videoclase")}
          ${toolButton("ƒ", "Fórmulas y repaso", "Consulta rápida antes de practicar", "route", "formulas")}
          ${toolButton("📚", "Biblioteca", "Colecciones y materiales de tu ruta", "route", "biblioteca")}
          ${toolButton("◷", "Modo concentración", "Bloques de 15, 25 o 45 minutos", "focus")}
        </div></section>
        <section class="friendly-more-group"><header><b>Organiza tu futuro</b><small>Planificación y orientación</small></header><div class="friendly-tool-list">
          ${toolButton("▣", "Agenda", "Horario, tareas y plan semanal", "route", "agenda")}
          ${toolButton("◇", "Orientación vocacional", "Intereses, carreras y universidades", "vocational")}
        </div></section>
        <section class="friendly-more-group"><header><b>Tu espacio</b><small>Cuenta, avisos y apariencia</small></header><div class="friendly-tool-list">
          ${toolButton("◉", "Mi perfil", "Progreso, logros y configuración", "route", "perfil")}
          ${toolButton("●", "Notificaciones", "Recordatorios y resultados", "route", "notificaciones")}
          ${toolButton("◐", "Colores y apariencia", "Modo claro, oscuro y fondos", "appearance")}
          ${toolButton("?", "Guía rápida", "Recorrido sencillo por las funciones principales", "tutorial")}
          ${toolButton("⌕", "Buscar en UniPrep", "Cursos, acciones y herramientas", "commands")}
        </div></section>
      </div>
    </section>`;

    layer.addEventListener("pointerdown", event => {
      if (event.target === layer) closeMorePanel();
    });
    layer.querySelector("[data-friendly-close]")?.addEventListener("click", closeMorePanel);
    layer.querySelectorAll("[data-friendly-action]").forEach(button => {
      button.addEventListener("click", () => runTool(button.dataset.friendlyAction, button.dataset.friendlyRoute));
    });
    document.body.appendChild(layer);
  }

  function openMorePanel() {
    createMorePanel();
    const layer = document.getElementById("friendly-more-layer");
    if (!layer) return;
    state.previousFocus = document.activeElement;
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    document.querySelector(".friendly-more-trigger")?.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => layer.querySelector("[data-friendly-close]")?.focus());
  }

  function closeMorePanel() {
    const layer = document.getElementById("friendly-more-layer");
    if (!layer?.classList.contains("open")) return;
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    document.querySelector(".friendly-more-trigger")?.setAttribute("aria-expanded", "false");
    if (state.previousFocus instanceof HTMLElement) state.previousFocus.focus();
  }

  async function runTool(action, route) {
    closeMorePanel();
    if (action === "route") {
      if (route === "biblioteca" && !document.getElementById("biblioteca") && typeof window.inicializarModulosAprendizaje === "function") {
        await window.inicializarModulosAprendizaje();
      }
      if (!document.getElementById(route)) {
        window.UniprepUGEL?.mostrarToast?.("Esta herramienta todavía se está preparando. Intenta nuevamente en un momento.");
        return;
      }
      return window.go?.(route, null);
    }
    if (action === "vocational") {
      if (typeof window.abrirCentroVocacional === "function") return window.abrirCentroVocacional(null);
      return window.go?.("vocacional", null);
    }
    if (action === "appearance") return window.abrirPersonalizacionUniPrep?.();
    if (action === "focus") return window.abrirEnfoqueHyperdrive?.();
    if (action === "tutorial") return window.iniciarTutorialUniPrep?.({forzar:true});
    if (action === "health") return window.abrirEstadoNacionalUniPrep?.();
    if (action === "exposition") return window.abrirGuiaExposicionUniPrep?.();
    if (action === "commands") return window.abrirCentroComandosUniPrep?.();
  }

  function syncNavigation(screenId) {
    state.currentScreen = screenId || state.currentScreen;
    document.body.dataset.friendlyScreen = state.currentScreen;
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => item.classList.remove("active"));

    const direct = [...document.querySelectorAll(".sidebar-nav .nav-item[data-screen]")]
      .find(item => item.dataset.screen === state.currentScreen);
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const directIsMobile = direct?.hasAttribute("data-mobile-primary");
    const useMore = mobile && (!direct || !directIsMobile);
    const target = useMore ? document.querySelector(".friendly-more-trigger") : direct;
    target?.classList.add("active");
    closeMorePanel();
  }

  function wrapNavigation() {
    const original = window.go;
    if (typeof original !== "function" || original.__friendlyWrapped) return;
    function friendlyGo(screenId, menuElement) {
      const result = original.call(this, screenId, menuElement);
      syncNavigation(screenId);
      return result;
    }
    friendlyGo.__friendlyWrapped = true;
    window.go = friendlyGo;
  }

  function wrapDashboard() {
    const original = window.cargarDashboard;
    if (typeof original !== "function" || original.__friendlyWrapped) return;
    async function friendlyDashboard(...args) {
      const result = await original.apply(this, args);
      await updateFriendlyHome();
      return result;
    }
    friendlyDashboard.__friendlyWrapped = true;
    window.cargarDashboard = friendlyDashboard;
  }

  function keyboard(event) {
    if (event.key === "Escape") closeMorePanel();
  }

  function initialize() {
    createMorePanel();
    wrapNavigation();
    wrapDashboard();
    syncNavigation(document.querySelector(".screen.active")?.id || "home");
    updateFriendlyHome();

    document.addEventListener("keydown", keyboard);
    document.addEventListener("uniprep:user-ready", event => updateFriendlyHome(event.detail?.user));
    document.addEventListener("uniprep:admission-ready", () => updateFriendlyHome());
    document.addEventListener("uniprep:admission-change", () => updateFriendlyHome());
    document.addEventListener("uniprep:storage-scope-change", () => updateFriendlyHome());
    window.addEventListener("resize", () => syncNavigation(state.currentScreen), { passive: true });
  }

  window.abrirMasUniPrep = openMorePanel;
  window.cerrarMasUniPrep = closeMorePanel;
  window.continuarRutaUniPrep = continuePath;
  window.iniciarPracticaRutaUniPrep = startPathPractice;
  window.actualizarRutaAmigableUniPrep = updateFriendlyHome;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
