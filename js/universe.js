// ================================================================
// UNIPREP 2 · UNIVERSO FRIENDLY FLOW 2026.24
// Prototipos interactivos conectados con los módulos académicos reales.
// ================================================================
(function () {
  "use strict";

  const STORAGE_KEY = "uniprep_universe_state_v1";
  const CATEGORIES = [
    ["all", "Todo"],
    ["adaptive", "Aprendizaje"],
    ["challenge", "Desafíos"],
    ["ai", "IA y creación"],
    ["world", "Universo"],
    ["wellbeing", "Bienestar"],
    ["future", "Futuro"],
    ["community", "Comunidad"]
  ];

  const FEATURES = [
    {id:"diagnostic", category:"adaptive", icon:"◎", title:"Diagnóstico inicial", description:"Descubre tu nivel y recibe una ruta de comienzo.", action:"diagnostic"},
    {id:"daily-target", category:"adaptive", icon:"◷", title:"Meta de la sesión", description:"Elige una sesión de 10, 20 o 30 minutos.", action:"session"},
    {id:"five-minutes", category:"adaptive", icon:"⚡", title:"Lección de 5 minutos", description:"Aprende algo concreto sin sentir una carga enorme.", action:"quick"},
    {id:"adaptive-path", category:"adaptive", icon:"↗", title:"Ruta que se adapta", description:"Prioriza cursos según progreso y examen objetivo.", action:"continue"},
    {id:"smart-review", category:"adaptive", icon:"↻", title:"Repaso inteligente", description:"Vuelve a mostrar un tema antes de olvidarlo.", action:"errors"},
    {id:"error-notebook", category:"adaptive", icon:"✎", title:"Cuaderno de errores", description:"Organiza fallos por curso para corregirlos.", action:"errors"},
    {id:"confidence", category:"adaptive", icon:"?", title:"Medidor de confianza", description:"Compara lo que sabes con lo que crees saber.", action:"concept"},
    {id:"weekly-summary", category:"adaptive", icon:"▥", title:"Resumen semanal", description:"Logros, dificultades y recomendación de la semana.", action:"weekly"},

    {id:"boss", category:"challenge", icon:"👾", title:"Batalla contra jefe", description:"Cada respuesta correcta reduce su energía.", action:"boss"},
    {id:"survival", category:"challenge", icon:"♥", title:"Modo supervivencia", description:"Avanza hasta acumular tres errores.", action:"survival"},
    {id:"escape", category:"challenge", icon:"🔐", title:"Sala de escape", description:"Resuelve pistas para encontrar un código.", action:"escape"},
    {id:"ghost", category:"challenge", icon:"◌", title:"Fantasma personal", description:"Compite contra tu rendimiento anterior.", action:"concept"},
    {id:"record", category:"challenge", icon:"⏱", title:"Duelo contra tu récord", description:"Mejora tiempo, precisión o cantidad de respuestas.", action:"quick"},
    {id:"mystery", category:"challenge", icon:"◇", title:"Pregunta misteriosa", description:"Una sorpresa diaria de cualquier curso de tu ruta.", action:"mystery"},
    {id:"impossible", category:"challenge", icon:"∞", title:"Modo imposible", description:"Retos secretos para quienes buscan máxima dificultad.", action:"impossible"},
    {id:"coop-mission", category:"challenge", icon:"⚑", title:"Misión cooperativa", description:"Cada integrante resuelve una parte diferente.", action:"concept"},

    {id:"teach-uni", category:"ai", icon:"✦", title:"Entrena a Uni", description:"Explícale un tema y comprueba si lo dominaste.", action:"teach"},
    {id:"debate", category:"ai", icon:"⚖", title:"Debate con la IA", description:"Defiende una idea frente a una postura contraria.", action:"debate"},
    {id:"easy-explain", category:"ai", icon:"A", title:"Explícamelo fácil", description:"Convierte una explicación difícil en pasos sencillos.", action:"easy"},
    {id:"scan-notes", category:"ai", icon:"▣", title:"Escáner de cuaderno", description:"Convierte una foto en resumen y preguntas.", action:"scan"},
    {id:"object-camera", category:"ai", icon:"◉", title:"Pregunta desde un objeto", description:"Fotografía algo y descubre la ciencia que contiene.", action:"scan-object"},
    {id:"voice-expo", category:"ai", icon:"🎙", title:"Cabina de exposición", description:"Practica claridad, tiempo y seguridad al hablar.", action:"expo"},
    {id:"ai-rival", category:"ai", icon:"◆", title:"Rival amistoso IA", description:"Un personaje te desafía sin castigarte.", action:"rival"},
    {id:"project-lab", category:"ai", icon:"🚀", title:"Laboratorio de proyectos", description:"De una idea inicial a un plan defendible.", action:"project"},

    {id:"knowledge-universe", category:"world", icon:"◉", title:"Universo de cursos", description:"Cada área se convierte en un mundo explorable.", action:"map"},
    {id:"knowledge-city", category:"world", icon:"🏙", title:"Ciudad del conocimiento", description:"Tu avance construye una ciudad académica.", action:"city"},
    {id:"learning-garden", category:"world", icon:"🌱", title:"Jardín de aprendizaje", description:"Cada tema dominado hace crecer una planta amazónica.", action:"garden"},
    {id:"mascot", category:"world", icon:"✧", title:"Compañera UniPrep", description:"Nombre, ánimo y evolución según tu constancia.", action:"mascot"},
    {id:"heroes", category:"world", icon:"🛡", title:"Equipo de mentores", description:"Personajes especializados por curso.", action:"concept"},
    {id:"passport", category:"world", icon:"🛂", title:"Pasaporte académico", description:"Sellos por cada habilidad y etapa dominada.", action:"passport"},
    {id:"seasons", category:"world", icon:"☄", title:"Temporadas temáticas", description:"Amazonía, espacio, tecnología e historia peruana.", action:"concept"},
    {id:"secret-code", category:"world", icon:"#", title:"Código secreto diario", description:"Las misiones revelan una colección especial.", action:"mystery"},

    {id:"calm", category:"wellbeing", icon:"≈", title:"Modo calma", description:"Respira y comienza con preguntas sencillas.", action:"calm"},
    {id:"mood", category:"wellbeing", icon:"☺", title:"¿Cómo te sientes?", description:"Adapta la intensidad sin realizar diagnósticos médicos.", action:"mood"},
    {id:"focus", category:"wellbeing", icon:"◷", title:"Cabina de concentración", description:"Bloques de 15, 25 o 45 minutos.", action:"focus"},
    {id:"soundtrack", category:"wellbeing", icon:"♫", title:"Sonido de estudio", description:"Ambientes suaves según el tipo de sesión.", action:"concept"},
    {id:"radio", category:"wellbeing", icon:"◖", title:"Radio UniPrep", description:"Consejo y curiosidad educativa en audio.", action:"radio"},
    {id:"streak-shield", category:"wellbeing", icon:"🛡", title:"Protector de racha", description:"Un descanso no elimina todo tu esfuerzo.", action:"shield"},
    {id:"smart-break", category:"wellbeing", icon:"☕", title:"Pausa inteligente", description:"Propone descansar después de una sesión intensa.", action:"break"},

    {id:"future-score", category:"future", icon:"↗", title:"Viaje al futuro", description:"Proyecta un escenario de avance a 30 días.", action:"future"},
    {id:"career", category:"future", icon:"◇", title:"Portal vocacional", description:"Explora intereses, carreras y universidades.", action:"career"},
    {id:"profession", category:"future", icon:"⚙", title:"Simulador de profesiones", description:"Resuelve casos como ingeniero, médico o científico.", action:"profession"},
    {id:"campus", category:"future", icon:"⌂", title:"Campus virtual", description:"Recorre aulas organizadas por objetivos.", action:"concept"},
    {id:"capsule", category:"future", icon:"✉", title:"Cápsula del tiempo", description:"Guarda una meta para tu versión futura.", action:"capsule"},
    {id:"future-letter", category:"future", icon:"★", title:"Carta del yo universitario", description:"Un recordatorio de por qué empezaste.", action:"future-letter"},

    {id:"study-groups", category:"community", icon:"●", title:"Grupos de estudio seguros", description:"Comparte dudas con moderación y privacidad.", action:"concept"},
    {id:"world-boss", category:"community", icon:"🌎", title:"Jefe mundial semanal", description:"La comunidad suma respuestas para un objetivo común.", action:"concept"},
    {id:"mentor", category:"community", icon:"☝", title:"Reto del profesor", description:"El docente publica una misión voluntaria.", action:"concept"},
    {id:"teacher-dashboard", category:"community", icon:"▦", title:"Panel docente", description:"Observa tendencias sin exponer contraseñas.", action:"concept"},
    {id:"class-event", category:"community", icon:"⚑", title:"Evento por salón", description:"Metas colectivas basadas en constancia y mejora.", action:"concept"},
    {id:"knowledge-news", category:"community", icon:"▤", title:"Noticiero educativo", description:"Convierte actualidad en actividades cortas.", action:"news"}
  ];

  const JOURNEYS = [
    {
      id:"advance", eyebrow:"PARA AVANZAR HOY", icon:"🚀", title:"Quiero aprender sin perderme",
      description:"Empieza con una actividad corta y deja que UniPrep ordene el siguiente paso.",
      color:"#765ff2", features:["five-minutes","smart-review","diagnostic"]
    },
    {
      id:"challenge", eyebrow:"PARA PONERME A PRUEBA", icon:"👾", title:"Quiero un reto emocionante",
      description:"Convierte la práctica real en una misión, sin castigos ni bloqueos.",
      color:"#e9953e", features:["boss","escape","survival"]
    },
    {
      id:"help", eyebrow:"PARA ENTENDER Y CREAR", icon:"✦", title:"Necesito ayuda de Uni",
      description:"Pide una explicación, analiza apuntes o convierte una idea en proyecto.",
      color:"#36a9c9", features:["easy-explain","scan-notes","project-lab"]
    },
    {
      id:"rhythm", eyebrow:"PARA ESTUDIAR A MI RITMO", icon:"🌱", title:"Quiero sentirme cómodo",
      description:"Organiza tu concentración, baja la presión y conecta el estudio con tu futuro.",
      color:"#38b88f", features:["focus","calm","career"]
    }
  ];

  const WORLD_GROUPS = {
    math:["rm","aritmetica","algebra","geometria","trigonometria"],
    words:["rv","comprension_lectora","lenguaje","literatura"],
    science:["fisica","quimica","biologia","medio_ambiente","anatomia"],
    society:["historia","historia_peru","geografia","economia","civica","filosofia","psicologia"]
  };

  const DEFAULT_STATE = Object.freeze({
    version: 1,
    mascot: {name:"Nuna", mood:"curiosa"},
    sessionMinutes: 20,
    shields: 1,
    bossDamage: 0,
    escapeWins: 0,
    weeklyChest: "",
    capsule: null,
    featureVisits: {},
    unlocked: [],
    updatedAt: ""
  });

  let state = loadLocalState();
  let activeCategory = "all";
  let libraryOpen = false;
  let currentUser = null;
  let previousFocus = null;
  let puzzleAnswer = null;
  let saveTimer = null;

  function storage() {
    return window.uniprepStorage || {
      leer(key, fallback) { try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch (_) { return fallback; } },
      guardar(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
    };
  }

  function normalizeState(value = {}) {
    const mascot = value.mascot && typeof value.mascot === "object" ? value.mascot : {};
    const capsule = value.capsule && typeof value.capsule === "object" ? value.capsule : null;
    return {
      version: 1,
      mascot: {
        name: cleanText(mascot.name || DEFAULT_STATE.mascot.name, 18),
        mood: ["curiosa","valiente","tranquila","eléctrica"].includes(mascot.mood) ? mascot.mood : "curiosa"
      },
      sessionMinutes: clamp(value.sessionMinutes, 5, 90, 20),
      shields: clamp(value.shields, 0, 5, 1),
      bossDamage: clamp(value.bossDamage, 0, 100, 0),
      escapeWins: clamp(value.escapeWins, 0, 999, 0),
      weeklyChest: cleanText(value.weeklyChest, 20),
      capsule: capsule ? {message:cleanText(capsule.message, 500), openDate:cleanText(capsule.openDate, 10), createdAt:cleanText(capsule.createdAt, 40)} : null,
      featureVisits: value.featureVisits && typeof value.featureVisits === "object" ? {...value.featureVisits} : {},
      unlocked: Array.isArray(value.unlocked) ? [...new Set(value.unlocked.map(item=>cleanText(item, 40)).filter(Boolean))].slice(0,80) : [],
      updatedAt: cleanText(value.updatedAt, 40)
    };
  }

  function loadLocalState() { return normalizeState(storage().leer?.(STORAGE_KEY, DEFAULT_STATE) || DEFAULT_STATE); }
  function cleanText(value, max = 120) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max); }
  function clamp(value, min, max, fallback = min) { const number = Number(value); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback; }
  function escapeHTML(value) { const node = document.createElement("div"); node.textContent = String(value ?? ""); return node.innerHTML; }
  function toast(message) {
    if (window.UniprepUGEL?.mostrarToast) window.UniprepUGEL.mostrarToast(message);
    else window.mostrarToastPremium?.(message);
  }
  function localDate() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
  function weekKey() { const now = new Date(); const first = new Date(now.getFullYear(),0,1); return `${now.getFullYear()}-${Math.ceil((((now-first)/86400000)+first.getDay()+1)/7)}`; }

  function saveState(eventType = "state_update", eventData = {}) {
    state.updatedAt = new Date().toISOString();
    storage().guardar?.(STORAGE_KEY, state);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => window.UniPrepCloud?.saveUniverseState?.(state), 550);
    if (eventType) window.UniPrepCloud?.logUniverseEvent?.(eventType, eventData);
  }

  async function syncFromCloud() {
    const remote = await window.UniPrepCloud?.loadUniverseState?.();
    if (!remote?.state || typeof remote.state !== "object") {
      window.UniPrepCloud?.saveUniverseState?.(state);
      return;
    }
    const remoteTime = new Date(remote.updated_at || remote.state.updatedAt || 0).getTime();
    const localTime = new Date(state.updatedAt || 0).getTime();
    if (remoteTime >= localTime) {
      state = normalizeState({...remote.state, updatedAt:remote.updated_at || remote.state.updatedAt});
      storage().guardar?.(STORAGE_KEY, state);
      renderAll();
    }
  }

  function average(values) {
    const list = values.map(Number).filter(Number.isFinite);
    return list.length ? Math.round(list.reduce((sum,item)=>sum+item,0)/list.length) : 0;
  }

  function progressFor(ids) {
    const progress = currentUser?.progreso || {};
    return average(ids.map(id => clamp(progress[id], 0, 100, 0)));
  }

  function overallProgress() {
    const values = Object.values(currentUser?.progreso || {}).map(value=>clamp(value,0,100,0));
    return values.length ? average(values) : 0;
  }

  function totalAchievements() { return achievements().filter(item=>item.unlocked).length; }

  function achievements() {
    const exercises = Math.max(0, Number(currentUser?.ejercicios) || 0);
    const streak = Math.max(0, Number(currentUser?.racha) || 0);
    const precision = Math.max(0, Number(currentUser?.precision) || 0);
    const visits = Object.keys(state.featureVisits || {}).length;
    const progress = overallProgress();
    return [
      {id:"first",icon:"🚀",title:"Primer paso",unlocked:exercises>0,color:"#6d62f2"},
      {id:"streak",icon:"🔥",title:"Racha 3",unlocked:streak>=3,color:"#f2a64b"},
      {id:"precision",icon:"🎯",title:"Precisión 70",unlocked:precision>=70,color:"#39b894"},
      {id:"explorer",icon:"🧭",title:"Explorador",unlocked:visits>=5,color:"#3d9ee8"},
      {id:"boss",icon:"👾",title:"Cazajefes",unlocked:state.bossDamage>=100,color:"#ec6a9d"},
      {id:"escape",icon:"🔐",title:"Código abierto",unlocked:state.escapeWins>0,color:"#d99036"},
      {id:"future",icon:"✉",title:"Meta futura",unlocked:Boolean(state.capsule?.message),color:"#8665f5"},
      {id:"master",icon:"🏆",title:"Dominio 25",unlocked:progress>=25,color:"#45bca9"}
    ];
  }

  function setText(id, value) { const node = document.getElementById(id); if (node) node.textContent = String(value); }

  function renderHeader() {
    const xp = Math.max(0, Number(currentUser?.xp) || 0);
    const level = Math.max(1, Number(currentUser?.nivel) || Math.floor(xp/500)+1);
    const streak = Math.max(0, Number(currentUser?.racha) || 0);
    const completedToday = currentUser?.ultimoDiaEstudio === localDate();
    const progress = completedToday ? 100 : Math.min(80, Math.round((Number(currentUser?.ejercicios)||0)%10*10));
    const moodText = {curiosa:"Lista para descubrir algo nuevo",valiente:"Lista para superar un desafío",tranquila:"Lista para avanzar sin presión",eléctrica:"Lista para una misión rápida"}[state.mascot.mood];
    setText("universe-level", level);
    setText("universe-xp", xp.toLocaleString("es-PE"));
    setText("universe-streak", streak);
    setText("universe-badges", totalAchievements());
    setText("universe-mascot-name", state.mascot.name);
    setText("universe-mascot-mood", moodText);
    setText("universe-daily-title", completedToday ? "¡Misión diaria completada!" : "Completa una lección corta");
    setText("universe-daily-note", completedToday ? "Tu avance de hoy ya quedó registrado." : "Solo necesitas unos minutos para avanzar.");
    setText("universe-daily-percent", `${progress}%`);
    const bar = document.getElementById("universe-daily-bar"); if (bar) bar.style.width = `${progress}%`;
  }

  function renderMap() {
    const values = {
      math:progressFor(WORLD_GROUPS.math),
      words:progressFor(WORLD_GROUPS.words),
      science:progressFor(WORLD_GROUPS.science),
      society:progressFor(WORLD_GROUPS.society)
    };
    Object.entries(values).forEach(([key,value])=>setText(`universe-world-${key}`, `${value}% dominado`));
    const total = average(Object.values(values));
    setText("universe-map-progress", `${total}% explorado`);
    setText("universe-base-copy", total ? `${total}% del mapa explorado` : "Comienza tu primera misión");
    const health = Math.max(0, 100 - Math.max(state.bossDamage, Math.min(100, Number(currentUser?.respuestasCorrectas)||0)));
    const bar = document.getElementById("universe-boss-health"); if (bar) bar.style.width = `${health}%`;
    setText("universe-boss-copy", health ? `${health}% energía` : "Jefe derrotado");
  }

  function renderProjection() {
    const slider = document.getElementById("universe-minutes");
    const minutes = clamp(slider?.value ?? state.sessionMinutes, 5, 90, 20);
    state.sessionMinutes = minutes;
    const base = overallProgress();
    const consistency = Math.min(18, Math.max(0, Number(currentUser?.racha)||0) * .8);
    const projected = Math.min(98, Math.round(base + Math.sqrt(minutes) * 2.25 + consistency));
    setText("universe-minutes-output", `${minutes} min`);
    setText("universe-future-score", `${projected}%`);
    setText("universe-future-copy", `Escenario orientativo: ${minutes} minutos diarios podrían llevar tu cobertura de ${base}% a cerca de ${projected}% en 30 días. No es una garantía de puntaje.`);
  }

  function renderCity() {
    const progress = overallProgress();
    const exercises = Math.max(0, Number(currentUser?.ejercicios)||0);
    const level = progress >= 70 ? 4 : progress >= 40 ? 3 : progress >= 15 ? 2 : 1;
    const names = ["Villa Inicial","Distrito Curioso","Ciudad del Progreso","Metrópoli Académica"];
    setText("universe-city-name", names[level-1]);
    setText("universe-city-copy", level === 1 ? "Cada tema dominado construye una parte de tu ciudad." : `${exercises.toLocaleString("es-PE")} ejercicios y ${progress}% de cobertura están haciendo crecer tu ciudad.`);
    document.querySelectorAll("#universe-city-scene i").forEach((building,index)=>{
      building.style.opacity = index < level ? "1" : ".18";
      building.style.transform = index < level ? "translateY(0)" : "translateY(22px)";
    });
  }

  function renderPassport() {
    const root = document.getElementById("universe-passport");
    if (!root) return;
    root.innerHTML = achievements().slice(0,6).map(item=>`<span class="universe-stamp${item.unlocked?" unlocked":""}" style="--stamp-color:${item.color}"><span>${item.icon}</span><b>${escapeHTML(item.title)}</b></span>`).join("");
  }

  function renderCapsule() {
    const capsule = state.capsule;
    if (!capsule?.message) return setText("universe-capsule-copy", "Guarda una meta y vuelve a leerla más adelante.");
    const date = capsule.openDate ? new Date(`${capsule.openDate}T12:00:00`).toLocaleDateString("es-PE",{day:"numeric",month:"long",year:"numeric"}) : "más adelante";
    setText("universe-capsule-copy", `Tu cápsula está guardada para el ${date}.`);
  }

  function renderFilters() {
    const root = document.getElementById("universe-filters");
    if (!root) return;
    root.innerHTML = CATEGORIES.map(([id,label])=>`<button type="button" class="${id===activeCategory?"active":""}" data-universe-filter="${id}">${escapeHTML(label)}</button>`).join("");
  }

  function renderJourneys() {
    const root = document.getElementById("universe-journey-grid");
    if (!root) return;
    root.innerHTML = JOURNEYS.map(journey => {
      const items = journey.features.map(id => FEATURES.find(feature => feature.id === id)).filter(Boolean);
      const primary = items[0];
      const secondary = items.slice(1);
      return `<article class="universe-journey-card journey-${journey.id}" style="--journey-color:${journey.color}">
        <header><span aria-hidden="true">${journey.icon}</span><div><small>${escapeHTML(journey.eyebrow)}</small><h3>${escapeHTML(journey.title)}</h3></div></header>
        <p>${escapeHTML(journey.description)}</p>
        <button class="universe-journey-primary" type="button" data-universe-feature="${primary.id}"><i aria-hidden="true">${primary.icon}</i><span><small>RECOMENDADO</small><b>${escapeHTML(primary.title)}</b></span><em>Empezar →</em></button>
        <div class="universe-journey-options">${secondary.map(feature => `<button type="button" data-universe-feature="${feature.id}"><span aria-hidden="true">${feature.icon}</span>${escapeHTML(feature.title)}</button>`).join("")}</div>
      </article>`;
    }).join("");
  }

  function setFeatureLibrary(open, options = {}) {
    libraryOpen = Boolean(open);
    const library = document.getElementById("universe-library");
    const toggle = document.getElementById("universe-toggle-all");
    if (library) library.hidden = !libraryOpen;
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(libraryOpen));
      const label = toggle.querySelector("span");
      const icon = toggle.querySelector("i");
      if (label) label.textContent = libraryOpen ? "Ocultar biblioteca" : `Explorar las ${FEATURES.length} ideas`;
      if (icon) icon.textContent = libraryOpen ? "−" : "＋";
      toggle.classList.toggle("open", libraryOpen);
    }
    if (libraryOpen) {
      renderFilters();
      renderFeatures();
      if (options.focus) window.setTimeout(() => document.getElementById("universe-search")?.focus(), 80);
    }
  }

  function renderFeatures() {
    const root = document.getElementById("universe-feature-grid");
    if (!libraryOpen) { if (root) root.innerHTML = ""; return; }
    const query = cleanText(document.getElementById("universe-search")?.value, 80).toLocaleLowerCase("es");
    if (!root) return;
    const filtered = FEATURES.filter(feature => (activeCategory === "all" || feature.category === activeCategory) && (!query || `${feature.title} ${feature.description}`.toLocaleLowerCase("es").includes(query)));
    root.innerHTML = filtered.length ? filtered.map((feature,index)=>`<button class="universe-feature-card" type="button" data-universe-feature="${feature.id}" style="--feature-color:${["#765ff2","#38bfa8","#e7983b","#e96599","#349bdc"][index%5]}"><i>${feature.icon}</i><span><b>${escapeHTML(feature.title)}</b><small>${escapeHTML(feature.description)}</small></span><em>›</em></button>`).join("") : '<div class="universe-empty">No encontré una función con ese nombre.</div>';
  }

  function renderAll() {
    if (!document.getElementById("universo")) return;
    renderHeader(); renderMap(); renderProjection(); renderCity(); renderPassport(); renderCapsule(); renderJourneys();
    if (libraryOpen) { renderFilters(); renderFeatures(); }
  }

  async function refreshUser() {
    try { currentUser = await window.obtenerUsuarioActivo?.(); } catch (_) { currentUser = window.obtenerUsuarioCache?.() || null; }
    renderAll();
  }

  function createDialog() {
    if (document.getElementById("universe-dialog-layer")) return;
    const layer = document.createElement("div");
    layer.id = "universe-dialog-layer";
    layer.className = "universe-dialog-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<section class="universe-dialog" role="dialog" aria-modal="true" aria-labelledby="universe-dialog-title"><header class="universe-dialog-head"><div><span id="universe-dialog-kicker">UNIVERSO UNIPREP</span><h2 id="universe-dialog-title">Explorar función</h2></div><button class="universe-dialog-close" type="button" data-universe-close aria-label="Cerrar">×</button></header><div class="universe-dialog-body" id="universe-dialog-body"></div></section>';
    layer.addEventListener("pointerdown", event=>{ if (event.target === layer) closeDialog(); });
    layer.querySelector("[data-universe-close]")?.addEventListener("click", closeDialog);
    layer.addEventListener("submit", handleDialogSubmit);
    layer.addEventListener("click", handleDialogClick);
    document.body.appendChild(layer);
  }

  function openDialog(title, kicker, content) {
    createDialog();
    previousFocus = document.activeElement;
    setText("universe-dialog-title", title);
    setText("universe-dialog-kicker", kicker || "UNIVERSO UNIPREP");
    const body = document.getElementById("universe-dialog-body"); if (body) body.innerHTML = content;
    const layer = document.getElementById("universe-dialog-layer");
    layer?.classList.add("open"); layer?.setAttribute("aria-hidden","false");
    document.body.style.setProperty("overflow","hidden");
    setTimeout(()=>layer?.querySelector("input, textarea, select, button")?.focus(),40);
  }

  function closeDialog() {
    const layer = document.getElementById("universe-dialog-layer");
    if (!layer?.classList.contains("open")) return;
    layer.classList.remove("open"); layer.setAttribute("aria-hidden","true");
    document.body.style.removeProperty("overflow");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  function genericDialog(feature) {
    const category = CATEGORIES.find(item=>item[0]===feature.category)?.[1] || "Idea";
    openDialog(feature.title, `${category} · VISTA PREVIA`, `<p>${escapeHTML(feature.description)}</p><div class="universe-dialog-callout"><b>Cómo encajaría:</b> esta función viviría dentro de Universo UniPrep o del módulo relacionado; no añadiría otro botón a la barra principal.</div><div class="universe-dialog-feature-list"><span>✓ Diseño amigable</span><span>✓ Uso voluntario</span><span>✓ Respaldo local</span><span>✓ Preparado para sincronizar</span></div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Entendido</button><button class="primary" type="button" data-dialog-action="suggest">Guardar como idea favorita</button></div>`);
  }

  function openFeature(id) {
    const feature = FEATURES.find(item=>item.id===id);
    if (!feature) return;
    state.featureVisits[id] = (Number(state.featureVisits[id])||0)+1;
    saveState("feature_opened", {feature:id});
    renderPassport(); renderHeader();
    runAction(feature.action, feature);
  }

  function runAction(action, feature = null) {
    if (action === "continue") { closeDialog(); return window.continuarRutaUniPrep?.(); }
    if (action === "diagnostic") { closeDialog(); return window.iniciarSimulacroTipo?.("diagnostico_20"); }
    if (action === "quick") { closeDialog(); return startQuickMission(5); }
    if (action === "errors") { closeDialog(); return window.iniciarColeccionPractica?.("errores"); }
    if (action === "career") {
      closeDialog();
      if (typeof window.abrirCentroVocacional === "function") return window.abrirCentroVocacional(null);
      return window.go?.("vocacional",null);
    }
    if (action === "focus") { closeDialog(); return window.abrirEnfoqueHyperdrive?.(); }
    if (action === "map") { closeDialog(); document.getElementById("universe-map")?.scrollIntoView({behavior:"smooth",block:"center"}); return; }
    if (action === "city" || action === "garden") { closeDialog(); document.querySelector(".universe-city-card")?.scrollIntoView({behavior:"smooth",block:"center"}); toast(action === "garden" ? "Tu jardín crecerá con cada tema dominado." : "Tu ciudad refleja tu avance académico real."); return; }
    if (action === "future") { closeDialog(); document.querySelector(".universe-future-card")?.scrollIntoView({behavior:"smooth",block:"center"}); return; }
    if (action === "boss") return showBoss();
    if (action === "escape") return showEscape();
    if (action === "survival") return showSurvival();
    if (action === "mascot") return showMascot();
    if (action === "capsule") return showCapsule();
    if (action === "passport") return showPassport();
    if (action === "session") return showSession();
    if (action === "calm" || action === "mood" || action === "break") return showWellbeing(action);
    if (["teach","debate","easy","scan","scan-object","expo","rival","project","profession","future-letter","news"].includes(action)) return openTutorAction(action);
    if (action === "radio") return playRadio();
    if (action === "shield") return claimShield();
    if (action === "weekly") return showWeekly();
    if (action === "mystery") return showMystery();
    if (action === "impossible") return showImpossible();
    return genericDialog(feature || {title:"Nueva función",description:"Vista previa de una futura experiencia UniPrep.",category:"world"});
  }

  function nextCourseId() {
    const courses = Object.values(window.CURSOS_PREUNI || {}).filter(item=>item?.id && window.cursoPermitidoAdmision?.(item.id)!==false);
    if (!courses.length) return "rm";
    return [...courses].sort((a,b)=>(Number(window.pesoCursoAdmision?.(b.id))||1)*(100-clamp(currentUser?.progreso?.[b.id],0,100,0))-(Number(window.pesoCursoAdmision?.(a.id))||1)*(100-clamp(currentUser?.progreso?.[a.id],0,100,0)))[0]?.id || "rm";
  }

  function startQuickMission(amount = 5) {
    const courseId = nextCourseId();
    if (typeof window.iniciarPracticaCursoNivel === "function") return window.iniciarPracticaCursoNivel(courseId,"todos",amount);
    return window.abrirCentroPractica?.(null);
  }

  function showBoss() {
    const health = Math.max(0,100-state.bossDamage);
    openDialog("El Guardián del Examen", "JEFE SEMANAL", `<p>Resuelve una ronda del curso que UniPrep considera prioritario. Cada respuesta correcta contribuirá a reducir la energía del jefe.</p><div class="universe-puzzle"><strong>${health}%</strong><span>energía restante</span></div><div class="universe-dialog-callout">La batalla no bloquea cursos ni castiga errores. Es una capa motivadora sobre la práctica real.</div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Ahora no</button><button class="primary" type="button" data-dialog-action="boss-start">Comenzar ronda</button></div>`);
  }

  function showSurvival() {
    openDialog("Modo supervivencia", "DESAFÍO OPCIONAL", '<p>Entrarás a una práctica rápida con tres oportunidades visuales. Esta demostración utiliza el banco real y conserva las explicaciones al terminar.</p><div class="universe-puzzle"><strong>♥ ♥ ♥</strong><span>tres oportunidades · sin penalización de XP</span></div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cancelar</button><button class="primary" type="button" data-dialog-action="survival-start">Probar ronda</button></div>');
  }

  function showEscape() {
    const a = 3 + Math.floor(Math.random()*6), b = 2 + Math.floor(Math.random()*7), c = 2 + Math.floor(Math.random()*4);
    puzzleAnswer = (a+b)*c;
    openDialog("El código perdido", "SALA DE ESCAPE · DEMO FUNCIONAL", `<p>Primera cerradura: resuelve la operación respetando los paréntesis.</p><form class="universe-dialog-form" data-dialog-form="escape"><div class="universe-puzzle"><strong>(${a} + ${b}) × ${c}</strong><span>Escribe el código correcto</span></div><label>Código<input name="answer" type="number" inputmode="numeric" required autocomplete="off"></label><div class="universe-puzzle-feedback" id="universe-puzzle-feedback" role="status"></div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Salir</button><button class="primary" type="submit">Probar código</button></div></form>`);
  }

  function showMascot() {
    openDialog("Personaliza a tu compañera", "COMPAÑERA UNIPREP", `<p>La compañera anima y orienta; nunca interrumpe ni castiga al estudiante.</p><form class="universe-dialog-form" data-dialog-form="mascot"><label>Nombre<input name="name" maxlength="18" value="${escapeHTML(state.mascot.name)}" required></label><label>Personalidad<select name="mood"><option value="curiosa"${state.mascot.mood==="curiosa"?" selected":""}>Curiosa</option><option value="valiente"${state.mascot.mood==="valiente"?" selected":""}>Valiente</option><option value="tranquila"${state.mascot.mood==="tranquila"?" selected":""}>Tranquila</option><option value="eléctrica"${state.mascot.mood==="eléctrica"?" selected":""}>Eléctrica</option></select></label><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cancelar</button><button class="primary" type="submit">Guardar compañera</button></div></form>`);
  }

  function showCapsule() {
    const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
    openDialog("Cápsula del tiempo", "MENSAJE PARA TU FUTURO", `<p>Escribe una meta personal. Solo tú podrás verla desde tu cuenta.</p><form class="universe-dialog-form" data-dialog-form="capsule"><label>Mi mensaje<textarea name="message" maxlength="500" required placeholder="Quiero recordar que…">${escapeHTML(state.capsule?.message || "")}</textarea></label><label>Abrir desde<input name="openDate" type="date" min="${tomorrow}" value="${escapeHTML(state.capsule?.openDate || tomorrow)}" required></label><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cancelar</button><button class="primary" type="submit">Guardar cápsula</button></div></form>`);
  }

  function showPassport() {
    const items = achievements();
    openDialog("Pasaporte académico", "TUS LOGROS REALES", `<p>Los sellos reconocen constancia y mejora. No reemplazan una calificación académica.</p><div class="universe-dialog-feature-list">${items.map(item=>`<span>${item.unlocked?"✓":"○"} ${item.icon} <b>${escapeHTML(item.title)}</b></span>`).join("")}</div><div class="universe-dialog-actions"><button class="primary" type="button" data-dialog-action="close">Seguir avanzando</button></div>`);
  }

  function showSession() {
    openDialog("Meta de la sesión", "ESTUDIA A TU RITMO", `<p>Elige cuánto tiempo tienes hoy. UniPrep te recomendará una actividad alcanzable.</p><form class="universe-dialog-form" data-dialog-form="session"><label>Tiempo disponible<select name="minutes"><option value="10">10 minutos · misión corta</option><option value="20"${state.sessionMinutes===20?" selected":""}>20 minutos · aprender y practicar</option><option value="30">30 minutos · sesión completa</option><option value="45">45 minutos · concentración profunda</option></select></label><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cancelar</button><button class="primary" type="submit">Crear mi sesión</button></div></form>`);
  }

  function showWellbeing(action) {
    const title = action === "mood" ? "¿Cómo te sientes hoy?" : action === "break" ? "Pausa inteligente" : "Modo calma";
    const text = action === "mood" ? "Elige una intensidad para adaptar la sesión. Esta función no realiza diagnósticos de salud." : action === "break" ? "Una pausa breve puede ayudarte a volver con mayor atención." : "Respira lentamente: inhala durante cuatro segundos y exhala durante seis.";
    openDialog(title, "BIENESTAR SIN PRESIÓN", `<p>${text}</p><div class="universe-puzzle"><strong>${action === "mood" ? "☺" : action === "break" ? "05:00" : "4 · 6"}</strong><span>${action === "mood" ? "suave · normal · intenso" : action === "break" ? "pausa sugerida" : "inhalar · exhalar"}</span></div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cerrar</button><button class="primary" type="button" data-dialog-action="focus-open">Abrir concentración</button></div>`);
  }

  function showWeekly() {
    const progress = overallProgress(), errors = storage().leer?.("uniprep_practice_errors_v1",[]) || [];
    openDialog("Tu semana en UniPrep", "RESUMEN PERSONAL", `<p>Resumen calculado con los datos disponibles de tu cuenta.</p><div class="universe-dialog-feature-list"><span><b>${Number(currentUser?.ejercicios||0).toLocaleString("es-PE")}</b> ejercicios acumulados</span><span><b>${Number(currentUser?.precision||0).toFixed(0)}%</b> de precisión</span><span><b>${progress}%</b> de cobertura media</span><span><b>${Array.isArray(errors)?errors.length:0}</b> errores por repasar</span></div><div class="universe-dialog-callout">Siguiente recomendación: refuerza ${escapeHTML(nextCourseId().toUpperCase())} con una misión breve.</div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cerrar</button><button class="primary" type="button" data-dialog-action="quick-start">Practicar ahora</button></div>`);
  }

  function showMystery() {
    const secret = ["AMAZONÍA","CONSTANCIA","INGENIO","FUTURO"][new Date().getDate()%4];
    openDialog("Pregunta misteriosa", "RETO DEL DÍA", `<p>La palabra secreta de hoy comienza con <b>${secret[0]}</b> y tiene <b>${secret.length}</b> letras. Completa una práctica para agregarla a tu colección.</p><div class="universe-puzzle"><strong>${secret[0]}${"·".repeat(Math.max(0,secret.length-1))}</strong><span>colección diaria</span></div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Después</button><button class="primary" type="button" data-dialog-action="quick-start">Resolver misión</button></div>`);
  }

  function showImpossible() {
    openDialog("Modo imposible", "DIFICULTAD MÁXIMA · OPCIONAL", '<p>Una ronda avanzada para estudiantes que desean exigirse. Las explicaciones siguen disponibles y fallar no reduce XP.</p><div class="universe-dialog-callout">UniPrep nunca presenta una pregunta de entrenamiento como examen oficial.</div><div class="universe-dialog-actions"><button type="button" data-dialog-action="close">Cancelar</button><button class="primary" type="button" data-dialog-action="impossible-start">Aceptar desafío</button></div>');
  }

  function openTutorAction(action) {
    const prompts = {
      teach:"Voy a explicarte un tema con mis propias palabras. Hazme preguntas para comprobar si realmente lo entendí.",
      debate:"Propón un tema educativo debatible, adopta una postura contraria y evalúa la calidad de mis argumentos con respeto.",
      easy:"Explícame el tema que te indique con palabras sencillas, una analogía y un ejemplo paso a paso.",
      scan:"Quiero adjuntar una foto de mis apuntes. Ayúdame a convertirla en resumen, conceptos y preguntas de repaso.",
      "scan-object":"Quiero adjuntar la foto de un objeto cotidiano. Explícame qué conceptos de ciencia o matemática puedo aprender con él.",
      expo:"Ayúdame a preparar y ensayar una exposición. Pregúntame el tema, duración y público, y luego evalúa mi estructura.",
      rival:"Actúa como un rival amistoso de estudio: proponme un reto breve, espera mi respuesta y dame retroalimentación.",
      project:"Ayúdame a transformar una idea de proyecto en problema, objetivo, metodología, evidencia y plan de presentación.",
      profession:"Simula una situación sencilla de una profesión relacionada con mis intereses y déjame tomar una decisión.",
      "future-letter":"Ayúdame a escribir una carta breve y realista de mi yo universitario para recordar por qué estudio.",
      news:"Convierte una noticia educativa o científica que yo te indique en resumen, vocabulario y tres preguntas críticas."
    };
    closeDialog();
    if (typeof window.abrirTutorConContexto === "function") {
      return window.abrirTutorConContexto({modo:"socratico",pregunta:prompts[action] || "Ayúdame con esta actividad educativa."});
    }
    return window.abrirTutorAcademico?.(null);
  }

  function playRadio() {
    const messages = [
      "Consejo UniPrep: estudiar veinte minutos con atención puede ser más útil que una hora llena de distracciones.",
      "Curiosidad: explicar un tema con tus propias palabras ayuda a detectar lo que todavía no comprendes.",
      "Misión rápida: elige un error antiguo, resuélvelo otra vez y escribe por qué te equivocaste."
    ];
    window.leerTextoUniPrep?.(messages[new Date().getDate()%messages.length]);
    toast("Radio UniPrep está reproduciendo el consejo del día.");
  }

  function claimShield() {
    const key = `shield-${weekKey()}`;
    if (state.unlocked.includes(key)) return toast("Ya recibiste tu protector de racha de esta semana.");
    state.shields = Math.min(5,state.shields+1); state.unlocked.push(key); saveState("shield_claimed",{week:weekKey()});
    toast(`Protector guardado. Ahora tienes ${state.shields}.`); renderPassport();
  }

  function handleDialogSubmit(event) {
    const form = event.target.closest("[data-dialog-form]"); if (!form) return;
    event.preventDefault();
    const data = new FormData(form), type = form.dataset.dialogForm;
    if (type === "escape") {
      const answer = Number(data.get("answer")); const feedback = document.getElementById("universe-puzzle-feedback");
      if (answer !== puzzleAnswer) { if (feedback) feedback.textContent = "La cerradura no abrió. Revisa primero el paréntesis."; return; }
      state.escapeWins += 1; if (!state.unlocked.includes("escape")) state.unlocked.push("escape"); saveState("escape_completed",{wins:state.escapeWins});
      if (feedback) feedback.textContent = "✓ ¡Código correcto! La primera cerradura se abrió.";
      toast("Sala superada. Ganaste el sello Código abierto."); renderAll();
      return;
    }
    if (type === "mascot") {
      state.mascot = {name:cleanText(data.get("name"),18)||"Nuna",mood:cleanText(data.get("mood"),20)}; saveState("mascot_updated",{mood:state.mascot.mood}); closeDialog(); renderHeader(); toast("Tu compañera quedó personalizada."); return;
    }
    if (type === "capsule") {
      state.capsule = {message:cleanText(data.get("message"),500),openDate:cleanText(data.get("openDate"),10),createdAt:new Date().toISOString()}; saveState("capsule_saved",{openDate:state.capsule.openDate}); closeDialog(); renderAll(); toast("Cápsula guardada de forma privada."); return;
    }
    if (type === "session") {
      state.sessionMinutes = clamp(data.get("minutes"),5,90,20); saveState("session_goal_saved",{minutes:state.sessionMinutes}); closeDialog(); renderProjection(); toast(`Sesión de ${state.sessionMinutes} minutos preparada.`); return;
    }
  }

  function handleDialogClick(event) {
    const button = event.target.closest("[data-dialog-action]"); if (!button) return;
    const action = button.dataset.dialogAction;
    if (action === "close") return closeDialog();
    if (action === "suggest") { const id = Object.keys(state.featureVisits).sort((a,b)=>state.featureVisits[b]-state.featureVisits[a])[0]; if (id && !state.unlocked.includes(`idea:${id}`)) state.unlocked.push(`idea:${id}`); saveState("idea_favorited",{feature:id}); closeDialog(); return toast("Idea guardada como favorita."); }
    if (action === "boss-start") { state.bossDamage = Math.min(100,state.bossDamage+20); saveState("boss_round_started",{damage:20}); closeDialog(); renderMap(); return startQuickMission(10); }
    if (action === "survival-start") { closeDialog(); return startQuickMission(10); }
    if (action === "quick-start") { closeDialog(); return startQuickMission(5); }
    if (action === "impossible-start") {
      closeDialog();
      const course = nextCourseId();
      if (typeof window.iniciarPracticaCursoNivel === "function") return window.iniciarPracticaCursoNivel(course, "avanzado", 10);
      return window.abrirCentroPractica?.(null);
    }
    if (action === "focus-open") { closeDialog(); return window.abrirEnfoqueHyperdrive?.(); }
  }

  function handleScreenClick(event) {
    const planet = event.target.closest("[data-universe-planet]");
    if (planet) {
      const courseId = planet.dataset.universePlanet;
      saveState("world_opened", { courseId });
      if (typeof window.abrirCurso === "function") return window.abrirCurso(courseId, 0);
      return window.go?.("cursos", null);
    }
    const feature = event.target.closest("[data-universe-feature]"); if (feature) return openFeature(feature.dataset.universeFeature);
    const action = event.target.closest("[data-universe-action]"); if (action) return runAction(action.dataset.universeAction);
    const toggle = event.target.closest("[data-universe-toggle]"); if (toggle) return setFeatureLibrary(!libraryOpen, {focus:!libraryOpen});
    const filter = event.target.closest("[data-universe-filter]"); if (filter) { activeCategory = filter.dataset.universeFilter; renderFilters(); renderFeatures(); }
  }

  async function openUniverse() {
    window.go?.("universo",null);
    await refreshUser();
  }

  function initialize() {
    const screen = document.getElementById("universo"); if (!screen) return;
    createDialog(); setFeatureLibrary(false); renderAll(); refreshUser();
    screen.addEventListener("click",handleScreenClick);
    document.getElementById("universe-search")?.addEventListener("input",renderFeatures);
    document.getElementById("universe-minutes")?.addEventListener("input",()=>{ renderProjection(); clearTimeout(saveTimer); saveTimer=setTimeout(()=>saveState("projection_adjusted",{minutes:state.sessionMinutes}),500); });
    document.addEventListener("keydown",event=>{ if (event.key === "Escape") closeDialog(); });
    document.addEventListener("uniprep:user-ready",event=>{ currentUser=event.detail?.user || null; state=loadLocalState(); renderAll(); syncFromCloud(); });
    document.addEventListener("uniprep:storage-scope-change",()=>{ state=loadLocalState(); refreshUser(); syncFromCloud(); });
    document.addEventListener("uniprep:admission-change",refreshUser);
  }

  window.abrirUniversoUniPrep = openUniverse;
  window.actualizarUniversoUniPrep = refreshUser;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",initialize,{once:true}); else initialize();
})();
