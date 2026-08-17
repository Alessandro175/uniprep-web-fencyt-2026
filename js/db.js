// =====================================================
// UNIPREP - BASE DE DATOS CON SUPABASE
// =====================================================

let usuarioActivoCache = null;


// =====================================================
// COMPROBAR SUPABASE
// =====================================================

function comprobarSupabase() {
  if (!window.supabaseClient) {
    console.error(
      "❌ No existe supabaseClient. Revisa supabase.js y el orden de los scripts."
    );

    return false;
  }

  return true;
}


// =====================================================
// OBTENER SESIÓN
// =====================================================

async function obtenerSesionActual() {
  if (!comprobarSupabase()) {
    return null;
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient.auth.getSession();

    if (error) {
      console.error(
        "❌ Error obteniendo la sesión:",
        error
      );

      return null;
    }

    return data?.session || null;

  } catch (error) {
    console.error(
      "❌ Error inesperado obteniendo sesión:",
      error
    );

    return null;
  }
}


// =====================================================
// OBTENER USUARIO DE AUTH
// =====================================================

async function obtenerUsuarioAuth() {
  const sesion =
    await obtenerSesionActual();

  if (!sesion?.user) {
    return null;
  }

  return sesion.user;
}


// =====================================================
// CONVERTIR PERFIL
// =====================================================

function convertirPerfilSupabase(
  perfil,
  progreso = {}
) {
  if (!perfil) {
    return null;
  }

  return {
    id:
      perfil.id || null,

    nombre:
      perfil.nombre ||
      "Estudiante UniPrep",

    correo:
      perfil.correo || "",

    carrera:
      perfil.carrera || "",

    universidad:
      perfil.universidad || "",

    nivel:
      Number(perfil.nivel ?? 1),

    xp:
      Number(perfil.xp ?? 0),

    monedas:
      Number(perfil.monedas ?? 0),

    racha:
      Number(perfil.racha ?? 0),

    recordRacha:
      Number(
        perfil.record_racha ?? 0
      ),

    ultimoDiaEstudio:
      perfil.ultimo_dia_estudio ||
      null,

    ejercicios:
      Number(
        perfil.ejercicios ?? 0
      ),

    respuestasCorrectas:
      Number(
        perfil.respuestas_correctas ?? 0
      ),

    respuestasTotales:
      Number(
        perfil.respuestas_totales ?? 0
      ),

    precision:
      Number(
        perfil.precision ?? 0
      ),

    ranking:
      perfil.ranking ?? null,

    simulacros:
      Number(
        perfil.simulacros ?? 0
      ),

    progreso,

    fechaRegistro:
      perfil.creado_en ||
      perfil.created_at ||
      null,

    actualizadoEn:
      perfil.actualizado_en ||
      perfil.updated_at ||
      null
  };
}


// =====================================================
// OBTENER PERFIL
// =====================================================

async function obtenerPerfilPorId(userId) {
  if (!comprobarSupabase()) {
    return null;
  }

  if (!userId) {
    return null;
  }

  try {
    /*
     * Usamos select("*") para evitar que la consulta falle
     * si todavía falta alguna columna secundaria.
     */
    const {
      data,
      error
    } = await window.supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "❌ Error consultando profiles:",
        error
      );

      console.error(
        "Código:",
        error.code
      );

      console.error(
        "Mensaje:",
        error.message
      );

      console.error(
        "Detalles:",
        error.details
      );

      return null;
    }

    if (!data) {
      console.warn(
        "⚠️ No se encontró una fila en profiles para:",
        userId
      );

      return null;
    }

    console.log(
      "✅ Perfil encontrado en Supabase:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ Error inesperado consultando el perfil:",
      error
    );

    return null;
  }
}


// =====================================================
// CREAR PERFIL SI AUTH EXISTE PERO FALTA PROFILES
// =====================================================

