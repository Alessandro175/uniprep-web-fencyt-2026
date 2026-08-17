// =====================================================
// UNIPREP - AUTENTICACIÓN CON SUPABASE
// =====================================================


// =====================================================
// MENSAJES
// =====================================================

function mostrarMensaje(id, mensaje, tipo = "error") {
  const elemento = document.getElementById(id);

  if (!elemento) {
    console.warn(`No se encontró el elemento #${id}`);
    return;
  }

  elemento.textContent = mensaje;
  elemento.style.display = mensaje ? "block" : "none";

  elemento.classList.remove("error", "success");

  if (mensaje) {
    elemento.classList.add(tipo);
  }
}


// =====================================================
// CAMBIAR ENTRE LOGIN Y REGISTRO
// =====================================================

function mostrarLogin() {
  const loginForm =
    document.getElementById("login-form");

  const registerForm =
    document.getElementById("register-form");

  const recoveryRequestForm =
    document.getElementById("recovery-request-form");

  const recoveryUpdateForm =
    document.getElementById("recovery-update-form");

  const loginTab =
    document.getElementById("login-tab");

  const registerTab =
    document.getElementById("register-tab");

  const titulo =
    document.getElementById("auth-title");

  const subtitulo =
    document.getElementById("auth-subtitle");

  registerForm?.classList.add("hidden");
  recoveryRequestForm?.classList.add("hidden");
  recoveryUpdateForm?.classList.add("hidden");
  loginForm?.classList.remove("hidden");

  registerTab?.classList.remove("active");
  loginTab?.classList.add("active");

  if (titulo) {
    titulo.textContent =
      "Continúa tu preparación";
  }

  if (subtitulo) {
    subtitulo.textContent =
      "Inicia sesión para volver a tu panel de estudios.";
  }

  mostrarMensaje("register-error", "");
  mostrarMensaje("login-error", "");
}


function mostrarRegistro() {
  const loginForm =
    document.getElementById("login-form");

  const registerForm =
    document.getElementById("register-form");

  const recoveryRequestForm =
    document.getElementById("recovery-request-form");

  const recoveryUpdateForm =
    document.getElementById("recovery-update-form");

  const loginTab =
    document.getElementById("login-tab");

  const registerTab =
    document.getElementById("register-tab");

  const titulo =
    document.getElementById("auth-title");

  const subtitulo =
    document.getElementById("auth-subtitle");

  loginForm?.classList.add("hidden");
  recoveryRequestForm?.classList.add("hidden");
  recoveryUpdateForm?.classList.add("hidden");
  registerForm?.classList.remove("hidden");

  loginTab?.classList.remove("active");
  registerTab?.classList.add("active");

  if (titulo) {
    titulo.textContent =
      "Comienza tu misión";
  }

  if (subtitulo) {
    subtitulo.textContent =
      "Crea tu perfil académico y empieza a avanzar.";
  }

  mostrarMensaje("login-error", "");
  mostrarMensaje("register-error", "");
}


// =====================================================
// MOSTRAR U OCULTAR CONTRASEÑA
// =====================================================

function alternarPassword(inputId, boton) {
  const input =
    document.getElementById(inputId);

  if (!input) {
    return;
  }

  const estaOculta =
    input.type === "password";

  input.type =
    estaOculta ? "text" : "password";

  if (boton) {
    boton.textContent =
      estaOculta ? "🙈" : "👁";

    boton.setAttribute(
      "aria-label",
      estaOculta
        ? "Ocultar contraseña"
        : "Mostrar contraseña"
    );
  }
}


// =====================================================
// SEGURIDAD DE CONTRASEÑA
// =====================================================

