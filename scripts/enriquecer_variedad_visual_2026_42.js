#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const BANK_DIR = path.join(ROOT, "json", "quiz-cursos");

function questions(topic) {
  return Object.values(topic.niveles || {}).flat();
}

function valuesFrom(text) {
  return [...String(text).matchAll(/-?\d+(?:[.,]\d+)?(?:\s*(?:m\/s²|m\/s|kg|N|J|W|Pa|Hz|°C|s|m|cm))?/gi)]
    .slice(0, 4).map(match => match[0]);
}

function inferFormat(question) {
  const text = String(question.pregunta || "");
  if (question.figura) return "interpretacion_visual";
  if (/\bI\)|\bII\)|proposiciones|verdader[ao]s?/i.test(text)) return "analisis_de_proposiciones";
  if (/estudiante propuso|corrige su conclusión|error/i.test(text)) return "analisis_de_error";
  if (/justific|explicación que valida/i.test(text)) return "justificacion_del_procedimiento";
  if (/caso:|situación|encuesta|experimento|proyecto|contexto/i.test(text)) return "caso_contextualizado";
  if (/calcula|resuelve|halla|determina|obtén|encuentra|cuánt/i.test(text)) return "resolucion_de_problemas";
  return "opcion_multiple_conceptual";
}

function physicsFigure(text) {
  const values = valuesFrom(text);
  if (/circuit|resistencia|voltaje|corriente eléctrica|ley de ohm/i.test(text)) return {tipo:"circuito_fisica", valores:values};
  if (/onda|frecuencia|longitud de onda|oscil|sonido/i.test(text)) return {tipo:"onda_fisica", valores:values};
  if (/presión|densidad|fluido|empuje|hidrost/i.test(text)) return {tipo:"fluido_fisica", valores:values};
  if (/calor|temperatura|dilat|termodin/i.test(text)) return {tipo:"termica_fisica", valores:values};
  if (/bloque|fuerza|fricción|rozamiento|newton|tensión/i.test(text)) return {tipo:"fuerzas_fisica", valores:values};
  if (/móvil|velocidad|rapidez|aceler|caída|proyectil|movimiento/i.test(text)) return {tipo:"movimiento_fisica", valores:values};
  return null;
}

function rmFigure(text) {
  let match = text.match(/cuadrícula tiene\s*(\d+)\s*filas y\s*(\d+)\s*columnas/i);
  if (match) return {tipo:"cuadricula_rm", filas:Number(match[1]), columnas:Number(match[2])};
  match = text.match(/(?:tablero|malla).*?(\d+)\s*[×x]\s*(\d+)/i);
  if (match) return {tipo:"cuadricula_rm", filas:Number(match[1]), columnas:Number(match[2])};
  match = text.match(/(\d+)\s*rectas verticales y\s*(\d+)\s*horizontales/i);
  if (match) return {tipo:"rectas_rm", verticales:Number(match[1]), horizontales:Number(match[2])};
  match = text.match(/(\d+)\s*puntos sobre una circunferencia/i);
  if (match) return {tipo:"puntos_circulo_rm", puntos:Number(match[1])};
  match = text.match(/(?:mesa circular|forman un círculo).*?(\d+)|^(\d+).*?(?:mesa circular|forman un círculo)/i);
  if (match) return {tipo:"asientos_circulares_rm", personas:Number(match[1] || match[2])};
  match = text.match(/(?:polígono convexo de|polígono(?: convexo)? tiene)\s*(\d+)\s*lados/i);
  if (match) return {tipo:"poligono", lados:Number(match[1])};
  match = text.match(/(\d+)\s*(?:engranajes|ruedas|poleas)/i);
  if (/engranaje|rueda|polea/i.test(text)) return {tipo:"engranajes_rm", cantidad:Number(match?.[1] || 3)};
  if (/encuesta|dominan|conjunto/i.test(text)) return {tipo:"venn_rm", valores:valuesFrom(text)};
  return null;
}

let figures = {fisica:0, rm:0};
let formats = 0;
for (const filename of fs.readdirSync(BANK_DIR).filter(name => name.endsWith(".json") && name !== "PLANTILLA_CURSO.json")) {
  const file = path.join(BANK_DIR, filename);
  const bank = JSON.parse(fs.readFileSync(file, "utf8"));
  const courseId = bank.courseId || path.basename(filename, ".json");
  for (const topic of bank.temas || []) {
    for (const question of questions(topic)) {
      if (!question.figura && courseId === "fisica") question.figura = physicsFigure(question.pregunta);
      if (!question.figura && courseId === "rm") question.figura = rmFigure(question.pregunta);
      if (!question.formatoPregunta) {
        question.formatoPregunta = inferFormat(question);
        formats += 1;
      }
      if (question.figura && courseId in figures) figures[courseId] += 1;
    }
    topic.formatosPregunta = [...new Set(questions(topic).map(item => item.formatoPregunta).filter(Boolean))];
  }
  bank.version = "2026.42-60-por-tema-variedad-visual";
  bank.criterioVariedad = "60 preguntas por tema: 15 básicas, 15 intermedias, 15 avanzadas y 15 de admisión; combina resolución, verificación, análisis de error, justificación, proposiciones y lectura visual cuando corresponde.";
  fs.writeFileSync(file, `${JSON.stringify(bank, null, 2)}\n`);
}

console.log(`Formatos clasificados: ${formats}. Figuras totales: Física ${figures.fisica}; RM ${figures.rm}.`);
