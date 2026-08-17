// =====================================================
// UNIPREP - SIMULACRO GENERAL FUNCIONAL
// =====================================================
(function () {
  const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const TIPOS_SIMULACRO = {
    general: {id:"general",nombre:"Simulacro General CEPRE",cantidad:100,duracion:180*60,etiqueta:"100 preguntas · 3 horas"},
    intensivo: {id:"intensivo",nombre:"Simulacro Intensivo #2",cantidad:50,duracion:90*60,etiqueta:"50 preguntas · 90 minutos"},
    uni_aah: {id:"uni_aah",nombre:"UNI - Aptitud Académica y Humanidades",cantidad:100,duracion:180*60,etiqueta:"100 preguntas · 180 minutos",banco:"uni_aah"},
    uni_mat: {id:"uni_mat",nombre:"UNI - Matemática",cantidad:40,duracion:180*60,etiqueta:"40 preguntas · 180 minutos",banco:"uni_mat"},
    uni_fq: {id:"uni_fq",nombre:"UNI - Física y Química",cantidad:40,duracion:180*60,etiqueta:"40 preguntas · 180 minutos",banco:"uni_fq"},
    ucsm_general: {id:"ucsm_general",nombre:"UCSM - Examen General",cantidad:80,duracion:120*60,etiqueta:"80 preguntas · 120 minutos",banco:"ucsm_general"}
  };
  const CLAVE_ACTIVO = "uniprep_simulacro_activo";
  let estado = null;
  let intervalo = null;
  let resultadoMostrado = null;

  const bancoOriginal = [
    {area:"Matemática",tema:"Aritmética",q:"Si el 30% de un número es 72, ¿cuál es el número?",o:["216","220","240","260"],r:2,e:"72 ÷ 0,30 = 240."},
    {area:"Matemática",tema:"Álgebra",q:"Factoriza x² − 9.",o:["(x−9)(x+1)","(x−3)(x+3)","(x−3)²","(x+9)(x−1)"],r:1,e:"Es una diferencia de cuadrados: x² − 3² = (x−3)(x+3)."},
    {area:"Matemática",tema:"Geometría",q:"Un triángulo rectángulo tiene catetos de 6 cm y 8 cm. ¿Cuánto mide la hipotenusa?",o:["9 cm","10 cm","12 cm","14 cm"],r:1,e:"Por Pitágoras: √(6²+8²)=√100=10."},
    {area:"Matemática",tema:"Trigonometría",q:"Si sen θ = 3/5 y θ es agudo, ¿cuánto vale cos θ?",o:["2/5","3/4","4/5","5/3"],r:2,e:"sen²θ+cos²θ=1; cos θ=4/5."},
    {area:"Comunicación",tema:"Comprensión lectora",q:"En la oración «Aunque llovía, continuaron el viaje», la palabra «aunque» expresa:",o:["Causa","Consecuencia","Concesión","Finalidad"],r:2,e:"«Aunque» introduce una dificultad que no impide la acción: una concesión."},
    {area:"Comunicación",tema:"Lenguaje",q:"¿Cuál de las siguientes palabras es esdrújula?",o:["Canción","Árbol","Matemática","Reloj"],r:2,e:"Ma-te-má-ti-ca lleva la fuerza de voz en la antepenúltima sílaba."},
    {area:"Comunicación",tema:"Analogías",q:"LIBRO es a LEER como CANCIÓN es a:",o:["Mirar","Escuchar","Dibujar","Escribir"],r:1,e:"El libro se lee y la canción se escucha."},
    {area:"Comunicación",tema:"Literatura",q:"¿Quién escribió «Paco Yunque»?",o:["José María Arguedas","César Vallejo","Ricardo Palma","Ciro Alegría"],r:1,e:"«Paco Yunque» es un cuento de César Vallejo."},
    {area:"Ciencias",tema:"Química",q:"El elemento con número atómico 17 pertenece a la familia de los:",o:["Alcalinos","Halógenos","Calcógenos","Gases nobles"],r:1,e:"El número atómico 17 corresponde al cloro, que es un halógeno."},
    {area:"Ciencias",tema:"Física",q:"Un móvil recorre 120 m en 20 s con rapidez constante. ¿Cuál es su rapidez?",o:["4 m/s","5 m/s","6 m/s","8 m/s"],r:2,e:"v=d/t=120/20=6 m/s."},
    {area:"Ciencias",tema:"Biología",q:"¿Qué organelo celular produce la mayor parte del ATP?",o:["Ribosoma","Núcleo","Mitocondria","Lisosoma"],r:2,e:"La respiración celular y la producción principal de ATP ocurren en la mitocondria."},
    {area:"Ciencias",tema:"Química",q:"¿Cuál es la fórmula química del agua?",o:["CO₂","H₂O","O₂","NaCl"],r:1,e:"Una molécula de agua contiene dos átomos de hidrógeno y uno de oxígeno."},
    {area:"Sociales",tema:"Historia",q:"¿Quién proclamó la independencia del Perú en 1821?",o:["Simón Bolívar","José de San Martín","Túpac Amaru II","Ramón Castilla"],r:1,e:"José de San Martín proclamó la independencia el 28 de julio de 1821."},
    {area:"Sociales",tema:"Geografía",q:"¿Cuál es la capital de Madre de Dios?",o:["Iñapari","Tambopata","Puerto Maldonado","Mazuko"],r:2,e:"Puerto Maldonado es la capital del departamento de Madre de Dios."},
    {area:"Sociales",tema:"Economía",q:"El PBI mide principalmente:",o:["La cantidad de habitantes","El valor de los bienes y servicios finales producidos","Solo las exportaciones","El dinero ahorrado por las familias"],r:1,e:"El Producto Bruto Interno mide el valor de la producción final realizada en un territorio durante un periodo."},
    {area:"Sociales",tema:"Cívica",q:"La norma de mayor jerarquía en el ordenamiento jurídico peruano es:",o:["El decreto supremo","La ordenanza municipal","La Constitución","La resolución ministerial"],r:2,e:"La Constitución Política es la norma suprema del Estado."},
    {area:"Razonamiento",tema:"RM",q:"Completa la sucesión: 2, 6, 12, 20, 30, ...",o:["36","40","42","44"],r:2,e:"Las diferencias son 4, 6, 8, 10 y luego 12; 30+12=42."},
    {area:"Razonamiento",tema:"RM",q:"Ana tiene el doble de edad que Luis. Si juntos suman 36 años, ¿cuántos años tiene Ana?",o:["12","18","24","26"],r:2,e:"Luis=x, Ana=2x; 3x=36, entonces Ana=24."},
    {area:"Razonamiento",tema:"RV",q:"Señala el término que no pertenece al grupo.",o:["Mercurio","Venus","Marte","Luna"],r:3,e:"Mercurio, Venus y Marte son planetas; la Luna es un satélite."},
    {area:"Razonamiento",tema:"Lógica",q:"Todos los médicos son profesionales. Algunos investigadores son médicos. Entonces:",o:["Todos los investigadores son profesionales","Algunos investigadores son profesionales","Ningún médico investiga","Ningún profesional es investigador"],r:1,e:"Si algunos investigadores son médicos y todo médico es profesional, esos investigadores son profesionales."}
  ];

  // Usa el banco externo de 100 preguntas; conserva el banco original como respaldo.
  const banco = Array.isArray(window.PREGUNTAS_CEPRE) && window.PREGUNTAS_CEPRE.length
    ? window.PREGUNTAS_CEPRE
    : bancoOriginal;

  function normalizar(texto) {
    return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function cursoDePregunta(pregunta) {
    const texto = normalizar(`${pregunta.area} ${pregunta.tema} ${pregunta.q || ""}`);
    if (/razonamiento matematico|\brm\b|logica|sucesion/.test(texto)) return "rm";
    if (/aritmet|porcentaje|proporcion/.test(texto)) return "aritmetica";
    if (/algebra|ecuacion|polinomio/.test(texto)) return "algebra";
    if (/geometr|triangulo|circulo/.test(texto)) return "geometria";
    if (/trigonom|seno|coseno/.test(texto)) return "trigonometria";
    if (/fisica|cinemat|dinamica/.test(texto)) return "fisica";
    if (/quimica|atomo|elemento/.test(texto)) return "quimica";
    if (/medio ambiente|ecolog|ambiental/.test(texto)) return "medio_ambiente";
    if (/anatom|sistema digest|sistema respir|sistema circul|salud/.test(texto)) return "anatomia";
    if (/psicolog|comportamiento|aprendizaje|personalidad|motivacion/.test(texto)) return "psicologia";
    if (/biologia|celula|genet|inmun/.test(texto)) return "biologia";
    if (/econom/.test(texto)) return "economia";
    if (/civica|ciudadan|constitucion/.test(texto)) return "civica";
    if (/historia del peru|tahuantinsuyo|inca|virrein|san martin|fujimori|leguia|velasco/.test(texto)) return "historia_peru";
    if (/geografia|territorio|cartograf/.test(texto)) return "geografia";
    if (/filosofia|etica|logica y argument/.test(texto)) return "filosofia";
    if (/historia|humanidad/.test(texto)) return "historia";
    if (/razonamiento verbal|analog|semant|sinon|anton/.test(texto)) return "rv";
    if (/comprension lectora|idea principal|inferencia|intencion del autor/.test(texto)) return "comprension_lectora";
    if (/literatura|obra|poema|novela|cuento|autor/.test(texto)) return "literatura";
    if (/comunicacion|lenguaje|gramatica|ortografia|fonologia/.test(texto)) return "lenguaje";
    return null;
  }

  function bancoDeRuta() {
    const seleccion = window.obtenerSeleccionAdmision?.();
    if (!seleccion?.cursos?.length) return banco;
    const filtrado = banco.filter(pregunta => {
      const curso = cursoDePregunta(pregunta);
      return curso && seleccion.cursos.includes(curso);
    });
    return filtrado.length >= 10 ? filtrado : banco;
  }

  function configurarTipoPorRuta(tipo) {
    if (tipo.id !== "general") return {...tipo};
    const seleccion = window.obtenerSeleccionAdmision?.();
    if (!seleccion) return {...tipo};
    let cantidad = tipo.cantidad;
    let duracion = tipo.duracion;
    if (seleccion.tipoPeso === "preguntas") {
      cantidad = Object.values(seleccion.pesos || {}).reduce((suma,valor)=>suma+Number(valor||0),0)
        + (seleccion.otrosComponentes || []).reduce((suma,item)=>suma+Number(item.preguntas||0),0);
    }
    if (seleccion.universidadId === "pucp") {
      cantidad = 28 + (["C","E"].includes(seleccion.grupoId) ? 48 : 40);
      duracion = 150 * 60;
    }
    if (seleccion.universidadId === "ucsm") {
      cantidad = 80;
      duracion = 120 * 60;
    }
    return {
      ...tipo,
      cantidad: cantidad || tipo.cantidad,
      duracion,
      nombre:`Simulacro ${seleccion.universidadCorta} · ${seleccion.grupoId}`,
      etiqueta:`${cantidad || tipo.cantidad} preguntas · ${Math.round(duracion/60)} minutos`
    };
  }

  function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  async function iniciarSimulacro(forzarNuevo = false, tipoElegido = "general") {
    detenerTemporizador();
    const guardado = leerJSON(CLAVE_ACTIVO, null);
    if (!forzarNuevo && guardado && !guardado.finalizado && guardado.fin > Date.now()) {
      const continuar = confirm("Tienes un simulacro sin terminar. ¿Deseas continuarlo?");
      if (continuar) estado = guardado;
    }

    if (!estado || estado.finalizado || forzarNuevo) {
      const tipo=configurarTipoPorRuta(TIPOS_SIMULACRO[tipoElegido]||TIPOS_SIMULACRO.general);
      const simulacroEspecial = tipo.banco ? window.SIMULACROS_2026?.[tipo.banco] : null;
      if (tipo.banco && !simulacroEspecial?.preguntas?.length) {
        alert("No se pudo cargar el banco de este simulacro. Recarga la página e inténtalo nuevamente.");
        return;
      }
      const bancoActivo=simulacroEspecial?.preguntas || bancoDeRuta();
      const preguntasSeleccionadas=simulacroEspecial
        ? bancoActivo.slice(0,tipo.cantidad)
        : mezclar(bancoActivo).slice(0,Math.min(tipo.cantidad,bancoActivo.length));
      const seleccion=window.obtenerSeleccionAdmision?.();
      estado = {
        id: Date.now(),
        inicio: Date.now(),
        fin: Date.now() + tipo.duracion * 1000,
        duracion: tipo.duracion,
        tipo: tipo.id,
        nombre: tipo.nombre,
        fuente: simulacroEspecial?.fuente || seleccion?.fuente || "Banco general UniPrep",
        avisoFuente: simulacroEspecial ? "Preguntas adaptadas para entrenamiento; no corresponden a una reproducción oficial." : "",
        ruta: seleccion ? {universidad:seleccion.universidadCorta,grupo:seleccion.grupoId,cursos:seleccion.cursos} : null,
        indice: 0,
        preguntas: preguntasSeleccionadas,
        respuestas: Array(preguntasSeleccionadas.length).fill(null),
        marcadas: Array(preguntasSeleccionadas.length).fill(false),
        finalizado: false
      };
      guardarEstado();
    }

    window.go("exam-active", null);
    texto("exam-active-name", estado.nombre || "Simulacro General UniPrep");
    texto("exam-source-note", [estado.fuente, estado.avisoFuente].filter(Boolean).join(" · "));
    renderizarPregunta();
    actualizarTemporizador();
    intervalo = setInterval(actualizarTemporizador, 1000);
  }

  function renderizarPregunta() {
    if (!estado) return;
    const pregunta = estado.preguntas[estado.indice];
    texto("exam-progress-text", `Pregunta ${estado.indice + 1} de ${estado.preguntas.length}`);
    texto("exam-subject", `${pregunta.area} · ${pregunta.tema}`);
    const estimulo = pregunta.estimulo ?? pregunta.texto ?? pregunta.lectura ?? pregunta.caso ?? pregunta.tabla ?? pregunta.grafico ?? "";
    texto("exam-question", [typeof estimulo === "string" ? estimulo : JSON.stringify(estimulo, null, 2), pregunta.q].filter(Boolean).join("\n\n"));
    const barra = document.getElementById("exam-progress-bar");
    if (barra) barra.style.width = `${((estado.indice + 1) / estado.preguntas.length) * 100}%`;

    const opciones = document.getElementById("exam-options");
    if (opciones) {
      opciones.innerHTML = pregunta.o.map((opcion, indice) => `
        <button class="option-btn ${estado.respuestas[estado.indice] === indice ? "selected" : ""}" onclick="responderSimulacro(${indice})">
          <div class="option-letter">${LETRAS[indice]}</div><div class="option-text">${escapar(opcion)}</div>
        </button>`).join("");
    }

    const respuestaElegida = estado.respuestas[estado.indice];
    texto(
      "exam-selection-status",
      respuestaElegida === null
        ? "Selecciona una alternativa. La respuesta correcta se mostrará al finalizar."
        : `Respuesta ${LETRAS[respuestaElegida]} guardada. Podrás comprobarla cuando finalices el examen.`
    );

    const anterior = document.getElementById("exam-prev");
    if (anterior) anterior.disabled = estado.indice === 0;
    const siguiente = document.getElementById("exam-next");
    if (siguiente) siguiente.textContent = estado.indice === estado.preguntas.length - 1 ? "Revisar respuestas →" : "Siguiente →";
    const marcar = document.getElementById("exam-mark");
    if (marcar) marcar.textContent = estado.marcadas[estado.indice] ? "★ Marcada para revisar" : "☆ Marcar para revisar";
    renderizarMapa();
  }

  function renderizarMapa() {
    const mapa = document.getElementById("exam-question-map");
    if (!mapa) return;
    mapa.innerHTML = estado.preguntas.map((_, indice) => {
      const clases = [indice === estado.indice ? "current" : "", estado.respuestas[indice] !== null ? "answered" : "", estado.marcadas[indice] ? "marked" : ""].filter(Boolean).join(" ");
      return `<button class="${clases}" onclick="irAPregunta(${indice})">${indice + 1}</button>`;
    }).join("");
  }

  function responderSimulacro(indiceOpcion) {
    estado.respuestas[estado.indice] = indiceOpcion;
    guardarEstado();
    renderizarPregunta();
  }

  function preguntaSiguiente() {
    if (estado.indice < estado.preguntas.length - 1) estado.indice++;
    else {
      const primeraVacia = estado.respuestas.findIndex(r => r === null);
      if (primeraVacia >= 0) estado.indice = primeraVacia;
      else return finalizarSimulacro(false);
    }
    guardarEstado(); renderizarPregunta();
  }

  function preguntaAnterior() { if (estado.indice > 0) { estado.indice--; guardarEstado(); renderizarPregunta(); } }
  function irAPregunta(indice) { estado.indice = indice; guardarEstado(); renderizarPregunta(); }
  function marcarPregunta() { estado.marcadas[estado.indice] = !estado.marcadas[estado.indice]; guardarEstado(); renderizarPregunta(); }

  function salirDelSimulacro() {
    if (!estado) return window.go("exams", null);
    if (confirm("Tu avance quedará guardado. ¿Deseas salir y continuar después?")) {
      guardarEstado(); detenerTemporizador(); window.go("exams", null); renderizarHistorial();
    }
  }

  async function finalizarSimulacro(porTiempo) {
    if (!estado || estado.finalizado) return;
    const vacias = estado.respuestas.filter(r => r === null).length;
    if (!porTiempo && !confirm(vacias ? `Tienes ${vacias} preguntas sin responder. ¿Finalizar de todos modos?` : "¿Deseas entregar el simulacro?")) return;
    estado.finalizado = true;
    detenerTemporizador();

    const correctas = estado.preguntas.reduce((n, p, i) => n + (estado.respuestas[i] === p.r ? 1 : 0), 0);
    const total = estado.preguntas.length;
    const resultado = {
      ...estado,
      correctas,
      incorrectas: total - correctas - vacias,
      vacias,
      porcentaje: Math.round((correctas / total) * 100),
      tiempoUsado: Math.min(estado.duracion||180*60, Math.round((Date.now() - estado.inicio) / 1000)),
      fecha: new Date().toISOString()
    };

    window.uniprepStorage?.eliminar(CLAVE_ACTIVO);
    const historial = await obtenerHistorial();
    historial.unshift(resultado);
    await guardarHistorial(historial.slice(0, 10));
    await guardarResultadoUsuario(resultado);
    if(window.registrarNotificacion)window.registrarNotificacion({tipo:"simulacro",titulo:`${resultado.nombre||"Simulacro"} completado`,cuerpo:`Resultado: ${resultado.porcentaje}% · ${resultado.correctas}/${resultado.preguntas.length} correctas.`});
    mostrarResultado(resultado, porTiempo);
  }

  async function guardarResultadoUsuario(resultado) {
    try {
      if (typeof window.obtenerUsuarioActivo !== "function") return;
      const usuario = await window.obtenerUsuarioActivo();
      if (!usuario) return;
      usuario.simulacros = (Number(usuario.simulacros) || 0) + 1;
      usuario.ejercicios = (Number(usuario.ejercicios) || 0) + resultado.preguntas.length;
      usuario.respuestasTotales = (Number(usuario.respuestasTotales) || 0) + resultado.preguntas.length;
      usuario.respuestasCorrectas = (Number(usuario.respuestasCorrectas) || 0) + resultado.correctas;
      usuario.precision = Math.round((usuario.respuestasCorrectas / usuario.respuestasTotales) * 100);
      usuario.xp = (Number(usuario.xp) || 0) + resultado.correctas * 5;
      if (typeof window.actualizarEstadisticasUsuario === "function") await window.actualizarEstadisticasUsuario({simulacros:usuario.simulacros,ejercicios:usuario.ejercicios,respuestasTotales:usuario.respuestasTotales,respuestasCorrectas:usuario.respuestasCorrectas,precision:usuario.precision,xp:usuario.xp,nivel:Math.floor(usuario.xp/500)+1});
      if (typeof window.registrarActividad === "function") await window.registrarActividad({tipo:"simulacro",titulo:`${resultado.nombre||"Simulacro General"} completado`,descripcion:`Puntaje: ${resultado.porcentaje}% · ${resultado.correctas}/${resultado.preguntas.length} correctas`,xpGanado:resultado.correctas * 5});
      if (typeof window.actualizarRachaEstudio === "function") await window.actualizarRachaEstudio();
      if (typeof window.cargarDashboard === "function") await window.cargarDashboard();
    } catch (error) { console.error("No se pudo guardar el resultado del simulacro:", error); }
  }

  function mostrarResultado(resultado, porTiempo = false) {
    resultadoMostrado = resultado;
    window.go("exam-result", null);
    texto("exam-final-score", `${resultado.porcentaje}%`);
    texto("exam-result-title", resultado.porcentaje >= 70 ? "¡Buen trabajo!" : "Sigue practicando");
    texto("exam-result-summary", porTiempo ? "El tiempo terminó y el examen fue enviado automáticamente." : `Obtuviste ${resultado.correctas} respuestas correctas de ${resultado.preguntas.length}.`);
    texto("result-correct", resultado.correctas); texto("result-wrong", resultado.incorrectas); texto("result-blank", resultado.vacias); texto("result-time", formatoTiempo(resultado.tiempoUsado));

    const areas = {};
    resultado.preguntas.forEach((p, i) => { if (!areas[p.area]) areas[p.area] = {bien:0,total:0}; areas[p.area].total++; if (resultado.respuestas[i] === p.r) areas[p.area].bien++; });
    document.getElementById("result-areas").innerHTML = Object.entries(areas).map(([area,d]) => { const pc = Math.round(d.bien/d.total*100); return `<div class="result-area"><span>${escapar(area)}</span><div class="pbar"><div class="pbar-fill" style="width:${pc}%;background:var(--purple)"></div></div><b>${pc}%</b></div>`; }).join("");
    renderizarCorreccion(resultado, "todas");
  }

  function renderizarCorreccion(resultado, filtro) {
    const contenedor = document.getElementById("exam-review");
    if (!contenedor) return;

    const preguntas = resultado.preguntas
      .map((pregunta, indice) => ({ pregunta, indice, respuesta: resultado.respuestas[indice] }))
      .filter(item => filtro !== "incorrectas" || item.respuesta !== item.pregunta.r);

    contenedor.innerHTML = preguntas.map(({pregunta:p, indice:i, respuesta:resp}) => {
      const esCorrecta = resp === p.r;
      const clase = resp === null ? "blank" : esCorrecta ? "correct" : "wrong";
      const estadoTexto = resp === null ? "Sin responder" : esCorrecta ? "Correcta" : "Incorrecta";

      const opciones = p.o.map((opcion, indiceOpcion) => {
        const esRespuestaCorrecta = indiceOpcion === p.r;
        const fueSeleccionada = indiceOpcion === resp;
        let claseOpcion = "review-option";
        let etiqueta = "";

        if (esRespuestaCorrecta) {
          claseOpcion += " correct-answer";
          etiqueta = '<span class="review-option-badge">✓ Respuesta correcta</span>';
        }
        if (fueSeleccionada && !esRespuestaCorrecta) {
          claseOpcion += " selected-wrong";
          etiqueta = '<span class="review-option-badge">✕ Tu respuesta</span>';
        }
        if (fueSeleccionada && esRespuestaCorrecta) claseOpcion += " selected-correct";

        return `<div class="${claseOpcion}"><span class="review-letter">${LETRAS[indiceOpcion]}</span><span class="review-option-text">${escapar(opcion)}</span>${etiqueta}</div>`;
      }).join("");

      const estimulo = p.estimulo ?? p.texto ?? p.lectura ?? p.caso ?? p.tabla ?? p.grafico ?? "";
      const enunciado = [typeof estimulo === "string" ? estimulo : JSON.stringify(estimulo, null, 2), p.q].filter(Boolean).join(" — ");
      return `<article class="review-item ${clase}">
        <div class="review-question-head"><strong>${i+1}. ${escapar(enunciado)}</strong><span class="review-status ${clase}">${estadoTexto}</span></div>
        <div class="review-options">${opciones}</div>
        <div class="review-explanation"><b>💡 Explicación</b><p>${escapar(p.e)}</p></div>
      </article>`;
    }).join("");

    if (!preguntas.length) contenedor.innerHTML = '<div class="card review-perfect">🎉 ¡No tuviste respuestas incorrectas!</div>';
    actualizarBotonesFiltro(filtro);
  }

  function filtrarCorreccion(filtro) {
    if (resultadoMostrado) renderizarCorreccion(resultadoMostrado, filtro);
  }

  function actualizarBotonesFiltro(filtro) {
    const todos = document.getElementById("filter-all");
    const incorrectas = document.getElementById("filter-wrong");
    if (todos) todos.className = `btn ${filtro === "todas" ? "btn-primary" : "btn-ghost"} btn-sm`;
    if (incorrectas) incorrectas.className = `btn ${filtro === "incorrectas" ? "btn-primary" : "btn-ghost"} btn-sm`;
  }

  async function renderizarHistorial() {
    const contenedor = document.getElementById("exam-history");
    if (!contenedor) return;
    const historial = await obtenerHistorial();
    if (!historial.length) { contenedor.innerHTML = '<div class="card" style="padding:18px;color:var(--text3)">Aún no realizaste ningún simulacro. Pulsa “Simulacro rápido” para comenzar.</div>'; return; }
    contenedor.innerHTML = historial.map((r,i) => `<div class="exam-result-card"><div class="exam-score-circle" style="border:2px solid ${r.porcentaje>=70?'var(--green)':'var(--yellow)'};color:${r.porcentaje>=70?'var(--green)':'var(--yellow)'}">${r.porcentaje}%</div><div class="exam-info"><div class="exam-name">${escapar(r.nombre||"Simulacro General CEPRE")}</div><div class="exam-date">${new Date(r.fecha).toLocaleDateString('es-PE')} · ${r.preguntas.length} preguntas · ${formatoTiempo(r.tiempoUsado)}</div></div><button class="btn btn-ghost btn-sm" onclick="verResultadoGuardado(${i})">Ver corrección</button></div>`).join("");
  }

  function actualizarSimulacrosPorRuta(seleccion = window.obtenerSeleccionAdmision?.()) {
    const universidad = String(seleccion?.universidadId || "").toLowerCase();
    const rutaConfigurada = Boolean(universidad);
    document.querySelectorAll("[data-exam-university]").forEach(tarjeta => {
      tarjeta.hidden = rutaConfigurada && tarjeta.dataset.examUniversity !== universidad;
    });
    const nota = document.getElementById("exam-route-model-note");
    if (!nota) return;
    if (universidad === "uni") nota.textContent = "Ruta UNI detectada: se muestran sus tres pruebas de admisión por separado.";
    else if (universidad === "ucsm") nota.textContent = "Ruta UCSM detectada: se muestra el examen general de 80 preguntas.";
    else if (seleccion) nota.textContent = window.obtenerPerfilPreguntasAdmision?.()?.formato || `Ruta ${seleccion.universidadCorta} ${seleccion.grupoId}: el simulacro se adapta a los cursos y pesos de tu carrera.`;
    else nota.textContent = "Configura tu universidad y carrera para adaptar cursos, cantidad, dificultad y tipo de preguntas.";
  }

  async function verResultadoGuardado(indice) { const h = await obtenerHistorial(); if (h[indice]) mostrarResultado(h[indice]); }
  async function obtenerHistorial() { const id = await idUsuario(); return leerJSON(`uniprep_simulacros_${id}`, []); }
  async function guardarHistorial(historial) { const id = await idUsuario(); localStorage.setItem(`uniprep_simulacros_${id}`, JSON.stringify(historial)); }
  async function idUsuario() { try { const u = typeof window.obtenerUsuarioActivo === "function" ? await window.obtenerUsuarioActivo() : null; return u?.id || "local"; } catch { return "local"; } }

  function actualizarTemporizador() { if (!estado) return; const restante = Math.max(0, Math.ceil((estado.fin-Date.now())/1000)); texto("exam-timer", `⏱ ${formatoTiempo(restante)}`); if (restante <= 0) finalizarSimulacro(true); }
  function detenerTemporizador() { if (intervalo) clearInterval(intervalo); intervalo = null; }
  function guardarEstado() { if (estado) window.uniprepStorage?.guardar(CLAVE_ACTIVO, estado); }
  function leerJSON(clave, defecto) { return window.uniprepStorage?.leer(clave, defecto) ?? defecto; }
  function formatoTiempo(s) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }
  function texto(id, valor) { const el=document.getElementById(id); if(el) el.textContent=valor; }
  function escapar(valor) { const d=document.createElement("div"); d.textContent=String(valor ?? ""); return d.innerHTML; }

  window.iniciarSimulacro=iniciarSimulacro; window.iniciarSimulacroTipo=(tipo)=>iniciarSimulacro(true,tipo); window.responderSimulacro=responderSimulacro; window.preguntaSiguiente=preguntaSiguiente; window.preguntaAnterior=preguntaAnterior; window.irAPregunta=irAPregunta; window.marcarPregunta=marcarPregunta; window.salirDelSimulacro=salirDelSimulacro; window.finalizarSimulacro=finalizarSimulacro; window.verResultadoGuardado=verResultadoGuardado; window.filtrarCorreccion=filtrarCorreccion;
  document.addEventListener("uniprep:admission-ready", event => actualizarSimulacrosPorRuta(event.detail));
  document.addEventListener("uniprep:admission-change", event => actualizarSimulacrosPorRuta(event.detail));
  document.addEventListener("uniprep:syllabus-ready", () => actualizarSimulacrosPorRuta());
  document.addEventListener("DOMContentLoaded", () => setTimeout(() => { renderizarHistorial(); actualizarSimulacrosPorRuta(); }, 350));
})();
