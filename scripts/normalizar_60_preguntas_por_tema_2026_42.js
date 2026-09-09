#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BANK_DIR = path.join(ROOT, "json", "quiz-cursos");
const LEVELS = ["basico", "intermedio", "avanzado", "admision"];
const LEVEL_CODE = {basico:"B", intermedio:"I", avanzado:"V", admision:"A"};
const LEVEL_LABEL = {basico:"Fundamento", intermedio:"Aplicación", avanzado:"Análisis", admision:"Reto de admisión"};
const CONTEXTS = [
  "En una práctica de comprensión conceptual",
  "Durante una sesión de aplicación guiada",
  "En un control de procedimiento",
  "Para comprobar el razonamiento",
  "En una situación de transferencia",
  "Durante una revisión de errores frecuentes",
  "En una práctica cronometrada",
  "Para justificar una respuesta ante el docente",
  "En un ejercicio de contraste de alternativas",
  "Durante la preparación para admisión",
  "En una actividad de razonamiento autónomo",
  "Para verificar la consistencia del resultado",
  "En una evaluación de conceptos relacionados",
  "Como cierre del bloque temático"
];

const INVALID_REASONS = [
  "Se usan todos los datos sin respetar la relación indicada.",
  "Se escoge la alternativa de mayor valor sin desarrollar el procedimiento.",
  "Se invierte la operación principal y no se comprueba el resultado.",
  "Se aplica una regla de otro tema y se ignoran las condiciones del enunciado.",
  "Se aproxima antes de tiempo y se pierde la condición decisiva.",
  "Se considera solo un dato y se descartan las demás restricciones."
];

function clean(value, max = 420) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function rotate(values, shift) {
  const unique = [];
  for (const value of values.map(item => clean(item, 260))) {
    if (value && !unique.includes(value)) unique.push(value);
  }
  let fallback = 1;
  while (unique.length < 4) {
    const value = `Procedimiento incompatible ${fallback++}`;
    if (!unique.includes(value)) unique.push(value);
  }
  const four = unique.slice(0, 4);
  const amount = Math.abs(shift) % 4;
  const alternatives = four.slice(amount).concat(four.slice(0, amount));
  return {alternatives, answer:alternatives.indexOf(four[0])};
}

function solutionOf(question) {
  return clean(question.solucion || question.explicacion || `La alternativa correcta se obtiene aplicando el procedimiento de ${question.tema || "este tema"}.`, 220);
}

function correctOf(question) {
  return clean(question.alternativas?.[Number(question.respuesta)] ?? "", 150);
}

function wrongOf(question, index = 0) {
  const correct = Number(question.respuesta);
  const wrong = (question.alternativas || []).filter((_, optionIndex) => optionIndex !== correct);
  return clean(wrong[index % Math.max(1, wrong.length)] || "la alternativa descartada", 150);
}

function derivedQuestion(base, metadata) {
  const {courseId, topicTitle, topicIndex, level, sequence, globalSequence} = metadata;
  const original = clean(base.pregunta, 650);
  const correct = correctOf(base);
  const wrongA = wrongOf(base, sequence);
  const wrongB = wrongOf(base, sequence + 1);
  const solution = solutionOf(base);
  const context = CONTEXTS[globalSequence % CONTEXTS.length];
  const mode = globalSequence % 6;
  let prompt;
  let alternatives;
  let answer;
  let format;

  if (mode === 0) {
    prompt = `${context}, resuelve sin ensayo ciego: ${original}`;
    alternatives = [...base.alternativas];
    answer = Number(base.respuesta);
    format = "aplicacion_directa";
  } else if (mode === 1) {
    prompt = `${context}, identifica el resultado compatible con todas las condiciones. ${original}`;
    alternatives = [...base.alternativas];
    answer = Number(base.respuesta);
    format = "verificacion_de_condiciones";
  } else if (mode === 2) {
    prompt = `${context}, un estudiante propuso «${wrongA}». Corrige su conclusión resolviendo el caso: ${original}`;
    alternatives = [...base.alternativas];
    answer = Number(base.respuesta);
    format = "analisis_de_error";
  } else if (mode === 3) {
    prompt = `${context}, selecciona la pareja formada por el resultado correcto y una justificación válida. Caso: ${original}`;
    const options = rotate([
      `${correct} — ${solution}`,
      `${wrongA} — ${INVALID_REASONS[(globalSequence + 1) % INVALID_REASONS.length]}`,
      `${wrongB} — ${INVALID_REASONS[(globalSequence + 3) % INVALID_REASONS.length]}`,
      `${wrongOf(base, sequence + 2)} — ${INVALID_REASONS[(globalSequence + 5) % INVALID_REASONS.length]}`
    ], globalSequence);
    alternatives = options.alternatives;
    answer = options.answer;
    format = "resultado_y_justificacion";
  } else if (mode === 4) {
    prompt = `${context}, resuelve el problema y elige la explicación que valida el procedimiento. ${original}`;
    const options = rotate([
      solution,
      INVALID_REASONS[globalSequence % INVALID_REASONS.length],
      INVALID_REASONS[(globalSequence + 2) % INVALID_REASONS.length],
      INVALID_REASONS[(globalSequence + 4) % INVALID_REASONS.length]
    ], globalSequence);
    alternatives = options.alternatives;
    answer = options.answer;
    format = "seleccion_de_justificacion";
  } else {
    const truthCase = globalSequence % 4;
    let statementI;
    let statementII;
    let correctCombination;
    if (truthCase === 0) {
      statementI = `El resultado compatible es «${correct}».`;
      statementII = `El resultado compatible es «${wrongA}».`;
      correctCombination = "Solo I es correcta";
    } else if (truthCase === 1) {
      statementI = `El resultado compatible es «${wrongA}».`;
      statementII = `El resultado compatible es «${correct}».`;
      correctCombination = "Solo II es correcta";
    } else if (truthCase === 2) {
      statementI = `El resultado compatible es «${correct}».`;
      statementII = `La comprobación válida es: ${solution}`;
      correctCombination = "I y II son correctas";
    } else {
      statementI = `El resultado compatible es «${wrongA}».`;
      statementII = `El resultado compatible es «${wrongB}».`;
      correctCombination = "Ninguna es correcta";
    }
    prompt = `${context}, analiza el caso y las proposiciones. Caso: ${original} I) ${statementI} II) ${statementII}`;
    const options = rotate([correctCombination, ...["Solo I es correcta","Solo II es correcta","I y II son correctas","Ninguna es correcta"].filter(item => item !== correctCombination)], globalSequence);
    alternatives = options.alternatives;
    answer = options.answer;
    format = "analisis_de_proposiciones";
  }

  return {
    ...base,
    id:`EXP-${courseId.toUpperCase()}-${String(topicIndex + 1).padStart(2,"0")}-${LEVEL_CODE[level]}-${String(sequence + 1).padStart(2,"0")}`,
    universidadReferencia:level === "admision" ? (base.universidadReferencia || "UNI") : "GENERAL",
    dificultad:level,
    tema:topicTitle,
    competencia:`${LEVEL_LABEL[level]} · ${format.replaceAll("_", " ")}`,
    formatoPregunta:format,
    pregunta:prompt,
    alternativas:alternatives,
    respuesta:answer,
    solucion:`Respuesta: ${correct}. ${solution}`,
    explicacion:`${solution} Se contrastan las condiciones y se descartan las alternativas incompatibles.`,
    pasosMinimos:level === "basico" ? 1 : level === "intermedio" ? 2 : level === "avanzado" ? 3 : 4,
    fuenteReferencia:base.fuenteReferencia || "Banco académico del proyecto UniPrep",
    alineacionUniversitaria:"Variante original de entrenamiento construida desde el mismo tema y curso; no es pregunta oficial."
  };
}

