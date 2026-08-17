// ======================================
// PREUNI - APP PRINCIPAL
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 UniPrep iniciada correctamente");

  await iniciarApp();
});

async function iniciarApp() {
  const authScreen =
    document.getElementById("auth-screen");

  if (window.esRecuperacionPasswordActiva?.()) {
    if (authScreen) authScreen.style.display = "flex";
    window.mostrarFormularioNuevaPassword?.();
    return false;
  }

  try {
    // Primero comprobamos si existe una sesión real en Supabase.
    if (!window.supabaseClient) {
      throw new Error(
        "Supabase no está conectado."
      );
    }

    const {
      data: { user },
      error: authError
    } =
      await window.supabaseClient.auth.getUser();

    if (authError) {
      console.error(
        "Error comprobando la sesión:",
        authError
      );
    }

    // No existe una sesión activa.
    if (!user) {
      mostrarPantallaLogin(authScreen);
      return false;
    }

    console.log(
      "✅ Usuario autenticado:",
      user.email
    );

    // Ahora cargamos el perfil de la tabla profiles.
    let usuario = null;

    if (
      typeof obtenerUsuarioActivo ===
      "function"
    ) {
      usuario =
        await obtenerUsuarioActivo();
    }

    // Existe usuario en Auth, pero falta el perfil.
    if (!usuario) {
      console.error(
        "❌ El usuario existe en Auth, pero no tiene perfil en la tabla profiles."
      );

      if (authScreen) {
        authScreen.style.display = "flex";
      }

      if (
        typeof mostrarMensaje ===
        "function"
      ) {
        mostrarMensaje(
          "login-error",
          "Ingresaste correctamente, pero no se encontró tu perfil."
        );
      }

      return false;
    }

    // Todo está correcto: ocultamos el login.
    if (authScreen) {
      authScreen.style.display = "none";
    }

    actualizarDatosGenerales(usuario);
    document.dispatchEvent(new CustomEvent("uniprep:user-ready", { detail: { id: usuario.id } }));

    // Perfil
    try {
      if (
        typeof cargarPerfilUsuario ===
        "function"
      ) {
        await cargarPerfilUsuario();
      } else if (
        typeof cargarPerfil ===
        "function"
      ) {
        await cargarPerfil();
      }
    } catch (errorPerfil) {
      console.error(
        "Error cargando el perfil:",
        errorPerfil
      );
    }

    // Dashboard
    try {
      if (
        typeof cargarDashboard ===
        "function"
      ) {
        await cargarDashboard();
      }
    } catch (errorDashboard) {
      console.error(
        "Error cargando el dashboard:",
        errorDashboard
      );
    }

    // Cursos
    try {
      if (
        typeof renderizarCursos ===
        "function"
      ) {
        renderizarCursos();
      }
    } catch (errorCursos) {
      console.error(
        "Error cargando los cursos:",
        errorCursos
      );
    }

    console.log(
      "✅ Usuario cargado:",
      usuario.nombre
    );

    return true;

  } catch (error) {
    console.error(
      "❌ Error iniciando UniPrep:",
      error
    );

    mostrarPantallaLogin(authScreen);

    if (
      typeof mostrarMensaje ===
      "function"
    ) {
      mostrarMensaje(
        "login-error",
        "La sesión se inició, pero ocurrió un error cargando la aplicación."
      );
    }

    return false;
  }
}


// ======================================
// BÚSQUEDA GLOBAL
// ======================================

function buscarEnUniPrep(consulta = "") {
  const texto = String(consulta).trim();

  if (!texto) {
    return;
  }

  const buscadorCursos =
    document.getElementById("courses-search");

  if (buscadorCursos) {
    buscadorCursos.value = texto;
  }

  if (typeof window.go === "function") {
    window.go("cursos", null);
  }

  if (typeof window.renderizarCursos === "function") {
    window.renderizarCursos();
  }

  window.mostrarToastPremium?.(
    `Resultados para “${texto}”`
  );
}

window.buscarEnUniPrep = buscarEnUniPrep;


// ======================================
// MOSTRAR LOGIN
// ======================================

function mostrarPantallaLogin(authScreen) {
  if (authScreen) {
    authScreen.style.display = "flex";
  }

  if (
    typeof mostrarLogin ===
    "function"
  ) {
    mostrarLogin();
  }
}


// ======================================
// ACTUALIZAR DATOS GENERALES
// ======================================

function actualizarDatosGenerales(usuario) {
  if (!usuario) {
    return;
  }

  const nombre =
    usuario.nombre ||
    "Estudiante UniPrep";

  const carrera =
    usuario.carrera ||
    "Estudiante UniPrep";

  const primerNombre =
    nombre.trim().split(/\s+/)[0];

  const iniciales =
    obtenerInicialesApp(nombre);

  // Menú lateral
  cambiarTextoApp(
    ".user-name",
    nombre
  );

  cambiarTextoApp(
    ".user-sub",
    carrera
  );

  const avatar =
    document.querySelector(
      ".user-avatar"
    );

  if (avatar) {
    const indicadorOnline =
      avatar.querySelector(
        ".user-avatar-online"
      );

    avatar.textContent =
      iniciales;

    if (indicadorOnline) {
      avatar.appendChild(
        indicadorOnline
      );
    }
  }

  // Saludo del inicio
  const saludo =
    document.getElementById(
      "dashboard-greeting"
    ) ||
    document.querySelector(
      ".welcome-title"
    );

  if (saludo) {
    saludo.innerHTML =
      `¡Buenas tardes,<br>${primerNombre}! 👋`;
  }
}


// ======================================
// UTILIDADES
// ======================================

function cambiarTextoApp(
  selector,
  texto
) {
  const elemento =
    document.querySelector(
      selector
    );

  if (elemento) {
    elemento.textContent =
      texto;
  }
}

function obtenerInicialesApp(
  nombre = ""
) {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        palabra =>
          palabra
            .charAt(0)
            .toUpperCase()
      )
      .join("") || "PU"
  );
}


// ======================================
// FUNCIONES GLOBALES
// ======================================

window.iniciarApp =
  iniciarApp;

window.actualizarDatosGenerales =
  actualizarDatosGenerales;
