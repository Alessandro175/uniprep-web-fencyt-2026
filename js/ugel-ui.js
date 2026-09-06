// =========================================================
// UNIPREP 2 · EDICIÓN DAYLIGHT UNIVERSE 2026.23
// Personalización visual integral, accesibilidad y lectura.
// =========================================================
(function () {
  "use strict";

  const CLAVE = "uniprep_visual_preferences_v3";
  const PROPIEDADES_PERSONALIZADAS = [
    "--ugel-accent", "--ugel-accent-2", "--ugel-accent-3", "--ugel-wallpaper",
    "--ugel-panel", "--ugel-panel-strong", "--ugel-border-color", "--ugel-border-width",
    "--ugel-topbar", "--ugel-hero-1", "--ugel-hero-2", "--ugel-surface", "--ugel-surface-2",
    "--ugel-on-topbar", "--ugel-on-hero", "--ugel-on-accent",
    "--ugel-card-radius", "--ugel-pattern-image", "--ugel-pattern-size", "--ugel-pattern-opacity",
    "--bg", "--bg2", "--bg3", "--card", "--card2", "--border", "--border2",
    "--text", "--text2", "--text3", "--purple", "--purple2", "--blue",
    "--ugel-backdrop-blur", "--ugel-wallpaper-size", "--ugel-wallpaper-position"
  ];
  const PALETA_PREDETERMINADA = Object.freeze({
    fondo1: "#07091a", fondo2: "#101b3c", barra: "#080d20",
    banner1: "#19194b", banner2: "#0a3442", panel: "#111a36", panel2: "#0a1229",
    acento: "#8068ff", acento2: "#48d7ff", texto: "#f5f7ff", borde: "#6b78a6",
    bordeAncho: 1, radio: 18, panelOpacidad: 88, patron: "grid",
    patronOpacidad: 28, angulo: 145, desenfoque: 18, escalaImagen: 100,
    posicionImagen: "center", imagen: "", sincronizar: true
  });
  const PREDETERMINADO = Object.freeze({
    tema: "cosmos", modo: "auto", lectura: "normal", espaciado: "comodo",
    reducirMovimiento: false, altoContraste: false, modoEnfoque: false,
    paleta: PALETA_PREDETERMINADA,
    hyperdrive: Object.freeze({quality:"auto", hacker:false, sound:false, cursor:true, hud:true})
  });

  const TEMAS = [
    {id:"cosmos",nombre:"Noche cósmica",preview:"radial-gradient(circle at 78% 18%,#31b8e8 0 8%,transparent 30%),linear-gradient(145deg,#090a23,#321767)"},
    {id:"amazonia",nombre:"Amazonía",preview:"radial-gradient(circle at 78% 18%,#56df91 0 8%,transparent 30%),linear-gradient(145deg,#05251b,#17633e)"},
    {id:"oceano",nombre:"Océano",preview:"radial-gradient(circle at 78% 18%,#53e2dc 0 8%,transparent 30%),linear-gradient(145deg,#071e36,#0b63a8)"},
    {id:"aurora",nombre:"Aurora",preview:"radial-gradient(circle at 78% 18%,#ffad65 0 8%,transparent 30%),linear-gradient(145deg,#321025,#8b2d73)"},
    {id:"grafito",nombre:"Grafito",preview:"radial-gradient(circle at 78% 18%,#a7b2c7 0 8%,transparent 30%),linear-gradient(145deg,#080a0e,#29364b)"},
    {id:"contraste",nombre:"Alto contraste",preview:"radial-gradient(circle at 78% 18%,#ffe25b 0 8%,transparent 30%),linear-gradient(145deg,#000,#161616)"},
    {id:"luz",nombre:"Cielo claro",preview:"radial-gradient(circle at 78% 18%,#8edcff 0 8%,transparent 30%),linear-gradient(145deg,#f8fbff,#dcecff)"},
    {id:"papel",nombre:"Papel cálido",preview:"radial-gradient(circle at 78% 18%,#ffd37a 0 8%,transparent 30%),linear-gradient(145deg,#fffaf0,#f3e4c9)"},
    {id:"menta",nombre:"Menta suave",preview:"radial-gradient(circle at 78% 18%,#66d9b3 0 8%,transparent 30%),linear-gradient(145deg,#f5fffb,#dff5ec)"},
    {id:"lavanda",nombre:"Lavanda clara",preview:"radial-gradient(circle at 78% 18%,#a590ff 0 8%,transparent 30%),linear-gradient(145deg,#fcfaff,#e9e5ff)"},
    {id:"amanecer",nombre:"Amanecer",preview:"radial-gradient(circle at 78% 18%,#ff9b7d 0 8%,transparent 30%),linear-gradient(145deg,#fffaf6,#ffe9df)"},
    {id:"vibrante",nombre:"Academia vibrante",preview:"radial-gradient(circle at 78% 18%,#78e55d 0 8%,transparent 30%),linear-gradient(145deg,#f2f0ff,#dffaf1)"}
  ];

  const COMBINACIONES = [
    {id:"cosmica",nombre:"Cósmica",modo:"dark",preview:"linear-gradient(135deg,#19194b,#0a3442)",valores:{fondo1:"#07091a",fondo2:"#101b3c",barra:"#080d20",banner1:"#19194b",banner2:"#0a3442",panel:"#111a36",panel2:"#0a1229",acento:"#8068ff",acento2:"#48d7ff",texto:"#f5f7ff",borde:"#6b78a6"}},
    {id:"oceano",nombre:"Océano",modo:"dark",preview:"linear-gradient(135deg,#082d4a,#0a4a4b)",valores:{fondo1:"#04141f",fondo2:"#082b3d",barra:"#061522",banner1:"#082d4a",banner2:"#0a4a4b",panel:"#0b2232",panel2:"#071824",acento:"#35b6ff",acento2:"#54edcf",texto:"#f3fbff",borde:"#39758e"}},
    {id:"amazonia",nombre:"Amazonía",modo:"dark",preview:"linear-gradient(135deg,#0a3824,#164929)",valores:{fondo1:"#04130e",fondo2:"#0a2b1e",barra:"#051711",banner1:"#0a3824",banner2:"#164929",panel:"#0b2319",panel2:"#071912",acento:"#2dde9c",acento2:"#9bea64",texto:"#f2fff8",borde:"#3d765d"}},
    {id:"aurora",nombre:"Aurora",modo:"dark",preview:"linear-gradient(135deg,#481437,#472052)",valores:{fondo1:"#160917",fondo2:"#2d1028",barra:"#19091a",banner1:"#481437",banner2:"#472052",panel:"#261225",panel2:"#180c1a",acento:"#ff6fae",acento2:"#ffad68",texto:"#fff5fb",borde:"#8e557b"}},
    {id:"grafito",nombre:"Grafito",modo:"dark",preview:"linear-gradient(135deg,#202939,#18262d)",valores:{fondo1:"#07090d",fondo2:"#161c25",barra:"#080b10",banner1:"#202939",banner2:"#18262d",panel:"#151b24",panel2:"#0d1219",acento:"#a9b5c7",acento2:"#63d7e8",texto:"#f5f7fa",borde:"#556170"}},
    {id:"cielo",nombre:"Cielo claro",modo:"light",preview:"linear-gradient(135deg,#eef4ff,#e6f7f6)",valores:{fondo1:"#f3f7ff",fondo2:"#edf8f7",barra:"#ffffff",banner1:"#eef0ff",banner2:"#e3f5f2",panel:"#ffffff",panel2:"#f2f5fa",acento:"#5c55d9",acento2:"#087f9f",texto:"#1b2940",borde:"#b3bfd0"}},
    {id:"menta-clara",nombre:"Menta",modo:"light",preview:"linear-gradient(135deg,#effcf7,#dff4eb)",valores:{fondo1:"#f3fbf8",fondo2:"#eaf6f1",barra:"#ffffff",banner1:"#e8f8f1",banner2:"#dff1e9",panel:"#ffffff",panel2:"#edf5f1",acento:"#187b64",acento2:"#1686a0",texto:"#18342d",borde:"#afc9c0"}},
    {id:"lavanda-clara",nombre:"Lavanda",modo:"light",preview:"linear-gradient(135deg,#f8f6ff,#eae6ff)",valores:{fondo1:"#faf9ff",fondo2:"#f0edff",barra:"#ffffff",banner1:"#f0edff",banner2:"#e8f3fb",panel:"#ffffff",panel2:"#f3f1fb",acento:"#6550c7",acento2:"#167d9d",texto:"#28233f",borde:"#c0b8d8"}},
    {id:"amanecer-claro",nombre:"Amanecer",modo:"light",preview:"linear-gradient(135deg,#fff9f4,#ffe9df)",valores:{fondo1:"#fffaf7",fondo2:"#fff0e8",barra:"#ffffff",banner1:"#fff0e7",banner2:"#f8eef8",panel:"#ffffff",panel2:"#fbf2ed",acento:"#ad5261",acento2:"#99702b",texto:"#3c2928",borde:"#d5beb5"}},
    {id:"academia-vibrante",nombre:"Academia",modo:"light",preview:"linear-gradient(135deg,#eeeaff,#dcf8ee)",valores:{fondo1:"#f3f1ff",fondo2:"#e8faf3",barra:"#ffffff",banner1:"#ebe7ff",banner2:"#d9f7ec",panel:"#ffffff",panel2:"#f1f4fb",acento:"#6653db",acento2:"#087d82",texto:"#18283b",borde:"#a8bdc7"}}
  ];

  let preferencias = cargarPreferencias();
  let ultimaVoz = null;
  let temporizadorToast = null;

  function almacenamiento() {
    if (window.uniprepStorage?.leer && window.uniprepStorage?.guardar) return window.uniprepStorage;
    return {
      leer(clave, defecto) {
        try { const valor = localStorage.getItem(clave); return valor === null ? defecto : JSON.parse(valor); }
        catch (_) { return defecto; }
      },
      guardar(clave, valor) { localStorage.setItem(clave, JSON.stringify(valor)); return valor; }
    };
  }

  function numero(valor, minimo, maximo, defecto) {
    const n = Number(valor);
    return Number.isFinite(n) ? Math.max(minimo, Math.min(maximo, n)) : defecto;
  }

  function color(valor, defecto) {
    return /^#[0-9a-f]{6}$/i.test(String(valor || "")) ? String(valor).toLowerCase() : defecto;
  }

  function normalizarHyperdrive(valor = {}) {
    return {
      quality:["auto","lite","balanced","ultra"].includes(valor.quality) ? valor.quality : "auto",
      hacker:Boolean(valor.hacker), sound:Boolean(valor.sound),
      cursor:valor.cursor !== false, hud:valor.hud !== false
    };
  }

  function normalizarPaleta(valor = {}) {
    const base = PALETA_PREDETERMINADA;
    const fondo1 = color(valor.fondo1, base.fondo1);
    const fondo2 = color(valor.fondo2, base.fondo2);
    const panel = color(valor.panel, base.panel);
    const acento = color(valor.acento, base.acento);
    const acento2 = color(valor.acento2, base.acento2);
    const fondoClaro = luminosidad(mezclar(fondo1, fondo2, .5)) > .48;
    return {
      fondo1, fondo2,
      barra: color(valor.barra, fondoClaro ? mezclar(fondo1, "#ffffff", .68) : mezclar(fondo1, "#000000", .18)),
      banner1: color(valor.banner1, mezclar(fondo1, acento, fondoClaro ? .12 : .28)),
      banner2: color(valor.banner2, mezclar(fondo2, acento2, fondoClaro ? .12 : .26)),
      panel, panel2: color(valor.panel2, mezclar(panel, fondo2, .42)),
      acento, acento2, texto: color(valor.texto, base.texto),
      borde: color(valor.borde, base.borde), bordeAncho: numero(valor.bordeAncho, 0, 4, base.bordeAncho),
      radio: numero(valor.radio, 6, 34, base.radio), panelOpacidad: numero(valor.panelOpacidad, 58, 100, base.panelOpacidad),
      patron: ["none", "grid", "dots", "diagonal"].includes(valor.patron) ? valor.patron : base.patron,
      patronOpacidad: numero(valor.patronOpacidad, 0, 65, base.patronOpacidad),
      angulo: numero(valor.angulo, 0, 180, base.angulo),
      desenfoque: numero(valor.desenfoque, 0, 34, base.desenfoque),
      escalaImagen: numero(valor.escalaImagen, 80, 180, base.escalaImagen),
      posicionImagen: ["center", "top", "bottom", "left", "right"].includes(valor.posicionImagen) ? valor.posicionImagen : base.posicionImagen,
      imagen: typeof valor.imagen === "string" && /^data:image\/(?:png|jpeg|webp);base64,/i.test(valor.imagen) ? valor.imagen : "",
      sincronizar: valor.sincronizar !== false
    };
  }

  function cargarPreferencias() {
    const guardado = almacenamiento().leer(CLAVE, null);
    if (!guardado || typeof guardado !== "object") return {
      tema:PREDETERMINADO.tema, modo:PREDETERMINADO.modo, lectura:PREDETERMINADO.lectura,
      espaciado:PREDETERMINADO.espaciado, reducirMovimiento:false, altoContraste:false,
      modoEnfoque:false, paleta:normalizarPaleta(), hyperdrive:normalizarHyperdrive(), actualizado:""
    };
    return {
      tema: [...TEMAS.map(tema => tema.id), "custom"].includes(guardado.tema) ? guardado.tema : PREDETERMINADO.tema,
      modo: ["auto", "dark", "light"].includes(guardado.modo) ? guardado.modo : PREDETERMINADO.modo,
      lectura: ["normal", "large", "extra"].includes(guardado.lectura) ? guardado.lectura : PREDETERMINADO.lectura,
      espaciado: ["compacto", "comodo", "amplio"].includes(guardado.espaciado) ? guardado.espaciado : PREDETERMINADO.espaciado,
      reducirMovimiento: Boolean(guardado.reducirMovimiento),
      altoContraste: Boolean(guardado.altoContraste),
      modoEnfoque: Boolean(guardado.modoEnfoque),
      paleta: normalizarPaleta(guardado.paleta),
      hyperdrive: normalizarHyperdrive(guardado.hyperdrive),
      actualizado: String(guardado.actualizado || "")
    };
  }

  function guardarPreferencias(sinNube = false) {
    try {
      preferencias.actualizado = new Date().toISOString();
      almacenamiento().guardar(CLAVE, preferencias);
      if (!sinNube) window.UniPrepCloud?.savePreferencesSoon?.({
        visual:preferencias,
        accessibility:{lectura:preferencias.lectura, espaciado:preferencias.espaciado, reducirMovimiento:preferencias.reducirMovimiento, altoContraste:preferencias.altoContraste, modoEnfoque:preferencias.modoEnfoque}
      });
      return true;
    }
    catch (error) {
      console.warn("No se pudo guardar toda la personalización:", error);
      mostrarToast("La imagen es demasiado pesada. Prueba con otra más pequeña.");
      return false;
    }
  }

  function hexRgb(hex) {
    const valor = color(hex, "#000000").slice(1);
    return [0, 2, 4].map(inicio => parseInt(valor.slice(inicio, inicio + 2), 16));
  }

  function luminosidad(hex) {
    const [r, g, b] = hexRgb(hex).map(canal => {
      const valor = canal / 255;
      return valor <= .03928 ? valor / 12.92 : Math.pow((valor + .055) / 1.055, 2.4);
    });
    return r * .2126 + g * .7152 + b * .0722;
  }

  function textoSobre(hex) {
    return contraste("#ffffff", hex) >= contraste("#07101e", hex) ? "#ffffff" : "#07101e";
  }

  function rgba(hex, opacidad) {
    const [r, g, b] = hexRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
  }

  function contraste(hex1, hex2) {
    const a = luminosidad(hex1), b = luminosidad(hex2);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }

  function mezclar(hex1, hex2, peso = .5) {
    const a = hexRgb(hex1), b = hexRgb(hex2);
    const canal = indice => Math.round(a[indice] * (1 - peso) + b[indice] * peso).toString(16).padStart(2, "0");
    return `#${canal(0)}${canal(1)}${canal(2)}`;
  }

  function resolverModoColor() {
    if (preferencias.modo !== "auto") return preferencias.modo;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches !== false ? "dark" : "light";
  }

  function acentoLegibleEnClaro(hex) {
    let resultado = color(hex, "#5b55d9");
    for (let intento = 0; intento < 8 && contraste(resultado, "#ffffff") < 3.15; intento += 1) {
      resultado = mezclar(resultado, "#13223d", .13);
    }
    return resultado;
  }

  function paletaParaModo(valor = preferencias.paleta, modo = resolverModoColor()) {
    const p = normalizarPaleta(valor);
    if (modo !== "light") return p;

    const acento = acentoLegibleEnClaro(p.acento);
    const acento2 = acentoLegibleEnClaro(p.acento2);
    const fondo1 = mezclar("#f8faff", mezclar(p.fondo1, acento, .18), .09);
    const fondo2 = mezclar("#eef5f7", mezclar(p.fondo2, acento2, .18), .09);
    const barra = mezclar("#ffffff", p.barra, .025);
    const banner1 = mezclar("#ffffff", mezclar(p.banner1, acento, .38), .11);
    const banner2 = mezclar("#ffffff", mezclar(p.banner2, acento2, .38), .11);
    const panel = mezclar("#ffffff", p.panel, .018);
    const panel2 = mezclar("#f3f6fa", mezclar(p.panel2, acento2, .08), .045);
    const texto = contraste(p.texto, panel) >= 6.5 ? p.texto : "#17233b";
    const borde = mezclar("#a9b6c9", p.borde, .18);

    return normalizarPaleta({
      ...p, fondo1, fondo2, barra, banner1, banner2, panel, panel2,
      acento, acento2, texto, borde
    });
  }

  function armonizarPaleta(valor = preferencias.paleta) {
    const p = normalizarPaleta(valor);
    const claro = luminosidad(mezclar(p.fondo1, p.fondo2, .5)) > .48;
    const panel = claro ? mezclar(p.fondo1, "#ffffff", .82) : mezclar(p.fondo1, "#ffffff", .08);
    const panel2 = claro ? mezclar(p.fondo2, "#ffffff", .55) : mezclar(p.fondo2, "#000000", .16);
    const barra = claro ? mezclar(p.fondo1, "#ffffff", .9) : mezclar(p.fondo1, "#000000", .24);
    const banner1 = mezclar(p.fondo1, p.acento, claro ? .14 : .31);
    const banner2 = mezclar(p.fondo2, p.acento2, claro ? .13 : .28);
    const texto = contraste(p.texto, panel) >= 4.5 ? p.texto : textoSobre(panel);
    return normalizarPaleta({...p, barra, banner1, banner2, panel, panel2, texto, sincronizar:true});
  }

  function aplicarCombinacion(id) {
    const combinacion = COMBINACIONES.find(item => item.id === id);
    if (!combinacion) return;
    preferencias.modo = combinacion.modo;
    preferencias.paleta = normalizarPaleta({...preferencias.paleta, ...combinacion.valores, sincronizar:true});
    activarPersonalizado();
    mostrarToast(`Combinación «${combinacion.nombre}» aplicada a toda la interfaz.`);
  }

  function patronCSS(tipo) {
    if (tipo === "dots") return {imagen:"radial-gradient(circle, currentColor 1.2px, transparent 1.4px)", tamano:"24px 24px"};
    if (tipo === "diagonal") return {imagen:"repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 18px)", tamano:"auto"};
    if (tipo === "grid") return {imagen:"linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)", tamano:"42px 42px"};
    return {imagen:"none", tamano:"auto"};
  }

  function limpiarVariablesPersonalizadas() {
    [document.documentElement, document.body].filter(Boolean).forEach(nodo => {
      PROPIEDADES_PERSONALIZADAS.forEach(propiedad => nodo.style.removeProperty(propiedad));
    });
  }

  function aplicarPaletaPersonalizada(modoResuelto = resolverModoColor()) {
    const p = paletaParaModo(preferencias.paleta, modoResuelto);
    const objetivos = [document.documentElement, document.body].filter(Boolean);
    const opacidadPanel = p.panelOpacidad / 100;
    const patron = patronCSS(p.patron);
    const papel = p.imagen
      ? `linear-gradient(${p.angulo}deg, ${rgba(p.fondo1, .78)}, ${rgba(p.fondo2, .82)}), url("${p.imagen}")`
      : `radial-gradient(circle at 84% 10%, ${rgba(p.acento2, .18)}, transparent 30%), radial-gradient(circle at 13% 88%, ${rgba(p.acento, .2)}, transparent 36%), linear-gradient(${p.angulo}deg, ${p.fondo1}, ${p.fondo2})`;
    const valores = {
      "--ugel-accent":p.acento, "--ugel-accent-2":p.acento2, "--ugel-accent-3":mezclar(p.acento, p.acento2, .5),
      "--ugel-wallpaper":papel, "--ugel-panel":rgba(p.panel, opacidadPanel),
      "--ugel-panel-strong":rgba(p.panel2, Math.min(1, opacidadPanel + .09)),
      "--ugel-topbar":rgba(p.barra, Math.min(1, opacidadPanel + .08)),
      "--ugel-hero-1":p.banner1, "--ugel-hero-2":p.banner2,
      "--ugel-surface":rgba(p.panel, opacidadPanel), "--ugel-surface-2":rgba(p.panel2, Math.min(1, opacidadPanel + .06)),
      "--ugel-on-topbar":textoSobre(p.barra), "--ugel-on-hero":textoSobre(mezclar(p.banner1, p.banner2, .5)),
      "--ugel-on-accent":textoSobre(mezclar(p.acento, p.acento2, .35)), "--ugel-border-color":p.borde,
      "--ugel-border-width":`${p.bordeAncho}px`, "--ugel-card-radius":`${p.radio}px`,
      "--ugel-pattern-image":patron.imagen, "--ugel-pattern-size":patron.tamano,
      "--ugel-pattern-opacity":String(p.patronOpacidad / 100), "--bg":p.fondo1,
      "--ugel-backdrop-blur":`${p.desenfoque}px`, "--ugel-wallpaper-size":`${p.escalaImagen}%`,
      "--ugel-wallpaper-position":p.posicionImagen,
      "--bg2":p.panel2, "--bg3":mezclar(p.panel2, p.panel, .38),
      "--card":rgba(p.panel, opacidadPanel), "--card2":rgba(p.panel2, Math.min(1, opacidadPanel + .04)),
      "--border":rgba(p.borde, Math.max(.16, p.bordeAncho ? .42 : .05)), "--border2":rgba(p.borde, Math.max(.24, p.bordeAncho ? .66 : .08)),
      "--text":p.texto, "--text2":mezclar(p.texto, p.panel2, .25), "--text3":mezclar(p.texto, p.panel2, .48),
      "--purple":p.acento, "--purple2":modoResuelto === "light" ? mezclar(p.acento, "#102039", .09) : mezclar(p.acento, "#ffffff", .28), "--blue":p.acento2
    };
    objetivos.forEach(objetivo => Object.entries(valores).forEach(([propiedad, valor]) => objetivo.style.setProperty(propiedad, valor)));
  }

  function aplicarPreferencias() {
    if (!document.body) return;
    limpiarVariablesPersonalizadas();
    document.documentElement.dataset.uniprepTheme = preferencias.tema;
    document.body.dataset.uniprepTheme = preferencias.tema;
    const modoResuelto = resolverModoColor();
    document.documentElement.dataset.colorMode = modoResuelto;
    document.body.dataset.colorMode = modoResuelto;
    document.documentElement.style.colorScheme = modoResuelto;
    document.body.style.colorScheme = modoResuelto;
    document.body.dataset.readingSize = preferencias.lectura;
    document.body.dataset.readingSpacing = preferencias.espaciado;
    document.body.dataset.reduceMotion = String(preferencias.reducirMovimiento);
    document.body.dataset.highContrast = String(preferencias.altoContraste);
    document.body.dataset.focusMode = String(preferencias.modoEnfoque);
    document.body.dataset.hackerMode = String(modoResuelto === "dark" && preferencias.hyperdrive.hacker);
    document.body.dataset.hyperCursor = String(preferencias.hyperdrive.cursor);
    document.body.dataset.hyperHud = String(preferencias.hyperdrive.hud);
    if (preferencias.tema === "custom") aplicarPaletaPersonalizada(modoResuelto);
    const colorTema = preferencias.tema === "custom" ? paletaParaModo(preferencias.paleta, modoResuelto).fondo1 :
      preferencias.tema === "amazonia" ? "#071812" : preferencias.tema === "oceano" ? "#061827" :
      preferencias.tema === "aurora" ? "#1b0a17" : preferencias.tema === "contraste" ? "#000000" :
      preferencias.tema === "papel" ? "#fff8e9" : preferencias.tema === "menta" ? "#f3fbf8" :
      preferencias.tema === "lavanda" ? "#faf9ff" : preferencias.tema === "amanecer" ? "#fffaf7" :
      preferencias.tema === "vibrante" ? "#f3f7ff" :
      (modoResuelto === "light" || preferencias.tema === "luz") ? "#f4f8ff" : "#080c20";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colorTema);
    actualizarControles();
    document.dispatchEvent(new CustomEvent("uniprep:hyperdrive-change", {detail:{...preferencias.hyperdrive}}));
    document.dispatchEvent(new CustomEvent("uniprep:theme-change", {detail:{mode:modoResuelto, theme:preferencias.tema}}));
  }

  function escaparExpresion(valor) { return String(valor || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function limpiarEnunciado(valor, tema = "") {
    let texto = String(valor ?? "").replace(/^\s*\[[^\]]+\]\s*/, "").trim();
    if (tema) texto = texto.replace(new RegExp(`^Tema\\s+${escaparExpresion(tema)}\\.\\s*`, "i"), "").trim();
    return texto;
  }

  function opcionesCompactas(opciones) {
    if (!Array.isArray(opciones) || opciones.length < 2) return false;
    return opciones.every(opcion => String(opcion ?? "").trim().length <= 34) && opciones.reduce((total, opcion) => total + String(opcion ?? "").length, 0) <= 105;
  }

  function campoColor(campo, titulo) {
    return `<label class="ugel-color-field"><span>${titulo}</span><input type="color" data-ugel-color="${campo}" value="${preferencias.paleta[campo]}"><output data-ugel-color-output="${campo}">${preferencias.paleta[campo].toUpperCase()}</output></label>`;
  }

  function crearPersonalizador() {
    if (document.getElementById("ugel-personalizer")) return;
    const capa = document.createElement("div");
    capa.id = "ugel-personalizer";
    capa.className = "ugel-personalizer";
    capa.hidden = true;
    capa.setAttribute("role", "dialog");
    capa.setAttribute("aria-modal", "true");
    capa.setAttribute("aria-labelledby", "ugel-personalizer-title");
    capa.innerHTML = `
      <section class="ugel-personalizer-panel">
        <header class="ugel-personalizer-head"><div><small>TU ESPACIO, TU ESTILO</small><h2 id="ugel-personalizer-title">Colores y apariencia</h2><p>Personaliza toda la interfaz: fondo, barras, banner del Tutor, tarjetas, botones y bordes. La armonía automática evita combinaciones desagradables.</p></div><button class="ugel-personalizer-close" type="button" data-ugel-close aria-label="Cerrar personalización">×</button></header>
        <div class="ugel-personalizer-body">
          <section class="ugel-mode-section"><div><span class="ugel-setting-label">Modo de color</span><small>Automático sigue la apariencia de tu equipo.</small></div><div class="ugel-mode-options"><button type="button" data-ugel-mode="auto"><i>◐</i><b>Auto</b></button><button type="button" data-ugel-mode="dark"><i>☾</i><b>Oscuro</b></button><button type="button" data-ugel-mode="light"><i>☀</i><b>Claro</b></button></div></section>
          <span class="ugel-setting-label">Fondos listos para usar</span>
          <div class="ugel-theme-grid">${TEMAS.map(tema => `<button class="ugel-theme-choice" type="button" data-ugel-theme="${tema.id}" style="--preview:${tema.preview}" aria-pressed="false"><span>ACTIVO</span><b>${tema.nombre}</b></button>`).join("")}</div>
          <button class="ugel-custom-toggle" type="button" data-ugel-custom-toggle aria-expanded="false"><span>🎨</span><span><b>Personalizar toda la interfaz</b><small>Barra, banner, tarjetas, botones, fondo y bordes</small></span><em>Configurar ↓</em></button>
          <section class="ugel-custom-builder" data-ugel-custom-builder hidden>
            <div class="ugel-live-preview" data-ugel-live-preview><div class="ugel-preview-window"><header><span>✦ UniPrep</span><i></i><i></i></header><section><small>BANNER DEL TUTOR</small><b>Todo combina contigo.</b><span>Fondo, superficies y colores conectados.</span><button type="button">Continuar</button></section><footer><strong>Tarjeta personalizada</strong><em data-ugel-contrast></em></footer></div></div>
            <div class="ugel-builder-section"><div class="ugel-builder-title"><b>1. Combinaciones que siempre armonizan</b><small>Elige una base profesional y luego modifica cualquier detalle.</small></div><div class="ugel-harmony-presets">${COMBINACIONES.map(item => `<button type="button" data-ugel-combination="${item.id}" style="--harmony-preview:${item.preview}"><i></i><span>${item.nombre}</span></button>`).join("")}</div><div class="ugel-harmony-sync"><span><b>Sincronizar colores automáticamente</b><small>Al cambiar fondo o acentos, ajusta barras, banner y tarjetas para que combinen.</small></span><button class="ugel-switch" type="button" data-ugel-harmony role="switch" aria-checked="true" aria-label="Sincronizar colores automáticamente"></button></div></div>
            <div class="ugel-builder-section"><div class="ugel-builder-title"><b>2. Colores de toda la interfaz</b><small>Cada zona se puede cambiar por separado. Los tres primeros controlan exactamente lo que señalaste.</small></div><div class="ugel-color-grid">${campoColor("barra", "Barras y navegación")}${campoColor("banner1", "Banner inicial")}${campoColor("banner2", "Banner final")}${campoColor("panel", "Tarjetas principales")}${campoColor("panel2", "Tarjetas internas")}${campoColor("fondo1", "Fondo inicial")}${campoColor("fondo2", "Fondo final")}${campoColor("acento", "Botones principales")}${campoColor("acento2", "Brillos y detalles")}${campoColor("texto", "Texto")}${campoColor("borde", "Bordes")}</div></div>
            <div class="ugel-builder-section"><div class="ugel-builder-title"><b>3. Bordes y superficies</b><small>Controla grosor, redondeado y transparencia.</small></div><div class="ugel-range-grid">
              <label><span>Grosor del borde <output data-ugel-output="bordeAncho"></output></span><input type="range" min="0" max="4" step="1" data-ugel-range="bordeAncho"></label>
              <label><span>Redondeado <output data-ugel-output="radio"></output></span><input type="range" min="6" max="34" step="1" data-ugel-range="radio"></label>
              <label><span>Opacidad de tarjetas <output data-ugel-output="panelOpacidad"></output></span><input type="range" min="58" max="100" step="1" data-ugel-range="panelOpacidad"></label>
              <label><span>Dirección del fondo <output data-ugel-output="angulo"></output></span><input type="range" min="0" max="180" step="5" data-ugel-range="angulo"></label>
              <label><span>Desenfoque de paneles <output data-ugel-output="desenfoque"></output></span><input type="range" min="0" max="34" step="1" data-ugel-range="desenfoque"></label>
              <label><span>Escala de imagen <output data-ugel-output="escalaImagen"></output></span><input type="range" min="80" max="180" step="5" data-ugel-range="escalaImagen"></label>
            </div></div>
            <div class="ugel-builder-section"><div class="ugel-builder-title"><b>4. Textura del fondo</b><small>Escoge un patrón y su intensidad.</small></div><div class="ugel-pattern-row"><button type="button" data-ugel-pattern="none">Sin textura</button><button type="button" data-ugel-pattern="grid">Cuadrícula</button><button type="button" data-ugel-pattern="dots">Puntos</button><button type="button" data-ugel-pattern="diagonal">Diagonal</button></div><label class="ugel-pattern-intensity"><span>Intensidad <output data-ugel-output="patronOpacidad"></output></span><input type="range" min="0" max="65" step="1" data-ugel-range="patronOpacidad"></label></div>
            <div class="ugel-builder-section"><div class="ugel-builder-title"><b>5. Imagen propia (opcional)</b><small>Se comprime y guarda para tu cuenta. Elige también dónde enfocarla.</small></div><div class="ugel-image-row"><label class="ugel-image-upload">＋ Elegir imagen<input type="file" accept="image/png,image/jpeg,image/webp" data-ugel-image hidden></label><button type="button" data-ugel-image-remove>Quitar imagen</button><span data-ugel-image-status>Sin imagen seleccionada</span></div><div class="ugel-position-row"><button type="button" data-ugel-position="top">Arriba</button><button type="button" data-ugel-position="center">Centro</button><button type="button" data-ugel-position="bottom">Abajo</button><button type="button" data-ugel-position="left">Izquierda</button><button type="button" data-ugel-position="right">Derecha</button></div></div>
            <div class="ugel-builder-footer"><button type="button" class="ugel-custom-reset" data-ugel-custom-reset>Restablecer solo mi paleta</button><button type="button" class="ugel-custom-apply" data-ugel-custom-apply>✓ Usar mi diseño</button></div>
          </section>
          <div class="ugel-reading-settings"><section class="ugel-setting-card"><span class="ugel-setting-label">Tamaño de preguntas</span><div class="ugel-size-options"><button type="button" data-ugel-size="normal">A</button><button type="button" data-ugel-size="large">A+</button><button type="button" data-ugel-size="extra">A++</button></div><span class="ugel-setting-label ugel-spacing-label">Espaciado de lectura</span><div class="ugel-spacing-options"><button type="button" data-ugel-spacing="compacto">Compacto</button><button type="button" data-ugel-spacing="comodo">Cómodo</button><button type="button" data-ugel-spacing="amplio">Amplio</button></div></section><section class="ugel-setting-card"><span class="ugel-setting-label">Accesibilidad visual</span><div class="ugel-access-row"><span>Reducir animaciones</span><button class="ugel-switch" type="button" data-ugel-motion role="switch" aria-checked="false" aria-label="Reducir animaciones"></button></div><div class="ugel-access-row"><span>Contraste reforzado</span><button class="ugel-switch" type="button" data-ugel-contrast-toggle role="switch" aria-checked="false" aria-label="Reforzar contraste"></button></div><div class="ugel-access-row"><span>Modo enfoque</span><button class="ugel-switch" type="button" data-ugel-focus role="switch" aria-checked="false" aria-label="Ocultar distracciones visuales"></button></div></section><section class="ugel-setting-card ugel-hyperdrive-card"><span class="ugel-setting-label">Rendimiento y efectos</span><small>El modo Auto cuida la fluidez según la potencia de tu equipo.</small><div class="ugel-quality-options"><button type="button" data-ugel-quality="auto">Auto</button><button type="button" data-ugel-quality="lite">Ahorro</button><button type="button" data-ugel-quality="balanced">Fluido</button><button type="button" data-ugel-quality="ultra">Ultra</button></div><div class="ugel-access-row"><span>Modo Hacker</span><button class="ugel-switch" type="button" data-ugel-hacker role="switch" aria-checked="false" aria-label="Activar Modo Hacker"></button></div><div class="ugel-access-row"><span>Sonidos suaves</span><button class="ugel-switch" type="button" data-ugel-sound role="switch" aria-checked="false" aria-label="Activar sonidos suaves"></button></div><div class="ugel-access-row"><span>Luz interactiva</span><button class="ugel-switch" type="button" data-ugel-cursor role="switch" aria-checked="true" aria-label="Activar luz interactiva"></button></div></section></div>
          <div class="ugel-personalizer-actions"><button class="ugel-reset-button" type="button" data-ugel-reset>Restablecer todo</button><button class="ugel-done-button" type="button" data-ugel-close>Guardar y cerrar</button></div>
        </div>
      </section>`;
    document.body.appendChild(capa);

    capa.querySelectorAll("[data-ugel-mode]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.modo = boton.dataset.ugelMode; guardarPreferencias(); aplicarPreferencias();
      mostrarToast(preferencias.modo === "auto" ? "Modo automático activado." : `Modo ${preferencias.modo === "light" ? "claro" : "oscuro"} activado.`);
    }));
    capa.querySelectorAll("[data-ugel-theme]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.tema = boton.dataset.ugelTheme;
      if (["luz", "papel", "menta", "lavanda", "amanecer", "vibrante"].includes(preferencias.tema)) preferencias.modo = "light";
      if (preferencias.tema === "contraste") preferencias.altoContraste = true;
      guardarPreferencias(); aplicarPreferencias();
      mostrarToast(`Fondo «${TEMAS.find(tema => tema.id === preferencias.tema)?.nombre}» activado.`);
    }));
    capa.querySelector("[data-ugel-custom-toggle]")?.addEventListener("click", alternarConstructor);
    capa.querySelectorAll("[data-ugel-combination]").forEach(boton => boton.addEventListener("click", () => aplicarCombinacion(boton.dataset.ugelCombination)));
    capa.querySelector("[data-ugel-harmony]")?.addEventListener("click", () => {
      preferencias.paleta.sincronizar = !preferencias.paleta.sincronizar;
      if (preferencias.paleta.sincronizar) preferencias.paleta = armonizarPaleta(preferencias.paleta);
      activarPersonalizado();
      mostrarToast(preferencias.paleta.sincronizar ? "Armonía automática activada." : "Ajuste independiente activado.");
    });
    capa.querySelectorAll("[data-ugel-color]").forEach(input => input.addEventListener("input", () => {
      const campo = input.dataset.ugelColor;
      preferencias.paleta[campo] = color(input.value, preferencias.paleta[campo]);
      if (["barra","banner1","banner2","panel","panel2"].includes(campo)) preferencias.paleta.sincronizar = false;
      else if (preferencias.paleta.sincronizar && ["fondo1","fondo2","acento","acento2"].includes(campo)) preferencias.paleta = armonizarPaleta(preferencias.paleta);
      activarPersonalizado(false);
    }));
    capa.querySelectorAll("[data-ugel-range]").forEach(input => input.addEventListener("input", () => {
      preferencias.paleta[input.dataset.ugelRange] = Number(input.value); activarPersonalizado(false);
    }));
    capa.querySelectorAll("[data-ugel-pattern]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.paleta.patron = boton.dataset.ugelPattern; activarPersonalizado(false);
    }));
    capa.querySelectorAll("[data-ugel-position]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.paleta.posicionImagen = boton.dataset.ugelPosition; activarPersonalizado(false);
    }));
    capa.querySelector("[data-ugel-image]")?.addEventListener("change", cargarImagenPersonalizada);
    capa.querySelector("[data-ugel-image-remove]")?.addEventListener("click", () => {
      preferencias.paleta.imagen = ""; activarPersonalizado(); mostrarToast("Imagen de fondo retirada.");
    });
    capa.querySelector("[data-ugel-custom-reset]")?.addEventListener("click", () => {
      preferencias.paleta = normalizarPaleta(); activarPersonalizado(); mostrarToast("Tu paleta volvió a sus valores iniciales.");
    });
    capa.querySelector("[data-ugel-custom-apply]")?.addEventListener("click", () => {
      preferencias.paleta = preferencias.paleta.sincronizar ? armonizarPaleta(preferencias.paleta) : normalizarPaleta(preferencias.paleta);
      if (contraste(preferencias.paleta.texto, preferencias.paleta.panel) < 4.5) preferencias.paleta.texto = textoSobre(preferencias.paleta.panel);
      activarPersonalizado(); mostrarToast("Diseño aplicado con legibilidad protegida.");
    });
    capa.querySelectorAll("[data-ugel-size]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.lectura = boton.dataset.ugelSize; guardarPreferencias(); aplicarPreferencias();
    }));
    capa.querySelectorAll("[data-ugel-spacing]").forEach(boton => boton.addEventListener("click", () => {
      preferencias.espaciado = boton.dataset.ugelSpacing; guardarPreferencias(); aplicarPreferencias();
    }));
    capa.querySelector("[data-ugel-motion]")?.addEventListener("click", () => {
      preferencias.reducirMovimiento = !preferencias.reducirMovimiento; guardarPreferencias(); aplicarPreferencias();
    });
    capa.querySelector("[data-ugel-contrast-toggle]")?.addEventListener("click", () => {
      preferencias.altoContraste = !preferencias.altoContraste; guardarPreferencias(); aplicarPreferencias();
    });
    capa.querySelector("[data-ugel-focus]")?.addEventListener("click", () => {
      preferencias.modoEnfoque = !preferencias.modoEnfoque; guardarPreferencias(); aplicarPreferencias();
    });
    capa.querySelectorAll("[data-ugel-quality]").forEach(boton => boton.addEventListener("click", () => actualizarHyperdrive({quality:boton.dataset.ugelQuality})));
    capa.querySelector("[data-ugel-hacker]")?.addEventListener("click", () => {
      const activar = !preferencias.hyperdrive.hacker;
      if (activar && resolverModoColor() === "light") preferencias.modo = "dark";
      actualizarHyperdrive({hacker:activar});
      if (activar) mostrarToast("Modo Hacker activado junto con el modo oscuro para conservar la legibilidad.");
    });
    capa.querySelector("[data-ugel-sound]")?.addEventListener("click", () => actualizarHyperdrive({sound:!preferencias.hyperdrive.sound}));
    capa.querySelector("[data-ugel-hud]")?.addEventListener("click", () => actualizarHyperdrive({hud:!preferencias.hyperdrive.hud}));
    capa.querySelector("[data-ugel-cursor]")?.addEventListener("click", () => actualizarHyperdrive({cursor:!preferencias.hyperdrive.cursor}));
    capa.querySelector("[data-ugel-reset]")?.addEventListener("click", () => {
      preferencias = {tema:PREDETERMINADO.tema, modo:PREDETERMINADO.modo, lectura:PREDETERMINADO.lectura, espaciado:PREDETERMINADO.espaciado, reducirMovimiento:false, altoContraste:false, modoEnfoque:false, paleta:normalizarPaleta(), hyperdrive:normalizarHyperdrive(), actualizado:""};
      guardarPreferencias(); aplicarPreferencias(); mostrarToast("Personalización restablecida.");
    });
    capa.querySelectorAll("[data-ugel-close]").forEach(boton => boton.addEventListener("click", cerrarPersonalizacion));
    capa.addEventListener("pointerdown", evento => { if (evento.target === capa) cerrarPersonalizacion(); });
  }

  function alternarConstructor() {
    const capa = document.getElementById("ugel-personalizer");
    const constructor = capa?.querySelector("[data-ugel-custom-builder]");
    const boton = capa?.querySelector("[data-ugel-custom-toggle]");
    if (!constructor || !boton) return;
    const abrir = constructor.hidden;
    constructor.hidden = !abrir; boton.setAttribute("aria-expanded", String(abrir));
    boton.querySelector("em").textContent = abrir ? "Ocultar ↑" : "Configurar ↓";
    if (abrir) setTimeout(() => constructor.scrollIntoView({behavior:"smooth", block:"nearest"}), 30);
  }

  function activarPersonalizado(guardar = true) {
    preferencias.tema = "custom"; preferencias.paleta = normalizarPaleta(preferencias.paleta);
    if (guardar) guardarPreferencias();
    else { clearTimeout(activarPersonalizado.temporizador); activarPersonalizado.temporizador = setTimeout(guardarPreferencias, 180); }
    aplicarPreferencias();
  }

  function actualizarHyperdrive(parcial = {}) {
    preferencias.hyperdrive = normalizarHyperdrive({...preferencias.hyperdrive, ...parcial});
    guardarPreferencias(); aplicarPreferencias();
    return {...preferencias.hyperdrive};
  }

  async function cargarImagenPersonalizada(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    if (!/^image\/(?:png|jpeg|webp)$/i.test(archivo.type) || archivo.size > 8 * 1024 * 1024) {
      evento.target.value = ""; mostrarToast("Usa una imagen JPG, PNG o WebP de máximo 8 MB."); return;
    }
    const estado = document.querySelector("[data-ugel-image-status]");
    if (estado) estado.textContent = "Preparando imagen…";
    try { preferencias.paleta.imagen = await comprimirImagen(archivo, 1600, 1000, .74); activarPersonalizado(); mostrarToast("Imagen propia aplicada al fondo."); }
    catch (_) { if (estado) estado.textContent = "No se pudo procesar la imagen"; mostrarToast("No se pudo leer esa imagen."); }
    finally { evento.target.value = ""; }
  }

  function comprimirImagen(archivo, maxAncho, maxAlto, calidad) {
    return new Promise((resolver, rechazar) => {
      const imagen = new Image(); const url = URL.createObjectURL(archivo);
      imagen.onload = () => {
        const escala = Math.min(1, maxAncho / imagen.width, maxAlto / imagen.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(imagen.width * escala)); canvas.height = Math.max(1, Math.round(imagen.height * escala));
        canvas.getContext("2d").drawImage(imagen, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
        try { resolver(canvas.toDataURL("image/webp", calidad)); } catch (error) { rechazar(error); }
      };
      imagen.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error("INVALID_IMAGE")); }; imagen.src = url;
    });
  }

  function actualizarControles() {
    const capa = document.getElementById("ugel-personalizer");
    if (!capa) return;
    capa.querySelectorAll("[data-ugel-mode]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelMode === preferencias.modo));
    capa.querySelectorAll("[data-ugel-theme]").forEach(boton => {
      const activo = boton.dataset.ugelTheme === preferencias.tema; boton.classList.toggle("active", activo); boton.setAttribute("aria-pressed", String(activo));
    });
    capa.querySelector("[data-ugel-custom-toggle]")?.classList.toggle("active", preferencias.tema === "custom");
    capa.querySelectorAll("[data-ugel-color]").forEach(input => {
      const campo = input.dataset.ugelColor; input.value = preferencias.paleta[campo];
      const salida = capa.querySelector(`[data-ugel-color-output="${campo}"]`); if (salida) salida.textContent = preferencias.paleta[campo].toUpperCase();
    });
    capa.querySelectorAll("[data-ugel-range]").forEach(input => {
      const campo = input.dataset.ugelRange; input.value = preferencias.paleta[campo];
      const salida = capa.querySelector(`[data-ugel-output="${campo}"]`);
      if (salida) salida.textContent = ["bordeAncho", "radio", "desenfoque"].includes(campo) ? `${preferencias.paleta[campo]} px` : campo === "angulo" ? `${preferencias.paleta[campo]}°` : `${preferencias.paleta[campo]}%`;
    });
    capa.querySelectorAll("[data-ugel-pattern]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelPattern === preferencias.paleta.patron));
    capa.querySelectorAll("[data-ugel-position]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelPosition === preferencias.paleta.posicionImagen));
    capa.querySelectorAll("[data-ugel-combination]").forEach(boton => {
      const combinacion = COMBINACIONES.find(item => item.id === boton.dataset.ugelCombination);
      const activo = combinacion && ["barra","banner1","banner2","panel","panel2","acento","acento2"].every(campo => preferencias.paleta[campo] === combinacion.valores[campo]);
      boton.classList.toggle("active", Boolean(activo));
    });
    const armonia = capa.querySelector("[data-ugel-harmony]"); armonia?.classList.toggle("active", preferencias.paleta.sincronizar); armonia?.setAttribute("aria-checked", String(preferencias.paleta.sincronizar));
    capa.querySelectorAll("[data-ugel-size]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelSize === preferencias.lectura));
    capa.querySelectorAll("[data-ugel-spacing]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelSpacing === preferencias.espaciado));
    const movimiento = capa.querySelector("[data-ugel-motion]"); movimiento?.classList.toggle("active", preferencias.reducirMovimiento); movimiento?.setAttribute("aria-checked", String(preferencias.reducirMovimiento));
    const contrasteVisual = capa.querySelector("[data-ugel-contrast-toggle]"); contrasteVisual?.classList.toggle("active", preferencias.altoContraste); contrasteVisual?.setAttribute("aria-checked", String(preferencias.altoContraste));
    const enfoque = capa.querySelector("[data-ugel-focus]"); enfoque?.classList.toggle("active", preferencias.modoEnfoque); enfoque?.setAttribute("aria-checked", String(preferencias.modoEnfoque));
    capa.querySelectorAll("[data-ugel-quality]").forEach(boton => boton.classList.toggle("active", boton.dataset.ugelQuality === preferencias.hyperdrive.quality));
    const hacker = capa.querySelector("[data-ugel-hacker]"); hacker?.classList.toggle("active", preferencias.hyperdrive.hacker); hacker?.setAttribute("aria-checked", String(preferencias.hyperdrive.hacker));
    const sonido = capa.querySelector("[data-ugel-sound]"); sonido?.classList.toggle("active", preferencias.hyperdrive.sound); sonido?.setAttribute("aria-checked", String(preferencias.hyperdrive.sound));
    const hud = capa.querySelector("[data-ugel-hud]"); hud?.classList.toggle("active", preferencias.hyperdrive.hud); hud?.setAttribute("aria-checked", String(preferencias.hyperdrive.hud));
    const cursor = capa.querySelector("[data-ugel-cursor]"); cursor?.classList.toggle("active", preferencias.hyperdrive.cursor); cursor?.setAttribute("aria-checked", String(preferencias.hyperdrive.cursor));
    const estadoImagen = capa.querySelector("[data-ugel-image-status]"); if (estadoImagen) estadoImagen.textContent = preferencias.paleta.imagen ? "✓ Imagen propia activa" : "Sin imagen seleccionada";
    const vista = capa.querySelector("[data-ugel-live-preview]");
    if (vista) { const p = paletaParaModo(preferencias.paleta); vista.style.cssText = `--preview-bg1:${p.fondo1};--preview-bg2:${p.fondo2};--preview-bar:${p.barra};--preview-hero1:${p.banner1};--preview-hero2:${p.banner2};--preview-panel:${rgba(p.panel,p.panelOpacidad/100)};--preview-panel2:${p.panel2};--preview-accent:${p.acento};--preview-accent2:${p.acento2};--preview-text:${p.texto};--preview-on-bar:${textoSobre(p.barra)};--preview-on-hero:${textoSobre(mezclar(p.banner1,p.banner2,.5))};--preview-on-accent:${textoSobre(mezclar(p.acento,p.acento2,.35))};--preview-border:${p.borde};--preview-border-width:${p.bordeAncho}px;--preview-radius:${p.radio}px;`; }
    const avisoContraste = capa.querySelector("[data-ugel-contrast]");
    if (avisoContraste) {
      const paletaVisible = paletaParaModo(preferencias.paleta);
      const razon = contraste(paletaVisible.texto, paletaVisible.panel);
      avisoContraste.textContent = razon >= 7 ? `✓ Contraste excelente · ${razon.toFixed(1)}:1` : razon >= 4.5 ? `✓ Contraste legible · ${razon.toFixed(1)}:1` : `⚠ Sube el contraste · ${razon.toFixed(1)}:1`;
      avisoContraste.classList.toggle("warning", razon < 4.5);
    }
  }

  function abrirPersonalizacion() {
    crearPersonalizador(); const capa = document.getElementById("ugel-personalizer"); capa.hidden = false;
    requestAnimationFrame(() => capa.classList.add("open")); document.body.style.setProperty("overflow", "hidden");
    setTimeout(() => capa.querySelector("[data-ugel-close]")?.focus(), 50);
  }

  function cerrarPersonalizacion() {
    const capa = document.getElementById("ugel-personalizer"); if (!capa) return;
    guardarPreferencias(); capa.classList.remove("open"); document.body.style.removeProperty("overflow"); setTimeout(() => { capa.hidden = true; }, 220);
  }

  function crearAccesoTutor() {
    if (document.getElementById("ugel-ai-fab")) return;
    const boton = document.createElement("button"); boton.id = "ugel-ai-fab"; boton.className = "ugel-ai-fab"; boton.type = "button";
    boton.setAttribute("aria-label", "Abrir Tutor con inteligencia artificial");
    boton.innerHTML = '<span class="ugel-ai-fab-icon">✦</span><span class="ugel-ai-fab-copy"><small>ASISTENTE DE ESTUDIO</small><b>Tutor con IA</b></span><i class="ugel-ai-fab-dot" aria-hidden="true"></i>';
    boton.addEventListener("click", () => { if (typeof window.abrirTutorAcademico === "function") window.abrirTutorAcademico(null); else window.go?.("tutor", null); });
    document.body.appendChild(boton);
  }

  function textoPreguntaVisible() {
    const practica = document.querySelector("#ejercicios.active .practice-question-card");
    const examen = document.querySelector("#exam-active.active .question-card");
    const evaluacion = document.querySelector("#course-evaluation.active .question-card");
    const tarjeta = practica || examen || evaluacion; if (!tarjeta) return "";
    const estimulo = tarjeta.querySelector(".practice-question-stimulus p, .question-stimulus:not([hidden])")?.textContent || "";
    const enunciado = tarjeta.querySelector(".practice-question-text, .question-text")?.textContent || "";
    const raizOpciones = practica ? document.getElementById("practice-options") : examen ? document.getElementById("exam-options") : document.getElementById("course-eval-options");
    const alternativas = [...(raizOpciones?.querySelectorAll(".practice-option, .option-btn") || [])].map((opcion, indice) => `Alternativa ${"ABCDE"[indice] || indice + 1}: ${opcion.querySelector(".practice-option-text, .option-text")?.textContent || opcion.textContent}`);
    return [estimulo, enunciado, ...alternativas].filter(Boolean).join(". ");
  }

  function vozEspanolPeru() {
    const voces = window.speechSynthesis?.getVoices?.() || [];
    return voces.find(voz => /es-PE/i.test(voz.lang)) || voces.find(voz => /^es/i.test(voz.lang)) || null;
  }

  function leerTexto(texto) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return mostrarToast("La lectura en voz alta no está disponible en este navegador.");
    const contenido = String(texto || "").trim(); if (!contenido) return mostrarToast("No hay texto para leer.");
    window.speechSynthesis.cancel(); ultimaVoz = new SpeechSynthesisUtterance(contenido); ultimaVoz.lang = "es-PE"; ultimaVoz.rate = .94; ultimaVoz.pitch = 1;
    const voz = vozEspanolPeru(); if (voz) ultimaVoz.voice = voz; ultimaVoz.onerror = () => mostrarToast("No se pudo iniciar la lectura."); window.speechSynthesis.speak(ultimaVoz);
  }

  function leerPreguntaVisible() {
    const texto = textoPreguntaVisible(); if (!texto) return mostrarToast("Abre una pregunta para escucharla.");
    leerTexto(texto); mostrarToast("Leyendo pregunta y alternativas…");
  }

  function mostrarToast(mensaje) {
    let aviso = document.getElementById("ugel-toast");
    if (!aviso) { aviso = document.createElement("div"); aviso.id = "ugel-toast"; aviso.className = "ugel-toast"; aviso.setAttribute("role", "status"); aviso.setAttribute("aria-live", "polite"); document.body.appendChild(aviso); }
    aviso.textContent = String(mensaje || ""); aviso.classList.remove("show"); requestAnimationFrame(() => aviso.classList.add("show"));
    clearTimeout(temporizadorToast); temporizadorToast = setTimeout(() => aviso.classList.remove("show"), 2800);
  }

  async function sincronizarDesdeNube() {
    const remoto = await window.UniPrepCloud?.getPreferences?.();
    if (!remoto?.visual || typeof remoto.visual !== "object") {
      window.UniPrepCloud?.savePreferencesSoon?.({visual:preferencias, accessibility:{lectura:preferencias.lectura, espaciado:preferencias.espaciado, reducirMovimiento:preferencias.reducirMovimiento, altoContraste:preferencias.altoContraste, modoEnfoque:preferencias.modoEnfoque}}, 900);
      return;
    }
    const fechaRemota = new Date(remoto.updated_at || 0).getTime();
    const fechaLocal = new Date(preferencias.actualizado || 0).getTime();
    if (fechaRemota < fechaLocal) return;
    almacenamiento().guardar(CLAVE, {...remoto.visual, actualizado:remoto.updated_at || new Date().toISOString()});
    preferencias = cargarPreferencias();
    aplicarPreferencias();
    mostrarToast("Apariencia sincronizada con tu cuenta.");
  }

  function iniciar() {
    preferencias = cargarPreferencias(); aplicarPreferencias(); crearPersonalizador(); crearAccesoTutor();
    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
      if (preferencias.modo === "auto") aplicarPreferencias();
    });
  }

  document.addEventListener("keydown", evento => { if (evento.key === "Escape" && document.getElementById("ugel-personalizer")?.classList.contains("open")) cerrarPersonalizacion(); });
  document.addEventListener("uniprep:storage-scope-change", () => { preferencias = cargarPreferencias(); aplicarPreferencias(); });
  document.addEventListener("uniprep:user-ready", () => { preferencias = cargarPreferencias(); aplicarPreferencias(); sincronizarDesdeNube(); });

  window.abrirPersonalizacionUniPrep = abrirPersonalizacion;
  window.cerrarPersonalizacionUniPrep = cerrarPersonalizacion;
  window.leerPreguntaVisible = leerPreguntaVisible;
  window.leerTextoUniPrep = leerTexto;
  window.UniprepUGEL = {limpiarEnunciado, opcionesCompactas, mostrarToast, leerPreguntaVisible, leerTexto, actualizarHyperdrive, obtenerPreferencias:()=>JSON.parse(JSON.stringify(preferencias))};

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
