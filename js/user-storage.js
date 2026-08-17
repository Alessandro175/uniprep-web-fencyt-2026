// =====================================================
// UNIPREP - ALMACENAMIENTO LOCAL AISLADO POR CUENTA
// =====================================================
(function () {
  "use strict";

  let ultimoAmbito = "";

  function seguro(valor) {
    return String(valor || "invitado")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]+/g, "-")
      .slice(0, 120) || "invitado";
  }

  function desdeTokenSupabase() {
    try {
      for (let indice = 0; indice < localStorage.length; indice += 1) {
        const clave = localStorage.key(indice) || "";
        if (!/^sb-.+-auth-token$/.test(clave)) continue;
        const sesion = JSON.parse(localStorage.getItem(clave) || "null");
        const id = sesion?.user?.id || sesion?.currentSession?.user?.id;
        if (id) return id;
      }
    } catch (_) {}
    return "";
  }

  function ambitoActual() {
    const cache = window.obtenerUsuarioCache?.();
    const respaldo = (() => {
      for (const clave of ["usuarioActivo", "preuni_usuario_activo"]) {
        try {
          const dato = JSON.parse(localStorage.getItem(clave) || "null");
          if (dato?.id || dato?.correo || dato?.email) return dato;
        } catch (_) {}
      }
      return null;
    })();
    return seguro(cache?.id || respaldo?.id || desdeTokenSupabase() || cache?.correo || respaldo?.correo || respaldo?.email || "invitado");
  }

  function clave(base) {
    return `${base}::${ambitoActual()}`;
  }

  function migrar(base) {
    const destino = clave(base);
    if (localStorage.getItem(destino) !== null) return destino;
    const legado = localStorage.getItem(base);
    if (legado !== null && ambitoActual() !== "invitado") {
      localStorage.setItem(destino, legado);
      localStorage.removeItem(base);
    }
    return destino;
  }

  function leer(base, defecto = null) {
    try {
      const dato = localStorage.getItem(migrar(base));
      return dato === null ? defecto : JSON.parse(dato);
    } catch (_) {
      return defecto;
    }
  }

  function guardar(base, valor) {
    localStorage.setItem(clave(base), JSON.stringify(valor));
    return valor;
  }

  function leerTexto(base, defecto = "") {
    const destino = migrar(base);
    return localStorage.getItem(destino) ?? defecto;
  }

  function guardarTexto(base, valor) {
    localStorage.setItem(clave(base), String(valor ?? ""));
  }

  function eliminar(base) {
    localStorage.removeItem(clave(base));
  }

  function limpiarCuenta(ambito = ambitoActual()) {
    const sufijo = `::${seguro(ambito)}`;
    const eliminarClaves = [];

    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const nombre = localStorage.key(indice) || "";
      if (
        nombre.endsWith(sufijo) ||
        /^sb-.+-auth-token$/.test(nombre) ||
        nombre === "usuarioActivo" ||
        nombre === "preuni_usuario_activo"
      ) {
        eliminarClaves.push(nombre);
      }
    }

    eliminarClaves.forEach(nombre => localStorage.removeItem(nombre));
  }

  function anunciarCambio() {
    const actual = ambitoActual();
    if (!ultimoAmbito) ultimoAmbito = actual;
    if (actual === ultimoAmbito) return;
    const anterior = ultimoAmbito;
    ultimoAmbito = actual;
    document.dispatchEvent(new CustomEvent("uniprep:storage-scope-change", {detail:{anterior, actual}}));
  }

  window.uniprepStorage = {ambitoActual, clave, leer, guardar, leerTexto, guardarTexto, eliminar, limpiarCuenta, anunciarCambio};
  document.addEventListener("uniprep:user-ready", anunciarCambio);
  window.addEventListener("storage", anunciarCambio);
})();
