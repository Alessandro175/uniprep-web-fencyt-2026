// UniPrep · arranque visual sin destellos entre modo claro y oscuro.
(function () {
  "use strict";

  const CLAVE = "uniprep_visual_preferences_v3";
  const TEMAS = new Set(["cosmos", "amazonia", "oceano", "aurora", "grafito", "contraste", "luz", "papel", "menta", "lavanda", "amanecer", "custom"]);

  function seguro(valor) {
    return String(valor || "invitado")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]+/g, "-")
      .slice(0, 120) || "invitado";
  }

  function ambitoActual() {
    try {
      for (const clave of ["usuarioActivo", "preuni_usuario_activo"]) {
        const dato = JSON.parse(localStorage.getItem(clave) || "null");
        if (dato?.id || dato?.correo || dato?.email) return seguro(dato.id || dato.correo || dato.email);
      }
      for (let indice = 0; indice < localStorage.length; indice += 1) {
        const clave = localStorage.key(indice) || "";
        if (!/^sb-.+-auth-token$/.test(clave)) continue;
        const sesion = JSON.parse(localStorage.getItem(clave) || "null");
        const id = sesion?.user?.id || sesion?.currentSession?.user?.id;
        if (id) return seguro(id);
      }
    } catch (_) {}
    return "invitado";
  }

  function preferenciasGuardadas() {
    const claves = [`${CLAVE}::${ambitoActual()}`, `${CLAVE}::invitado`, CLAVE];
    for (const clave of claves) {
      try {
        const valor = JSON.parse(localStorage.getItem(clave) || "null");
        if (valor && typeof valor === "object") return valor;
      } catch (_) {}
    }
    return {};
  }

  const guardado = preferenciasGuardadas();
  const modo = ["auto", "dark", "light"].includes(guardado.modo) ? guardado.modo : "auto";
  const resuelto = modo === "auto"
    ? (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches !== false ? "dark" : "light")
    : modo;
  const tema = TEMAS.has(guardado.tema) ? guardado.tema : "cosmos";
  const raiz = document.documentElement;

  raiz.dataset.colorMode = resuelto;
  raiz.dataset.uniprepTheme = tema;
  raiz.style.colorScheme = resuelto;
  raiz.classList.add("uniprep-theme-ready");
})();