async function crearPerfilFaltante(authUser) {
  if (!authUser?.id) return null;

  const metadata = authUser.user_metadata || {};
  const fila = {
    id: authUser.id,
    nombre: metadata.nombre || authUser.email?.split("@")[0] || "Estudiante UniPrep",
    correo: authUser.email || "",
    carrera: metadata.carrera || "",
    universidad: metadata.universidad || ""
  };

  try {
    const { data, error } = await window.supabaseClient
      .from("profiles")
      .upsert(fila, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (!error && data) {
      console.log("✅ Perfil creado automáticamente:", data.id);
      return data;
    }

    console.warn("⚠️ No se pudo insertar profiles; se usará el perfil de Auth.", error?.message || "Sin datos");
  } catch (error) {
    console.warn("⚠️ Error creando el perfil automático:", error);
  }

  // Evita bloquear el acceso si la tabla o sus políticas aún no están listas.
  return fila;
}


// =====================================================
// OBTENER PROGRESO
// =====================================================

async function obtenerTodoElProgreso(userId) {
  if (!comprobarSupabase() || !userId) {
    return {
      resumen: {},
      detallado: []
    };
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("course_progress")
      .select("*")
      .eq("user_id", userId);

    /*
     * Si todavía no existe progreso, no impedimos
     * que el usuario entre a la aplicación.
     */
    if (error) {
      console.warn(
        "⚠️ No se pudo cargar course_progress:",
        error.message
      );

      return {
        resumen: {},
        detallado: []
      };
    }

    const filas =
      Array.isArray(data)
        ? data
        : [];

    const resumen = {};

    filas.forEach(fila => {
      if (!fila.course_id) {
        return;
      }

      resumen[fila.course_id] =
        Number(fila.progress ?? 0);
    });

    return {
      resumen,
      detallado: filas
    };

  } catch (error) {
    console.warn(
      "⚠️ Error inesperado cargando progreso:",
      error
    );

    return {
      resumen: {},
      detallado: []
    };
  }
}


// =====================================================
// OBTENER USUARIO ACTIVO COMPLETO
// =====================================================

async function obtenerUsuarioActivo() {
  try {
    const authUser =
      await obtenerUsuarioAuth();

    if (!authUser) {
      usuarioActivoCache = null;

      console.log(
        "ℹ️ No existe sesión activa en Supabase."
      );

      return null;
    }

    console.log(
      "✅ Usuario autenticado:",
      authUser.email
    );

    let perfil =
      await obtenerPerfilPorId(
        authUser.id
      );

    if (!perfil) {
      perfil = await crearPerfilFaltante(authUser);
    }

    if (!perfil) {
      usuarioActivoCache = null;
      console.error("❌ No fue posible construir el perfil del usuario.");
      return null;
    }

    const datosProgreso =
      await obtenerTodoElProgreso(
        authUser.id
      );

    const usuario =
      convertirPerfilSupabase(
        perfil,
        datosProgreso.resumen
      );

    usuario.progresoDetallado =
      datosProgreso.detallado;

    usuario.authEmail =
      authUser.email || "";

    usuarioActivoCache =
      usuario;

    console.log(
      "✅ Usuario completo cargado:",
      usuario
    );

    return usuario;

  } catch (error) {
    usuarioActivoCache = null;

    console.error(
      "❌ Error obteniendo usuario activo:",
      error
    );

    return null;
  }
}


// =====================================================
// OBTENER CACHÉ
// =====================================================

function obtenerUsuarioCache() {
  return usuarioActivoCache;
}


// =====================================================
// RECARGAR USUARIO
// =====================================================

async function recargarUsuarioActivo() {
  usuarioActivoCache = null;

  return await obtenerUsuarioActivo();
}


// =====================================================
// ACTUALIZAR PERFIL
// =====================================================

async function actualizarUsuario(
  usuario
) {
  if (!comprobarSupabase()) {
    return {
      exito: false,
      mensaje:
        "Supabase no está conectado."
    };
  }

  if (!usuario?.id) {
    return {
      exito: false,
      mensaje:
        "No existe un usuario válido."
    };
  }

  /*
   * Por ahora solo enviamos columnas principales
   * que sabemos que existen en tu tabla.
   */
  const cambiosPrincipales = {
    nombre:
      usuario.nombre ||
      "Estudiante UniPrep",

    correo:
      usuario.correo ||
      usuario.authEmail ||
      "",

    carrera:
      usuario.carrera || "",

    universidad:
      usuario.universidad || ""
  };

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("profiles")
      .update(cambiosPrincipales)
      .eq("id", usuario.id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "❌ Error actualizando perfil:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message ||
          "No se pudo actualizar el perfil."
      };
    }

    if (data) {
      const actualizado =
        convertirPerfilSupabase(
          data,
          usuario.progreso || {}
        );

      usuarioActivoCache = {
        ...usuario,
        ...actualizado
      };
    }

    return {
      exito: true,
      mensaje:
        "Perfil actualizado correctamente.",
      usuario:
        usuarioActivoCache
    };

  } catch (error) {
    console.error(
      "❌ Error inesperado actualizando perfil:",
      error
    );

    return {
      exito: false,
      mensaje:
        "Ocurrió un error actualizando el perfil."
    };
  }
}


