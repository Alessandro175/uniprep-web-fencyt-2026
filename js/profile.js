// =====================================================
// UNIPREP - PERFIL, ANALÍTICA Y REGISTRO ACADÉMICO
// =====================================================

(function () {
  "use strict";

  const IDS_CURSOS = ["rm","aritmetica","algebra","geometria","trigonometria","fisica","quimica","biologia","medio_ambiente","anatomia","psicologia","rv","comprension_lectora","lenguaje","literatura","historia","historia_peru","geografia","filosofia","economia","civica"];
  const progresoInicial = Object.fromEntries(IDS_CURSOS.map(id => [id,0]));

  document.addEventListener("DOMContentLoaded", () => setTimeout(cargarPerfilUsuario, 140));

  async function cargarPerfilUsuario() {
    if (typeof window.obtenerUsuarioActivo !== "function") return false;
    try {
      const usuario = await window.obtenerUsuarioActivo();
      if (!usuario) return false;
      asegurarDatosPerfil(usuario);
      pintarDatosPerfil(usuario);
      pintarRacha(usuario);
      pintarAnalitica(usuario);
      pintarLogros(usuario);
      return true;
    } catch (error) {
      console.error("No se pudo cargar el perfil:", error);
      return false;
    }
  }

  function asegurarDatosPerfil(usuario) {
    const predeterminados = {nombre:"Estudiante UniPrep",carrera:"Carrera por definir",universidad:"Universidad por definir",xp:0,nivel:1,monedas:0,racha:0,recordRacha:0,ejercicios:0,respuestasCorrectas:0,respuestasTotales:0,precision:0,ranking:null,simulacros:0};
    Object.entries(predeterminados).forEach(([clave, valor]) => {
      if (usuario[clave] === undefined || usuario[clave] === null || usuario[clave] === "") usuario[clave] = valor;
    });
    usuario.progreso = {...progresoInicial,...(usuario.progreso || {})};
    usuario.progresoDetallado = Array.isArray(usuario.progresoDetallado) ? usuario.progresoDetallado : [];
  }

  function pintarDatosPerfil(usuario) {
    const nombre = usuario.nombre || "Estudiante UniPrep";
    const carrera = usuario.carrera || "Carrera por definir";
    const universidad = usuario.universidad || "Universidad por definir";
    texto("profile-name", nombre);
    texto("profile-avatar", iniciales(nombre));
    texto("profile-sub", `Preuniversitario · ${carrera}`);
    texto("profile-goal", `🎯 Meta: ${carrera} — ${universidad}`);
    texto("profile-exercises", numero(usuario.ejercicios));
    texto("profile-precision", `${calcularPrecision(usuario)}%`);
    texto("profile-streak", Number(usuario.racha) || 0);
    texto("profile-ranking", usuario.ranking ? `#${usuario.ranking}` : "#--");
    texto("profile-xp", numero(usuario.xp));

    const sidebarName = document.querySelector(".user-name");
    const sidebarSub = document.querySelector(".user-sub");
    const sidebarAvatar = document.querySelector(".user-avatar");
    if (sidebarName) sidebarName.textContent = nombre;
    if (sidebarSub) sidebarSub.textContent = carrera;
    if (sidebarAvatar) {
      const online = sidebarAvatar.querySelector(".user-avatar-online");
      sidebarAvatar.textContent = iniciales(nombre);
      if (online) sidebarAvatar.appendChild(online);
    }
    const saludo = document.querySelector(".welcome-title");
    if (saludo) saludo.innerHTML = `¡Buenas tardes,<br>${esc(nombre.trim().split(/\s+/)[0])}! 👋`;
  }

  function pintarRacha(usuario) {
    const racha = Number(usuario.racha) || 0;
    const record = Math.max(Number(usuario.recordRacha) || 0, racha);
    texto("streak-days", `${racha} ${racha === 1 ? "día" : "días"}`);
    texto("streak-description", racha ? `Racha de estudio activa · Récord: ${record} días` : "Responde una pregunta para iniciar tu racha");
    const contenedor = document.getElementById("streak-dots");
    if (!contenedor) return;
    const total = Math.max(21, Math.min(Math.max(record,racha),30));
    contenedor.innerHTML = Array.from({length:total}, (_,i) => `<div class="streak-dot${i < racha ? " done" : ""}" title="Día ${i + 1}: ${i < racha ? "completado" : "pendiente"}"></div>`).join("");
  }

  function filaCurso(usuario, id) {
    const fila = usuario.progresoDetallado.find(item => item.course_id === id) || {};
    return {
      id,
      progreso:limitar(fila.progress ?? usuario.progreso?.[id] ?? 0),
      correctas:Number(fila.correct_answers) || 0,
      total:Number(fila.total_answers) || 0,
      completadas:Number(fila.completed_exercises) || 0,
      ultimoTema:Number(fila.last_topic_index) || 0
    };
  }

  function pintarAnalitica(usuario) {
    const idsActivos = IDS_CURSOS
      .filter(id => window.cursoPermitidoAdmision?.(id) !== false)
      .sort((a,b) => (Number(window.pesoCursoAdmision?.(b)) || 0) - (Number(window.pesoCursoAdmision?.(a)) || 0));
    const cursos = idsActivos.map(id => filaCurso(usuario,id));
    const respuestas = Number(usuario.respuestasTotales) || cursos.reduce((s,f) => s + f.total,0);
    const precision = calcularPrecision(usuario);
    const cobertura = Math.round(cursos.reduce((s,f) => s + f.progreso,0) / cursos.length);
    const consistencia = Math.min(100, Math.round((Number(usuario.racha) || 0) / 7 * 100));
    const preparacion = respuestas ? Math.round(cobertura * .45 + precision * .45 + consistencia * .10) : 0;
    const errores = leerLista("uniprep_practice_errors_v1").length;
    const iniciados = cursos.filter(f => f.total > 0 || f.progreso > 0).length;

    texto("analysis-answered", numero(respuestas));
    texto("analysis-accuracy", `${precision}%`);
    texto("analysis-errors", errores);
    texto("analysis-courses-started", `${iniciados}/${cursos.length}`);
    texto("profile-readiness", `${preparacion}%`);
    const aro = document.getElementById("profile-readiness-ring");
    if (aro) aro.style.setProperty("--readiness", preparacion);
    texto("profile-readiness-title", preparacion >= 80 ? "Nivel competitivo" : preparacion >= 60 ? "Vas por buen camino" : preparacion >= 30 ? "Base en construcción" : "Comienza tu diagnóstico");
    texto("profile-readiness-copy", respuestas ? `Tu índice combina ${precision}% de precisión, ${cobertura}% de cobertura y una racha de ${Number(usuario.racha)||0} días.` : "Responde preguntas para generar una lectura académica confiable.");
    const nube = document.getElementById("profile-cloud-status");
    if (nube) { nube.textContent = usuario.id ? "● Progreso sincronizado con Supabase" : "● Modo local"; nube.classList.toggle("online", Boolean(usuario.id)); }

    renderizarProgresoCursos(cursos);
    renderizarFortalezas(usuario,cursos,respuestas);
  }

  function renderizarProgresoCursos(cursos) {
    const contenedor = document.getElementById("profile-course-progress");
    if (!contenedor) return;
    contenedor.innerHTML = cursos.map(fila => {
      const curso = window.CURSOS_PREUNI?.[fila.id] || {nombre:fila.id,icono:"•",color:"#7c5cff"};
      const precision = fila.total ? Math.round(fila.correctas / fila.total * 100) : 0;
      return `<button type="button" class="analysis-course-row" onclick="abrirCurso('${fila.id}',${fila.ultimoTema})">
        <i style="background:${curso.color}18">${curso.icono}</i><span><b>${esc(curso.nombre)}</b><small>${fila.total ? `${fila.total} respuestas · ${precision}% precisión` : "Sin diagnóstico todavía"}</small><em><span style="width:${fila.progreso}%;background:${curso.color}"></span></em></span><strong>${fila.progreso}%</strong>
      </button>`;
    }).join("");
  }

  function renderizarFortalezas(usuario,cursos,respuestas) {
    const contenedor = document.getElementById("profile-strengths");
    if (!contenedor) return;
    const conEvidencia = cursos.filter(f => f.total >= 3).map(f => ({...f,precision:Math.round(f.correctas / f.total * 100)})).sort((a,b) => b.precision - a.precision || b.total - a.total);
    if (!conEvidencia.length) {
      contenedor.innerHTML = `<div class="analysis-empty"><span>◎</span><b>Aún no inventamos fortalezas</b><p>Necesitas al menos 3 respuestas en un curso. Así el diagnóstico se basa en evidencia real.</p></div>`;
      configurarSiguienteAccion(null);
      return;
    }

    const mejores = conEvidencia.slice(0,2);
    const prioridades = [...conEvidencia].sort((a,b) => a.precision - b.precision || b.total - a.total).slice(0,3);
    const seleccion = [...mejores.map(f => ({...f,tipo:"Fuerte"})),...prioridades.filter(p => !mejores.some(m => m.id === p.id)).map(f => ({...f,tipo:f.precision < 50 ? "Prioridad" : "En progreso"}))].slice(0,5);
    contenedor.innerHTML = seleccion.map(fila => {
      const curso = window.CURSOS_PREUNI?.[fila.id] || {nombre:fila.id,icono:"•"};
      const clase = fila.tipo === "Fuerte" ? "strong" : fila.tipo === "Prioridad" ? "weak" : "medium";
      const badge = fila.tipo === "Fuerte" ? "badge-green" : fila.tipo === "Prioridad" ? "badge-pink" : "badge-yellow";
      return `<button class="strength-row" type="button" onclick="configurarPractica('${fila.id}')"><span class="strength-dot ${clase}"></span><span class="strength-name"><b>${curso.icono} ${esc(curso.nombre)}</b><small>${fila.correctas}/${fila.total} correctas · ${fila.precision}%</small></span><span class="badge ${badge}">${fila.tipo}</span></button>`;
    }).join("");
    configurarSiguienteAccion(prioridades[0]);
  }

  function configurarSiguienteAccion(prioridad) {
    const boton = document.getElementById("profile-next-action");
    if (!boton) return;
    if (!prioridad) {
      texto("profile-next-action-title","Realizar práctica diagnóstica");
      texto("profile-next-action-copy","Necesitamos respuestas reales para detectar tu prioridad.");
      boton.onclick = () => window.abrirCentroPractica?.(null);
      return;
    }
    const curso = window.CURSOS_PREUNI?.[prioridad.id] || {nombre:prioridad.id};
    texto("profile-next-action-title",`Reforzar ${curso.nombre}`);
    texto("profile-next-action-copy",`${prioridad.precision}% de precisión en ${prioridad.total} respuestas. Es tu mejor oportunidad de mejora.`);
    boton.onclick = () => window.configurarPractica?.(prioridad.id);
  }

  function pintarLogros(usuario) {
    const precision = calcularPrecision(usuario), racha = Number(usuario.racha)||0, ranking=Number(usuario.ranking)||0, ejercicios=Number(usuario.ejercicios)||0;
    logro("achievement-streak-7",racha>=7); logro("achievement-perfect",precision===100 && Number(usuario.respuestasTotales)>0); logro("achievement-top-10",ranking>0&&ranking<=10); logro("achievement-500",ejercicios>=500); logro("achievement-speed",usuario.logroVelocidad===true); logro("achievement-streak-30",racha>=30); logro("achievement-top-3",ranking>0&&ranking<=3); logro("achievement-1000",ejercicios>=1000);
    const cursosMeta = IDS_CURSOS.filter(id => window.cursoPermitidoAdmision?.(id) !== false);
    logro("achievement-perfection",cursosMeta.length > 0 && cursosMeta.every(id => Number(usuario.progreso?.[id]) >= 90));
  }

  async function registrarResultadoEjercicio({correcto,area,cursoId=null,tema=null,preguntaId=null,xpGanado=10,tiempoSegundos=null}) {
    if (typeof window.obtenerUsuarioActivo !== "function") return {exito:false};
    const usuario = await window.obtenerUsuarioActivo();
    if (!usuario) return {exito:false};
    asegurarDatosPerfil(usuario);

    usuario.ejercicios = Number(usuario.ejercicios) + 1;
    usuario.respuestasTotales = Number(usuario.respuestasTotales) + 1;
    if (correcto) { usuario.respuestasCorrectas = Number(usuario.respuestasCorrectas) + 1; usuario.xp = Number(usuario.xp) + Number(xpGanado || 0); }
    usuario.precision = calcularPrecision(usuario);
    usuario.nivel = Math.floor(Number(usuario.xp) / 500) + 1;
    if (correcto && tiempoSegundos !== null && Number(tiempoSegundos) < 30) usuario.logroVelocidad = true;

    let guardadoPerfil = true;
    if (typeof window.actualizarEstadisticasUsuario === "function") {
      guardadoPerfil = await window.actualizarEstadisticasUsuario({ejercicios:usuario.ejercicios,respuestasTotales:usuario.respuestasTotales,respuestasCorrectas:usuario.respuestasCorrectas,precision:usuario.precision,xp:usuario.xp,nivel:usuario.nivel});
    }

    let guardadoCurso = true;
    if (cursoId && IDS_CURSOS.includes(cursoId) && typeof window.guardarProgresoCurso === "function") {
      const actual = filaCurso(usuario,cursoId);
      const completadas = actual.completadas + 1;
      const correctas = actual.correctas + (correcto ? 1 : 0);
      const total = actual.total + 1;
      const metaCurso = Math.max(40,(window.CURSOS_PREUNI?.[cursoId]?.temas?.length || 1) * 40);
      const progreso = limitar(completadas / metaCurso * 100);
      const indiceTema = Math.max(0, window.CURSOS_PREUNI?.[cursoId]?.temas?.findIndex(t => t.titulo === tema) ?? actual.ultimoTema);
      const resultado = await window.guardarProgresoCurso(cursoId,{progress:progreso,completedExercises:completadas,correctAnswers:correctas,totalAnswers:total,lastTopicIndex:indiceTema});
      guardadoCurso = resultado?.exito === true;
      usuario.progreso[cursoId] = progreso;
      const nuevaFila = {course_id:cursoId,progress:progreso,completed_exercises:completadas,correct_answers:correctas,total_answers:total,last_topic_index:indiceTema,pregunta_id:preguntaId};
      usuario.progresoDetallado = [...usuario.progresoDetallado.filter(f => f.course_id !== cursoId),nuevaFila];
    }

    pintarDatosPerfil(usuario); pintarAnalitica(usuario); pintarLogros(usuario);
    return {exito:Boolean(guardadoPerfil && guardadoCurso),usuario};
  }

  async function abrirEditarPerfil() {
    const usuario = typeof window.obtenerUsuarioActivo === "function" ? await window.obtenerUsuarioActivo() : null;
    if (!usuario) return alert("No existe una sesión activa.");
    const nombre = prompt("Escribe tu nombre completo:",usuario.nombre||""); if (nombre === null) return;
    usuario.nombre = nombre.trim() || usuario.nombre;
    const resultado = await window.actualizarUsuario?.(usuario);
    if (!resultado?.exito) return alert(resultado?.mensaje || "No se pudo actualizar el perfil.");
    await cargarPerfilUsuario();
    window.actualizarDatosGenerales?.(usuario);
    alert("Nombre actualizado correctamente. Tu universidad, área y carrera se cambian desde «Mi objetivo de admisión».");
  }

  function leerLista(clave) { const datos=window.uniprepStorage?.leer(clave,[]); return Array.isArray(datos)?datos:[]; }
  function calcularPrecision(usuario) { const total=Number(usuario.respuestasTotales)||0, correctas=Number(usuario.respuestasCorrectas)||0; return total?Math.round(correctas/total*100):limitar(usuario.precision); }
  function limitar(valor) { return Math.max(0,Math.min(100,Math.round(Number(valor)||0))); }
  function iniciales(nombre="") { return nombre.trim().split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0].toUpperCase()).join("")||"PU"; }
  function numero(valor) { return Number(valor||0).toLocaleString("es-PE"); }
  function texto(id,valor) { const elemento=document.getElementById(id); if(elemento) elemento.textContent=valor; }
  function esc(valor) { const nodo=document.createElement("div"); nodo.textContent=String(valor??""); return nodo.innerHTML; }
  function logro(id,activo) { const elemento=document.getElementById(id); if(elemento){elemento.classList.toggle("locked",!activo);elemento.classList.toggle("unlocked",activo);} }

  window.cargarPerfil = cargarPerfilUsuario;
  window.cargarPerfilUsuario = cargarPerfilUsuario;
  window.registrarResultadoEjercicio = registrarResultadoEjercicio;
  window.abrirEditarPerfil = abrirEditarPerfil;

  window.supabaseClient?.auth?.onAuthStateChange(async (evento,sesion) => {
    if (evento === "SIGNED_IN" && sesion?.user) await cargarPerfilUsuario();
    if (evento === "SIGNED_OUT") texto("profile-name","Estudiante UniPrep");
  });
  document.addEventListener("uniprep:admission-change", cargarPerfilUsuario);
})();
