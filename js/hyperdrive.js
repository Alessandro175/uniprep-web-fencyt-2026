// =========================================================
// UNIPREP 2 · HYPERDRIVE UNIVERSE 2026.23
// Centro de comandos, rendimiento adaptativo y modo Hacker.
// =========================================================
(function () {
  "use strict";

  const DEFAULTS = Object.freeze({quality:"auto", hacker:false, sound:false, cursor:true, hud:true});
  const ROUTES = [
    {id:"home", icon:"⌂", title:"Tu ruta de hoy", detail:"Misión, racha y siguiente paso", keys:"Alt+H"},
    {id:"universo", icon:"✦", title:"Universo UniPrep", detail:"Mundos, misiones y laboratorio de ideas", keys:""},
    {id:"cursos", icon:"▦", title:"Aprender", detail:"Cursos, temas, teoría y progreso", keys:"Alt+C"},
    {id:"ejercicios", icon:"◎", title:"Practicar", detail:"Preguntas por curso y nivel", keys:"Alt+P", special:"practice"},
    {id:"formulas", icon:"ƒ", title:"Fórmulas y repaso", detail:"Consulta rápida antes de practicar", keys:"Alt+F"},
    {id:"biblioteca", icon:"▤", title:"Biblioteca", detail:"Colecciones y materiales de tu ruta", keys:""},
    {id:"exams", icon:"◫", title:"Comprueba tu avance", detail:"Diagnósticos, retos y simulacros", keys:"Alt+E"},
    {id:"ranking", icon:"♛", title:"Ranking", detail:"Día, semana, mes, región y Perú", keys:"Alt+R"},
    {id:"agenda", icon:"□", title:"Organiza tu estudio", detail:"Agenda y horario semanal", keys:"Alt+A"},
    {id:"vocacional", icon:"◇", title:"Descubre tu carrera", detail:"Orientación, carreras y universidades", keys:"Alt+V", special:"vocational"},
    {id:"tutor", icon:"✦", title:"Tutor Uni", detail:"Consulta libre, voz, foto y materiales", keys:"Alt+U", special:"tutor"},
    {id:"perfil", icon:"◉", title:"Mi perfil", detail:"Foto, estadísticas y resultados", keys:"Alt+M"},
    {id:"notificaciones", icon:"●", title:"Notificaciones", detail:"Avisos y logros recientes", keys:""}
  ];
  const SHORTCUTS = [
    ["Ctrl/⌘ + K", "Abrir el Centro de Comandos"],
    ["Ctrl/⌘ + `", "Abrir la Terminal UniPrep"],
    ["Ctrl/⌘ + Shift + H", "Activar o desactivar Modo Hacker"],
    ["Ctrl/⌘ + Shift + F", "Abrir Cabina de Concentración"],
    ["Alt + H / C / P", "Inicio, Cursos o Práctica"],
    ["Alt + U / E / R", "Tutor IA, Simulacros o Ranking"],
    ["↑ / ↓ + Enter", "Recorrer y ejecutar un comando"],
    ["Escape", "Cerrar cualquier panel Hyperdrive"]
  ];

  let prefs = {...DEFAULTS};
  let motionReduced = false;
  let resolvedQuality = "balanced";
  let commandTab = "commands";
  let selectedIndex = 0;
  let visibleCommands = [];
  let matrix = null;
  let audioContext = null;
  let decorateQueued = false;
  let aiAvailable = null;
  let lastPointerFrame = 0;
  const focus = {duration:25*60, remaining:25*60, deadline:0, timer:0, running:false};
  const terminalLines = [
    '<b>UNIPREP NEURAL TERMINAL · 2026.23 UNIVERSE</b>',
    '<span class="muted">Escribe help para ver los comandos disponibles.</span>'
  ];

  function esc(value) {
    const node = document.createElement("div");
    node.textContent = String(value ?? "");
    return node.innerHTML;
  }

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function readPrefs() {
    const visual = window.UniprepUGEL?.obtenerPreferencias?.() || {};
    const source = visual.hyperdrive;
    motionReduced = Boolean(visual.reducirMovimiento);
    prefs = {
      quality:["auto","lite","balanced","ultra"].includes(source?.quality) ? source.quality : DEFAULTS.quality,
      hacker:Boolean(source?.hacker), sound:Boolean(source?.sound),
      cursor:source?.cursor !== false, hud:source?.hud !== false
    };
    return prefs;
  }

  function deviceQuality() {
    if (prefs.quality !== "auto") return prefs.quality;
    const memory = Number(navigator.deviceMemory || 4);
    const cores = Number(navigator.hardwareConcurrency || 4);
    const saveData = Boolean(navigator.connection?.saveData);
    const reduced = motionReduced || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (saveData || reduced || memory <= 3 || cores <= 4) return "lite";
    if (window.innerWidth < 900 || memory < 8 || cores < 8) return "balanced";
    return "ultra";
  }

  function updatePrefs(patch) {
    prefs = {...prefs, ...patch};
    window.UniprepUGEL?.actualizarHyperdrive?.(prefs);
    applyPrefs();
  }

  function applyPrefs() {
    readPrefs();
    resolvedQuality = deviceQuality();
    if (!document.body) return;
    document.body.dataset.hyperQuality = resolvedQuality;
    const lightMode = document.documentElement.dataset.colorMode === "light" || document.body.dataset.colorMode === "light";
    const hackerVisible = prefs.hacker && !lightMode;
    document.body.dataset.hackerMode = String(hackerVisible);
    document.body.dataset.hyperCursor = String(prefs.cursor);
    document.body.dataset.hyperHud = String(prefs.hud);
    toggleMatrix(hackerVisible && !motionReduced);
    updateSystemUI();
  }

  function goTo(route) {
    closeCommandCenter();
    if (route.special === "practice") return typeof window.abrirCentroPractica === "function" ? window.abrirCentroPractica(null) : window.go?.("ejercicios", null);
    if (route.special === "tutor") return typeof window.abrirTutorAcademico === "function" ? window.abrirTutorAcademico(null) : window.go?.("tutor", null);
    if (route.special === "vocational") return typeof window.abrirCentroVocacional === "function" ? window.abrirCentroVocacional(null) : window.go?.("vocacional", null);
    return window.go?.(route.id, null);
  }

  function actionCommands() {
    return [
      {id:"command", category:"ACCIONES RÁPIDAS", icon:"⌘", title:"Centro de comandos", detail:"Busca cualquier módulo, curso o herramienta", keys:"Ctrl+K", run:()=>openCommandCenter("commands")},
      {id:"focus", category:"ACCIONES RÁPIDAS", icon:"◷", title:"Cabina de concentración", detail:"Temporizador global de 15, 25 o 45 minutos", keys:"Ctrl+Shift+F", run:openFocus},
      {id:"personalize", category:"ACCIONES RÁPIDAS", icon:"✺", title:"Fondos y apariencia", detail:"Modo, paleta, bordes, accesibilidad y efectos", keys:"", run:()=>{closeCommandCenter();window.abrirPersonalizacionUniPrep?.();}},
      {id:"hacker", category:"ACCIONES RÁPIDAS", icon:"</>", title:prefs.hacker?"Desactivar Modo Hacker":"Activar Modo Hacker", detail:"Terminal, lluvia de código y HUD verde", keys:"Ctrl+Shift+H", run:toggleHacker},
      {id:"terminal", category:"ACCIONES RÁPIDAS", icon:"$_", title:"Terminal UniPrep", detail:"Controla la plataforma mediante comandos", keys:"Ctrl+`", run:()=>openCommandCenter("terminal")},
      {id:"install", category:"ACCIONES RÁPIDAS", icon:"⇩", title:"Instalar UniPrep", detail:"Añade la plataforma como aplicación", keys:"", run:()=>{closeCommandCenter();window.instalarUniPrep?.();}},
      {id:"tutorial", category:"ACCIONES RÁPIDAS", icon:"?", title:"Misión guiada", detail:"Recorre las funciones principales", keys:"", run:()=>{closeCommandCenter();window.iniciarTutorialUniPrep?.({forzar:true});}},
      {id:"diag", category:"ENTRENAMIENTO", icon:"20", title:"Iniciar Diagnóstico 20", detail:"20 preguntas · 30 minutos", keys:"", run:()=>{closeCommandCenter();window.iniciarSimulacroTipo?.("diagnostico_20");}},
      {id:"express", category:"ENTRENAMIENTO", icon:"30", title:"Iniciar Reto Express", detail:"30 preguntas · 45 minutos", keys:"", run:()=>{closeCommandCenter();window.iniciarSimulacroTipo?.("reto_30");}},
      {id:"marathon", category:"ENTRENAMIENTO", icon:"100", title:"Iniciar Maratón Nacional", detail:"100 preguntas · 150 minutos", keys:"", run:()=>{closeCommandCenter();window.iniciarSimulacroTipo?.("maraton_100");}},
      {id:"shortcuts", category:"SISTEMA", icon:"⌨", title:"Ver atajos de teclado", detail:"Navega UniPrep como un experto", keys:"", run:()=>openCommandCenter("shortcuts")},
      {id:"quality", category:"SISTEMA", icon:"⚡", title:`Rendimiento: ${qualityLabel(resolvedQuality)}`, detail:prefs.quality==="auto"?"Se adapta automáticamente a tu dispositivo":"Perfil seleccionado manualmente", keys:"", run:cycleQuality}
    ];
  }

  function courseCommands() {
    return Object.values(window.CURSOS_PREUNI || {}).map(course => ({
      id:`course-${course.id}`, category:"CURSOS", icon:course.icono || "▦", title:course.nombre,
      detail:`Abrir ${course.temas?.length || 0} temas y continuar estudiando`, keys:"",
      keywords:`${course.id} ${course.descripcion || ""}`,
      run:()=>{closeCommandCenter();if(typeof window.abrirCurso==="function")window.abrirCurso(course.id,0);else window.go?.("cursos",null);}
    }));
  }

  function allCommands() {
    const routes = ROUTES.map(route=>({
      id:`route-${route.id}`, category:"NAVEGACIÓN", icon:route.icon, title:route.title, detail:route.detail,
      keys:route.keys, keywords:route.id, run:()=>goTo(route)
    }));
    return [...actionCommands(), ...routes, ...courseCommands()];
  }

  function qualityLabel(value) {
    return ({lite:"Ahorro",balanced:"Equilibrado",ultra:"Ultra"})[value] || "Automático";
  }

  function cycleQuality() {
    const values = ["auto","lite","balanced","ultra"];
    const next = values[(values.indexOf(prefs.quality)+1)%values.length];
    updatePrefs({quality:next});
    toast(`Rendimiento ${next === "auto" ? "automático" : qualityLabel(next)} activado.`);
    renderCommandContent();
  }

  function createAmbient() {
    if (document.querySelector(".hyper-ambient")) return;
    const ambient = document.createElement("div");
    ambient.className = "hyper-ambient";
    ambient.setAttribute("aria-hidden", "true");
    document.body.prepend(ambient);
  }

  function createSystemTrigger() {
    if (document.getElementById("hyper-system-trigger")) return;
    const topbar = document.querySelector(".topbar-actions");
    if (!topbar) return;
    const trigger = document.createElement("button");
    trigger.id = "hyper-system-trigger";
    trigger.className = "hyper-system-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-label", "Abrir Centro de Comandos UniPrep");
    trigger.innerHTML = '<i></i><span><b>HYPERDRIVE</b><small id="hyper-system-copy">Sistema listo</small></span><kbd>⌘ K</kbd>';
    trigger.addEventListener("click", ()=>openCommandCenter("commands"));
    topbar.insertBefore(trigger, topbar.firstChild);
  }

  function createMissionControl() {
    if (document.getElementById("hyper-mission-control")) return;
    const hero = document.querySelector("#home .welcome-banner");
    if (!hero) return;
    const panel = document.createElement("section");
    panel.id = "hyper-mission-control";
    panel.className = "hyper-mission-control";
    panel.setAttribute("aria-label", "Estado rápido de UniPrep");
    panel.innerHTML = `
      <article><i>✦</i><div><small>MISIÓN DE HOY</small><b>Avanza una pregunta más que ayer</b><span>La constancia gana a la improvisación.</span></div><button type="button" data-hyper-practice>Practicar</button></article>
      <article><i>⌘</i><div><small>COMANDOS</small><b>Ctrl + K</b><span>Todo UniPrep en segundos</span></div></article>
      <article><i>◉</i><div><small>SISTEMA</small><b id="hyper-mission-status">En línea</b><span id="hyper-mission-quality">Efectos adaptativos</span></div></article>
      <article><i>◷</i><div><small>HORA LOCAL</small><b id="hyper-mission-clock">--:--</b><span>Hora de tu dispositivo</span></div></article>`;
    panel.querySelector("[data-hyper-practice]")?.addEventListener("click",()=>{if(typeof window.abrirCentroPractica==="function")window.abrirCentroPractica(null);else window.go?.("ejercicios",null);});
    hero.insertAdjacentElement("afterend", panel);
  }

  function createCommandCenter() {
    if (document.getElementById("hyper-command-layer")) return;
    const layer = document.createElement("div");
    layer.id = "hyper-command-layer";
    layer.className = "hyper-command-layer";
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-label", "Centro de Comandos UniPrep");
    layer.innerHTML = `<section class="hyper-command-panel">
      <header class="hyper-command-head"><span class="hyper-command-brand">✦</span><label class="hyper-command-search"><input id="hyper-command-input" type="search" autocomplete="off" placeholder="¿Qué quieres abrir o hacer?" aria-label="Buscar comandos"><small>Busca módulos, cursos, IA, simulacros o escribe una acción</small></label><kbd>ESC</kbd></header>
      <nav class="hyper-command-tabs" aria-label="Vistas del centro de comandos"><button type="button" data-hyper-tab="commands">COMANDOS</button><button type="button" data-hyper-tab="terminal">TERMINAL</button><button type="button" data-hyper-tab="shortcuts">ATAJOS</button></nav>
      <main class="hyper-command-results" id="hyper-command-results"></main>
      <footer class="hyper-command-footer"><span><b><kbd>↑ ↓</kbd> navegar</b><b><kbd>ENTER</kbd> abrir</b><b><kbd>ESC</kbd> cerrar</b></span><em>UniPrep Hyperdrive · ${navigator.onLine?"online":"offline"}</em></footer>
    </section>`;
    layer.addEventListener("pointerdown", event=>{if(event.target===layer)closeCommandCenter();});
    layer.querySelectorAll("[data-hyper-tab]").forEach(button=>button.addEventListener("click",()=>{
      commandTab=button.dataset.hyperTab; selectedIndex=0; renderCommandContent();
    }));
    const input = layer.querySelector("#hyper-command-input");
    input.addEventListener("input",()=>{selectedIndex=0;renderCommandContent();});
    input.addEventListener("keydown",commandKeydown);
    document.body.appendChild(layer);
    renderCommandContent();
  }

  function openCommandCenter(tab="commands") {
    createCommandCenter();
    commandTab=tab;
    const layer=document.getElementById("hyper-command-layer");
    layer?.classList.add("open");
    document.body.style.setProperty("overflow","hidden");
    renderCommandContent();
    setTimeout(()=>{
      if(commandTab==="terminal")document.getElementById("hyper-terminal-input")?.focus();
      else document.getElementById("hyper-command-input")?.focus();
    },80);
  }

  function closeCommandCenter() {
    const layer=document.getElementById("hyper-command-layer");
    layer?.classList.remove("open");
    if(!document.getElementById("hyper-focus-layer")?.classList.contains("open"))document.body.style.removeProperty("overflow");
  }

  function renderCommandContent() {
    const root=document.getElementById("hyper-command-results");
    const layer=document.getElementById("hyper-command-layer");
    if(!root||!layer)return;
    layer.querySelectorAll("[data-hyper-tab]").forEach(button=>button.classList.toggle("active",button.dataset.hyperTab===commandTab));
    const search=layer.querySelector(".hyper-command-search");
    if(search)search.hidden=commandTab!=="commands";
    if(commandTab==="terminal")return renderTerminal(root);
    if(commandTab==="shortcuts")return renderShortcuts(root);
    const query=normalize(document.getElementById("hyper-command-input")?.value);
    visibleCommands=allCommands().filter(command=>!query||normalize(`${command.title} ${command.detail} ${command.keywords||""} ${command.category}`).includes(query)).slice(0,26);
    selectedIndex=Math.min(Math.max(0,selectedIndex),Math.max(0,visibleCommands.length-1));
    if(!visibleCommands.length){root.innerHTML='<div class="hyper-command-empty"><div><span>⌕</span><b>No encontré ese comando</b><p>Prueba con “IA”, “práctica”, “hacker”, “álgebra” o “simulacro”.</p></div></div>';return;}
    let last="";
    root.innerHTML=visibleCommands.map((command,index)=>{
      const group=command.category!==last?`<div class="hyper-command-group">${esc(command.category)}</div>`:"";
      last=command.category;
      return `${group}<button type="button" class="hyper-command-item ${index===selectedIndex?"selected":""}" data-hyper-index="${index}"><i>${esc(command.icon)}</i><span><b>${esc(command.title)}</b><small>${esc(command.detail)}</small></span><em>${esc(command.keys||"→")}</em></button>`;
    }).join("");
    root.querySelectorAll("[data-hyper-index]").forEach(button=>{
      button.addEventListener("mouseenter",()=>{selectedIndex=Number(button.dataset.hyperIndex)||0;paintSelection();});
      button.addEventListener("click",()=>visibleCommands[Number(button.dataset.hyperIndex)]?.run?.());
    });
  }

  function paintSelection() {
    document.querySelectorAll("[data-hyper-index]").forEach(button=>button.classList.toggle("selected",Number(button.dataset.hyperIndex)===selectedIndex));
    document.querySelector(`[data-hyper-index="${selectedIndex}"]`)?.scrollIntoView({block:"nearest"});
  }

  function commandKeydown(event) {
    if(commandTab!=="commands")return;
    if(event.key==="ArrowDown"){event.preventDefault();selectedIndex=Math.min(visibleCommands.length-1,selectedIndex+1);paintSelection();}
    if(event.key==="ArrowUp"){event.preventDefault();selectedIndex=Math.max(0,selectedIndex-1);paintSelection();}
    if(event.key==="Enter"&&visibleCommands[selectedIndex]){event.preventDefault();visibleCommands[selectedIndex].run?.();}
  }

  function renderShortcuts(root) {
    root.innerHTML=`<div class="hyper-command-group">ATAJOS DISPONIBLES</div>${SHORTCUTS.map(([key,description])=>`<div class="hyper-command-item"><i>⌨</i><span><b>${esc(key)}</b><small>${esc(description)}</small></span><em>LISTO</em></div>`).join("")}`;
  }

  function renderTerminal(root) {
    root.innerHTML=`<section class="hyper-terminal"><div class="hyper-terminal-log" id="hyper-terminal-log">${terminalLines.join("\n")}</div><form class="hyper-terminal-input" id="hyper-terminal-form"><b>student@uniprep:~$</b><input id="hyper-terminal-input" autocomplete="off" spellcheck="false" placeholder="help"></form></section>`;
    const form=root.querySelector("#hyper-terminal-form");
    form.addEventListener("submit",event=>{event.preventDefault();const input=root.querySelector("#hyper-terminal-input");const value=input.value.trim();input.value="";runTerminal(value);});
    requestAnimationFrame(()=>{const log=root.querySelector("#hyper-terminal-log");if(log)log.scrollTop=log.scrollHeight;});
  }

  function terminalWrite(line, className="") {
    terminalLines.push(className?`<span class="${className}">${esc(line)}</span>`:esc(line));
    if(terminalLines.length>60)terminalLines.splice(2,terminalLines.length-60);
  }

  function runTerminal(raw) {
    const input=normalize(raw);
    if(!input)return;
    terminalLines.push(`<b>student@uniprep:~$ ${esc(raw)}</b>`);
    const [command,...args]=input.split(/\s+/);
    if(command==="help")terminalWrite("Comandos: status · go [módulo] · hacker [on/off] · focus [15/25/45] · exam [20/30/80/100] · quality [auto/lite/balanced/ultra] · clear");
    else if(command==="status")terminalWrite(`ONLINE=${navigator.onLine} · IA=${aiAvailable===true?"READY":aiAvailable===false?"LOCAL":"CHECKING"} · QUALITY=${resolvedQuality.toUpperCase()} · SUPABASE=${Boolean(window.supabaseClient)} · MODE=${prefs.hacker?"HACKER":"NORMAL"}`);
    else if(command==="clear"){terminalLines.splice(2);}
    else if(command==="hacker"){const enable=args[0]==="on"?true:args[0]==="off"?false:!prefs.hacker;updatePrefs({hacker:enable});terminalWrite(`HACKER_MODE=${enable?"ENABLED":"DISABLED"}`);}
    else if(command==="focus"){const minutes=[15,25,45].includes(Number(args[0]))?Number(args[0]):25;closeCommandCenter();setFocusDuration(minutes);openFocus();}
    else if(command==="quality"){
      const quality=args[0];if(["auto","lite","balanced","ultra"].includes(quality)){updatePrefs({quality});terminalWrite(`QUALITY_PROFILE=${quality.toUpperCase()}`);}else terminalWrite("Usa: quality auto|lite|balanced|ultra","error");
    }
    else if(command==="exam"){
      const types={"20":"diagnostico_20","30":"reto_30","80":"unsaac_80","100":"maraton_100"};
      if(types[args[0]]){closeCommandCenter();window.iniciarSimulacroTipo?.(types[args[0]]);}else terminalWrite("Usa: exam 20|30|80|100","error");
    }
    else if(command==="go"){
      const route=ROUTES.find(item=>item.id===args[0]||normalize(item.title).includes(args.join(" ")));
      if(route)goTo(route);else terminalWrite(`Módulo desconocido: ${args.join(" ")||"vacío"}`,"error");
    }
    else terminalWrite(`Comando no reconocido: ${command}. Escribe help.`,"error");
    renderCommandContent();
    setTimeout(()=>document.getElementById("hyper-terminal-input")?.focus(),0);
  }

  function createFocus() {
    if(document.getElementById("hyper-focus-layer"))return;
    const layer=document.createElement("div");layer.id="hyper-focus-layer";layer.className="hyper-focus-layer";layer.setAttribute("role","dialog");layer.setAttribute("aria-modal","true");layer.setAttribute("aria-label","Cabina de concentración");
    layer.innerHTML=`<section class="hyper-focus-panel"><button type="button" class="hyper-focus-close" data-focus-close aria-label="Cerrar">×</button><small>MODO DE ALTO ENFOQUE</small><h2>Una misión. Cero distracciones.</h2><p>Elige un bloque, inicia el reloj y trabaja solo en una meta concreta.</p><div class="hyper-focus-orbit" id="hyper-focus-orbit"></div><div class="hyper-focus-time"><b id="hyper-focus-time">25:00</b><span id="hyper-focus-label">LISTO PARA EMPEZAR</span></div><div class="hyper-focus-presets"><button type="button" data-focus-minutes="15">15 min</button><button type="button" data-focus-minutes="25" class="active">25 min</button><button type="button" data-focus-minutes="45">45 min</button></div><div class="hyper-focus-actions"><button type="button" data-focus-reset>Reiniciar</button><button type="button" class="primary" data-focus-toggle>Iniciar enfoque</button><button type="button" data-focus-practice>Ir a practicar</button></div></section>`;
    layer.addEventListener("pointerdown",event=>{if(event.target===layer)closeFocus();});
    layer.querySelector("[data-focus-close]").addEventListener("click",closeFocus);
    layer.querySelectorAll("[data-focus-minutes]").forEach(button=>button.addEventListener("click",()=>setFocusDuration(Number(button.dataset.focusMinutes))));
    layer.querySelector("[data-focus-reset]").addEventListener("click",resetFocus);
    layer.querySelector("[data-focus-toggle]").addEventListener("click",toggleFocusTimer);
    layer.querySelector("[data-focus-practice]").addEventListener("click",()=>{closeFocus();window.abrirCentroPractica?.(null);});
    document.body.appendChild(layer);paintFocus();
  }

  function openFocus() { createFocus();closeCommandCenter();document.getElementById("hyper-focus-layer")?.classList.add("open");document.body.style.setProperty("overflow","hidden"); }
  function closeFocus() { document.getElementById("hyper-focus-layer")?.classList.remove("open");document.body.style.removeProperty("overflow"); }
  function setFocusDuration(minutes) { stopFocusTimer();focus.duration=minutes*60;focus.remaining=focus.duration;paintFocus(); }
  function resetFocus() { stopFocusTimer();focus.remaining=focus.duration;paintFocus(); }
  function stopFocusTimer() { if(focus.timer)clearInterval(focus.timer);focus.timer=0;focus.running=false; }
  function toggleFocusTimer() {
    if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));stopFocusTimer();paintFocus();return;}
    if(focus.remaining<=0)focus.remaining=focus.duration;
    focus.running=true;focus.deadline=Date.now()+focus.remaining*1000;
    focus.timer=setInterval(()=>{focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining<=0)completeFocus();paintFocus();},250);paintFocus();
  }
  function completeFocus(){stopFocusTimer();focus.remaining=0;paintFocus();navigator.vibrate?.([60,40,80]);playTone(660,.12);window.registrarNotificacion?.({tipo:"estudio",titulo:"Bloque Hyperdrive completado",cuerpo:`Terminaste ${Math.round(focus.duration/60)} minutos de concentración.`});toast("✓ Misión de concentración completada");}
  function paintFocus(){
    const minutes=Math.floor(focus.remaining/60),seconds=focus.remaining%60;
    const time=document.getElementById("hyper-focus-time");if(time)time.textContent=`${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    const label=document.getElementById("hyper-focus-label");if(label)label.textContent=focus.running?"ENFOQUE EN CURSO":focus.remaining===0?"MISIÓN COMPLETADA":"LISTO PARA EMPEZAR";
    const toggle=document.querySelector("[data-focus-toggle]");if(toggle)toggle.textContent=focus.running?"Pausar":"Iniciar enfoque";
    const orbit=document.getElementById("hyper-focus-orbit");if(orbit)orbit.style.setProperty("--focus-angle",`${focus.duration?((focus.duration-focus.remaining)/focus.duration)*360:0}deg`);
    document.querySelectorAll("[data-focus-minutes]").forEach(button=>button.classList.toggle("active",Number(button.dataset.focusMinutes)===focus.duration/60));
  }

  function wrapNavigation() {
    const original=window.go;if(typeof original!=="function"||original.__hyperWrapped)return;
    function hyperGo(id,element){const result=original.call(this,id,element);const screen=document.getElementById(id);if(screen){screen.classList.remove("hyper-route-enter");requestAnimationFrame(()=>screen.classList.add("hyper-route-enter"));setTimeout(()=>screen.classList.remove("hyper-route-enter"),520);}scheduleDecorate();return result;}
    hyperGo.__hyperWrapped=true;window.go=hyperGo;
  }

  function cardSelector() { return ".card,.qstat,.course-card-ultra,.formula-course-card,.library-card,.profile-card,.ach-card,.practice-feature-card,.exam-option-card,.exam-evolution-card,.tutor-tool,.tutor-module-card,.vocational-hub-card,.career-card"; }

  function scheduleDecorate() {
    if(decorateQueued)return;decorateQueued=true;
    const schedule=window.requestIdleCallback||((callback)=>setTimeout(callback,40));
    schedule(()=>{decorateQueued=false;decorateCards();},{timeout:300});
  }

  function decorateCards() {
    const cards=[...document.querySelectorAll(cardSelector())];
    cards.forEach(card=>{if(card.dataset.hyperReady)return;card.dataset.hyperReady="1";card.classList.add("hyper-card");if(!card.closest(".hyper-command-layer,.hyper-focus-layer")){card.classList.add("hyper-reveal");if(revealObserver)revealObserver.observe(card);else card.classList.add("is-visible");}});
  }

  const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target);}}),{rootMargin:"80px",threshold:.04}) : null;

  function pointerMove(event) {
    if(!prefs.cursor||resolvedQuality==="lite"||event.pointerType==="touch")return;
    if(lastPointerFrame)return;
    lastPointerFrame=requestAnimationFrame(()=>{
      lastPointerFrame=0;
      const x=(event.clientX/window.innerWidth-.5)*22,y=(event.clientY/window.innerHeight-.5)*18;
      document.documentElement.style.setProperty("--hyper-ambient-x",`${x}px`);document.documentElement.style.setProperty("--hyper-ambient-y",`${y}px`);
      const card=event.target.closest(cardSelector());if(card){const rect=card.getBoundingClientRect();card.style.setProperty("--hyper-card-x",`${event.clientX-rect.left}px`);card.style.setProperty("--hyper-card-y",`${event.clientY-rect.top}px`);}
    });
  }

  function clickFeedback(event) {
    const interactive=event.target.closest("button,.btn,.nav-item,[role=button]");if(!interactive)return;
    navigator.vibrate?.(6);if(prefs.sound)playTone(480,.025);
    if(resolvedQuality==="lite"||window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)return;
    const flash=document.createElement("span");flash.className="hyper-click-flash";flash.style.left=`${event.clientX-4}px`;flash.style.top=`${event.clientY-4}px`;document.body.appendChild(flash);setTimeout(()=>flash.remove(),520);
  }

  function playTone(frequency=480,duration=.03) {
    if(!prefs.sound)return;
    try{audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.025,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+duration);}catch(_){}
  }

  function toggleHacker() { updatePrefs({hacker:!prefs.hacker});toast(prefs.hacker?"</> Modo Hacker activado":"Modo Hacker desactivado");if(prefs.hacker)terminalWrite("HACKER_MODE=ENABLED · visual layer secured");renderCommandContent(); }

  function createMatrix() {
    if(matrix)return matrix;
    const canvas=document.createElement("canvas");canvas.id="hyper-matrix";canvas.setAttribute("aria-hidden","true");document.body.prepend(canvas);
    const ctx=canvas.getContext("2d",{alpha:true});matrix={canvas,ctx,drops:[],timer:0,running:false};resizeMatrix();return matrix;
  }

  function resizeMatrix() {
    if(!matrix)return;const ratio=Math.min(window.devicePixelRatio||1,1.35);matrix.canvas.width=Math.round(innerWidth*ratio);matrix.canvas.height=Math.round(innerHeight*ratio);matrix.canvas.style.width=`${innerWidth}px`;matrix.canvas.style.height=`${innerHeight}px`;matrix.ctx.setTransform(ratio,0,0,ratio,0,0);const size=resolvedQuality==="lite"?22:18;matrix.size=size;matrix.drops=Array(Math.ceil(innerWidth/size)).fill(0).map(()=>Math.random()*-40);
  }

  function toggleMatrix(enable) {
    if(!enable){if(matrix?.timer)clearInterval(matrix.timer);if(matrix){matrix.timer=0;matrix.running=false;matrix.ctx.clearRect(0,0,innerWidth,innerHeight);}return;}
    createMatrix();if(matrix.running)return;matrix.running=true;
    matrix.timer=setInterval(()=>{if(document.hidden||!prefs.hacker)return;drawMatrix();},resolvedQuality==="lite"?95:58);
  }

  function drawMatrix() {
    if(!matrix?.ctx)return;const {ctx,size,drops}=matrix;ctx.fillStyle="rgba(1,8,4,.11)";ctx.fillRect(0,0,innerWidth,innerHeight);ctx.fillStyle="rgba(87,255,147,.62)";ctx.font=`${size-4}px ui-monospace,monospace`;const chars="01∆ΣπλUP<>/{}";drops.forEach((drop,index)=>{ctx.fillText(chars[Math.floor(Math.random()*chars.length)],index*size,drop*size);if(drop*size>innerHeight&&Math.random()>.985)drops[index]=0;else drops[index]+=1;});
  }

  function watchData() {
    const targets=["dashboard-exercises","dashboard-precision","dashboard-ranking","dashboard-streak","profile-xp","profile-level"];
    targets.forEach(id=>{const node=document.getElementById(id);if(!node||node.dataset.hyperWatch)return;node.dataset.hyperWatch="1";new MutationObserver(()=>{node.classList.remove("hyper-data-pulse");requestAnimationFrame(()=>node.classList.add("hyper-data-pulse"));}).observe(node,{childList:true,characterData:true,subtree:true});});
  }

  function keyboard(event) {
    const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)||event.target.isContentEditable;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();openCommandCenter("commands");return;}
    if((event.ctrlKey||event.metaKey)&&event.key==="`"){event.preventDefault();openCommandCenter("terminal");return;}
    if((event.ctrlKey||event.metaKey)&&event.shiftKey&&event.key.toLowerCase()==="h"){event.preventDefault();toggleHacker();return;}
    if((event.ctrlKey||event.metaKey)&&event.shiftKey&&event.key.toLowerCase()==="f"){event.preventDefault();openFocus();return;}
    if(event.key==="Escape"){closeCommandCenter();closeFocus();return;}
    if(typing||!event.altKey)return;
    const map={h:"home",c:"cursos",p:"ejercicios",f:"formulas",e:"exams",r:"ranking",a:"agenda",v:"vocacional",u:"tutor",m:"perfil"};
    const route=ROUTES.find(item=>item.id===map[event.key.toLowerCase()]);if(route){event.preventDefault();goTo(route);}
  }

  async function checkAI() {
    try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),3500);const response=await fetch("/api/tutor",{headers:{Accept:"application/json"},signal:controller.signal});clearTimeout(timeout);const data=await response.json().catch(()=>({}));aiAvailable=Boolean(data.available);}catch(_){aiAvailable=false;}updateSystemUI();
  }

  function updateSystemUI() {
    const trigger=document.getElementById("hyper-system-trigger");trigger?.classList.toggle("offline",!navigator.onLine);
    const copy=document.getElementById("hyper-system-copy");if(copy)copy.textContent=!navigator.onLine?"Modo offline":aiAvailable===true?"IA + nube listas":aiAvailable===false?"Guía local lista":`${qualityLabel(resolvedQuality)} · listo`;
    const status=document.getElementById("hyper-mission-status");if(status)status.textContent=!navigator.onLine?"Modo offline":aiAvailable===true?"IA conectada":"Sistema listo";
    const quality=document.getElementById("hyper-mission-quality");if(quality)quality.textContent=`Efectos ${qualityLabel(resolvedQuality).toLowerCase()}`;
  }

  function updateClock() {
    const clock=document.getElementById("hyper-mission-clock");if(clock)clock.textContent=new Date().toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"});
  }

  function connectTopbarSearch() {
    const input=document.querySelector(".topbar-search input");
    if(!input||input.dataset.hyperConnected)return;
    input.dataset.hyperConnected="1";
    input.placeholder="Buscar en UniPrep…";
    input.setAttribute("aria-label","Buscar cursos y herramientas en UniPrep");
    input.addEventListener("focus",()=>openCommandCenter("commands"));
    input.addEventListener("pointerdown",event=>{event.preventDefault();openCommandCenter("commands");});
  }

  function toast(message) { if(window.UniprepUGEL?.mostrarToast)window.UniprepUGEL.mostrarToast(message);else window.mostrarToastPremium?.(message); }

  function initialize() {
    readPrefs();createAmbient();createCommandCenter();createFocus();connectTopbarSearch();wrapNavigation();applyPrefs();scheduleDecorate();watchData();updateClock();
    setInterval(updateClock,30000);setTimeout(checkAI,900);
    document.addEventListener("pointermove",pointerMove,{passive:true});document.addEventListener("pointerdown",clickFeedback,{passive:true});document.addEventListener("keydown",keyboard);
    window.addEventListener("resize",()=>{resolvedQuality=deviceQuality();document.body.dataset.hyperQuality=resolvedQuality;resizeMatrix();updateSystemUI();},{passive:true});
    window.addEventListener("online",()=>{updateSystemUI();checkAI();});window.addEventListener("offline",updateSystemUI);
    document.addEventListener("uniprep:hyperdrive-change",()=>{applyPrefs();renderCommandContent();});
    document.addEventListener("uniprep:theme-change",applyPrefs);
    document.addEventListener("uniprep:user-ready",()=>{applyPrefs();checkAI();watchData();});
    document.addEventListener("uniprep:storage-scope-change",applyPrefs);
    const observer=new MutationObserver(()=>{scheduleDecorate();watchData();});observer.observe(document.body,{childList:true,subtree:true});
  }

  window.UniPrepHyperdrive={open:openCommandCenter,close:closeCommandCenter,focus:openFocus,toggleHacker,getCommandCount:()=>allCommands().length,getState:()=>({prefs:{...prefs},quality:resolvedQuality,aiAvailable})};
  window.abrirCentroComandosUniPrep=()=>openCommandCenter("commands");
  window.abrirTerminalUniPrep=()=>openCommandCenter("terminal");
  window.abrirEnfoqueHyperdrive=openFocus;
  window.alternarModoHacker=toggleHacker;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