// =====================================================
// ACTUALIZAR ESTADÍSTICAS
// =====================================================

async function actualizarEstadisticasUsuario(
  cambios = {}
) {
  if (!comprobarSupabase()) {
    return false;
  }

  const usuario =
    usuarioActivoCache ||
    await obtenerUsuarioActivo();

  if (!usuario?.id) {
    return false;
  }

  /*
   * Solo añade las columnas que existan realmente
   * en tu tabla profiles.
   */
  const datos = {};

  if (cambios.nivel !== undefined) {
    datos.nivel =
      Math.max(
        1,
        Number(cambios.nivel) || 1
      );
  }

  if (cambios.xp !== undefined) {
    datos.xp =
      Math.max(
        0,
        Number(cambios.xp) || 0
      );
  }

  if (cambios.monedas !== undefined) {
    datos.monedas =
      Math.max(
        0,
        Number(cambios.monedas) || 0
      );
  }

  if (cambios.racha !== undefined) {
    datos.racha =
      Math.max(
        0,
        Number(cambios.racha) || 0
      );
  }

  if (
    cambios.recordRacha !== undefined
  ) {
    datos.record_racha =
      Math.max(
        0,
        Number(
          cambios.recordRacha
        ) || 0
      );
  }

  if (
    cambios.ultimoDiaEstudio !==
    undefined
  ) {
    datos.ultimo_dia_estudio =
      cambios.ultimoDiaEstudio ||
      null;
  }

  if (
    cambios.ejercicios !== undefined
  ) {
    datos.ejercicios =
      Math.max(
        0,
        Number(cambios.ejercicios) || 0
      );
  }

  if (
    cambios.respuestasCorrectas !==
    undefined
  ) {
    datos.respuestas_correctas =
      Math.max(
        0,
        Number(
          cambios.respuestasCorrectas
        ) || 0
      );
  }

  if (
    cambios.respuestasTotales !==
    undefined
  ) {
    datos.respuestas_totales =
      Math.max(
        0,
        Number(
          cambios.respuestasTotales
        ) || 0
      );
  }

  if (
    cambios.precision !== undefined
  ) {
    datos.precision =
      Math.max(
        0,
        Math.min(
          100,
          Number(cambios.precision) || 0
        )
      );
  }

  if (
    cambios.ranking !== undefined
  ) {
    datos.ranking =
      cambios.ranking === null
        ? null
        : Number(cambios.ranking);
  }

  if (
    cambios.simulacros !== undefined
  ) {
    datos.simulacros =
      Math.max(
        0,
        Number(cambios.simulacros) || 0
      );
  }

  if (
    Object.keys(datos).length === 0
  ) {
    return true;
  }

  try {
    const {
      error
    } = await window.supabaseClient
      .from("profiles")
      .update(datos)
      .eq("id", usuario.id);

    if (error) {
      console.error(
        "❌ Error actualizando estadísticas:",
        error
      );

      return false;
    }

    usuarioActivoCache = {
      ...usuarioActivoCache,
      ...cambios
    };

    return true;

  } catch (error) {
    console.error(
      "❌ Error inesperado actualizando estadísticas:",
      error
    );

    return false;
  }
}


// =====================================================
// GUARDAR PROGRESO DEL CURSO
// =====================================================

