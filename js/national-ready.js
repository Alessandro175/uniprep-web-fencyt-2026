// =====================================================================
// UNIPREP 2 · NATIONAL READY 2026.25
// Diagnóstico visible, fallos recuperables y comprobaciones para exposición.
// =====================================================================
(function () {
  "use strict";

  const VERSION = document.querySelector('meta[name="uniprep-version"]')?.content || "desconocida";
  const issues = [];
  let previousFocus = null;

  function escapeHTML(value) {
    const node = document.createElement("div");
    node.textContent = String(value ?? "");
    return node.innerHTML;
  }

  function withTimeout(operation, time = 6000, code = "TIMEOUT") {
    let timer;
    const limit = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(code)), time);
    });
    return Promise.race([Promise.resolve(operation), limit]).finally(() => clearTimeout(timer));
  }

  function rememberIssue(type, value) {
    const message = String(value?.message || value || "Error desconocido").slice(0, 220);
    if (!message || /AbortError|RANKING_TIMEOUT|UNIPREP_TIMEOUT/i.test(message)) return;
    const signature = `${type}:${message}`;
    if (!issues.some(item => item.signature === signature)) issues.push({signature, type, message, at:new Date().toISOString()});
    if (issues.length > 8) issues.shift();
  }

  window.addEventListener("error", event => rememberIssue("JavaScript", event.error || event.message));
  window.addEventListener("unhandledrejection", event => rememberIssue("Promesa", event.reason));

  async function fetchJSON(url, time = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), time);
    try {
      const response = await fetch(url, {cache:"no-store", signal:controller.signal, headers:{Accept:"application/json"}});
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function result(id, icon, title, state, detail, action = "") {
    return {id, icon, title, state, detail, action};
  }

  async function checkInterface() {
    const requiredScreens = ["home","cursos","ejercicios","exams","ranking","agenda","vocacional","tutor","perfil","universo"];
    const missing = requiredScreens.filter(id => !document.getElementById(id));
    const requiredFunctions = ["go","abrirCentroPractica","abrirTutorAcademico","iniciarSimulacroTipo","volverEnUniPrep","avanzarEnUniPrep"];
    const missingFunctions = requiredFunctions.filter(name => typeof window[name] !== "function");
    const duplicateIds = [...document.querySelectorAll("[id]")].map(node => node.id).filter((id,index,all) => all.indexOf(id) !== index);
    if (missing.length || missingFunctions.length || duplicateIds.length) {
      return result("interface","◇","Interfaz y navegación","error",`Faltan ${missing.length} pantallas, ${missingFunctions.length} funciones o existen ${duplicateIds.length} identificadores repetidos.`,"reload");
    }
    return result("interface","◇","Interfaz y navegación","ready",`${requiredScreens.length} pantallas esenciales, Atrás/Adelante y acciones principales disponibles.`);
  }

  async function checkAcademic() {
    try {
      const [admission, quiz, exams] = await Promise.all([
        fetchJSON("json/admission-profiles.json"),
        fetchJSON("json/quiz-cursos/rm.json"),
        fetchJSON("json/university-exam-profiles.json")
      ]);
      const universities = admission?.universidades?.length || 0;
      const themes = quiz?.temas?.length || 0;
      const profiles = Array.isArray(exams) ? exams.length : Object.keys(exams || {}).length;
      if (!universities || !themes || !profiles) throw new Error("CATALOGO_INCOMPLETO");
      return result("academic","▦","Contenido académico","ready",`${universities} universidades, ${themes} temas de muestra y perfiles de examen accesibles.`);
    } catch (_) {
      return result("academic","▦","Contenido académico","error","Falta un JSON académico o el servidor no permite leerlo.","reload");
    }
  }

  async function checkAccounts() {
    if (!navigator.onLine) return result("accounts","●","Cuentas y progreso","warning","Sin internet: los módulos locales funcionan, pero iniciar sesión y sincronizar requieren conexión.");
    if (!window.supabaseClient?.auth) return result("accounts","●","Cuentas y progreso","error","No se cargó el servicio de cuentas. Revisa conexión, CDN y configuración de Supabase.","config");
    try {
      const response = await withTimeout(window.supabaseClient.auth.getSession(), 7000, "SUPABASE_TIMEOUT");
      if (response?.error) throw response.error;
      return result("accounts","●","Cuentas y progreso","ready",response?.data?.session ? "Sesión segura activa y sincronización disponible." : "Servicio disponible; inicia sesión para sincronizar tu progreso.");
    } catch (_) {
      return result("accounts","●","Cuentas y progreso","error","Supabase no respondió en 7 segundos. Revisa internet y las variables públicas.","config");
    }
  }

  async function checkRanking() {
    if (!window.supabaseClient?.auth) return result("ranking","★","Ranking","warning","Se habilitará cuando Supabase esté disponible.","config");
    try {
      const session = await withTimeout(window.supabaseClient.auth.getSession(), 5000, "SESSION_TIMEOUT");
      const user = session?.data?.session?.user;
      if (!user) return result("ranking","★","Ranking","info","La función está instalada en la aplicación; la consulta real se comprueba al iniciar sesión.");
      const response = await withTimeout(window.supabaseClient.rpc("obtener_ranking_uniprep_v2", {p_periodo:"dia", p_region:null}), 8000, "RANKING_TIMEOUT");
      if (response?.error) throw response.error;
      return result("ranking","★","Ranking","ready","Consulta diaria real disponible con privacidad por usuario.");
    } catch (error) {
      const missing = /function|schema|PGRST|42883/i.test(String(error?.message || error));
      return result("ranking","★","Ranking",missing ? "error" : "warning",missing ? "Falta ejecutar el instalador SQL consolidado." : "No se pudo comprobar ahora; vuelve a intentar con conexión estable.","config");
    }
  }

  async function checkTutor() {
    try {
      const data = await fetchJSON("/api/tutor", 5000);
      if (data?.available && data?.openai) return result("tutor","✦","Tutor Uni","ready","IA real disponible y clave protegida en el servidor.");
      return result("tutor","✦","Tutor Uni","warning","Guía local disponible. La IA real necesita OPENAI_API_KEY en Vercel.","config");
    } catch (_) {
      return result("tutor","✦","Tutor Uni","warning","La ruta de IA no respondió; Uni seguirá usando la guía local.","config");
    }
  }

  async function checkInstallable() {
    if (!("serviceWorker" in navigator)) return result("pwa","⬡","Aplicación instalable","warning","Este navegador no admite instalación PWA; la web continúa funcionando.");
    try {
      const registration = await withTimeout(navigator.serviceWorker.getRegistration(), 3500, "PWA_TIMEOUT");
      return result("pwa","⬡","Aplicación instalable",registration ? "ready" : "info",registration ? "Caché y modo instalable registrados." : "Se registrará al recargar después de publicar en HTTPS.");
    } catch (_) {
      return result("pwa","⬡","Aplicación instalable","warning","No se pudo confirmar la caché; vuelve a cargar desde HTTPS.");
    }
  }

  async function runChecks() {
    const root = document.getElementById("national-health-results");
    const summary = document.getElementById("national-health-summary");
    const runButton = document.querySelector("[data-national-run]");
    if (root) root.innerHTML = Array.from({length:6},(_,index)=>`<div class="national-health-skeleton" style="--delay:${index*45}ms"><i></i><span></span></div>`).join("");
    if (summary) summary.innerHTML = '<span class="checking">COMPROBANDO</span><b>Revisando UniPrep…</b><small>No cierres esta ventana.</small>';
    if (runButton) runButton.disabled = true;

    const checks = await Promise.all([checkInterface(),checkAcademic(),checkAccounts(),checkRanking(),checkTutor(),checkInstallable()]);
    const errors = checks.filter(item=>item.state==="error").length;
    const warnings = checks.filter(item=>item.state==="warning").length;
    const ready = checks.filter(item=>item.state==="ready").length;
    document.documentElement.dataset.nationalReady = errors ? "review" : "ready";

    if (root) root.innerHTML = checks.map(item=>`<article class="national-health-row state-${item.state}"><span class="national-health-icon">${item.icon}</span><div><small>${item.state==="ready"?"LISTO":item.state==="error"?"REVISAR":item.state==="warning"?"RESPALDO":"INFORMATIVO"}</small><b>${escapeHTML(item.title)}</b><p>${escapeHTML(item.detail)}</p></div><i aria-hidden="true">${item.state==="ready"?"✓":item.state==="error"?"!":item.state==="warning"?"△":"i"}</i></article>`).join("");
    if (summary) summary.innerHTML = errors
      ? `<span class="review">REQUIERE ATENCIÓN</span><b>Revisa ${errors} punto${errors===1?"":"s"} antes de presentar</b><small>${ready} comprobaciones listas · ${warnings} con respaldo</small>`
      : `<span class="ready">LISTO PARA EXPOSICIÓN</span><b>Los flujos esenciales respondieron</b><small>${ready} comprobaciones listas · ${warnings} con respaldo · versión ${escapeHTML(VERSION)}</small>`;
    if (runButton) runButton.disabled = false;
    window.__uniprepNationalReport = {version:VERSION, checkedAt:new Date().toISOString(), online:navigator.onLine, errors, warnings, runtimeIssues:issues.length, checks};
    document.dispatchEvent(new CustomEvent("uniprep:national-health", {detail:window.__uniprepNationalReport}));
  }

  function createPanel() {
    if (document.getElementById("national-health-layer")) return;
    const layer = document.createElement("div");
    layer.id = "national-health-layer";
    layer.className = "national-health-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<section class="national-health-panel" role="dialog" aria-modal="true" aria-labelledby="national-health-title">
      <header><div><small>EDICIÓN NACIONAL · CONTROL DE CALIDAD</small><h2 id="national-health-title">Estado de UniPrep</h2><p>Comprueba lo esencial antes de una exposición o jornada de estudio.</p></div><button type="button" data-national-close aria-label="Cerrar">×</button></header>
      <div class="national-health-summary" id="national-health-summary"></div>
      <div class="national-health-results" id="national-health-results"></div>
      <div class="national-health-runtime"><span>Errores detectados durante esta sesión</span><b id="national-runtime-count">0</b><small>La lista no incluye contraseñas, claves ni datos personales.</small></div>
      <footer><button type="button" data-national-copy>Copiar informe</button><button type="button" class="primary" data-national-run>Comprobar otra vez</button></footer>
    </section>`;
    layer.addEventListener("pointerdown", event=>{if(event.target===layer)closePanel()});
    layer.querySelector("[data-national-close]")?.addEventListener("click",closePanel);
    layer.querySelector("[data-national-run]")?.addEventListener("click",runChecks);
    layer.querySelector("[data-national-copy]")?.addEventListener("click",copyReport);
    document.body.appendChild(layer);
  }

  function openPanel() {
    createPanel();
    previousFocus = document.activeElement;
    const layer = document.getElementById("national-health-layer");
    layer?.classList.add("open");
    layer?.setAttribute("aria-hidden","false");
    const counter = document.getElementById("national-runtime-count");
    if (counter) counter.textContent = String(issues.length);
    runChecks();
    setTimeout(()=>layer?.querySelector("[data-national-close]")?.focus(),30);
  }

  function closePanel() {
    const layer = document.getElementById("national-health-layer");
    layer?.classList.remove("open");
    layer?.setAttribute("aria-hidden","true");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  async function copyReport() {
    const report = window.__uniprepNationalReport;
    if (!report) return;
    const text = [`UniPrep ${report.version}`,`Comprobado: ${report.checkedAt}`,`Conexión: ${report.online?"sí":"no"}`,`Errores: ${report.errors}`,`Respaldos: ${report.warnings}`,`Incidencias de sesión: ${report.runtimeIssues}`,"",...report.checks.map(item=>`${item.state.toUpperCase()} · ${item.title}: ${item.detail}`)].join("\n");
    try { await navigator.clipboard.writeText(text); window.mostrarToastPremium?.("Informe de estado copiado."); }
    catch (_) { window.prompt("Copia el informe:", text); }
  }

  document.addEventListener("keydown", event=>{if(event.key==="Escape")closePanel()});
  window.abrirEstadoNacionalUniPrep = openPanel;
  window.cerrarEstadoNacionalUniPrep = closePanel;
  window.comprobarEstadoNacionalUniPrep = runChecks;
})();
