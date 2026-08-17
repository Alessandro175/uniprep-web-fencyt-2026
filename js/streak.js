// =====================================================
// UNIPREP - SISTEMA REAL DE RACHA
// =====================================================

(function () {
  function obtenerFechaLocal() {
    const ahora = new Date();

    const anio =
      ahora.getFullYear();

    const mes =
      String(
        ahora.getMonth() + 1
      ).padStart(2, "0");

    const dia =
      String(
        ahora.getDate()
      ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  }


  function crearFechaSinHora(
    fechaTexto
  ) {
    if (!fechaTexto) {
      return null;
    }

    const partes =
      fechaTexto
        .split("-")
        .map(Number);

    if (partes.length !== 3) {
      return null;
    }

    return new Date(
      partes[0],
      partes[1] - 1,
      partes[2]
    );
  }


  function calcularDiferenciaDias(
    fechaAnterior,
    fechaActual
  ) {
    const anterior =
      crearFechaSinHora(
        fechaAnterior
      );

    const actual =
      crearFechaSinHora(
        fechaActual
      );

    if (!anterior || !actual) {
      return null;
    }

    const milisegundosDia =
      1000 * 60 * 60 * 24;

    return Math.round(
      (
        actual.getTime() -
        anterior.getTime()
      ) /
      milisegundosDia
    );
  }


  async function actualizarRachaEstudio() {
    if (
      typeof window.obtenerUsuarioActivo !==
      "function"
    ) {
      console.error(
        "❌ No existe obtenerUsuarioActivo()."
      );

      return null;
    }

    if (
      typeof window.actualizarEstadisticasUsuario !==
      "function"
    ) {
      console.error(
        "❌ No existe actualizarEstadisticasUsuario()."
      );

      return null;
    }

    try {
      const usuario =
        await window.obtenerUsuarioActivo();

      if (!usuario) {
        return null;
      }

      const hoy =
        obtenerFechaLocal();

      const ultimoDia =
        usuario.ultimoDiaEstudio ||
        null;

      let racha =
        Number(
          usuario.racha
        ) || 0;

      let record =
        Number(
          usuario.recordRacha
        ) || 0;

      /*
       * Ya estudió hoy:
       * no aumentamos nuevamente.
       */
      if (ultimoDia === hoy) {
        return { usuario, aumento: false, nuevaRacha: false };
      }

      const diferencia =
        calcularDiferenciaDias(
          ultimoDia,
          hoy
        );

      /*
       * Nunca había estudiado.
       */
      if (!ultimoDia) {
        racha = 1;
      }

      /*
       * Estudió ayer.
       */
      else if (diferencia === 1) {
        racha += 1;
      }

      /*
       * Dejó pasar uno o más días.
       */
      else if (
        diferencia !== null &&
        diferencia > 1
      ) {
        racha = 1;
      }

      /*
       * Evita problemas si la fecha
       * del dispositivo está atrasada.
       */
      else if (
        diferencia !== null &&
        diferencia < 0
      ) {
        console.warn(
          "La fecha actual es anterior al último día de estudio."
        );

        return usuario;
      }

      const nuevoRecord =
        racha > record;

      record =
        Math.max(
          record,
          racha
        );

      usuario.racha =
        racha;

      usuario.recordRacha =
        record;

      usuario.ultimoDiaEstudio =
        hoy;

      const guardado = await window.actualizarEstadisticasUsuario({
        racha: usuario.racha,
        recordRacha: usuario.recordRacha,
        ultimoDiaEstudio: usuario.ultimoDiaEstudio
      });

      const resultado = { exito: guardado === true };

      if (
        !resultado ||
        resultado.exito !== true
      ) {
        console.error(
          "❌ No se pudo guardar la racha:",
          resultado
        );

        return null;
      }

      console.log(
        "🔥 Racha actualizada:",
        racha
      );

      if (typeof window.registrarActividad === "function") {
        await window.registrarActividad({
          tipo: "racha",
          titulo: `Racha de ${racha} ${racha === 1 ? "día" : "días"}`,
          descripcion: nuevoRecord
            ? "¡Nuevo récord personal de estudio!"
            : "Estudiaste hoy y mantuviste activa tu racha.",
          xpGanado: 0
        });
      }

      return { usuario, aumento: true, nuevaRacha: nuevoRecord };

    } catch (error) {
      console.error(
        "❌ Error actualizando racha:",
        error
      );

      return null;
    }
  }


  window.actualizarRachaEstudio =
    actualizarRachaEstudio;
})();