async function guardarProgresoCurso(
  courseId,
  datos = {}
) {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser) {
    return {
      exito: false,
      mensaje:
        "Debes iniciar sesión."
    };
  }

  if (!courseId) {
    return {
      exito: false,
      mensaje:
        "El curso no es válido."
    };
  }

  const progreso =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          datos.progress ?? 0
        )
      )
    );

  const fila = {
    user_id:
      authUser.id,

    course_id:
      courseId,

    progress:
      progreso,

    completed_exercises:
      Math.max(
        0,
        Number(
          datos.completedExercises ?? 0
        )
      ),

    correct_answers:
      Math.max(
        0,
        Number(
          datos.correctAnswers ?? 0
        )
      ),

    total_answers:
      Math.max(
        0,
        Number(
          datos.totalAnswers ?? 0
        )
      ),

    last_topic_index:
      Math.max(
        0,
        Number(
          datos.lastTopicIndex ?? 0
        )
      ),

    updated_at:
      new Date().toISOString()
  };

  try {
    const {
      error
    } = await window.supabaseClient
      .from("course_progress")
      .upsert(
        fila,
        {
          onConflict:
            "user_id,course_id"
        }
      );

    if (error) {
      console.error(
        "❌ Error guardando progreso:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message ||
          "No se pudo guardar el progreso."
      };
    }

    if (usuarioActivoCache) {
      usuarioActivoCache.progreso = {
        ...(
          usuarioActivoCache.progreso ||
          {}
        ),

        [courseId]:
          progreso
      };

      const filaCache = {
        ...fila,
        course_id: courseId
      };

      usuarioActivoCache.progresoDetallado = [
        ...(usuarioActivoCache.progresoDetallado || []).filter(item => item.course_id !== courseId),
        filaCache
      ];
    }

    return {
      exito: true,
      mensaje:
        "Progreso guardado correctamente."
    };

  } catch (error) {
    console.error(
      "❌ Error inesperado guardando progreso:",
      error
    );

    return {
      exito: false,
      mensaje:
        "Ocurrió un error guardando el progreso."
    };
  }
}


// =====================================================
// OBTENER PROGRESO DE UN CURSO
// =====================================================

async function obtenerProgresoCurso(
  courseId
) {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser || !courseId) {
    return null;
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("course_progress")
      .select("*")
      .eq(
        "user_id",
        authUser.id
      )
      .eq(
        "course_id",
        courseId
      )
      .maybeSingle();

    if (error) {
      console.warn(
        "⚠️ Error obteniendo progreso:",
        error
      );

      return null;
    }

    return data || null;

  } catch (error) {
    console.warn(
      "⚠️ Error inesperado obteniendo progreso:",
      error
    );

    return null;
  }
}


// =====================================================
// REGISTRAR ACTIVIDAD
// =====================================================

async function registrarActividad({
  tipo,
  titulo,
  descripcion = "",
  xpGanado = 0
}) {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser) {
    return {
      exito: false,
      mensaje:
        "Debes iniciar sesión."
    };
  }

  try {
    const {
      error
    } = await window.supabaseClient
      .from("activities")
      .insert({
        user_id:
          authUser.id,

        activity_type:
          tipo || "actividad",

        title:
          titulo || "Actividad",

        description:
          descripcion,

        xp_earned:
          Math.max(
            0,
            Number(xpGanado) || 0
          )
      });

    if (error) {
      console.warn(
        "⚠️ No se pudo registrar la actividad:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message
      };
    }

    return {
      exito: true
    };

  } catch (error) {
    console.warn(
      "⚠️ Error inesperado registrando actividad:",
      error
    );

    return {
      exito: false,
      mensaje:
        "No se pudo registrar la actividad."
    };
  }
}


// =====================================================
// OBTENER ACTIVIDADES
// =====================================================

async function obtenerActividades(
  limite = 10
) {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser) {
    return [];
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("activities")
      .select("*")
      .eq(
        "user_id",
        authUser.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(limite);

    if (error) {
      console.warn(
        "⚠️ No se pudieron obtener actividades:",
        error
      );

      return [];
    }

    return data || [];

  } catch (error) {
    console.warn(
      "⚠️ Error inesperado cargando actividades:",
      error
    );

    return [];
  }
}


// =====================================================
// CREAR EVENTO DE AGENDA
// =====================================================

async function crearEventoAgenda(
  evento
) {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser) {
    return {
      exito: false,
      mensaje:
        "Debes iniciar sesión."
    };
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("agenda_events")
      .insert({
        user_id:
          authUser.id,

        title:
          evento.titulo,

        description:
          evento.descripcion || "",

        event_date:
          evento.fecha,

        start_time:
          evento.horaInicio || null,

        end_time:
          evento.horaFin || null,

        event_type:
          evento.tipo || "estudio",

        completed:
          evento.completado === true
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "❌ Error creando evento:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message ||
          "No se pudo crear el evento."
      };
    }

    return {
      exito: true,
      evento:
        data
    };

  } catch (error) {
    console.error(
      "❌ Error inesperado creando evento:",
      error
    );

    return {
      exito: false,
      mensaje:
        "No se pudo crear el evento."
    };
  }
}


