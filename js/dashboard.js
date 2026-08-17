// =====================================================
// UNIPREP - PANEL PRINCIPAL DINÁMICO
// =====================================================

async function cargarDashboard() {
  if (typeof window.obtenerUsuarioActivo !== "function") return false;

  const usuario = await window.obtenerUsuarioActivo();
  if (!usuario) return false;

  const nombre = usuario.nombre || "Estudiante";
  const primerNombre = nombre.trim().split(/\s+/)[0];
  const racha = Number(usuario.racha) || 0;
  const record = Math.max(Number(usuario.recordRacha) || 0, racha);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  cambiarDashboardHTML("dashboard-greeting", `¡${saludo},<br>${escaparHTML(primerNombre)}! 👋`);

  cambiarDashboardTexto("dashboard-exercises", formatearDashboard(usuario.ejercicios));
  cambiarDashboardTexto("dashboard-precision", `${calcularPrecisionDashboard(usuario)}%`);
  cambiarDashboardTexto("dashboard-ranking", usuario.ranking ? `#${usuario.ranking}` : "#--");
  cambiarDashboardTexto("dashboard-streak", racha);
  cambiarDashboardTexto("dashboard-record", `Récord: ${record} ${record === 1 ? "día" : "días"}`);
  pintarMensajeRacha(usuario);
  pintarNotificacionRacha(usuario);
  pintarCoberturaAcademica(usuario);
  pintarGamificacionDashboard(usuario);
  pintarRecomendacionesDashboard(usuario);
  await pintarActividadesRecientes();

  return true;
}

function pintarGamificacionDashboard(usuario) {
  const contenedor = document.getElementById("dashboard-gamification");
  if (!contenedor) return;
  const xp = Math.max(0, Number(usuario.xp) || 0);
  const nivel = Math.floor(xp / 500) + 1;
  const tramo = xp % 500;
  const progreso = Math.round(tramo / 500 * 100);
  const ligas = ["Órbita", "Cometa", "Nova", "Galaxia", "Élite UniPrep"];
  const liga = ligas[Math.min(ligas.length - 1, Math.floor((nivel - 1) / 3))];
  contenedor.innerHTML = `<span class="game-level-orb">${nivel >= 10 ? "🏆" : "✦"}</span><span class="game-level-copy"><small>TRAYECTORIA UNIPREP · RACHA ${Math.max(0,Number(usuario.racha)||0)} DÍAS</small><b>Nivel ${nivel} · Liga ${liga}</b><span class="game-level-track"><span style="width:${progreso}%"></span></span></span><span class="game-level-meta"><b>${xp.toLocaleString("es-PE")} XP</b><span>${500-tramo} XP para nivel ${nivel+1}</span></span>`;
}

function pintarCoberturaAcademica(usuario) {
  const ids = Object.keys(window.CURSOS_PREUNI || {}).filter(id => window.cursoPermitidoAdmision?.(id) !== false);
  const valores = ids.map(id => Math.max(0, Math.min(100, Number(usuario.progreso?.[id]) || 0)));
  const cobertura = valores.length ? Math.round(valores.reduce((a,b) => a + b, 0) / valores.length) : 0;
  cambiarDashboardTexto("dashboard-cycle-value", `${cobertura}%`);
  cambiarDashboardTexto("dashboard-cycle-big", cobertura);
  const barra = document.getElementById("dashboard-cycle-bar");
  if (barra) barra.style.width = `${cobertura}%`;
  cambiarDashboardTexto("dashboard-exercises-note", `Nivel ${Number(usuario.nivel)||1} · ${Number(usuario.xp)||0} XP`);
  cambiarDashboardTexto("dashboard-precision-note", Number(usuario.respuestasTotales) > 0 ? `${Number(usuario.respuestasCorrectas)||0} de ${Number(usuario.respuestasTotales)||0} correctas` : "Completa una práctica diagnóstica");
  cambiarDashboardTexto("dashboard-ranking-note", usuario.ranking ? `Posición #${usuario.ranking} por XP` : "Se activa al comparar perfiles");
}

function pintarRecomendacionesDashboard(usuario) {
  const contenedor = document.getElementById("dashboard-recommendations");
  const cursos = Object.values(window.CURSOS_PREUNI || {}).filter(curso => window.cursoPermitidoAdmision?.(curso.id) !== false);
  if (!contenedor || !cursos.length) return;
  const filas = Array.isArray(usuario.progresoDetallado) ? usuario.progresoDetallado : [];
  const recomendados = [...cursos].sort((a,b) => {
    const riesgoA=(Number(window.pesoCursoAdmision?.(a.id))||1)*(100-(Number(usuario.progreso?.[a.id])||0));
    const riesgoB=(Number(window.pesoCursoAdmision?.(b.id))||1)*(100-(Number(usuario.progreso?.[b.id])||0));
    return riesgoB-riesgoA;
  }).slice(0,3);
  contenedor.innerHTML = recomendados.map((curso,indice) => {
    const fila = filas.find(item => item.course_id === curso.id);
    const temaIndice = Math.min(Number(fila?.last_topic_index)||0, Math.max(0,curso.temas.length-1));
    const tema = curso.temas[temaIndice] || curso.temas[0];
    const progreso = Math.round(Number(usuario.progreso?.[curso.id])||0);
    return `<button class="lesson-card dashboard-recommendation" type="button" onclick="abrirCurso('${curso.id}',${temaIndice})">
      <span class="lesson-thumb" style="background:${curso.color}18">${curso.icono}</span>
      <span class="dashboard-recommendation-copy"><b>${escaparHTML(tema?.titulo||curso.nombre)}</b><small>${escaparHTML(curso.nombre)} · ${tema?.duracion||"Ruta oficial"}</small><span class="pbar"><span class="pbar-fill" style="width:${progreso}%;background:${curso.color}"></span></span></span>
      <span class="badge ${indice===0?"badge-purple":"badge-green"}">${progreso ? `${progreso}%` : "Comenzar"}</span>
    </button>`;
  }).join("");
}