function normalizeTopic(topic, courseId, topicIndex) {
  topic.niveles ||= {};
  const overflow = [];
  for (const level of LEVELS) {
    topic.niveles[level] = Array.isArray(topic.niveles[level]) ? topic.niveles[level] : [];
    if (topic.niveles[level].length > 15) overflow.push(...topic.niveles[level].splice(15));
  }

  for (const level of LEVELS) {
    while (topic.niveles[level].length < 15 && overflow.length) {
      const moved = overflow.shift();
      moved.dificultad = level;
      moved.competencia = `${LEVEL_LABEL[level]} · ${clean(moved.competencia || "resolución temática", 150)}`;
      topic.niveles[level].push(moved);
    }
  }

  const source = LEVELS.flatMap(level => topic.niveles[level]).filter(item => item?.pregunta && Array.isArray(item.alternativas));
  if (!source.length) throw new Error(`${courseId}/${topic.titulo}: tema sin preguntas base`);
  let generated = 0;
  const formats = new Set(source.map(item=>item.formatoPregunta || "opcion_multiple"));
  for (const level of LEVELS) {
    const current = topic.niveles[level];
    const levelSource = current.length ? [...current] : source;
    while (current.length < 15) {
      const sequence = current.length;
      const globalSequence = generated + topicIndex * 7 + LEVELS.indexOf(level) * 11;
      const base = levelSource[generated % levelSource.length] || source[generated % source.length];
      const question = derivedQuestion(base, {courseId, topicTitle:topic.titulo, topicIndex, level, sequence, globalSequence});
      while (source.some(item=>item.id === question.id) || current.some(item=>item.id === question.id)) question.id += "X";
      current.push(question);
      source.push(question);
      formats.add(question.formatoPregunta);
      generated += 1;
    }
  }
  topic.distribucion = {basico:15, intermedio:15, avanzado:15, admision:15, total:60};
  topic.formatosPregunta = [...formats];
  return generated;
}

function normalizeBank(file) {
  const filePath = path.join(BANK_DIR, file);
  const bank = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const courseId = bank.courseId || path.basename(file, ".json");
  let generated = 0;
  (bank.temas || []).forEach((topic, topicIndex) => { generated += normalizeTopic(topic, courseId, topicIndex); });
  const topicCount = (bank.temas || []).length;
  bank.version = "2026.42-60-por-tema-variedad-verificada";
  bank.total = topicCount * 60;
  bank.distribucion = {basico:topicCount*15, intermedio:topicCount*15, avanzado:topicCount*15, admision:topicCount*15, total:topicCount*60};
  bank.distribucionPorTema = {basico:15, intermedio:15, avanzado:15, admision:15, total:60};
  bank.criterioVariedad = "Cálculo o conocimiento directo, aplicación, verificación de condiciones, análisis de error, resultado con justificación, selección de procedimiento y análisis de proposiciones.";
  fs.writeFileSync(filePath, `${JSON.stringify(bank, null, 2)}\n`);
  return {courseId, topics:topicCount, generated, total:bank.total};
}

const files = fs.readdirSync(BANK_DIR).filter(file => file.endsWith(".json") && file !== "PLANTILLA_CURSO.json").sort();
const results = files.map(normalizeBank);
console.log(JSON.stringify({version:"2026.42", courses:results.length, topics:results.reduce((sum,item)=>sum+item.topics,0), generated:results.reduce((sum,item)=>sum+item.generated,0), total:results.reduce((sum,item)=>sum+item.total,0), results}, null, 2));
