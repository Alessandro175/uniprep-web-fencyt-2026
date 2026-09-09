// =====================================================================
// UNIPREP 2 · SPARK ACADEMY 2026.26
// Misiones reales, guía de exposición y energía visual con sentido.
// =====================================================================
(function () {
  "use strict";

  const DAY_KEY = "uniprep_spark_daily_v1";
  let previousFocus = null;

  function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }

  function storage() {
    return window.uniprepStorage || {
      leer(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}},
      guardar(key,value){localStorage.setItem(key,JSON.stringify(value));return value}
    };
  }

  function number(value) { return Math.max(0, Number(value) || 0); }
  function clamp(value,max) { return Math.max(0,Math.min(max,value)); }

  function dailyState(user) {
    const saved = storage().leer(DAY_KEY,null);
    const current = {exercises:number(user?.ejercicios), correct:number(user?.respuestasCorrectas), xp:number(user?.xp)};
    if (!saved || saved.date !== today()) {
      const fresh = {date:today(), baseline:current, values:{questions:0,correct:0,xp:0}, celebrated:false};
      storage().guardar(DAY_KEY,fresh);
      return fresh;
    }
    saved.values = {
      questions:Math.max(number(saved.values?.questions),current.exercises-number(saved.baseline?.exercises)),
      correct:Math.max(number(saved.values?.correct),current.correct-number(saved.baseline?.correct)),
      xp:Math.max(number(saved.values?.xp),current.xp-number(saved.baseline?.xp))
    };
    storage().guardar(DAY_KEY,saved);
    return saved;
  }

  function updateMission(button,value,max) {
    if (!button) return;
    const done = value >= max;
    const progress = Math.round(clamp(value,max)/max*100);
    button.classList.toggle("complete",done);
    button.querySelector("em i")?.style.setProperty("--spark-progress",`${progress}%`);
    const output = button.querySelector("u");
    if (output) output.textContent = done ? "¡Listo!" : `${Math.min(value,max)}/${max}`;
    button.setAttribute("aria-label",`${button.querySelector("b")?.textContent || "Misión"}: ${done ? "completada" : `${progress}%`}`);
  }

  async function refresh(userProvided=null) {
    let user=userProvided;
    if (!user || user.ejercicios === undefined || user.xp === undefined) {
      try { user=await window.obtenerUsuarioActivo?.(); } catch (_) { user=null; }
    }
    if (!user) return;
    const state=dailyState(user);
    updateMission(document.querySelector('[data-spark-mission="questions"]'),state.values.questions,5);
    updateMission(document.querySelector('[data-spark-mission="correct"]'),state.values.correct,3);
    updateMission(document.querySelector('[data-spark-mission="xp"]'),state.values.xp,50);
    const score=Math.round((clamp(state.values.questions,5)/5+clamp(state.values.correct,3)/3+clamp(state.values.xp,50)/50)/3*100);
    const scoreNode=document.getElementById("spark-day-score");
    if(scoreNode)scoreNode.textContent=`${score}%`;
    document.querySelector(".spark-day-medal")?.style.setProperty("--spark-score",`${score*3.6}deg`);
    const title=document.getElementById("spark-coach-title");
    const copy=document.getElementById("spark-coach-copy");
    if(score===100){
      if(title)title.textContent="Misión diaria completada";
      if(copy)copy.textContent="Tu avance quedó registrado. Ahora puedes repasar errores o intentar un desafío.";
      if(!state.celebrated){state.celebrated=true;storage().guardar(DAY_KEY,state);window.mostrarToastPremium?.("¡Tres misiones completadas! Tu impulso de hoy está al máximo.")}
    } else if(state.values.questions>=5){
      if(title)title.textContent="Ahora convierte práctica en dominio";
      if(copy)copy.textContent="Ya calentaste. Concéntrate en respuestas correctas y revisa cada explicación.";
    }
  }

  const GUIDE = [
    {icon:"⌂",title:"Inicio adaptativo",what:"Ordena una ruta diaria según universidad, carrera, peso del curso y avance.",say:"UniPrep no muestra contenido al azar: recomienda el siguiente tema que más aporta a la meta del estudiante.",demo:"home"},
    {icon:"◎",title:"Práctica explicada",what:"Selecciona curso, dificultad y cantidad; registra correctas, errores, tiempo y XP.",say:"Cada respuesta entrega retroalimentación y los errores vuelven a una colección de refuerzo.",demo:"ejercicios"},
    {icon:"⚡",title:"Misiones y progreso",what:"Tres objetivos diarios se calculan con respuestas y XP reales.",say:"La gamificación no reemplaza el aprendizaje: convierte acciones académicas verificables en progreso visible.",demo:"home"},
    {icon:"🏁",title:"Simulacros",what:"Evalúa con tiempo, navegación por preguntas, guardado, entrega automática y corrección.",say:"El estudiante practica condiciones de examen y luego identifica sus áreas débiles.",demo:"exams"},
    {icon:"✦",title:"Tutor Uni",what:"Responde consultas libres, analiza materiales y crea actividades; tiene respaldo local.",say:"La IA se activa únicamente cuando el alumno la solicita y la clave permanece protegida en el servidor.",demo:"tutor"},
    {icon:"★",title:"Ranking justo",what:"Compara resultados por día, semana, mes y región mediante puntajes normalizados.",say:"El objetivo es motivar sin comparar exámenes de distinta cantidad de preguntas de manera injusta.",demo:"ranking"},
    {icon:"◇",title:"Orientación vocacional",what:"Relaciona intereses con carreras y guarda el avance del test.",say:"No reemplaza a un orientador; ayuda al estudiante a explorar opciones con información organizada.",demo:"vocacional"},
    {icon:"▦",title:"Biblioteca y cursos",what:"Reúne 25 cursos, temarios por universidad, fórmulas, videos y 12,660 preguntas.",say:"La ruta académica cambia según la universidad elegida para evitar estudiar temas sin prioridad.",demo:"cursos"},
    {icon:"◐",title:"Accesibilidad visual",what:"Permite modo claro, oscuro, automático, paletas, lectura y movimiento reducido.",say:"La personalización responde a comodidad y accesibilidad, no solo a decoración.",action:"appearance"},
    {icon:"✓",title:"Estado para exposición",what:"Comprueba interfaz, contenidos, cuentas, ranking, Tutor y PWA.",say:"Antes de presentar puedo verificar los servicios esenciales y copiar un informe técnico.",action:"health"}
  ];

  function createGuide() {
    if(document.getElementById("spark-guide-layer"))return;
    const layer=document.createElement("div");
    layer.id="spark-guide-layer";layer.className="spark-guide-layer";layer.setAttribute("aria-hidden","true");
    layer.innerHTML=`<section class="spark-guide" role="dialog" aria-modal="true" aria-labelledby="spark-guide-title"><header><div><small>MODO EXPOSICIÓN · GUION VERIFICABLE</small><h2 id="spark-guide-title">Explica UniPrep sin chamuyar</h2><p>Qué hace cada módulo, por qué existe y qué puedes mostrar al jurado.</p></div><button type="button" data-spark-close aria-label="Cerrar">×</button></header><div class="spark-guide-progress"><span><i></i></span><b>${GUIDE.length} funciones esenciales</b></div><div class="spark-guide-list">${GUIDE.map((item,index)=>`<article><span>${item.icon}</span><div><small>FUNCIÓN ${String(index+1).padStart(2,"0")}</small><h3>${item.title}</h3><p>${item.what}</p><blockquote>“${item.say}”</blockquote></div><button type="button" data-spark-demo="${index}">${item.action?"Abrir":"Demostrar"}</button></article>`).join("")}</div><footer><button type="button" data-spark-copy>Copiar guion</button><button type="button" class="primary" data-spark-close>Entendido</button></footer></section>`;
    layer.addEventListener("pointerdown",event=>{if(event.target===layer)closeGuide()});
    layer.querySelectorAll("[data-spark-close]").forEach(button=>button.addEventListener("click",closeGuide));
    layer.querySelector("[data-spark-copy]")?.addEventListener("click",copyGuide);
    layer.querySelectorAll("[data-spark-demo]").forEach(button=>button.addEventListener("click",()=>demo(Number(button.dataset.sparkDemo))));
    document.body.appendChild(layer);
  }

  function openGuide(){createGuide();previousFocus=document.activeElement;const layer=document.getElementById("spark-guide-layer");layer?.classList.add("open");layer?.setAttribute("aria-hidden","false");setTimeout(()=>layer?.querySelector("[data-spark-close]")?.focus(),20)}
  function closeGuide(){const layer=document.getElementById("spark-guide-layer");layer?.classList.remove("open");layer?.setAttribute("aria-hidden","true");if(previousFocus instanceof HTMLElement)previousFocus.focus()}
  function demo(index){const item=GUIDE[index];closeGuide();if(item.action==="appearance")return window.abrirPersonalizacionUniPrep?.();if(item.action==="health")return window.abrirEstadoNacionalUniPrep?.();if(item.demo==="tutor")return window.abrirTutorAcademico?.(null);window.go?.(item.demo||"home",null)}
  async function copyGuide(){const text=GUIDE.map((item,index)=>`${index+1}. ${item.title}\nQué hace: ${item.what}\nQué decir: ${item.say}`).join("\n\n");try{await navigator.clipboard.writeText(text);window.mostrarToastPremium?.("Guion de exposición copiado.")}catch(_){window.prompt("Copia tu guion:",text)}}

  function wrapDashboard(){const original=window.cargarDashboard;if(typeof original!=="function"||original.__sparkWrapped)return;async function wrapped(...args){const result=await original.apply(this,args);await refresh();return result}wrapped.__sparkWrapped=true;window.cargarDashboard=wrapped}
  function wrapProgress(name){const original=window[name];if(typeof original!=="function"||original.__sparkWrapped)return;async function wrapped(...args){const result=await original.apply(this,args);window.setTimeout(()=>refresh(),80);return result}wrapped.__sparkWrapped=true;window[name]=wrapped}
  function initialize(){wrapDashboard();wrapProgress("registrarResultadoEjercicio");wrapProgress("actualizarEstadisticasUsuario");refresh();document.querySelectorAll("[data-spark-mission]").forEach(button=>button.addEventListener("click",()=>window.abrirCentroPractica?.(null)));document.addEventListener("uniprep:user-ready",event=>refresh(event.detail));document.addEventListener("uniprep:storage-scope-change",()=>refresh());document.addEventListener("keydown",event=>{if(event.key==="Escape")closeGuide()})}

  window.abrirGuiaExposicionUniPrep=openGuide;
  window.actualizarMisionesSpark=refresh;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
