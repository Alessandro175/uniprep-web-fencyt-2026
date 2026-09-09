const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function recorrer(banco, callback) {
  for (const tema of banco.temas || []) {
    for (const grupo of Object.values(tema.niveles || {})) {
      for (const pregunta of grupo || []) callback(pregunta);
    }
  }
}

function numeros(texto, patron) {
  const coincidencia = String(texto).match(patron);
  return coincidencia ? coincidencia.slice(1).map(Number) : null;
}

function figuraGeometria(enunciado) {
  let datos = numeros(enunciado, /AB:AC\s*=\s*(\d+)\s*:\s*(\d+).*?BC\s*=\s*(\d+)/i);
  if (datos) return {tipo:"triangulo_bisectriz", razonAB:datos[0], razonAC:datos[1], base:datos[2]};

  datos = numeros(enunciado, /triángulo rectángulo tiene catetos\s*(\d+)\s*y\s*(\d+)/i);
  if (datos) return {tipo:"triangulo_rectangulo", cateto1:datos[0], cateto2:datos[1]};

  datos = numeros(enunciado, /circunferencia de radio\s*(\d+).*?distancia\s*(\d+)/i);
  if (datos) return {tipo:"circulo_cuerda", radio:datos[0], distancia:datos[1]};

  datos = numeros(enunciado, /segmento externo\s*(\d+)\s*e interno\s*(\d+)/i);
  if (datos) return {tipo:"tangente_secante", externo:datos[0], interno:datos[1]};

  datos = numeros(enunciado, /trapecio tiene bases\s*(\d+)\s*y\s*(\d+).*?mediana mide\s*(\d+).*?altura\s*(\d+)/i);
  if (datos) return {tipo:"trapecio", baseMayor:datos[0], baseMenor:datos[1], mediana:datos[2], altura:datos[3]};

  datos = numeros(enunciado, /polígono(?: convexo)? (?:tiene|de)\s*(\d+)\s*lados/i);
  if (datos) return {tipo:"poligono", lados:datos[0]};
  return null;
}

function figuraTrigonometria(enunciado) {
  let datos = numeros(enunciado, /triángulo rectángulo con catetos\s*(\d+)\s*y\s*(\d+)/i);
  if (datos) return {tipo:"triangulo_rectangulo", cateto1:datos[0], cateto2:datos[1]};

  datos = numeros(enunciado, /Dos lados de un triángulo miden\s*(\d+)\s*y\s*(\d+).*?(?:ángulo comprendido es|forman)\s*(\d+)°/i);
  if (datos) return {tipo:"triangulo_oblicuo", lado1:datos[0], lado2:datos[1], angulo:datos[2]};
  return null;
}

function figuraAlgebra(enunciado) {
  const texto = String(enunciado || "");
  if (!/[=√²³⁴⁵⁶⁷⁸⁹]|\|[^|]+\||≤|≥/.test(texto)) return null;
  const partes = texto.split(/\.\s+/).map(item => item.trim()).filter(item => /[=√²³⁴⁵⁶⁷⁸⁹]|\|[^|]+\||≤|≥/.test(item));
  const contenido = (partes.sort((a, b) => b.length - a.length)[0] || texto)
    .replace(/^Tema [^.]+\.\s*/i, "")
    .slice(0, 260);
  return {tipo:"formula", contenido};
}

function actualizar(id, creador) {
  const archivo = path.join(root, "json", "quiz-cursos", `${id}.json`);
  const banco = JSON.parse(fs.readFileSync(archivo, "utf8"));
  let agregadas = 0;
  recorrer(banco, pregunta => {
    if (pregunta.figura) return;
    const figura = creador(pregunta.pregunta || "");
    if (!figura) return;
    pregunta.figura = figura;
    agregadas += 1;
  });
  banco.version = "2026.41-figuras-matematicas";
  fs.writeFileSync(archivo, `${JSON.stringify(banco, null, 2)}\n`);
  return agregadas;
}

const algebra = actualizar("algebra", figuraAlgebra);
const geometria = actualizar("geometria", figuraGeometria);
const trigonometria = actualizar("trigonometria", figuraTrigonometria);
console.log(`Figuras agregadas: Álgebra ${algebra}; Geometría ${geometria}; Trigonometría ${trigonometria}.`);
