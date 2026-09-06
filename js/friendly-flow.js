// =====================================================================
// UNIPREP 2 · FRIENDLY FLOW 2026.24
// Historial interno, acciones contextuales y transiciones comprensibles.
// =====================================================================
(function () {
  "use strict";

  const SCREEN_TITLES = {
    home: "Tu ruta de hoy",
    universo: "Universo UniPrep",
    cursos: "Aprender",
    videoclase: "Lección",
    ejercicios: "Practicar",
    formulas: "Fórmulas y repaso",
    biblioteca: "Biblioteca",
    "course-evaluation": "Evaluación del curso",
    exams: "Comprueba tu avance",
    "exam-active": "Simulacro en curso",
    "exam-result": "Resultado del simulacro",
    ranking: "Ranking",
    agenda: "Organiza tu estudio",
    vocacional: "Descubre tu carrera",
    tutor: "Tutor Uni",
    perfil: "Mi perfil",
    notificaciones: "Notificaciones"
  };

  const SCREEN_CONTEXT = {
    home: [
      {id:"continue", icon:"▶", label:"Continuar ruta", primary:true},
      {id:"tutor", icon:"✦", label:"Preguntar a Uni"}
    ],
    universo: [
      {id:"quick", icon:"⚡", label:"Misión rápida", primary:true},
      {id:"home", icon:"⌂", label:"Mi ruta"}
    ],
    cursos: [
      {id:"practice", icon:"◎", label:"Practicar", primary:true},
      {id:"agenda", icon:"◷", label:"Mi plan"}
    ],
    videoclase: [
      {id:"courses", icon:"▦", label:"Todos los cursos"},
      {id:"practice", icon:"◎", label:"Practicar", primary:true}
    ],
    ejercicios: [
      {id:"errors", icon:"↻", label:"Repasar errores", primary:true},
      {id:"formulas", icon:"∑", label:"Ver fórmulas"}
    ],
    formulas: [
      {id:"practice", icon:"◎", label:"Practicar", primary:true},
      {id:"courses", icon:"▦", label:"Cursos"}
    ],
    biblioteca: [
      {id:"tutor", icon:"✦", label:"Preguntar a Uni", primary:true},
      {id:"courses", icon:"▦", label:"Cursos"}
    ],
    exams: [
      {id:"diagnostic", icon:"20", label:"Diagnóstico", primary:true},
      {id:"ranking", icon:"★", label:"Ranking"}
    ],
    "exam-result": [
      {id:"exams", icon:"↻", label:"Otro simulacro", primary:true},
      {id:"ranking", icon:"★", label:"Ranking"}
    ],
    ranking: [
      {id:"practice", icon:"◎", label:"Mejorar puntaje", primary:true},
      {id:"home", icon:"⌂", label:"Inicio"}
    ],
    agenda: [
      {id:"focus", icon:"◷", label:"Concentrarme", primary:true},
      {id:"home", icon:"⌂", label:"Inicio"}
    ],
    vocacional: [
      {id:"courses", icon:"▦", label:"Ver cursos", primary:true},
      {id:"profile", icon:"◇", label:"Mi perfil"}
    ],
    tutor: [
      {id:"courses", icon:"▦", label:"Cursos"},
      {id:"practice", icon:"◎", label:"Practicar", primary:true}
    ],
    perfil: [
      {id:"appearance", icon:"◐", label:"Personalizar", primary:true},
      {id:"home", icon:"⌂", label:"Inicio"}
    ],
    notificaciones: [
      {id:"home", icon:"⌂", label:"Inicio", primary:true},
      {id:"agenda", icon:"◷", label:"Mi plan"}
    ]
  };

  const flow = {
    entries: [],
    index: -1,
    restoring: false,
    originalGo: null
  };

  function currentScreen() {
    return document.querySelector(".screen.active")?.id || "home";
  }

  function titleFor(screenId) {
    return SCREEN_TITLES[screenId] || "UniPrep";
  }

  function isEditable(target) {
    return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function announce(message) {
    let live = document.getElementById("flow-live-region");
    if (!live) {
      live = document.createElement("div");
      live.id = "flow-live-region";
      live.className = "flow-visually-hidden";
      live.setAttribute("aria-live", "polite");
      live.setAttribute("aria-atomic", "true");
      document.body.appendChild(live);
    }
    live.textContent = "";
    window.setTimeout(() => { live.textContent = message; }, 20);
  }

  function updateHistoryButtons() {
    const back = document.getElementById("flow-nav-back");
    const forward = document.getElementById("flow-nav-forward");
    const previous = flow.entries[flow.index - 1];
    const next = flow.entries[flow.index + 1];

    if (back) {
      back.disabled = !previous;
      back.title = previous ? `Atrás: ${titleFor(previous.screen)} (Alt + ←)` : "No hay una pantalla anterior";
      back.setAttribute("aria-label", previous ? `Volver a ${titleFor(previous.screen)}` : "No hay una pantalla anterior");
    }
    if (forward) {
      forward.disabled = !next;
      forward.title = next ? `Adelante: ${titleFor(next.screen)} (Alt + →)` : "No hay una pantalla siguiente";
      forward.setAttribute("aria-label", next ? `Ir a ${titleFor(next.screen)}` : "No hay una pantalla siguiente");
    }
  }

  function renderContext(screenId) {
    const title = titleFor(screenId);
    const titleNode = document.getElementById("flow-context-title");
    const actionRoot = document.getElementById("flow-context-actions");
    const contextBar = document.getElementById("flow-context-bar");
    const actions = SCREEN_CONTEXT[screenId] || [];

    if (titleNode) titleNode.textContent = title;
    if (contextBar) contextBar.dataset.screen = screenId;
    if (actionRoot) {
      actionRoot.innerHTML = actions.map(action => `<button type="button" class="flow-context-action${action.primary ? " primary" : ""}" data-flow-action="${action.id}"><i aria-hidden="true">${action.icon}</i><span>${action.label}</span></button>`).join("");
    }
    updateHistoryButtons();
  }

  function record(screenId) {
    const current = flow.entries[flow.index];
    if (current?.screen === screenId) {
      renderContext(screenId);
      return;
    }
    flow.entries = flow.entries.slice(0, flow.index + 1);
    flow.entries.push({screen:screenId, at:Date.now()});
    if (flow.entries.length > 40) flow.entries.shift();
    flow.index = flow.entries.length - 1;
    renderContext(screenId);
  }

  function navigateHistory(offset) {
    const targetIndex = flow.index + offset;
    const target = flow.entries[targetIndex];
    if (!target || typeof flow.originalGo !== "function") return;

    flow.restoring = true;
    flow.index = targetIndex;
    document.body.dataset.flowDirection = offset < 0 ? "back" : "forward";
    flow.originalGo(target.screen, null);
    flow.restoring = false;
    renderContext(target.screen);
    announce(`${offset < 0 ? "Volviste a" : "Avanzaste a"} ${titleFor(target.screen)}`);
    document.dispatchEvent(new CustomEvent("uniprep:flow-navigation", {detail:{screen:target.screen, direction:offset < 0 ? "back" : "forward"}}));
  }

  function route(screenId) {
    window.go?.(screenId, null);
  }

  function runAction(actionId) {
    if (actionId === "continue") return window.continuarRutaUniPrep?.();
    if (actionId === "tutor") return typeof window.abrirTutorAcademico === "function" ? window.abrirTutorAcademico(null) : route("tutor");
    if (actionId === "practice") return typeof window.abrirCentroPractica === "function" ? window.abrirCentroPractica(null) : route("ejercicios");
    if (actionId === "errors") return typeof window.iniciarColeccionPractica === "function" ? window.iniciarColeccionPractica("errores") : route("ejercicios");
    if (actionId === "quick") {
      const activeCourses = window.obtenerCursosActivosAdmision?.() || [];
      const courseId = activeCourses[0] || "rm";
      return typeof window.iniciarPracticaCursoNivel === "function" ? window.iniciarPracticaCursoNivel(courseId, "todos", 5) : route("ejercicios");
    }
    if (actionId === "diagnostic") {
      if (typeof window.iniciarSimulacroTipo === "function") return window.iniciarSimulacroTipo("diagnostico_20");
      return route("exams");
    }
    if (actionId === "focus") return window.abrirEnfoqueHyperdrive?.();
    if (actionId === "appearance") return window.abrirPersonalizacionUniPrep?.();

    const routes = {
      home:"home", courses:"cursos", formulas:"formulas", exams:"exams",
      ranking:"ranking", agenda:"agenda", profile:"perfil"
    };
    if (routes[actionId]) return route(routes[actionId]);
  }

  function wrapNavigation() {
    if (typeof window.go !== "function" || window.go.__friendlyFlowWrapped) return;
    const previousGo = window.go;
    flow.originalGo = previousGo;

    function friendlyFlowGo(screenId, menuElement = null) {
      const screen = document.getElementById(screenId);
      if (!screen) return previousGo(screenId, menuElement);

      const from = currentScreen();
      if (!flow.restoring) {
        const existingForwardIndex = flow.entries.findIndex((entry, index) => index > flow.index && entry.screen === screenId);
        document.body.dataset.flowDirection = existingForwardIndex >= 0 ? "forward" : (screenId === from ? "still" : "forward");
      }

      const result = previousGo(screenId, menuElement);
      if (!flow.restoring && document.getElementById(screenId)?.classList.contains("active")) {
        record(screenId);
        if (screenId !== from) announce(`Abriste ${titleFor(screenId)}`);
      }
      return result;
    }

    friendlyFlowGo.__friendlyFlowWrapped = true;
    window.go = friendlyFlowGo;
  }

  function initialize() {
    wrapNavigation();
    const initial = currentScreen();
    flow.entries = [{screen:initial, at:Date.now()}];
    flow.index = 0;
    renderContext(initial);

    document.getElementById("flow-nav-back")?.addEventListener("click", () => navigateHistory(-1));
    document.getElementById("flow-nav-forward")?.addEventListener("click", () => navigateHistory(1));
    document.getElementById("flow-context-actions")?.addEventListener("click", event => {
      const button = event.target.closest("[data-flow-action]");
      if (button) runAction(button.dataset.flowAction);
    });

    document.addEventListener("keydown", event => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isEditable(event.target)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateHistory(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateHistory(1);
      }
    });
  }

  window.volverEnUniPrep = () => navigateHistory(-1);
  window.avanzarEnUniPrep = () => navigateHistory(1);
  window.actualizarBarraContextualUniPrep = () => renderContext(currentScreen());

  document.addEventListener("DOMContentLoaded", initialize);
})();