function actualizarSeguridadPassword(
  password = ""
) {
  const barra =
    document.getElementById(
      "password-strength-fill"
    );

  const texto =
    document.getElementById(
      "password-strength-text"
    );

  if (!barra || !texto) {
    return;
  }

  let nivel = 0;

  if (password.length >= 6) {
    nivel++;
  }

  if (/[A-Z]/.test(password)) {
    nivel++;
  }

  if (/[0-9]/.test(password)) {
    nivel++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    nivel++;
  }

  const configuraciones = [
    {
      ancho: "0%",
      mensaje:
        "Usa mínimo 6 caracteres.",
      fondo: "transparent"
    },
    {
      ancho: "25%",
      mensaje:
        "Contraseña débil",
      fondo: "var(--pink)"
    },
    {
      ancho: "50%",
      mensaje:
        "Contraseña aceptable",
      fondo: "var(--orange)"
    },
    {
      ancho: "75%",
      mensaje:
        "Contraseña segura",
      fondo: "var(--yellow)"
    },
    {
      ancho: "100%",
      mensaje:
        "Contraseña muy segura",
      fondo: "var(--green)"
    }
  ];

  const configuracion =
    configuraciones[nivel];

  barra.style.width =
    configuracion.ancho;

  barra.style.background =
    configuracion.fondo;

  texto.textContent =
    configuracion.mensaje;
}


// =====================================================
// TRADUCIR ERRORES
// =====================================================

function traducirErrorAuth(
  mensaje = ""
) {
  const error =
    mensaje.toLowerCase();

  if (
    error.includes(
      "invalid login credentials"
    )
  ) {
    return "Correo o contraseña incorrectos.";
  }

  if (
    error.includes(
      "email not confirmed"
    )
  ) {
    return "Debes confirmar tu correo antes de ingresar.";
  }

  if (
    error.includes(
      "user already registered"
    ) ||
    error.includes(
      "already been registered"
    )
  ) {
    return "Este correo ya está registrado.";
  }

  if (
    error.includes(
      "password should be"
    ) ||
    error.includes(
      "password must be"
    )
  ) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (
    error.includes("rate limit") ||
    error.includes(
      "too many requests"
    ) ||
    error.includes(
      "email rate limit exceeded"
    )
  ) {
    return "Realizaste demasiados intentos. Espera unos minutos.";
  }

  if (
    error.includes(
      "signup is disabled"
    )
  ) {
    return "El registro de usuarios está desactivado.";
  }

  if (
    error.includes(
      "invalid email"
    )
  ) {
    return "El correo electrónico no es válido.";
  }

  if (
    error.includes("network") ||
    error.includes(
      "failed to fetch"
    )
  ) {
    return "No se pudo conectar con Supabase. Revisa tu internet.";
  }

  if (
    error.includes("auth session missing") ||
    error.includes("invalid token") ||
    error.includes("token has expired") ||
    error.includes("otp expired")
  ) {
    return "El enlace de recuperación venció o ya fue utilizado. Solicita uno nuevo.";
  }

  return (
    mensaje ||
    "Ocurrió un error de autenticación."
  );
}


// =====================================================
// ESTADO DE BOTONES
// =====================================================

function cambiarEstadoBoton(
  boton,
  cargando,
  textoNormal,
  textoCargando
) {
  if (!boton) {
    return;
  }

  boton.disabled =
    cargando;

  boton.style.opacity =
    cargando ? "0.7" : "1";

  boton.style.cursor =
    cargando
      ? "wait"
      : "pointer";

  const textoInterior =
    boton.querySelector("span");

  if (textoInterior) {
    textoInterior.textContent =
      cargando
        ? textoCargando
        : textoNormal;
  } else {
    boton.textContent =
      cargando
        ? textoCargando
        : textoNormal;
  }
}


// =====================================================
// ABRIR APLICACIÓN
// =====================================================

async function abrirAplicacion() {
  if (
    typeof window.iniciarApp !==
    "function"
  ) {
    console.error(
      "❌ No existe iniciarApp(). Revisa app.js."
    );

    return false;
  }

  try {
    const resultado =
      await window.iniciarApp();

    return resultado === true;

  } catch (error) {
    console.error(
      "❌ Error abriendo UniPrep:",
      error
    );

    return false;
  }
}


