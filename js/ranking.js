(function () {
  "use strict";

  const DEPARTAMENTOS = ["Amazonas","Áncash","Apurímac","Arequipa","Ayacucho","Cajamarca","Callao","Cusco","Huancavelica","Huánuco","Ica","Junín","La Libertad","Lambayeque","Lima","Loreto","Madre de Dios","Moquegua","Pasco","Piura","Puno","San Martín","Tacna","Tumbes","Ucayali"];
  const METRICAS = {
    puntos:{nombre:"Puntos",campo:"puntos_periodo",formato:v=>numero(v)+" pts",detalle:p=>`${numero(p.preguntas_periodo)} preguntas en el periodo`},
    precision:{nombre:"Precisión",campo:"precision_periodo",formato:v=>numero(v)+"%",detalle:p=>`${numero(p.correctas_periodo)}/${numero(p.preguntas_periodo)} correctas`},
    preguntas:{nombre:"Preguntas",campo:"preguntas_periodo",formato:v=>numero(v),detalle:p=>`${numero(p.correctas_periodo)} respuestas correctas`},
    simulacro:{nombre:"Mejor simulacro",campo:"mejor_simulacro",formato:v=>`${Number(v||0).toLocaleString("es-PE",{maximumFractionDigits:1})}%`,detalle:p=>p.escala_simulacro||"Sin simulacro en el periodo"}
  };
  const PERIODOS = {dia:"Hoy",semana:"Esta semana",mes:"Este mes",total:"Histórico"};
  const estado = {perfiles:[], periodo:"semana", alcance:"nacional", vista:"estudiantes", metrica:"puntos", cargando:false, ultimaCarga:0, esquemaCompleto:true, error:null};

  function esc(valor){const d=document.createElement("div");d.textContent=String(valor??"");return d.innerHTML}
  function numero(valor){return Number(valor||0).toLocaleString("es-PE")}
  function valor(perfil){return Number(perfil?.[METRICAS[estado.metrica].campo])||0}
  function iniciales(nombre=""){return String(nombre||"").trim().split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join("")||"UP"}
  function nombrePublico(nombre="Estudiante"){const p=String(nombre||"Estudiante").trim().split(/\s+/).filter(Boolean);return p.length>1?`${p[0]} ${p[1][0]}.`:p[0]||"Estudiante"}
  function normalizar(valor=""){return String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
  function regionUsuario(usuario){return usuario?.procedencia||window.obtenerSeleccionAdmision?.()?.procedencia||""}

  async function cargarRanking(forzar=false) {
    const pantalla=document.getElementById("ranking");
    if(!pantalla||estado.cargando)return;
    construirEstructura(pantalla);
    if(!forzar&&estado.perfiles.length&&Date.now()-estado.ultimaCarga<45000){renderizar();return}
    estado.cargando=true; estadoCarga("Calculando el ranking con resultados reales…");
    const usuario=typeof window.obtenerUsuarioActivo==="function"?await window.obtenerUsuarioActivo():null;
    const regionFiltro=estado.alcance==="nacional"?null:estado.alcance==="mi_region"?regionUsuario(usuario):estado.alcance;
    let perfiles=[]; let errorConsulta=null; estado.esquemaCompleto=true;
    try{
      if(!window.supabaseClient)throw new Error("Supabase no está disponible");
      const respuesta=await window.supabaseClient.rpc("obtener_ranking_uniprep_v2",{p_periodo:estado.periodo,p_region:regionFiltro||null});
      if(respuesta.error)throw respuesta.error;
      perfiles=Array.isArray(respuesta.data)?respuesta.data.filter(p=>p?.id):[];
    }catch(error){
      errorConsulta=error; estado.esquemaCompleto=false;
      try{
        const respaldo=await window.supabaseClient?.from("profiles").select("id,nombre,carrera,xp,racha,ejercicios,respuestas_correctas,respuestas_totales,procedencia,avatar_url").limit(200);
        if(respaldo?.error)throw respaldo.error;
        perfiles=(respaldo?.data||[]).map(p=>({
          ...p,puntos_periodo:Number(p.xp)||0,preguntas_periodo:Number(p.respuestas_totales)||0,
          correctas_periodo:Number(p.respuestas_correctas)||0,
          precision_periodo:Number(p.respuestas_totales)>0?Math.round(Number(p.respuestas_correctas||0)/Number(p.respuestas_totales)*100):0,
          mejor_simulacro:0,escala_simulacro:"",procedencia:p.procedencia||"Sin región"
        }));
      }catch(respaldoError){errorConsulta=respaldoError;perfiles=[]}
    }
    if(usuario&&!perfiles.some(p=>p.id===usuario.id)){
      perfiles.push({id:usuario.id,nombre:usuario.nombre,carrera:usuario.carrera,procedencia:regionUsuario(usuario)||"Sin región",avatar_url:usuario.avatarUrl||"",puntos_periodo:Number(usuario.xp)||0,preguntas_periodo:Number(usuario.respuestasTotales)||0,correctas_periodo:Number(usuario.respuestasCorrectas)||0,precision_periodo:Number(usuario.precision)||0,mejor_simulacro:0,escala_simulacro:""});
    }
    if(regionFiltro) perfiles=perfiles.filter(p=>normalizar(p.procedencia)===normalizar(regionFiltro));
    estado.perfiles=perfiles; estado.error=errorConsulta; estado.ultimaCarga=Date.now(); estado.cargando=false; renderizar();
  }

  function construirEstructura(pantalla){
    if(pantalla.dataset.rankingUgel==="true")return;
    pantalla.dataset.rankingUgel="true";
    pantalla.dataset.rankingReal="true";
    pantalla.innerHTML=`
      <div class="page-header ranking-real-head"><div><div class="page-title">Ranking UniPrep</div><div class="page-subtitle" id="ranking-subtitle">Resultados reales de estudiantes registrados</div></div><div class="ranking-sync"><span>● DATOS SINCRONIZADOS</span><button class="btn btn-ghost btn-sm" type="button" onclick="cargarRanking(true)">↻ Actualizar</button></div></div>
      <section class="ranking-command">
        <div class="ranking-command-copy"><span>CLASIFICACIÓN TRANSPARENTE</span><h2>Compara tu avance por tiempo y región.</h2><p>El ranking nacional corresponde a la comunidad registrada en UniPrep, no a todos los postulantes del Perú.</p></div>
        <div class="ranking-view-tabs"><button data-ranking-view="estudiantes" onclick="cambiarVistaRanking('estudiantes')">Estudiantes</button><button data-ranking-view="regiones" onclick="cambiarVistaRanking('regiones')">Regiones</button></div>
        <div class="ranking-filters">
          <div><label>Periodo</label><div class="ranking-period-tabs">${Object.entries(PERIODOS).map(([id,nombre])=>`<button type="button" data-ranking-period="${id}" onclick="cambiarPeriodoRanking('${id}')">${nombre}</button>`).join("")}</div></div>
          <label>Alcance<select id="ranking-region-select" onchange="cambiarAlcanceRanking(this.value)"><option value="nacional">🇵🇪 Nacional UniPrep</option><option value="mi_region">⌖ Mi región</option>${DEPARTAMENTOS.map(region=>`<option value="${region}">${region}</option>`).join("")}</select></label>
          <label>Métrica<select id="ranking-metric-select" onchange="cambiarMetricaRanking(this.value)">${Object.entries(METRICAS).map(([id,item])=>`<option value="${id}">${item.nombre}</option>`).join("")}</select></label>
        </div>
      </section>
      <div id="ranking-status"></div><div id="ranking-user-stats" class="ranking-user-stats"></div><div id="ranking-podium-real" class="ranking-podium-real"></div><div id="ranking-list-real" class="card ranking-list-real"></div>`;
  }

  function estadoCarga(texto){const c=document.getElementById("ranking-status");if(c)c.innerHTML=`<div class="ranking-loading"><span></span>${esc(texto)}</div>`}

  async function renderizar(){
    const usuario=typeof window.obtenerUsuarioActivo==="function"?await window.obtenerUsuarioActivo():null;
    document.querySelectorAll("[data-ranking-period]").forEach(b=>b.classList.toggle("active",b.dataset.rankingPeriod===estado.periodo));
    document.querySelectorAll("[data-ranking-view]").forEach(b=>b.classList.toggle("active",b.dataset.rankingView===estado.vista));
    const regionSelect=document.getElementById("ranking-region-select"); if(regionSelect)regionSelect.value=estado.alcance;
    const metricSelect=document.getElementById("ranking-metric-select"); if(metricSelect)metricSelect.value=estado.metrica;
    if(estado.vista==="regiones")return renderizarRegiones(usuario);
    const config=METRICAS[estado.metrica];
    const orden=[...estado.perfiles].sort((a,b)=>valor(b)-valor(a)||String(a.nombre||"").localeCompare(String(b.nombre||""),"es"));
    const posicion=usuario?orden.findIndex(p=>p.id===usuario.id)+1:0;
    const propio=posicion?orden[posicion-1]:null;
    const subt=document.getElementById("ranking-subtitle");
    if(subt)subt.textContent=`${PERIODOS[estado.periodo]} · ${alcanceTexto()} · ${orden.length} estudiante${orden.length===1?"":"s"}`;
    const status=document.getElementById("ranking-status");
    if(status)status.innerHTML=estado.esquemaCompleto?"":'<div class="ranking-private-note">⚙️ Vista compatible activa. Ejecuta <b>SUPABASE_UGEL_RANKING_FOTOS.sql</b> para habilitar los periodos diarios, semanales, mensuales y regionales con precisión completa.</div>';
    pintarStats(posicion,propio,orden.length,regionUsuario(usuario));
    const podio=document.getElementById("ranking-podium-real"); if(podio)podio.innerHTML=orden.slice(0,3).map((p,i)=>tarjetaPodio(p,i,config,usuario?.id)).join("");
    const lista=document.getElementById("ranking-list-real"); if(lista)lista.innerHTML=orden.length?orden.map((p,i)=>filaRanking(p,i,config,usuario?.id)).join(""):'<div class="ranking-empty">Aún no hay resultados en este periodo y alcance.</div>';
    if(posicion){document.getElementById("dashboard-ranking")?.replaceChildren(document.createTextNode(`#${posicion}`));document.getElementById("profile-ranking")?.replaceChildren(document.createTextNode(`#${posicion}`));}
  }

  function pintarStats(posicion,propio,total,region){
    const stats=document.getElementById("ranking-user-stats"),config=METRICAS[estado.metrica];
    if(!stats)return;
    stats.innerHTML=`<article><span>Tu posición</span><b>${posicion?`#${posicion}`:"—"}</b><small>de ${total}</small></article><article><span>Tu ${esc(config.nombre)}</span><b>${propio?esc(config.formato(valor(propio))):"—"}</b><small>${PERIODOS[estado.periodo]}</small></article><article><span>Tu región</span><b class="ranking-region-stat">${esc(region||"Sin definir")}</b><small>se cambia en tu objetivo</small></article><article><span>Participantes</span><b>${total}</b><small>perfiles visibles</small></article>`;
  }

  function renderizarRegiones(usuario){
    const agrupado=new Map();
    estado.perfiles.forEach(perfil=>{
      const region=perfil.procedencia||"Sin región";
      const fila=agrupado.get(region)||{region,puntos:0,preguntas:0,correctas:0,participantes:0,mejor:0};
      fila.puntos+=Number(perfil.puntos_periodo)||0; fila.preguntas+=Number(perfil.preguntas_periodo)||0; fila.correctas+=Number(perfil.correctas_periodo)||0; fila.participantes++; fila.mejor=Math.max(fila.mejor,Number(perfil.mejor_simulacro)||0); agrupado.set(region,fila);
    });
    const campo=estado.metrica==="precision"?"precision":estado.metrica==="preguntas"?"preguntas":estado.metrica==="simulacro"?"mejor":"puntos";
    const filas=[...agrupado.values()].map(f=>({...f,precision:f.preguntas?Math.round(f.correctas/f.preguntas*100):0})).sort((a,b)=>b[campo]-a[campo]||a.region.localeCompare(b.region,"es"));
    const miRegion=regionUsuario(usuario); const posicion=filas.findIndex(f=>normalizar(f.region)===normalizar(miRegion))+1; const propia=posicion?filas[posicion-1]:null;
    const subt=document.getElementById("ranking-subtitle"); if(subt)subt.textContent=`Ranking de regiones · ${PERIODOS[estado.periodo]} · ${filas.length} regiones`;
    pintarStats(posicion,propia?{[METRICAS[estado.metrica].campo]:propia[campo]}:null,filas.length,miRegion);
    const status=document.getElementById("ranking-status"); if(status)status.innerHTML='<div class="ranking-scope-note">Cada región suma únicamente la actividad de estudiantes UniPrep que indicaron ese departamento.</div>';
    const podio=document.getElementById("ranking-podium-real"); if(podio)podio.innerHTML=filas.slice(0,3).map((f,i)=>`<article class="ranking-podium-card place-${i+1}${normalizar(f.region)===normalizar(miRegion)?" me":""}"><span class="ranking-medal">${["🥇","🥈","🥉"][i]}</span><span class="ranking-avatar">${esc(f.region.slice(0,2).toUpperCase())}</span><b>${esc(f.region)}</b><small>${f.participantes} participantes</small><strong>${formatoRegion(f,campo)} <em>${esc(METRICAS[estado.metrica].nombre)}</em></strong></article>`).join("");
    const lista=document.getElementById("ranking-list-real"); if(lista)lista.innerHTML=filas.length?filas.map((f,i)=>`<article class="ranking-real-row${normalizar(f.region)===normalizar(miRegion)?" me":""}"><span class="ranking-position">${i+1}</span><span class="ranking-avatar small">${esc(f.region.slice(0,2).toUpperCase())}</span><span class="ranking-person"><b>${esc(f.region)}${normalizar(f.region)===normalizar(miRegion)?" (tu región)":""}</b><small>${f.participantes} estudiante${f.participantes===1?"":"s"}</small></span><span class="ranking-detail">${numero(f.preguntas)} preguntas</span><strong>${formatoRegion(f,campo)}</strong></article>`).join(""):'<div class="ranking-empty">No hay regiones con resultados en este periodo.</div>';
  }

  function formatoRegion(fila,campo){if(campo==="precision")return numero(fila.precision)+"%";if(campo==="puntos")return numero(fila.puntos)+" pts";if(campo==="mejor")return Number(fila.mejor||0).toLocaleString("es-PE",{maximumFractionDigits:1})+"%";return Number(fila[campo]||0).toLocaleString("es-PE",{maximumFractionDigits:2})}
  function alcanceTexto(){if(estado.alcance==="nacional")return"Nacional UniPrep";if(estado.alcance==="mi_region")return"Mi región";return estado.alcance}
  function avatar(perfil,clase=""){return perfil.avatar_url?`<span class="ranking-avatar ${clase}"><img src="${esc(perfil.avatar_url)}" alt=""></span>`:`<span class="ranking-avatar ${clase}">${esc(iniciales(perfil.nombre))}</span>`}

  function tarjetaPodio(perfil,indice,config,idActual){
    const esActual=perfil.id===idActual;
    return `<article class="ranking-podium-card place-${indice+1}${esActual?" me":""}"><span class="ranking-medal">${["🥇","🥈","🥉"][indice]}</span>${avatar(perfil)}<b>${esc(nombrePublico(perfil.nombre))}${esActual?" (tú)":""}</b><small>${esc(perfil.procedencia||perfil.carrera||"Sin región")}</small><strong>${esc(config.formato(valor(perfil)))} <em>${esc(config.nombre)}</em></strong></article>`;
  }

  function filaRanking(perfil,indice,config,idActual){
    const esActual=perfil.id===idActual;
    return `<article class="ranking-real-row${esActual?" me":""}"><span class="ranking-position">${indice+1}</span>${avatar(perfil,"small")}<span class="ranking-person"><b>${esc(nombrePublico(perfil.nombre))}${esActual?" (tú)":""}</b><small>${esc(perfil.procedencia||"Sin región")} · ${esc(perfil.carrera||"Preuniversitario")}</small></span><span class="ranking-detail">${esc(config.detalle(perfil))}</span><strong>${esc(config.formato(valor(perfil)))}</strong></article>`;
  }

  function cambiarPeriodoRanking(periodo){if(!PERIODOS[periodo])return;estado.periodo=periodo;estado.ultimaCarga=0;cargarRanking(true)}
  function cambiarAlcanceRanking(alcance){estado.alcance=alcance||"nacional";estado.ultimaCarga=0;cargarRanking(true)}
  function cambiarVistaRanking(vista){if(!["estudiantes","regiones"].includes(vista))return;estado.vista=vista;if(vista==="regiones"&&estado.alcance!=="nacional")estado.alcance="nacional";estado.ultimaCarga=0;cargarRanking(true)}
  function cambiarMetricaRanking(metrica){if(!METRICAS[metrica])return;estado.metrica=metrica;renderizar()}

  const observador=new MutationObserver(()=>{if(document.getElementById("ranking")?.classList.contains("active"))cargarRanking()});
  document.addEventListener("DOMContentLoaded",()=>{const pantalla=document.getElementById("ranking");if(pantalla)observador.observe(pantalla,{attributes:true,attributeFilter:["class"]});setTimeout(()=>cargarRanking(),450)});
  window.cargarRanking=cargarRanking; window.cambiarPeriodoRanking=cambiarPeriodoRanking; window.cambiarAlcanceRanking=cambiarAlcanceRanking; window.cambiarVistaRanking=cambiarVistaRanking; window.cambiarMetricaRanking=cambiarMetricaRanking;
})();
