// =====================================================
// UNIPREP - HORARIO SEMANAL PERSONALIZADO
// =====================================================
(function () {
  "use strict";

  const CLAVE = "uniprep_horario_semanal_v1";
  const CLAVE_AGENDA = "uniprep_agenda_v2";
  const DIAS = [
    {id:0,nombre:"Lunes",corto:"LUN"},{id:1,nombre:"Martes",corto:"MAR"},{id:2,nombre:"Miércoles",corto:"MIÉ"},
    {id:3,nombre:"Jueves",corto:"JUE"},{id:4,nombre:"Viernes",corto:"VIE"},{id:5,nombre:"Sábado",corto:"SÁB"},{id:6,nombre:"Domingo",corto:"DOM"}
  ];
  const ACTIVIDADES = {teoria:"Teoría",practica:"Práctica",repaso:"Repaso",simulacro:"Simulacro",video:"Videoclase"};

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function leer() {
    const datos = window.uniprepStorage?.leer(CLAVE, []);
    return Array.isArray(datos) ? datos : [];
  }

  function guardar(datos) {
    window.uniprepStorage?.guardar(CLAVE, Array.isArray(datos) ? datos : []);
  }

  function cursosActivos() {
    return Object.values(window.CURSOS_PREUNI || {})
      .filter(curso => window.cursoPermitidoAdmision?.(curso.id) !== false)
      .sort((a,b) => (Number(window.pesoCursoAdmision?.(b.id)) || 0) - (Number(window.pesoCursoAdmision?.(a.id)) || 0));
  }

  function cursoPorId(id) {
    return window.CURSOS_PREUNI?.[id] || {id,nombre:id,icono:"📚",color:"#7c5cff",temas:[]};
  }

  function minutos(hora) {
    const [h,m] = String(hora || "00:00").split(":").map(Number);
    return h * 60 + m;
  }

  function hora(minutosTotales) {
    const valor = Math.max(0, Math.min(1439, minutosTotales));
    return `${String(Math.floor(valor/60)).padStart(2,"0")}:${String(valor%60).padStart(2,"0")}`;
  }

  function crearModal() {
    let modal = document.getElementById("weekly-schedule-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "weekly-schedule-modal";
    modal.className = "weekly-schedule-modal";
    modal.innerHTML = `<section class="weekly-schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="weekly-schedule-title">
      <header class="weekly-schedule-head"><div><small>PLANIFICADOR PERSONAL</small><h2 id="weekly-schedule-title">Mi horario semanal</h2><p>Organiza teoría, videoclases, práctica y simulacros con los cursos de tu ruta.</p></div><button type="button" onclick="cerrarHorarioPersonalizado()" aria-label="Cerrar">×</button></header>
      <div class="weekly-schedule-actions"><button class="btn btn-primary btn-sm" type="button" onclick="editarSesionHorario()">＋ Nueva sesión</button><button class="btn btn-ghost btn-sm" type="button" onclick="mostrarGeneradorHorario()">✦ Crear propuesta</button><button class="btn btn-ghost btn-sm" type="button" onclick="sincronizarHorarioAgenda()">↗ Pasar a Agenda</button><button class="btn btn-ghost btn-sm" type="button" onclick="exportarHorarioICS()">⇩ Exportar .ics</button></div>
      <div class="weekly-schedule-stats" id="weekly-schedule-stats"></div>
      <div class="weekly-schedule-panel" id="weekly-schedule-generator">
        <div class="weekly-panel-head"><div><span>PROPUESTA INTELIGENTE</span><h3>Adáptala a tu tiempo disponible</h3></div><button type="button" onclick="cerrarPanelHorario()">×</button></div>
        <div class="weekly-generator-grid"><label>Días disponibles<span class="weekly-day-checks">${DIAS.map((dia,i)=>`<label><input type="checkbox" name="schedule-day" value="${dia.id}"${i<6?" checked":""}><span>${dia.corto}</span></label>`).join("")}</span></label><label>Hora de inicio<input id="schedule-generator-start" type="time" value="18:00"></label><label>Duración por sesión<select id="schedule-generator-duration"><option value="45">45 minutos</option><option value="60" selected>60 minutos</option><option value="90">90 minutos</option><option value="120">120 minutos</option></select></label><label>Sesiones por día<select id="schedule-generator-count"><option value="1" selected>1 sesión</option><option value="2">2 sesiones</option><option value="3">3 sesiones</option></select></label></div>
        <div class="weekly-panel-actions"><button class="btn btn-ghost btn-sm" type="button" onclick="cerrarPanelHorario()">Cancelar</button><button class="btn btn-primary btn-sm" type="button" onclick="generarHorarioInteligente()">Generar con mi ruta</button></div>
      </div>
      <form class="weekly-schedule-panel" id="weekly-schedule-form">
        <div class="weekly-panel-head"><div><span>SESIÓN DE ESTUDIO</span><h3 id="schedule-form-title">Nueva sesión</h3></div><button type="button" onclick="cerrarPanelHorario()">×</button></div><input id="schedule-session-id" type="hidden">
        <div class="weekly-form-grid"><label>Curso<select id="schedule-course" required></select></label><label>Actividad<select id="schedule-activity"><option value="teoria">Teoría</option><option value="practica">Práctica</option><option value="repaso">Repaso</option><option value="simulacro">Simulacro</option><option value="video">Videoclase</option></select></label><label>Día<select id="schedule-day">${DIAS.map(dia=>`<option value="${dia.id}">${dia.nombre}</option>`).join("")}</select></label><label>Inicio<input id="schedule-start" type="time" value="18:00" required></label><label>Fin<input id="schedule-end" type="time" value="19:00" required></label><label class="weekly-objective">Objetivo<input id="schedule-objective" maxlength="120" placeholder="Ej. Dominar ecuaciones cuadráticas"></label></div>
        <div class="weekly-form-error" id="schedule-form-error"></div><div class="weekly-panel-actions"><button class="btn btn-ghost btn-sm weekly-delete" id="schedule-delete" type="button" onclick="eliminarSesionHorario()">Eliminar</button><span></span><button class="btn btn-ghost btn-sm" type="button" onclick="cerrarPanelHorario()">Cancelar</button><button class="btn btn-primary btn-sm" type="submit">Guardar sesión</button></div>
      </form>
      <div class="weekly-schedule-grid" id="weekly-schedule-grid"></div>
      <footer class="weekly-schedule-footer"><p><b>Guardado automático.</b> Tu horario permanece en este dispositivo y puedes pasarlo a la Agenda para recibir recordatorios.</p><button type="button" onclick="limpiarHorarioPersonalizado()">Vaciar horario</button></footer>
    </section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", evento => { if (evento.target === modal) cerrar(); });
    document.getElementById("weekly-schedule-form").addEventListener("submit", guardarFormulario);
    return modal;
  }

  function abrir(opciones = {}) {
    const modal = crearModal();
    cerrarPanel();
    renderizar();
    modal.classList.add("open");
    if (opciones?.cursoId) setTimeout(() => editar("", opciones), 30);
  }

  function cerrar() {
    document.getElementById("weekly-schedule-modal")?.classList.remove("open");
  }

  function cerrarPanel() {
    document.querySelectorAll("#weekly-schedule-modal .weekly-schedule-panel").forEach(panel => panel.classList.remove("open"));
  }

  function opcionesCursos(valor = "") {
    return cursosActivos().map(curso => `<option value="${curso.id}"${curso.id===valor?" selected":""}>${curso.icono} ${esc(curso.nombre)}</option>`).join("");
  }

  function editar(id = "", predeterminado = {}) {
    crearModal();
    cerrarPanel();
    const sesion = leer().find(item => String(item.id) === String(id));
    const cursoInicial = sesion?.cursoId || predeterminado.cursoId || cursosActivos()[0]?.id || "rm";
    document.getElementById("schedule-session-id").value = sesion?.id || "";
    document.getElementById("schedule-course").innerHTML = opcionesCursos(cursoInicial);
    document.getElementById("schedule-activity").value = sesion?.actividad || predeterminado.actividad || "practica";
    document.getElementById("schedule-day").value = String(sesion?.dia ?? predeterminado.dia ?? 0);
    document.getElementById("schedule-start").value = sesion?.inicio || predeterminado.inicio || "18:00";
    document.getElementById("schedule-end").value = sesion?.fin || predeterminado.fin || "19:00";
    document.getElementById("schedule-objective").value = sesion?.objetivo || predeterminado.objetivo || "";
    document.getElementById("schedule-form-title").textContent = sesion ? "Editar sesión" : "Nueva sesión";
    document.getElementById("schedule-delete").style.display = sesion ? "" : "none";
    document.getElementById("schedule-form-error").textContent = "";
    document.getElementById("weekly-schedule-form").classList.add("open");
    setTimeout(() => document.getElementById("schedule-course")?.focus(), 30);
  }

  function mostrarGenerador() {
    crearModal();
    cerrarPanel();
    document.getElementById("weekly-schedule-generator").classList.add("open");
  }

  function mostrarError(mensaje) {
    const error = document.getElementById("schedule-form-error");
    if (error) error.textContent = mensaje;
  }

  function guardarFormulario(evento) {
    evento.preventDefault();
    const id = document.getElementById("schedule-session-id").value || `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const sesion = {
      id,
      cursoId:document.getElementById("schedule-course").value,
      actividad:document.getElementById("schedule-activity").value,
      dia:Number(document.getElementById("schedule-day").value),
      inicio:document.getElementById("schedule-start").value,
      fin:document.getElementById("schedule-end").value,
      objetivo:document.getElementById("schedule-objective").value.trim()
    };
    if (!sesion.cursoId || !sesion.inicio || !sesion.fin) return mostrarError("Completa curso, día, inicio y fin.");
    if (minutos(sesion.fin) <= minutos(sesion.inicio)) return mostrarError("La hora de fin debe ser posterior a la hora de inicio.");
    const datos = leer();
    const choque = datos.find(item => String(item.id)!==String(id) && item.dia===sesion.dia && minutos(sesion.inicio)<minutos(item.fin) && minutos(sesion.fin)>minutos(item.inicio));
    if (choque) return mostrarError(`Se cruza con ${cursoPorId(choque.cursoId).nombre}, de ${choque.inicio} a ${choque.fin}.`);
    const indice = datos.findIndex(item => String(item.id) === String(id));
    if (indice >= 0) datos[indice] = sesion; else datos.push(sesion);
    guardar(datos);
    cerrarPanel();
    renderizar();
    toast(indice >= 0 ? "Sesión actualizada." : "Sesión añadida a tu horario.");
  }

  function eliminar() {
    const id = document.getElementById("schedule-session-id")?.value;
    if (!id || !confirm("¿Eliminar esta sesión del horario?")) return;
    guardar(leer().filter(item => String(item.id) !== String(id)));
    cerrarPanel();
    renderizar();
    toast("Sesión eliminada.");
  }

  function limpiar() {
    if (!leer().length || !confirm("¿Vaciar todo tu horario semanal?")) return;
    guardar([]);
    cerrarPanel();
    renderizar();
    toast("Horario vaciado.");
  }

  function generar() {
    const dias = [...document.querySelectorAll('input[name="schedule-day"]:checked')].map(input => Number(input.value));
    const inicio = document.getElementById("schedule-generator-start").value;
    const duracion = Number(document.getElementById("schedule-generator-duration").value) || 60;
    const cantidad = Number(document.getElementById("schedule-generator-count").value) || 1;
    const cursos = cursosActivos();
    if (!dias.length) return toast("Selecciona por lo menos un día disponible.");
    if (!inicio || !cursos.length) return toast("Completa la hora y configura tu ruta académica.");
    if (leer().length && !confirm("La propuesta reemplazará tu horario actual. ¿Continuar?")) return;
    const uso = Object.fromEntries(cursos.map(curso => [curso.id,0]));
    const pesos = Object.fromEntries(cursos.map(curso => [curso.id,Math.max(1,Number(window.pesoCursoAdmision?.(curso.id))||1)]));
    const datos = [];
    let correlativo = 0;
    dias.forEach(dia => {
      for (let bloque=0; bloque<cantidad; bloque++) {
        const curso = [...cursos].sort((a,b) => (uso[a.id]/pesos[a.id])-(uso[b.id]/pesos[b.id]) || pesos[b.id]-pesos[a.id])[0];
        uso[curso.id] += 1;
        const desde = minutos(inicio) + bloque * (duracion + 10);
        const hasta = desde + duracion;
        if (hasta >= 1440) continue;
        const tema = curso.temas?.[correlativo % Math.max(1,curso.temas.length)]?.titulo || `Repaso de ${curso.nombre}`;
        datos.push({id:`auto-${Date.now()}-${correlativo++}`,cursoId:curso.id,actividad:bloque%2?"practica":"teoria",dia,inicio:hora(desde),fin:hora(hasta),objetivo:tema});
      }
    });
    guardar(datos);
    cerrarPanel();
    renderizar();
    toast(`Propuesta creada: ${datos.length} sesiones según tu ruta.`);
  }

  function renderizar() {
    if (!document.getElementById("weekly-schedule-grid")) return;
    const datos = leer().sort((a,b) => a.dia-b.dia || a.inicio.localeCompare(b.inicio));
    const totalMinutos = datos.reduce((suma,item) => suma + Math.max(0,minutos(item.fin)-minutos(item.inicio)),0);
    const diasActivos = new Set(datos.map(item=>item.dia)).size;
    const cursosUsados = new Set(datos.map(item=>item.cursoId)).size;
    const ruta = window.obtenerSeleccionAdmision?.();
    document.getElementById("weekly-schedule-stats").innerHTML = `<div><b>${datos.length}</b><span>sesiones semanales</span></div><div><b>${Math.floor(totalMinutos/60)}h ${totalMinutos%60?`${totalMinutos%60}m`:""}</b><span>tiempo planificado</span></div><div><b>${diasActivos}/7</b><span>días activos</span></div><div><b>${cursosUsados}</b><span>cursos · ${esc(ruta?.universidadCorta || "ruta general")}</span></div>`;
    document.getElementById("weekly-schedule-grid").innerHTML = DIAS.map(dia => {
      const sesiones = datos.filter(item => item.dia === dia.id);
      return `<section class="weekly-day-column"><header><span>${dia.corto}</span><b>${dia.nombre}</b><small>${sesiones.length} ${sesiones.length===1?"sesión":"sesiones"}</small></header><div>${sesiones.map(sesion => {
        const curso=cursoPorId(sesion.cursoId), permitido=window.cursoPermitidoAdmision?.(sesion.cursoId)!==false;
        return `<article class="weekly-session${permitido?"":" outside-route"}" style="--session-color:${curso.color}"><button class="weekly-session-main" type="button" onclick="editarSesionHorario('${esc(sesion.id)}')"><span>${sesion.inicio}–${sesion.fin}</span><b>${curso.icono} ${esc(curso.nombre)}</b><small>${esc(ACTIVIDADES[sesion.actividad]||sesion.actividad)}${sesion.objetivo?` · ${esc(sesion.objetivo)}`:""}</small>${permitido?"":"<em>Fuera de la ruta actual</em>"}</button><button class="weekly-session-go" type="button" onclick="estudiarSesionHorario('${sesion.cursoId}')" ${permitido?"":"disabled"} title="Estudiar ahora">→</button></article>`;
      }).join("")}<button class="weekly-add-day" type="button" onclick="editarSesionHorario('',{dia:${dia.id}})">＋ Añadir</button></div></section>`;
    }).join("");
  }

  function lunesActual() {
    const fecha = new Date();
    fecha.setHours(12,0,0,0);
    fecha.setDate(fecha.getDate() - ((fecha.getDay()+6)%7));
    return fecha;
  }

  function fechaLocal(fecha) {
    return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
  }

  function sincronizarAgenda() {
    const horario = leer();
    if (!horario.length) return toast("Primero crea por lo menos una sesión.");
    let agenda=[];
    const dato=window.uniprepStorage?.leer(CLAVE_AGENDA,[]);agenda=Array.isArray(dato)?dato:[];
    const lunes=lunesActual(), semana=fechaLocal(lunes);
    agenda=agenda.filter(evento => !(evento.origenHorario===true && evento.semanaHorario===semana));
    horario.forEach(sesion => {
      const fecha=new Date(lunes);fecha.setDate(lunes.getDate()+sesion.dia);
      const curso=cursoPorId(sesion.cursoId), prioridad=window.detallePesoCursoAdmision?.(sesion.cursoId)?.clase==="alta"?"alta":"media";
      agenda.push({id:`horario-${semana}-${sesion.id}`,titulo:`${curso.nombre} · ${ACTIVIDADES[sesion.actividad]||sesion.actividad}`,fecha:fechaLocal(fecha),tipo:sesion.actividad==="simulacro"?"examen":"estudio",inicio:sesion.inicio,fin:sesion.fin,prioridad,recordatorio:10,descripcion:sesion.objetivo||"Sesión del horario semanal UniPrep",completado:false,notificado:false,origenHorario:true,semanaHorario:semana,cursoId:sesion.cursoId});
    });
    window.uniprepStorage?.guardar(CLAVE_AGENDA,agenda);
    window.renderizarAgenda?.();
    toast(`${horario.length} sesiones pasadas a la Agenda de esta semana.`);
  }

  function exportarICS() {
    const horario=leer();
    if(!horario.length)return toast("Primero crea tu horario semanal.");
    const lunes=lunesActual(),diasICS=["MO","TU","WE","TH","FR","SA","SU"];
    const limpiar=v=>String(v||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
    const fechaHora=(fecha,horaTexto)=>`${fechaLocal(fecha).replace(/-/g,"")}T${horaTexto.replace(":","")}00`;
    const eventos=horario.map(sesion=>{const fecha=new Date(lunes);fecha.setDate(lunes.getDate()+sesion.dia);const curso=cursoPorId(sesion.cursoId);return ["BEGIN:VEVENT",`UID:${limpiar(sesion.id)}@uniprep`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,`DTSTART:${fechaHora(fecha,sesion.inicio)}`,`DTEND:${fechaHora(fecha,sesion.fin)}`,`RRULE:FREQ=WEEKLY;BYDAY=${diasICS[sesion.dia]}`,`SUMMARY:${limpiar(`${curso.nombre} · ${ACTIVIDADES[sesion.actividad]||sesion.actividad}`)}`,`DESCRIPTION:${limpiar(sesion.objetivo||"Horario semanal UniPrep")}`,"END:VEVENT"].join("\r\n")}).join("\r\n");
    const contenido=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//UniPrep//Horario semanal//ES\r\nCALSCALE:GREGORIAN\r\n${eventos}\r\nEND:VCALENDAR`;
    const enlace=document.createElement("a");enlace.href=URL.createObjectURL(new Blob([contenido],{type:"text/calendar;charset=utf-8"}));enlace.download="Mi_horario_UniPrep.ics";document.body.appendChild(enlace);enlace.click();setTimeout(()=>{URL.revokeObjectURL(enlace.href);enlace.remove()},1000);
    toast("Horario exportado para Google Calendar, Outlook o Apple Calendar.");
  }

  function estudiar(cursoId) {
    cerrar();
    if(typeof window.configurarPractica==="function")window.configurarPractica(cursoId);else window.abrirCurso?.(cursoId,0);
  }

  function toast(mensaje) {
    const elemento=document.createElement("div");elemento.className="premium-toast";elemento.textContent=mensaje;document.body.appendChild(elemento);setTimeout(()=>elemento.remove(),3700);
  }

  window.abrirHorarioPersonalizado=abrir;
  window.cerrarHorarioPersonalizado=cerrar;
  window.cerrarPanelHorario=cerrarPanel;
  window.editarSesionHorario=editar;
  window.eliminarSesionHorario=eliminar;
  window.limpiarHorarioPersonalizado=limpiar;
  window.mostrarGeneradorHorario=mostrarGenerador;
  window.generarHorarioInteligente=generar;
  window.sincronizarHorarioAgenda=sincronizarAgenda;
  window.exportarHorarioICS=exportarICS;
  window.estudiarSesionHorario=estudiar;
  window.renderizarHorarioPersonalizado=renderizar;

  document.addEventListener("uniprep:admission-change", renderizar);
  document.addEventListener("uniprep:user-ready", renderizar);
  document.addEventListener("uniprep:storage-scope-change", renderizar);
})();
