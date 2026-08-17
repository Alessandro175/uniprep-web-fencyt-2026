(function () {
  "use strict";

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const tiltSelector = [
    ".qstat",
    ".course-card-ultra",
    ".formula-course-card",
    ".library-card",
    ".analysis-mini-card",
    ".profile-card",
    ".ach-card",
    ".practice-feature-card",
    ".game-level-card",
    ".exam-option-card",
    ".auth-benefit"
  ].join(",");
  const heroSelector = [
    ".welcome-banner",
    ".exam-hero",
    ".courses-command-center",
    ".ranking-hero-real",
    ".formula-hero",
    ".schedule-hero",
    ".practice-hero"
  ].join(",");

  let introTimer = 0;
  let decorateFrame = 0;
  let canvasState = null;

  function introMarkup() {
    return `
      <div class="showcase-intro-scan" aria-hidden="true"></div>
      <button class="showcase-intro-skip" type="button">Saltar intro</button>
      <div class="showcase-intro-stage">
        <div class="showcase-intro-system">Sistema de preparación activado</div>
        <div class="showcase-intro-emblem" aria-hidden="true">
          <div class="showcase-intro-emblem-core">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.5L3.5 7.25v9.5L12 21.5l8.5-4.75v-9.5L12 2.5Z" stroke="white" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M12 2.5v19M3.5 7.25L12 12l8.5-4.75" stroke="white" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="showcase-intro-kicker">Tu ingreso empieza aquí</div>
        <h1 class="showcase-intro-title">Uni<span>Prep</span></h1>
        <p class="showcase-intro-subtitle">Convierte cada tema en una misión. Convierte cada misión en tu futuro.</p>
        <div class="showcase-intro-chips" aria-label="Funciones destacadas">
          <span>Retos adaptativos</span><span>Simulacros reales</span><span>Progreso con XP</span><span>Ranking</span><span>Universidades del Perú</span>
        </div>
        <div class="showcase-intro-loader" aria-hidden="true"><span></span></div>
      </div>`;
  }

  function closeIntro(intro) {
    if (!intro || intro.classList.contains("is-closing")) return;
    window.clearTimeout(introTimer);
    intro.classList.add("is-closing");
    document.body.classList.remove("showcase-intro-open");
    window.setTimeout(() => intro.remove(), reduceMotion ? 320 : 650);
  }

  function showIntro() {
    document.querySelectorAll(".showcase-intro").forEach((item) => item.remove());
    const intro = document.createElement("section");
    intro.className = "showcase-intro";
    intro.setAttribute("aria-label", "Presentación de UniPrep");
    intro.innerHTML = introMarkup();
    document.body.appendChild(intro);
    document.body.classList.add("showcase-intro-open", "showcase-hyper");
    intro.querySelector(".showcase-intro-skip")?.addEventListener("click", () => closeIntro(intro));
    introTimer = window.setTimeout(() => closeIntro(intro), reduceMotion ? 1450 : 5150);
  }

  function createAtmosphere() {
    if (!document.getElementById("uniprep-showcase-canvas")) {
      const canvas = document.createElement("canvas");
      canvas.id = "uniprep-showcase-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
      if (!reduceMotion) startParticles(canvas);
    }
    if (!document.querySelector(".showcase-grid")) {
      const grid = document.createElement("div");
      grid.className = "showcase-grid";
      grid.setAttribute("aria-hidden", "true");
      document.body.prepend(grid);
    }
    if (!document.querySelector(".showcase-pointer-aura")) {
      const aura = document.createElement("div");
      aura.className = "showcase-pointer-aura";
      aura.setAttribute("aria-hidden", "true");
      document.body.prepend(aura);
    }
  }

  function startParticles(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const palette = ["84,244,255", "154,108,255", "255,98,207", "67,246,189"];
    const state = { canvas, ctx, width: 0, height: 0, particles: [], raf: 0, active: true };
    canvasState = state;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      canvas.width = Math.round(state.width * ratio);
      canvas.height = Math.round(state.height * ratio);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(22, Math.min(58, Math.round((state.width * state.height) / 26000)));
      state.particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        radius: Math.random() * 1.45 + 0.55,
        alpha: Math.random() * 0.42 + 0.18,
        color: palette[index % palette.length]
      }));
    }

    function render() {
      if (!state.active) return;
      ctx.clearRect(0, 0, state.width, state.height);
      for (let i = 0; i < state.particles.length; i += 1) {
        const point = state.particles[i];
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -10) point.x = state.width + 10;
        if (point.x > state.width + 10) point.x = -10;
        if (point.y < -10) point.y = state.height + 10;
        if (point.y > state.height + 10) point.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${point.color},${point.alpha})`;
        ctx.shadowColor = `rgba(${point.color},.65)`;
        ctx.shadowBlur = 8;
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < state.particles.length; j += 1) {
          const other = state.particles[j];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 112) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${point.color},${(1 - distance / 112) * 0.075})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
      state.raf = window.requestAnimationFrame(render);
    }

    resize();
    render();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      state.active = !document.hidden;
      if (state.active) render();
      else window.cancelAnimationFrame(state.raf);
    });
  }

  function addReplayButton() {
    const actions = document.querySelector(".topbar-actions");
    if (!actions || actions.querySelector(".showcase-replay")) return;
    const button = document.createElement("button");
    button.className = "showcase-replay";
    button.type = "button";
    button.title = "Reproducir presentación cinematográfica";
    button.setAttribute("aria-label", "Reproducir presentación de UniPrep");
    button.innerHTML = '<span aria-hidden="true">▶</span><span class="showcase-replay-label">Intro</span>';
    button.addEventListener("click", showIntro);
    actions.prepend(button);
  }

  function decorateElements() {
    document.querySelectorAll(tiltSelector).forEach((card) => {
      card.classList.add("showcase-tilt");
      if (!card.querySelector(":scope > .showcase-sheen")) {
        const sheen = document.createElement("span");
        sheen.className = "showcase-sheen";
        sheen.setAttribute("aria-hidden", "true");
        card.prepend(sheen);
      }
    });
    document.querySelectorAll(heroSelector).forEach((hero) => {
      if (!hero.querySelector(":scope > .showcase-hero-frame")) {
        const frame = document.createElement("span");
        frame.className = "showcase-hero-frame";
        frame.setAttribute("aria-hidden", "true");
        hero.prepend(frame);
      }
    });
  }

  function scheduleDecoration() {
    if (decorateFrame) return;
    decorateFrame = window.requestAnimationFrame(() => {
      decorateFrame = 0;
      decorateElements();
      addReplayButton();
    });
  }

  function enablePointerEffects() {
    if (reduceMotion) return;
    document.addEventListener("pointermove", (event) => {
      document.documentElement.style.setProperty("--showcase-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--showcase-y", `${event.clientY}px`);
      if (event.pointerType === "touch" || window.innerWidth < 761) return;

      const card = event.target.closest(tiltSelector);
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        card.style.setProperty("--tilt-y", `${((x - 0.5) * 7).toFixed(2)}deg`);
        card.style.setProperty("--tilt-x", `${((0.5 - y) * 6).toFixed(2)}deg`);
        card.style.setProperty("--shine-x", `${Math.round(x * 100)}%`);
        card.style.setProperty("--shine-y", `${Math.round(y * 100)}%`);
      }

      const hero = event.target.closest(heroSelector);
      if (hero) {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--shine-x", `${Math.round(((event.clientX - rect.left) / rect.width) * 100)}%`);
        hero.style.setProperty("--shine-y", `${Math.round(((event.clientY - rect.top) / rect.height) * 100)}%`);
      }
    }, { passive: true });

    document.addEventListener("pointerout", (event) => {
      const card = event.target.closest(tiltSelector);
      if (!card || card.contains(event.relatedTarget)) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--shine-x", "50%");
      card.style.setProperty("--shine-y", "50%");
    }, { passive: true });
  }

  function enableRipples() {
    document.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("button, .btn");
      if (!button || button.classList.contains("showcase-intro-skip")) return;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "showcase-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.setAttribute("aria-hidden", "true");
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  }

  function routeLabel(id) {
    const labels = {
      home: "Inicio · misión activa",
      cursos: "Mapa de cursos",
      videoclase: "Aula multimedia",
      ejercicios: "Centro de práctica",
      formulas: "Formulario inteligente",
      exams: "Simulacros",
      ranking: "Liga UniPrep",
      agenda: "Plan de estudio",
      perfil: "Perfil del estudiante",
      vocacional: "Ruta vocacional",
      tutor: "Tutor académico",
      notificaciones: "Centro de avisos"
    };
    return labels[id] || "UniPrep · nueva misión";
  }

  function showRouteBeacon(id) {
    document.querySelectorAll(".showcase-route-beacon").forEach((item) => item.remove());
    const beacon = document.createElement("div");
    beacon.className = "showcase-route-beacon";
    beacon.setAttribute("aria-hidden", "true");
    beacon.innerHTML = `<span>${routeLabel(id)}</span>`;
    document.body.appendChild(beacon);
    window.setTimeout(() => beacon.remove(), 820);
  }

  function wrapNavigation() {
    const originalGo = window.go;
    if (typeof originalGo !== "function" || originalGo.__showcaseWrapped) return;
    function showcaseGo(id, menuItem) {
      showRouteBeacon(id);
      const result = originalGo.call(this, id, menuItem);
      scheduleDecoration();
      return result;
    }
    showcaseGo.__showcaseWrapped = true;
    window.go = showcaseGo;
  }

  function start() {
    document.documentElement.classList.add("uniprep-showcase");
    createAtmosphere();
    addReplayButton();
    decorateElements();
    enablePointerEffects();
    enableRipples();
    wrapNavigation();
    const observer = new MutationObserver(scheduleDecoration);
    observer.observe(document.body, { childList: true, subtree: true });
    document.body.classList.add("showcase-ready");
    showIntro();
    window.addEventListener("pagehide", () => {
      observer.disconnect();
      if (canvasState) window.cancelAnimationFrame(canvasState.raf);
    }, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.reproducirIntroUniPrep = showIntro;
})();
