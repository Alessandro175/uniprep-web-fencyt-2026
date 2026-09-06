#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");
const crypto = require("crypto");
const ROOT = __dirname;
const failures = [];
const passes = [];

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function pass(message) { passes.push(message); }
function fail(message) { failures.push(message); }

const files = walk(ROOT).filter(file => !file.includes(`${path.sep}.git${path.sep}`));
const scripts = files.filter(file => file.endsWith(".js"));
for (const file of scripts) {
  const check = spawnSync(process.execPath, ["--check", file], {encoding:"utf8"});
  if (check.status !== 0) fail(`Sintaxis: ${path.relative(ROOT,file)}: ${(check.stderr || check.stdout).trim()}`);
}
if (!failures.length) pass(`${scripts.length} archivos JavaScript con sintaxis válida`);
const scriptHashes = scripts.map(file=>({file,hash:crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}));
const repeatedScripts = scriptHashes.filter((item,index,list)=>list.findIndex(other=>other.hash===item.hash)!==index);
repeatedScripts.length ? fail(`Archivos JavaScript duplicados: ${repeatedScripts.map(item=>path.relative(ROOT,item.file)).join(", ")}`) : pass("Sin archivos JavaScript duplicados");

const jsonFiles = files.filter(file => file.endsWith(".json"));
for (const file of jsonFiles) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`JSON: ${path.relative(ROOT,file)}: ${error.message}`); }
}
if (!failures.some(item=>item.startsWith("JSON:"))) pass(`${jsonFiles.length} archivos JSON válidos`);

