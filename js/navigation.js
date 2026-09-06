// =====================================================
// PREUNI - NAVEGACIÓN ENTRE PANTALLAS
// =====================================================

const TITULOS_PANTALLAS = {
  home: "Tu ruta de hoy",
  universo: "Universo UniPrep",
  cursos: "Aprender",
  videoclase: "Lección",
  ejercicios: "Practicar",
  formulas: "Fórmulas y repaso",
  biblioteca: "Biblioteca",
  "course-evaluation": "Evaluación del curso",
  exams: "Comprueba tu avance",
  "exam-active": "Simulacro en curso",
  "exam-result": "Resultado del simulacro",
  ranking: "Ranking",
  agenda: "Organiza tu estudio",
  vocacional: "Descubre tu carrera",
  tutor: "Tutor Uni",
  perfil: "Mi perfil",
  notificaciones: "Notificaciones"
};

function go(idPantalla, elementoMenu = null) {
  console.log("Abriendo pantalla:", idPantalla);

  const pantalla = document.getElementById(idPantalla);

  if (!pantalla) {
    console.error(`No existe una pantalla con id="${idPantalla}"`);
    return;
  }

  document.querySelectorAll(".screen").forEach(elemento => {
    elemento.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(elemento => {
    elemento.classList.remove("active");
  });

  pantalla.classList.add("active");

  if (elementoMenu) {
    elementoMenu.classList.add("active");
  } else {
    const itemCorrespondiente = document.querySelector(
      `.nav-item[data-screen="${idPantalla}"]`
    );

    itemCorrespondiente?.classList.add("active");
  }

  const titulo = document.getElementById("topbar-title");

  if (titulo) {
    titulo.textContent =
      TITULOS_PANTALLAS[idPantalla] || "UniPrep";
  }

  const contenido = document.querySelector(".content");

  if (contenido) {
    contenido.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

// Dejamos la función disponible para los onclick del HTML.
window.go = go;