function pintarNotificacionRacha(usuario) {
  const racha = Number(usuario.racha) || 0;
  const record = Math.max(Number(usuario.recordRacha) || 0, racha);
  const activaHoy = usuario.ultimoDiaEstudio === obtenerFechaLocalDashboard();

  cambiarDashboardTexto(
    "streak-notification-title",
    racha > 0 ? `¡Racha de ${racha} ${racha === 1 ? "día" : "días"}!` : "Aún no tienes una racha activa"
  );

  cambiarDashboardTexto(
    "streak-notification-body",
    racha > 0
      ? `${activaHoy ? "Tu racha está asegurada hoy." : "Practica hoy para conservarla."} Tu récord personal es de ${record} ${record === 1 ? "día" : "días"}.`
      : "Responde una pregunta para comenzar tu primera racha de estudio."
  );
}

function pintarMensajeRacha(usuario) {
  const hoy = obtenerFechaLocalDashboard();
  const racha = Number(usuario.racha) || 0;
  const estudioHoy = usuario.ultimoDiaEstudio === hoy;
  let mensaje;

  if (estudioHoy) {
    mensaje = `🔥 Llevas <strong style="color:var(--yellow)">${racha} ${racha === 1 ? "día" : "días"}</strong> estudiando. Tu racha ya está asegurada por hoy.`;
  } else if (racha > 0) {
    mensaje = `⚠️ Tu racha actual es de <strong style="color:var(--yellow)">${racha} días</strong>. Responde una pregunta hoy para conservarla.`;
  } else {
    mensaje = `Responde una pregunta hoy para iniciar tu <strong style="color:var(--yellow)">primera racha</strong> de estudio.`;
  }

  cambiarDashboardHTML("dashboard-streak-message", mensaje);
}

async function pintarActividadesRecientes() {
  const contenedor = document.getElementById("dashboard-activities");
  if (!contenedor || typeof window.obtenerActividades !== "function") return;

  const actividades = await window.obtenerActividades(4);
  if (!actividades.length) {
    contenedor.innerHTML = '<div style="padding:14px;color:var(--text3)">Aún no hay actividad. Completa tu primera pregunta para comenzar.</div>';
    return;
  }

  contenedor.innerHTML = actividades.map(actividad => {
    const esRacha = actividad.activity_type === "racha";
    const icono = esRacha ? "🔥" : "✅";
    const fondo = esRacha ? "var(--orange-bg)" : "var(--green-bg)";
    return `<div class="activity-item">
      <div class="activity-icon" style="background:${fondo}">${icono}</div>
      <div>
        <div class="activity-text"><strong>${escaparHTML(actividad.title || "Actividad")}</strong>${actividad.description ? ` · ${escaparHTML(actividad.description)}` : ""}</div>
        <div class="activity-time">${formatearTiempoRelativo(actividad.created_at)}</div>
      </div>
    </div>`;
  }).join("");
}

function formatearTiempoRelativo(fechaTexto) {
  const fecha = new Date(fechaTexto);
  const segundos = Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 1000));
  if (segundos < 60) return "Hace un momento";
  if (segundos < 3600) return `Hace ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `Hace ${Math.floor(segundos / 3600)} h`;
  const dias = Math.floor(segundos / 86400);
  return dias === 1 ? "Ayer" : `Hace ${dias} días`;
}

function obtenerFechaLocalDashboard() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function calcularPrecisionDashboard(usuario) {
  const total = Number(usuario.respuestasTotales) || 0;
  const correctas = Number(usuario.respuestasCorrectas) || 0;
  return total > 0 ? Math.round((correctas / total) * 100) : Number(usuario.precision) || 0;
}

function cambiarDashboardTexto(id, texto) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto;
}

function cambiarDashboardHTML(id, contenido) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.innerHTML = contenido;
}

function formatearDashboard(valor) {
  return Number(valor || 0).toLocaleString("es-PE");
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto ?? "");
  return div.innerHTML;
}

window.cargarDashboard = cargarDashboard;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => cargarDashboard(), 200);
});
document.addEventListener("uniprep:admission-ready", () => cargarDashboard());
document.addEventListener("uniprep:admission-change", () => cargarDashboard());
