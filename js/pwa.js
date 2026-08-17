(function(){
  "use strict";
  let eventoInstalacion=null;

  function actualizarEstado(){
    const estado=document.getElementById("app-network-status");
    if(!estado)return;
    const online=navigator.onLine;
    estado.textContent=online?"● En línea":"● Sin conexión";
    estado.classList.toggle("offline",!online);
  }

  async function instalarUniPrep(){
    if(!eventoInstalacion){
      window.mostrarToastPremium?.("UniPrep ya está instalada o el navegador mostrará la opción desde su menú.");
      return;
    }
    eventoInstalacion.prompt();
    const eleccion=await eventoInstalacion.userChoice;
    if(eleccion.outcome==="accepted")window.mostrarToastPremium?.("✓ UniPrep se instaló correctamente");
    eventoInstalacion=null;
    const boton=document.getElementById("install-app-btn");
    if(boton)boton.hidden=true;
  }

  window.addEventListener("beforeinstallprompt",evento=>{
    evento.preventDefault();
    eventoInstalacion=evento;
    const boton=document.getElementById("install-app-btn");
    if(boton)boton.hidden=false;
  });
  window.addEventListener("appinstalled",()=>{
    eventoInstalacion=null;
    const boton=document.getElementById("install-app-btn");
    if(boton)boton.hidden=true;
  });
  window.addEventListener("online",()=>{actualizarEstado();window.mostrarToastPremium?.("Conexión recuperada. Supabase volverá a sincronizar.")});
  window.addEventListener("offline",()=>{actualizarEstado();window.mostrarToastPremium?.("Modo sin conexión: los recursos guardados siguen disponibles.")});

  document.addEventListener("DOMContentLoaded",()=>{
    actualizarEstado();
    const pantalla=new URLSearchParams(location.search).get("screen");
    if(pantalla)setTimeout(()=>{
      if(pantalla==="ejercicios")window.abrirCentroPractica?.(null);
      else if(pantalla==="tutor")window.abrirTutorAcademico?.(null);
      else if(pantalla==="vocacional")window.abrirCentroVocacional?.(null);
      else window.go?.(pantalla,null);
    },550);
    if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
      navigator.serviceWorker.register("sw.js?v=2026.15.0").catch(error=>console.warn("No se pudo registrar el modo instalable:",error));
    }
  });

  window.instalarUniPrep=instalarUniPrep;
})();