// =====================================================
// ACTUALIZAR RACHA DIARIA
// =====================================================

async function actualizarRachaAlIngresar() {
  if (
    typeof window.actualizarRachaEstudio !==
    "function"
  ) {
    console.warn(
      "⚠️ No existe actualizarRachaEstudio(). Revisa streak.js."
    );

    return;
  }

  try {
    await window.actualizarRachaEstudio();

  } catch (error) {
    console.error(
      "❌ Error actualizando la racha:",
      error
    );
  }
}


// =====================================================
// RECUPERAR CONTRASEÑA
// =====================================================

function mostrarRecuperacion() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const requestForm = document.getElementById("recovery-request-form");
  const updateForm = document.getElementById("recovery-update-form");
  const correoLogin = document.getElementById("login-correo")?.value.trim() || "";
  const correoRecuperacion = document.getElementById("recovery-email");

  loginForm?.classList.add("hidden");
  registerForm?.classList.add("hidden");
  updateForm?.classList.add("hidden");
  requestForm?.classList.remove("hidden");
  document.getElementById("login-tab")?.classList.remove("active");
  document.getElementById("register-tab")?.classList.remove("active");

  if (correoRecuperacion && correoLogin) correoRecuperacion.value = correoLogin;
  if (correoRecuperacion) setTimeout(() => correoRecuperacion.focus(), 0);

  const titulo = document.getElementById("auth-title");
  const subtitulo = document.getElementById("auth-subtitle");
  if (titulo) titulo.textContent = "Recupera tu cuenta";
  if (subtitulo) subtitulo.textContent = "Recibirás un enlace temporal en tu correo.";
  mostrarMensaje("recovery-request-message", "");
}

function mostrarFormularioNuevaPassword() {
  const authScreen = document.getElementById("auth-screen");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const requestForm = document.getElementById("recovery-request-form");
  const updateForm = document.getElementById("recovery-update-form");

  if (authScreen) authScreen.style.display = "flex";
  loginForm?.classList.add("hidden");
  registerForm?.classList.add("hidden");
  requestForm?.classList.add("hidden");
  updateForm?.classList.remove("hidden");
  document.getElementById("login-tab")?.classList.remove("active");
  document.getElementById("register-tab")?.classList.remove("active");

  const titulo = document.getElementById("auth-title");
  const subtitulo = document.getElementById("auth-subtitle");
  if (titulo) titulo.textContent = "Crea una nueva contraseña";
  if (subtitulo) subtitulo.textContent = "Este cambio protegerá nuevamente tu cuenta.";
  setTimeout(() => document.getElementById("recovery-new-password")?.focus(), 0);
}

function crearUrlRecuperacion() {
  if (!window.location.origin || window.location.origin === "null") return "";
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("recover", "1");
  return url.toString();
}

function esRecuperacionPasswordActiva() {
  if (window.__uniprepRecoveryMode) return true;
  const consulta = new URLSearchParams(window.location.search);
  const fragmento = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return consulta.get("recover") === "1" || fragmento.get("type") === "recovery";
}

function activarModoRecuperacion() {
  window.__uniprepRecoveryMode = true;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mostrarFormularioNuevaPassword, {once: true});
  } else {
    mostrarFormularioNuevaPassword();
  }
}

function limpiarUrlRecuperacion() {
  const url = new URL(window.location.href);
  ["recover", "code", "error", "error_code", "error_description"].forEach(clave => url.searchParams.delete(clave));
  url.hash = "";
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}

function passwordNuevaEsSegura(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

if (esRecuperacionPasswordActiva()) activarModoRecuperacion();

window.supabaseClient?.auth?.onAuthStateChange((evento) => {
  if (evento === "PASSWORD_RECOVERY") activarModoRecuperacion();
});


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {
  if (!window.supabaseClient) {
    console.error(
      "Supabase no está conectado."
    );

    return;
  }

  try {
    const { error } =
      await window.supabaseClient
        .auth
        .signOut();

    if (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );

      alert(
        "No se pudo cerrar la sesión."
      );

      return;
    }

    localStorage.removeItem(
      "usuarioActivo"
    );

    localStorage.removeItem(
      "preuni_usuario_activo"
    );

    window.location.reload();

  } catch (error) {
    console.error(
      "Error inesperado cerrando sesión:",
      error
    );
  }
}