// =====================================================
// OBTENER EVENTOS
// =====================================================

async function obtenerEventosAgenda() {
  const authUser =
    await obtenerUsuarioAuth();

  if (!authUser) {
    return [];
  }

  try {
    const {
      data,
      error
    } = await window.supabaseClient
      .from("agenda_events")
      .select("*")
      .eq(
        "user_id",
        authUser.id
      )
      .order(
        "event_date",
        {
          ascending: true
        }
      )
      .order(
        "start_time",
        {
          ascending: true
        }
      );

    if (error) {
      console.warn(
        "⚠️ Error obteniendo agenda:",
        error
      );

      return [];
    }

    return data || [];

  } catch (error) {
    console.warn(
      "⚠️ Error inesperado cargando agenda:",
      error
    );

    return [];
  }
}


// =====================================================
// ACTUALIZAR EVENTO
// =====================================================

async function actualizarEventoAgenda(
  eventoId,
  cambios
) {
  try {
    const {
      error
    } = await window.supabaseClient
      .from("agenda_events")
      .update(cambios)
      .eq(
        "id",
        eventoId
      );

    if (error) {
      console.error(
        "❌ Error actualizando evento:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message
      };
    }

    return {
      exito: true
    };

  } catch (error) {
    console.error(
      "❌ Error inesperado actualizando evento:",
      error
    );

    return {
      exito: false,
      mensaje:
        "No se pudo actualizar el evento."
    };
  }
}


// =====================================================
// ELIMINAR EVENTO
// =====================================================

async function eliminarEventoAgenda(
  eventoId
) {
  try {
    const {
      error
    } = await window.supabaseClient
      .from("agenda_events")
      .delete()
      .eq(
        "id",
        eventoId
      );

    if (error) {
      console.error(
        "❌ Error eliminando evento:",
        error
      );

      return {
        exito: false,
        mensaje:
          error.message
      };
    }

    return {
      exito: true
    };

  } catch (error) {
    console.error(
      "❌ Error inesperado eliminando evento:",
      error
    );

    return {
      exito: false,
      mensaje:
        "No se pudo eliminar el evento."
    };
  }
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesionUsuario() {
  if (!comprobarSupabase()) {
    return false;
  }

  try {
    const {
      error
    } = await window.supabaseClient.auth
      .signOut();

    if (error) {
      console.error(
        "❌ Error cerrando sesión:",
        error
      );

      return false;
    }

    usuarioActivoCache =
      null;

    localStorage.removeItem(
      "usuarioActivo"
    );

    localStorage.removeItem(
      "preuni_usuario_activo"
    );

    return true;

  } catch (error) {
    console.error(
      "❌ Error inesperado cerrando sesión:",
      error
    );

    return false;
  }
}


// =====================================================
// FUNCIONES GLOBALES
// =====================================================

window.obtenerSesionActual =
  obtenerSesionActual;

window.obtenerUsuarioAuth =
  obtenerUsuarioAuth;

window.obtenerPerfilPorId =
  obtenerPerfilPorId;

window.obtenerUsuarioActivo =
  obtenerUsuarioActivo;

window.obtenerUsuarioCache =
  obtenerUsuarioCache;

window.recargarUsuarioActivo =
  recargarUsuarioActivo;

window.actualizarUsuario =
  actualizarUsuario;

window.actualizarEstadisticasUsuario =
  actualizarEstadisticasUsuario;

window.guardarProgresoCurso =
  guardarProgresoCurso;

window.obtenerProgresoCurso =
  obtenerProgresoCurso;

window.registrarActividad =
  registrarActividad;

window.obtenerActividades =
  obtenerActividades;

window.crearEventoAgenda =
  crearEventoAgenda;

window.obtenerEventosAgenda =
  obtenerEventosAgenda;

window.actualizarEventoAgenda =
  actualizarEventoAgenda;

window.eliminarEventoAgenda =
  eliminarEventoAgenda;

window.cerrarSesionUsuario =
  cerrarSesionUsuario;
