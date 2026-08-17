(function () {
  "use strict";

  let perfiles = [];
  let metrica = "xp";
  let cargando = false;
  let ultimaCarga = 0;

  const METRICAS = {
    xp:{nombre:"XP",valor:p=>Number(p.xp)||0,formato:v=>v.toLocaleString("es-PE"),detalle:p=>"Nivel "+(Math.floor((Number(p.xp)||0)/500)+1)},
    precision:{nombre:"Precisión",valor:p=>Number(p.respuestas_totales)>0?Math.round((Number(p.respuestas_correctas)||0)/Number(p.respuestas_totales)*100):0,formato:v=>v+"%",detalle:p=>(Number(p.respuestas_totales)||0)+" respuestas"},
    racha:{nombre:"Racha",valor:p=>Number(p.racha)||0,formato:v=>v+" días",detalle:()=> "Constancia de estudio"},
    ejercicios:{nombre:"Ejercicios",valor:p=>Number(p.ejercicios)||0,formato:v=>v.toLocaleString("es-PE"),detalle:()=> "Práctica acumulada"}
  };

  function esc(valor){const d=document.createElement("div");d.textContent=String(valor??"");return d.innerHTML}
  function iniciales(nombre=""){return nombre.trim().split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join("")||"UP"}
  function nombrePublico(nombre="Estudiante"){const p=nombre.trim().split(/\s+/).filter(Boolean);return p.length>1?p[0]+" "+p[1][0]+".":p[0]||"Estudiante"}

  async function cargarRanking(forzar=false) {
    const pantalla=document.getElementById("ranking");
    if(!pantalla||cargando)return;
    construirEstructura(pantalla);
    if(!forzar&&perfiles.length&&Date.now()-ultimaCarga<60000){renderizar();return}
    cargando=true;
    estadoCarga("Consultando clasificación real…");
    let errorConsulta=null;
    try{
      if(!window.supabaseClient)throw new Error("Supabase no está disponible");
      let respuesta=await window.supabaseClient.rpc("obtener_ranking_uniprep");
      if(respuesta.error&&/function|schema cache|PGRST202/i.test(respuesta.error.message||"")){
        respuesta=await window.supabaseClient.from("profiles").select("id,nombre,carrera,xp,racha,ejercicios,respuestas_correctas,respuestas_totales").limit(100);
      }
      if(respuesta.error)throw respuesta.error;
      perfiles=Array.isArray(respuesta.data)?respuesta.data.filter(p=>p?.id):[];
    }catch(error){errorConsulta=error;console.warn("Ranking limitado al perfil activo:",error?.message||error)}

    const usuario=typeof window.obtenerUsuarioActivo==="function"?await window.obtenerUsuarioActivo():null;
    if(usuario&&!perfiles.some(p=>p.id===usuario.id)){
      perfiles.push({id:usuario.id,nombre:usuario.nombre,carrera:usuario.carrera,xp:usuario.xp,racha:usuario.racha,ejercicios:usuario.ejercicios,respuestas_correctas:usuario.respuestasCorrectas,respuestas_totales:usuario.respuestasTotales});
    }
    ultimaCarga=Date.now();
    cargando=false;
    renderizar(errorConsulta);
  }

  function construirEstructura(pantalla){
    if(pantalla.dataset.rankingReal==="true")return;
    pantalla.dataset.rankingReal="true";
    const tabs=Object.entries(METRICAS).map(([id,m])=>'<button type="button" data-ranking-metric="'+id+'" onclick="cambiarMetricaRanking(\''+id+'\')">'+m.nombre+"</button>").join("");
    pantalla.innerHTML='<div class="page-header ranking-real-head"><div><div class="page-title">Ranking UniPrep</div><div class="page-subtitle" id="ranking-subtitle">Clasificación real por desempeño</div></div><div class="ranking-sync"><span>● SUPABASE LIVE</span><button class="btn btn-ghost btn-sm" type="button" onclick="cargarRanking(true)">↻ Actualizar</button></div></div>'+
      '<section class="ranking-hero-real"><div><span>COMPETENCIA POSITIVA</span><h2>Crece con evidencia, no con datos inventados.</h2><p>La clasificación usa únicamente perfiles registrados y permite comparar XP, precisión, racha o ejercicios.</p></div><div class="ranking-metric-tabs">'+tabs+"</div></section>"+
      '<div id="ranking-status"></div><div id="ranking-user-stats" class="ranking-user-stats"></div><div id="ranking-podium-real" class="ranking-podium-real"></div><div id="ranking-list-real" class="card ranking-list-real"></div>';
  }

  function estadoCarga(texto){
    const c=document.getElementById("ranking-status");
    if(c)c.innerHTML='<div class="ranking-loading"><span></span>'+esc(texto)+"</div>";
  }

  async function renderizar(errorConsulta=null){
    const usuario=typeof window.obtenerUsuarioActivo==="function"?await window.obtenerUsuarioActivo():null;
    const config=METRICAS[metrica];
    const orden=[...perfiles].sort((a,b)=>config.valor(b)-config.valor(a)||String(a.nombre||"").localeCompare(String(b.nombre||""),"es"));
    document.querySelectorAll("[data-ranking-metric]").forEach(b=>b.classList.toggle("active",b.dataset.rankingMetric===metrica));
    const posicion=usuario?orden.findIndex(p=>p.id===usuario.id)+1:0;
    const propio=posicion?orden[posicion-1]:null;
    const subt=document.getElementById("ranking-subtitle");
    const faltaEsquema=errorConsulta&&/column|function|schema cache|PGRST/i.test(errorConsulta.message||"");
    if(subt)subt.textContent=errorConsulta?(faltaEsquema?"Falta activar el esquema de usuarios y puntajes en Supabase":"Vista privada: Supabase solo permite mostrar tu perfil"):orden.length+" estudiante"+(orden.length===1?"":"s")+" · ordenado por "+config.nombre;
    const status=document.getElementById("ranking-status");
    if(status)status.innerHTML=errorConsulta?'<div class="ranking-private-note">'+(faltaEsquema?'⚙️ Ejecuta una vez SUPABASE_ARREGLAR_USUARIOS_Y_PUNTAJES.sql para registrar perfiles, XP y puntajes.':'🔒 El ranking respeta las políticas de privacidad y muestra únicamente los perfiles permitidos.')+'</div>':"";

    const stats=document.getElementById("ranking-user-stats");
    if(stats)stats.innerHTML='<article><span>Tu posición</span><b>'+(posicion?"#"+posicion:"—")+'</b><small>de '+(orden.length||0)+'</small></article><article><span>Tu '+config.nombre+"</span><b>"+(propio?config.formato(config.valor(propio)):"—")+"</b><small>"+(propio?config.detalle(propio):"Inicia sesión")+'</small></article><article><span>Participantes</span><b>'+orden.length+'</b><small>perfiles visibles</small></article><article><span>Datos ficticios</span><b>0</b><small>solo Supabase</small></article>';

    const podio=document.getElementById("ranking-podium-real");
    if(podio)podio.innerHTML=orden.slice(0,3).map((p,i)=>tarjetaPodio(p,i,config,usuario?.id)).join("");
    const lista=document.getElementById("ranking-list-real");
    if(lista)lista.innerHTML=orden.length?orden.map((p,i)=>filaRanking(p,i,config,usuario?.id)).join(""):'<div class="ranking-empty">Aún no hay perfiles para clasificar.</div>';

    if(posicion){
      const dashboard=document.getElementById("dashboard-ranking");
      if(dashboard)dashboard.textContent="#"+posicion;
      const perfil=document.getElementById("profile-ranking");
      if(perfil)perfil.textContent="#"+posicion;
    }
  }

  function tarjetaPodio(perfil,indice,config,idActual){
    const medallas=["🥇","🥈","🥉"],valor=config.valor(perfil),esActual=perfil.id===idActual;
    return '<article class="ranking-podium-card place-'+(indice+1)+(esActual?" me":"")+'"><span class="ranking-medal">'+medallas[indice]+'</span><span class="ranking-avatar">'+esc(iniciales(perfil.nombre))+"</span><b>"+esc(nombrePublico(perfil.nombre))+(esActual?" (tú)":"")+"</b><small>"+esc(perfil.carrera||"Preuniversitario")+"</small><strong>"+config.formato(valor)+" <em>"+esc(config.nombre)+"</em></strong></article>";
  }

  function filaRanking(perfil,indice,config,idActual){
    const esActual=perfil.id===idActual;
    return '<article class="ranking-real-row'+(esActual?" me":"")+'"><span class="ranking-position">'+(indice+1)+'</span><span class="ranking-avatar small">'+esc(iniciales(perfil.nombre))+'</span><span class="ranking-person"><b>'+esc(nombrePublico(perfil.nombre))+(esActual?" (tú)":"")+"</b><small>"+esc(perfil.carrera||"Preuniversitario")+'</small></span><span class="ranking-detail">'+esc(config.detalle(perfil))+"</span><strong>"+config.formato(config.valor(perfil))+"</strong></article>";
  }

  function cambiarMetricaRanking(nueva){if(!METRICAS[nueva])return;metrica=nueva;renderizar()}

  const observador=new MutationObserver(()=>{if(document.getElementById("ranking")?.classList.contains("active"))cargarRanking()});
  document.addEventListener("DOMContentLoaded",()=>{
    const pantalla=document.getElementById("ranking");
    if(pantalla)observador.observe(pantalla,{attributes:true,attributeFilter:["class"]});
    setTimeout(()=>cargarRanking(),450);
  });
  window.cargarRanking=cargarRanking;
  window.cambiarMetricaRanking=cambiarMetricaRanking;
})();