const html = fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]);
const duplicates = [...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
duplicates.length ? fail(`IDs repetidos: ${duplicates.join(", ")}`) : pass(`${ids.length} identificadores HTML únicos`);
const retiredHomeBlocks = ["spark-day-score","spark-mission-grid","spark-coach-title","friendly-goal-ring"];
const retiredStillPresent = retiredHomeBlocks.filter(id=>ids.includes(id));
const friendlyUx = fs.readFileSync(path.join(ROOT,"js/friendly-ux.js"),"utf8");
if (retiredStillPresent.length) fail(`Inicio móvil conserva bloques retirados: ${retiredStillPresent.join(", ")}`);
else if (!friendlyUx.includes("abrirGuiaExposicionUniPrep")) fail("Falta el acceso al Modo exposición en las herramientas");
else pass("Inicio limpio y Modo exposición disponible en herramientas");

const sw = fs.readFileSync(path.join(ROOT,"sw.js"),"utf8");
const assetBlock = sw.match(/const\s+(?:ASSETS|CORE)\s*=\s*\[([\s\S]*?)\];/)?.[1] || "";
const cached = [...assetBlock.matchAll(/["']([^"']+\.(?:css|js|json|png|svg|webp|ico|html)(?:\?v=[^"']+)?)['"]/g)].map(match=>match[1]);
const cacheDuplicates = [...new Set(cached.filter((item,index)=>cached.indexOf(item)!==index))];
for (const item of [...new Set(cached)]) {
  const clean = item.replace(/^\.\//,"").replace(/\?v=.*$/,"");
  if (!fs.existsSync(path.join(ROOT,clean))) fail(`Recurso PWA ausente: ${clean}`);
}
cacheDuplicates.length ? fail(`Recursos PWA repetidos: ${cacheDuplicates.join(", ")}`) : pass(`${new Set(cached).size} recursos PWA presentes y sin duplicados`);

let questionCount = 0;
const questionIds = [];
const questionPrompts = [];
for (const file of jsonFiles.filter(file=>file.includes(`${path.sep}quiz-cursos${path.sep}`))) {
  if (file.endsWith("PLANTILLA_CURSO.json")) continue;
  const data = JSON.parse(fs.readFileSync(file,"utf8"));
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    if (typeof value.pregunta === "string" && Array.isArray(value.alternativas)) {
      questionCount++;
      questionPrompts.push(value.pregunta.toLowerCase().replace(/\s+/g," ").trim());
      if (value.id) questionIds.push(value.id);
      const key = value.respuesta ?? value.correcta ?? value.respuestaCorrecta;
      if (key === undefined || key === null) fail(`Pregunta sin clave en ${path.relative(ROOT,file)}`);
      if (value.alternativas.length !== 4 || new Set(value.alternativas.map(String)).size !== 4) fail(`Alternativas inválidas en ${value.id || path.relative(ROOT,file)}`);
      if (!Number.isInteger(key) || key < 0 || key > 3) fail(`Clave fuera de rango en ${value.id || path.relative(ROOT,file)}`);
    }
    Object.values(value).forEach(visit);
  };
  visit(data);
}
questionCount === 7920 ? pass("7,920 preguntas académicas detectadas") : fail(`Se esperaban 7,920 preguntas y se detectaron ${questionCount}`);
const repeatedQuestionIds = [...new Set(questionIds.filter((id,index)=>questionIds.indexOf(id)!==index))];
repeatedQuestionIds.length ? fail(`IDs de preguntas repetidos: ${repeatedQuestionIds.slice(0,12).join(", ")}`) : pass(`${questionIds.length} IDs académicos únicos`);
const repeatedPrompts = [...new Set(questionPrompts.filter((prompt,index)=>questionPrompts.indexOf(prompt)!==index))];
repeatedPrompts.length ? fail(`Enunciados exactamente repetidos: ${repeatedPrompts.length}`) : pass("Sin enunciados exactamente duplicados");

const rm = JSON.parse(fs.readFileSync(path.join(ROOT,"json/quiz-cursos/rm.json"),"utf8"));
const rmQuestions = rm.temas.flatMap(topic=>Object.values(topic.niveles).flat());
const normalizePrompt = text=>text.toLowerCase().replace(/\d+(?:[.,]\d+)?/g,"#").replace(/[a-záéíóúñ]+/g,word=>word.length<3?word:"w").replace(/\s+/g," ").trim();
const rmPatterns = new Set(rmQuestions.map(item=>normalizePrompt(item.pregunta)));
const badRm = rmQuestions.filter(item=>item.alternativas.length!==4 || new Set(item.alternativas).size!==4 || !Number.isInteger(item.respuesta) || item.respuesta<0 || item.respuesta>3);
if (rmQuestions.length!==540) fail(`Banco RM incompleto: ${rmQuestions.length}/540`);
else if (rmPatterns.size<100) fail(`Variedad RM insuficiente: ${rmPatterns.size} patrones normalizados`);
else if (badRm.length) fail(`Banco RM con ${badRm.length} preguntas estructuralmente inválidas`);
else pass(`RM ampliado: 540 preguntas, ${rmPatterns.size} estructuras normalizadas y distractores únicos`);

const admission = JSON.parse(fs.readFileSync(path.join(ROOT,"json/admission-profiles.json"),"utf8"));
const bankCourses = new Set(jsonFiles.filter(file=>file.includes(`${path.sep}quiz-cursos${path.sep}`) && !file.endsWith("PLANTILLA_CURSO.json")).map(file=>path.basename(file,".json")));
const uniSyllabus = JSON.parse(fs.readFileSync(path.join(ROOT,"json/syllabus-uni-2026-2.json"),"utf8"));
const uniReferenceCourses = new Set(uniSyllabus.cursos.map(course=>course.id));
const pendingUniBanks = new Set();
let careerCount = 0;
for (const university of admission.universidades.filter(item=>item.id!=="otra")) {
  const careers = new Set();
  if (!university.fuente) fail(`${university.corto}: falta fuente institucional`);
  for (const group of university.grupos || []) {
    for (const career of group.carreras || []) {
      careerCount++;
      if (careers.has(career)) fail(`${university.corto}: carrera repetida en dos áreas: ${career}`);
      careers.add(career);
    }
    for (const course of group.cursos || []) {
      if (bankCourses.has(course)) continue;
      if (university.id === "uni" && uniReferenceCourses.has(course)) pendingUniBanks.add(course);
      else fail(`${university.corto} ${group.id}: curso sin banco ${course}`);
    }
  }
}
if (!failures.some(item=>/falta fuente institucional|carrera repetida|curso sin banco/.test(item))) pass(`7 universidades, ${careerCount} rutas de carrera y bancos académicos enlazados`);
if (uniSyllabus.cursos.length === 20 && uniReferenceCourses.size === 20) pass(`Ruta UNI aislada: 20 cursos y ${uniSyllabus.cursos.reduce((total,course)=>total+course.temas.length,0)} temas de referencia`);
else fail("Ruta UNI incompleta o con cursos repetidos");
if (pendingUniBanks.size) pass(`UNI conserva ${[...pendingUniBanks].join(", ")} como temario visible con banco marcado en preparación`);

const sql = fs.readFileSync(path.join(ROOT,"SUPABASE_UNIPREP_COMPLETO_2026.sql"),"utf8");
const tables = [...sql.matchAll(/create table if not exists public\.([a-z_]+)/gi)].map(match=>match[1]);
const rls = [...sql.matchAll(/alter table public\.([a-z_]+) enable row level security/gi)].map(match=>match[1]);
const withoutRls = tables.filter(table=>!rls.includes(table));
withoutRls.length ? fail(`Tablas sin RLS: ${withoutRls.join(", ")}`) : pass(`${tables.length} tablas Supabase con RLS declarado`);
if (!/obtener_ranking_uniprep_v2/i.test(sql)) fail("Falta la función consolidada del ranking");
else pass("Función consolidada del ranking presente");

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT,"vercel.json"),"utf8"));
const securityHeaders = JSON.stringify(vercel.headers || []);
const requiredHeaders = ["X-Content-Type-Options","X-Frame-Options","Referrer-Policy","Permissions-Policy"];
const missingHeaders = requiredHeaders.filter(header=>!securityHeaders.includes(header));
missingHeaders.length ? fail(`Cabeceras de seguridad ausentes: ${missingHeaders.join(", ")}`) : pass("Cabeceras de seguridad Vercel presentes");

console.log("UNIPREP NACIONAL 2026.33 · 7,920 PREGUNTAS");
passes.forEach(item=>console.log(`✓ ${item}`));
failures.forEach(item=>console.error(`✗ ${item}`));
console.log(failures.length ? `RESULTADO: REVISAR (${failures.length} incidencias)` : "RESULTADO: VALIDACIÓN TÉCNICA APROBADA");
process.exitCode = failures.length ? 1 : 0;