// =====================================================
// FORMULARIOS
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const registerForm =
      document.getElementById(
        "register-form"
      );

    const loginForm =
      document.getElementById(
        "login-form"
      );

    const recoveryRequestForm =
      document.getElementById("recovery-request-form");

    const recoveryUpdateForm =
      document.getElementById("recovery-update-form");

    if (!window.supabaseClient) {
      console.error(
        "❌ No existe supabaseClient."
      );

      console.error(
        "Revisa que supabase.js cargue antes de auth.js."
      );

      mostrarMensaje("login-error","No se pudo conectar con el servicio de usuarios. Recarga la página con internet.");
      mostrarMensaje("register-error","No se pudo conectar con el servicio de usuarios. Recarga la página con internet.");
      mostrarMensaje("recovery-request-message","No se pudo conectar con el servicio de usuarios. Recarga la página con internet.");
      mostrarMensaje("recovery-update-message","No se pudo conectar con el servicio de usuarios. Recarga la página con internet.");
      return;
    }

    recoveryRequestForm?.addEventListener("submit", async event => {
      event.preventDefault();
      mostrarMensaje("recovery-request-message", "");
      const boton = recoveryRequestForm.querySelector('button[type="submit"]');
      const correo = document.getElementById("recovery-email")?.value.trim().toLowerCase() || "";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarMensaje("recovery-request-message", "Ingresa un correo electrónico válido.");
        return;
      }

      const redirectTo = crearUrlRecuperacion();
      if (!redirectTo) {
        mostrarMensaje("recovery-request-message", "Abre UniPrep con Live Server para enviar el enlace de recuperación.");
        return;
      }

      cambiarEstadoBoton(boton, true, "Enviar enlace seguro", "Enviando...");
      try {
        const {error} = await window.supabaseClient.auth.resetPasswordForEmail(correo, {redirectTo});
        if (error) {
          mostrarMensaje("recovery-request-message", traducirErrorAuth(error.message));
          return;
        }
        mostrarMensaje(
          "recovery-request-message",
          "Si el correo está registrado, recibirás un enlace para crear una contraseña nueva. Revisa también Spam.",
          "success"
        );
      } catch (error) {
        console.error("Error enviando la recuperación:", error);
        mostrarMensaje("recovery-request-message", "No se pudo enviar el correo. Revisa tu conexión e inténtalo nuevamente.");
      } finally {
        cambiarEstadoBoton(boton, false, "Enviar enlace seguro", "Enviando...");
      }
    });

    recoveryUpdateForm?.addEventListener("submit", async event => {
      event.preventDefault();
      mostrarMensaje("recovery-update-message", "");
      const boton = recoveryUpdateForm.querySelector('button[type="submit"]');
      const password = document.getElementById("recovery-new-password")?.value || "";
      const confirmacion = document.getElementById("recovery-confirm-password")?.value || "";

      if (!passwordNuevaEsSegura(password)) {
        mostrarMensaje("recovery-update-message", "Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.");
        return;
      }
      if (password !== confirmacion) {
        mostrarMensaje("recovery-update-message", "Las contraseñas no coinciden.");
        return;
      }

      cambiarEstadoBoton(boton, true, "Guardar nueva contraseña", "Guardando...");
      try {
        const {error} = await window.supabaseClient.auth.updateUser({password});
        if (error) {
          mostrarMensaje("recovery-update-message", traducirErrorAuth(error.message));
          return;
        }

        mostrarMensaje("recovery-update-message", "Contraseña actualizada correctamente. Ya puedes iniciar sesión.", "success");
        await window.supabaseClient.auth.signOut({scope: "local"});
        window.__uniprepRecoveryMode = false;
        limpiarUrlRecuperacion();
        recoveryUpdateForm.reset();
        mostrarLogin();
        mostrarMensaje("login-error", "Contraseña actualizada. Ingresa con tu nueva contraseña.", "success");
      } catch (error) {
        console.error("Error actualizando la contraseña:", error);
        mostrarMensaje("recovery-update-message", "No se pudo cambiar la contraseña. Solicita un enlace nuevo.");
      } finally {
        cambiarEstadoBoton(boton, false, "Guardar nueva contraseña", "Guardando...");
      }
    });


    // ===============================================
    // CREAR CUENTA
    // ===============================================

    registerForm?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        mostrarMensaje(
          "register-error",
          ""
        );

        const boton =
          registerForm.querySelector(
            'button[type="submit"]'
          );

        const nombre =
          document
            .getElementById(
              "reg-nombre"
            )
            ?.value.trim() || "";

        const correo =
          document
            .getElementById(
              "reg-correo"
            )
            ?.value.trim()
            .toLowerCase() || "";

        const password =
          document
            .getElementById(
              "reg-password"
            )
            ?.value || "";

        const seleccionAdmision =
          window.seleccionAdmisionDesdeFormulario?.("reg") || null;

        const carrera =
          seleccionAdmision?.carrera || "";

        const universidad =
          seleccionAdmision?.universidadCorta || "";

        const grupoAdmision =
          seleccionAdmision?.grupoId || "";

        const procedencia =
          document.getElementById("reg-procedencia")?.value || "";

        const aceptoTerminos =
          document
            .getElementById(
              "accept-terms"
            )
            ?.checked ?? true;

        if (
          !nombre ||
          !correo ||
          !password ||
          !carrera ||
          !universidad ||
          !grupoAdmision ||
          !procedencia
        ) {
          mostrarMensaje(
            "register-error",
            "Completa todos los campos para crear tu cuenta."
          );

          return;
        }

        const correoValido =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(correo);

        if (!correoValido) {
          mostrarMensaje(
            "register-error",
            "Ingresa un correo electrónico válido."
          );

          return;
        }

        if (password.length < 6) {
          mostrarMensaje(
            "register-error",
            "La contraseña debe tener al menos 6 caracteres."
          );

          return;
        }

        if (!aceptoTerminos) {
          mostrarMensaje(
            "register-error",
            "Debes aceptar los términos para crear tu cuenta."
          );

          return;
        }

        cambiarEstadoBoton(
          boton,
          true,
          "Comenzar mi misión",
          "Creando cuenta..."
        );

        try {
          const { data, error } =
            await window.supabaseClient
              .auth
              .signUp({
                email: correo,
                password,

                options: {
                  data: {
                    nombre,
                    carrera,
                    universidad,
                    universidad_id: seleccionAdmision.universidadId,
                    grupo_admision: grupoAdmision,
                    procedencia,
                    tutorial_completado: false,
                    tutorial_version: "2026.12"
                  }
                }
              });

          if (error) {
            mostrarMensaje(
              "register-error",
              traducirErrorAuth(
                error.message
              )
            );

            return;
          }

          if (!data?.user) {
            mostrarMensaje(
              "register-error",
              "No se pudo crear la cuenta."
            );

            return;
          }

          window.guardarSeleccionAdmision?.({
            ...seleccionAdmision,
            procedencia
          });

          /*
           * Confirmación de correo desactivada:
           * Supabase entrega una sesión activa.
           */
          if (data.session) {
            const aplicacionCargada =
              await abrirAplicacion();

            if (!aplicacionCargada) {
              mostrarMensaje(
                "register-error",
                "La cuenta se creó, pero no se pudo abrir el panel."
              );

              return;
            }

            // La carrera ya determinó su área: abrir directamente la ruta académica.
            window.abrirRutaAdmision?.();

            // El tutorial se abre después de crear la cuenta y nunca bloquea el registro.
            setTimeout(() => {
              window.iniciarTutorialUniPrep?.({forzar: true});
            }, 550);

            registerForm.reset();

            actualizarSeguridadPassword(
              ""
            );

            console.log(
              "✅ Cuenta creada:",
              data.user.email
            );

            return;
          }

          /*
           * Confirmación de correo activada.
           */
          mostrarLogin();

          const loginCorreo =
            document.getElementById(
              "login-correo"
            );

          if (loginCorreo) {
            loginCorreo.value =
              correo;
          }

          mostrarMensaje(
            "login-error",
            "Cuenta creada. Revisa tu correo y confirma tu cuenta.",
            "success"
          );

        } catch (error) {
          console.error(
            "Error inesperado creando cuenta:",
            error
          );

          mostrarMensaje(
            "register-error",
            "Ocurrió un error inesperado al crear la cuenta."
          );

        } finally {
          cambiarEstadoBoton(
            boton,
            false,
            "Comenzar mi misión",
            "Creando cuenta..."
          );
        }
      }
    );


    // ===============================================
    // INICIAR SESIÓN
    // ===============================================

    loginForm?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        mostrarMensaje(
          "login-error",
          ""
        );

        const boton =
          loginForm.querySelector(
            'button[type="submit"]'
          );

        const correo =
          document
            .getElementById(
              "login-correo"
            )
            ?.value.trim()
            .toLowerCase() || "";

        const password =
          document
            .getElementById(
              "login-password"
            )
            ?.value || "";

        if (!correo || !password) {
          mostrarMensaje(
            "login-error",
            "Completa el correo y la contraseña."
          );

          return;
        }

        const correoValido =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(correo);

        if (!correoValido) {
          mostrarMensaje(
            "login-error",
            "Ingresa un correo válido, por ejemplo: nombre@gmail.com."
          );

          return;
        }

        if (password.length < 6) {
          mostrarMensaje(
            "login-error",
            "La contraseña debe tener al menos 6 caracteres."
          );

          return;
        }

        cambiarEstadoBoton(
          boton,
          true,
          "Entrar a mi órbita",
          "Ingresando..."
        );

        try {
          const { data, error } =
            await window.supabaseClient
              .auth
              .signInWithPassword({
                email: correo,
                password
              });

          if (error) {
            mostrarMensaje(
              "login-error",
              traducirErrorAuth(
                error.message
              )
            );

            return;
          }

          if (
            !data?.session ||
            !data?.user
          ) {
            mostrarMensaje(
              "login-error",
              "No se pudo iniciar la sesión."
            );

            return;
          }

          const aplicacionCargada =
            await abrirAplicacion();

          if (!aplicacionCargada) {
            mostrarMensaje(
              "login-error",
              "La sesión inició, pero no se pudo abrir la aplicación."
            );

            return;
          }

          loginForm.reset();

          console.log(
            "✅ Sesión iniciada:",
            data.user.email
          );

        } catch (error) {
          console.error(
            "Error inesperado iniciando sesión:",
            error
          );

          mostrarMensaje(
            "login-error",
            "Ocurrió un error inesperado al iniciar sesión."
          );

        } finally {
          cambiarEstadoBoton(
            boton,
            false,
            "Entrar a mi órbita",
            "Ingresando..."
          );
        }
      }
    );
  }
);


// =====================================================
// FUNCIONES GLOBALES
// =====================================================

window.mostrarLogin =
  mostrarLogin;

window.mostrarRegistro =
  mostrarRegistro;

window.mostrarMensaje =
  mostrarMensaje;

window.alternarPassword =
  alternarPassword;

window.actualizarSeguridadPassword =
  actualizarSeguridadPassword;

window.mostrarRecuperacion =
  mostrarRecuperacion;

window.mostrarFormularioNuevaPassword =
  mostrarFormularioNuevaPassword;

window.esRecuperacionPasswordActiva =
  esRecuperacionPasswordActiva;

window.cerrarSesion =
  cerrarSesion;
