(function(){
  "use strict";
  function instalar(){
    const acciones=document.querySelector("#perfil .profile-actions");
    if(!acciones||document.getElementById("uniprep-privacy-btn"))return;
    acciones.insertAdjacentHTML("beforeend",`<a id="uniprep-privacy-btn" class="btn btn-ghost" href="privacy.html" target="_blank" rel="noopener">🛡 Privacidad</a><button class="btn btn-ghost" type="button" onclick="eliminarMiCuentaUniPrep()">🗑 Eliminar cuenta</button>`);
  }
  async function eliminarMiCuenta(){
    const aviso="Esta acción elimina permanentemente tu cuenta, perfil, progreso y datos asociados. No se puede deshacer.";
    if(!confirm(aviso))return;
    const confirmacion=prompt('Para confirmar escribe exactamente: ELIMINAR');
    if(confirmacion!=="ELIMINAR")return alert("No se eliminó la cuenta.");
    const boton=document.querySelector('[onclick="eliminarMiCuentaUniPrep()"]');
    if(boton){boton.disabled=true;boton.textContent="Eliminando…"}
    try{
      if(!window.supabaseClient)throw new Error("No hay conexión con el servicio de cuentas.");
      const ambito=window.uniprepStorage?.ambitoActual?.();
      const {data,error}=await window.supabaseClient.rpc("eliminar_mi_cuenta_uniprep");
      if(error)throw error;
      if(data!==true)throw new Error("El servidor no confirmó la eliminación.");
      await window.supabaseClient.auth.signOut({scope:"local"}).catch(()=>{});
      window.uniprepStorage?.limpiarCuenta?.(ambito);
      location.replace("./");
    }catch(error){
      console.error(error);
      alert("No se pudo eliminar la cuenta. Ejecuta primero la migración SQL incluida o solicita la eliminación desde la página de privacidad.");
      if(boton){boton.disabled=false;boton.textContent="🗑 Eliminar cuenta"}
    }
  }
  window.eliminarMiCuentaUniPrep=eliminarMiCuenta;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",instalar);else instalar();
})();
