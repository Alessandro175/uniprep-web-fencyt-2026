(function () {
  "use strict";

  const FUENTE = "Temario oficial de admisión UNAMAD 2026";

  const catalogo = {
    rm: {
      area: "Matemática",
      temas: [
        "Organización y orden de la información",
        "Razonamiento lógico",
        "Conteo de figuras",
        "Análisis combinatorio",
        "Sucesiones",
        "Analogías y distribuciones",
        "Operadores matemáticos",
        "Planteo y resolución mediante ecuaciones",
        "Áreas y perímetros",
        "Problemas lúdicos y mecánicos"
      ]
    },
    aritmetica: {
      area: "Matemática",
      temas: [
        "Conjuntos y operaciones con conjuntos",
        "Sistemas numéricos naturales y enteros",
        "Sistemas numéricos racionales",
        "Sistema de numeración",
        "Divisibilidad",
        "Números primos",
        "Máximo común divisor y mínimo común múltiplo",
        "Razones y proporciones",
        "Magnitudes proporcionales",
        "Regla de tres y porcentajes",
        "Interés simple y compuesto",
        "Estadística y probabilidad"
      ]
    },
    algebra: {
      area: "Matemática",
      temas: [
        "Números reales y sus operaciones",
        "Intervalos y valor absoluto",
        "Números complejos",
        "Potencias y expresiones algebraicas",
        "Productos y cocientes notables",
        "División de polinomios y teorema del resto",
        "Factorización, MCD y MCM de polinomios",
        "Radicales y racionalización",
        "Ecuaciones polinómicas",
        "Inecuaciones polinómicas, fraccionarias e irracionales",
        "Sistemas de ecuaciones lineales",
        "Sistemas de inecuaciones e interpretación geométrica",
        "Matrices y determinantes",
        "Funciones, exponenciales y logaritmos"
      ]
    },
    geometria: {
      area: "Matemática",
      temas: [
        "Fundamentos de geometría plana",
        "Ángulos",
        "Triángulos",
        "Polígonos",
        "Circunferencias",
        "Proporcionalidad y semejanza",
        "Relaciones métricas en triángulos y circunferencias",
        "Áreas de regiones poligonales y circulares",
        "Geometría del espacio",
        "Secciones cónicas",
        "Geometría analítica"
      ]
    },
    trigonometria: {
      area: "Matemática",
      temas: [
        "Sistemas de medida angular",
        "Razones trigonométricas",
        "Reducción al primer cuadrante",
        "Funciones trigonométricas",
        "Identidades trigonométricas",
        "Ecuaciones e inecuaciones trigonométricas",
        "Resolución de triángulos oblicuángulos"
      ]
    },
    rv: {
      area: "Comunicación",
      temas: [
        ["Semántica de la palabra", "Razonamiento léxico"],
        ["Sinonimia y antonimia contextual", "Razonamiento léxico"],
        ["Analogías verbales", "Razonamiento léxico"],
        ["Término excluido y series verbales", "Razonamiento léxico"],
        ["Cohesión y coherencia del texto", "Organización textual"],
        ["Conectores lógicos y referentes", "Organización textual"],
        ["Oraciones incompletas", "Organización textual"],
        ["Eliminación de oraciones", "Organización textual"],
        ["Plan de redacción", "Organización textual"]
      ]
    },
    comprension_lectora: {
      area: "Comunicación",
      temas: [
        ["Comprensión lectora", "Comprensión Lectora"]
      ]
    },
    lenguaje: {
      area: "Comunicación",
      temas: [
        ["Comunicación y realidad lingüística", "Lenguaje"],
        ["Fonología de la lengua española", "Lenguaje"],
        ["Gramática: la palabra", "Lenguaje"],
        ["La oración gramatical", "Lenguaje"],
        ["Ortografía", "Lenguaje"]
      ]
    },
    literatura: {
      area: "Comunicación",
      temas: [
        ["Conceptos literarios", "Literatura"],
        ["Literatura peruana", "Literatura"],
        ["Literatura universal", "Literatura"]
      ]
    },
    historia: {
      area: "Ciencias Sociales",
      temas: [
        ["Registro histórico y recreación del pasado", "Historia Universal"],
        ["Primeras civilizaciones y mundo clásico", "Historia Universal"],
        ["Edad Media", "Historia Universal"],
        ["Expansión europea y mundo colonial", "Historia Universal"],
        ["Absolutismo y era de las revoluciones", "Historia Universal"],
        ["Revolución Industrial, imperialismo y Primera Guerra Mundial", "Historia Universal"],
        ["Del siglo XX al mundo contemporáneo", "Historia Universal"]
      ]
    },
    historia_peru: {
      area: "Ciencias Sociales",
      temas: [
        ["Poblamiento de América y surgimiento cultural", "Historia del Perú"],
        ["Del Formativo a los Estados Regionales", "Historia del Perú"],
        ["El Tahuantinsuyo", "Historia del Perú"],
        ["Establecimiento del orden virreinal", "Historia del Perú"],
        ["Proceso de independencia americana", "Historia del Perú"],
        ["Política, economía y sociedad en Latinoamérica y el Perú", "Historia del Perú"],
        ["El Perú en el siglo XX (1920-1980)", "Historia del Perú"],
        ["El Perú de fines del siglo XX al siglo XXI", "Historia del Perú"]
      ]
    },
    geografia: {
      area: "Ciencias Sociales",
      temas: [
        ["Espacio geográfico y sus interrelaciones", "Geografía"],
        ["Geomorfología del territorio peruano", "Geografía"],
        ["Problemática ambiental y territorial", "Geografía"],
        ["Gestión de riesgos, vulnerabilidad y desastres", "Geografía"],
        ["Fuentes de información geográfica", "Geografía"]
      ]
    },
    filosofia: {
      area: "Ciencias Sociales",
      temas: [
        ["Nociones fundamentales de filosofía", "Filosofía"],
        ["Historia de la filosofía", "Filosofía"],
        ["Ética, sociedad y política", "Filosofía"],
        ["Ciencia y conocimiento", "Filosofía"],
        ["Lógica y teoría de la argumentación", "Filosofía"]
      ]
    },
    economia: {
      area: "Ciencias Sociales",
      temas: [
        "Fundamentos de la economía",
        "Necesidades, bienes y recursos",
        "Proceso económico y producción",
        "La empresa y el mercado",
        "Los precios",
        "La moneda",
        "El sistema financiero",
        "Dinámica demográfica y desarrollo económico del Perú"
      ]
    },
    quimica: {
      area: "Ciencia y Tecnología",
      temas: [
        "Fundamentos de la química y la materia",
        "Estructura atómica",
        "Tabla periódica",
        "Enlace químico y fuerzas intermoleculares",
        "Compuestos inorgánicos y nomenclatura",
        "Reacciones químicas y estequiometría",
        "Estados de la materia",
        "Química orgánica"
      ]
    },
    biologia: {
      area: "Ciencia y Tecnología",
      temas: [
        ["Fundamentos de la biología", "Biología"],
        ["Clasificación de los seres vivos", "Biología"],
        ["Bioquímica", "Biología"],
        ["Célula", "Biología"],
        ["Histología animal", "Biología"],
        ["Histología vegetal", "Biología"],
        ["Nutrición y metabolismo", "Biología"],
        ["Sistemas biológicos en plantas y animales", "Biología"],
        ["Sistema endocrino y nervioso", "Biología"],
        ["Reproducción", "Biología"],
        ["Genética y continuidad de la vida", "Biología"],
        ["Sistema inmunitario y enfermedades", "Biología"]
      ]
    },
    medio_ambiente: {
      area: "Ciencia y Tecnología",
      temas: [
        ["Fundamentos de ecología", "Medio Ambiente"],
        ["Problemas ambientales globales", "Medio Ambiente"],
        ["Conservación y desarrollo sostenible", "Medio Ambiente"],
        ["Recursos naturales", "Medio Ambiente"],
        ["Procesos ambientales aplicados", "Medio Ambiente"]
      ]
    },
    anatomia: {
      area: "Ciencia y Tecnología",
      temas: [
        ["Generalidades de anatomía", "Anatomía"],
        ["Sistema locomotor", "Anatomía"],
        ["Sistema digestivo", "Anatomía"],
        ["Sistema respiratorio", "Anatomía"],
        ["Sistema circulatorio", "Anatomía"],
        ["Sistema excretor", "Anatomía"],
        ["Sistema reproductor", "Anatomía"],
        ["Sistema endocrino", "Anatomía"],
        ["Sistema nervioso", "Anatomía"],
        ["Promoción de la salud", "Anatomía"]
      ]
    },
    psicologia: {
      area: "Ciencias Sociales",
      temas: [
        ["Introducción a la psicología", "Psicología"],
        ["Bases biológicas del comportamiento", "Psicología"],
        ["Procesos psicológicos básicos", "Psicología"],
        ["Aprendizaje", "Psicología"],
        ["Desarrollo humano", "Psicología"],
        ["Personalidad e identidad", "Psicología"],
        ["Afectividad y motivación", "Psicología"]
      ]
    },
    fisica: {
      area: "Ciencia y Tecnología",
      temas: [
        "Fundamentos de la física",
        "Análisis vectorial",
        "Movimiento en una dimensión",
        "Movimiento en el plano",
        "Dinámica y estática",
        "Trabajo y energía",
        "Mecánica de fluidos",
        "Temperatura y dilatación",
        "Calor"
      ]
    },
    civica: {
      area: "Ciudadanía y Cívica",
      temas: [
        "Estado y sistema democrático",
        "Órganos constitucionales autónomos",
        "Defensa y seguridad nacional",
        "Ciudadanía e identidad nacional",
        "Convivencia democrática y valores cívicos",
        "Desarrollo ciudadano y formación personal"
      ]
    }
  };

  const descripciones = {
    "Matemática": "Conceptos, propiedades y estrategias de resolución para preguntas de admisión.",
    "Comunicación": "Comprensión, normativa y análisis del lenguaje aplicados al examen de admisión.",
    "Ciencias Sociales": "Procesos, conceptos y relaciones para interpretar la realidad peruana y mundial.",
    "Ciencia y Tecnología": "Fundamentos científicos, procedimientos y aplicaciones preuniversitarias.",
    "Ciudadanía y Cívica": "Constitución, democracia, derechos, deberes e instituciones del Estado peruano."
  };

  function crearTema(entrada, indice, curso) {
    const titulo = Array.isArray(entrada) ? entrada[0] : entrada;
    const subarea = Array.isArray(entrada) ? entrada[1] : catalogo[curso].area;
    const minutos = 28 + ((indice * 7 + titulo.length) % 24);
    return {
      id: `${curso}-${indice + 1}`,
      titulo,
      subarea,
      descripcion: descripciones[catalogo[curso].area],
      duracion: `${minutos} min`,
      oficial: true,
      fuente: FUENTE,
      puntos: [
        `Conceptos esenciales de ${titulo}`,
        "Procedimientos, propiedades y casos frecuentes",
        "Aplicación en preguntas tipo admisión UNAMAD"
      ]
    };
  }

  Object.entries(catalogo).forEach(([curso, datos]) => {
    datos.temas = datos.temas.map((entrada, indice) => crearTema(entrada, indice, curso));
  });

  window.TEMARIO_UNAMAD = catalogo;
  window.TEMARIO_UNAMAD_FUENTE = FUENTE;
  window.TOTAL_TEMAS_UNAMAD = Object.values(catalogo).reduce((suma, curso) => suma + curso.temas.length, 0);
})();
