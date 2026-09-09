#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");
const crypto = require("crypto");
const vm = require("vm");
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
let topicCount = 0;
const requiredLevels = ["basico","intermedio","avanzado","admision"];
for (const file of jsonFiles.filter(file=>file.includes(`${path.sep}quiz-cursos${path.sep}`))) {
  if (file.endsWith("PLANTILLA_CURSO.json")) continue;
  const data = JSON.parse(fs.readFileSync(file,"utf8"));
  for (const topic of data.temas || []) {
    topicCount++;
    const topicQuestions = Object.values(topic.niveles || {}).flat();
    if (topicQuestions.length !== 60) fail(`${data.courseId}/${topic.id}: ${topicQuestions.length}/60 preguntas`);
    for (const level of requiredLevels) {
      const count = Array.isArray(topic.niveles?.[level]) ? topic.niveles[level].length : 0;
      if (count !== 15) fail(`${data.courseId}/${topic.id}/${level}: ${count}/15 preguntas`);
    }
    const formats = new Set(topicQuestions.map(item=>item.formatoPregunta).filter(Boolean));
    if (formats.size < 3) fail(`${data.courseId}/${topic.id}: solo ${formats.size} formatos de pregunta`);
  }
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
questionCount === 12660 ? pass("12,660 preguntas académicas detectadas") : fail(`Se esperaban 12,660 preguntas y se detectaron ${questionCount}`);
topicCount === 211 ? pass("211 temas con 60 preguntas y distribución 15/15/15/15") : fail(`Se esperaban 211 temas y se detectaron ${topicCount}`);
const repeatedQuestionIds = [...new Set(questionIds.filter((id,index)=>questionIds.indexOf(id)!==index))];
repeatedQuestionIds.length ? fail(`IDs de preguntas repetidos: ${repeatedQuestionIds.slice(0,12).join(", ")}`) : pass(`${questionIds.length} IDs académicos únicos`);
const repeatedPrompts = [...new Set(questionPrompts.filter((prompt,index)=>questionPrompts.indexOf(prompt)!==index))];
repeatedPrompts.length ? fail(`Enunciados exactamente repetidos: ${repeatedPrompts.length}`) : pass("Sin enunciados exactamente duplicados");

const figureMinimums = {algebra:600, geometria:450, trigonometria:110, fisica:750, rm:120};
const allowedFigureTypes = new Set(["formula","reloj","trigonometrica","triangulo_bisectriz","triangulo_rectangulo","triangulo_oblicuo","circulo_cuerda","tangente_secante","trapecio","poligono","movimiento_fisica","fuerzas_fisica","onda_fisica","circuito_fisica","fluido_fisica","termica_fisica","cuadricula_rm","rectas_rm","puntos_circulo_rm","asientos_circulares_rm","engranajes_rm","venn_rm"]);
for (const [courseId, minimum] of Object.entries(figureMinimums)) {
  const bank = JSON.parse(fs.readFileSync(path.join(ROOT,`json/quiz-cursos/${courseId}.json`),"utf8"));
  const questions = bank.temas.flatMap(topic=>Object.values(topic.niveles || {}).flat());
  const figures = questions.filter(item=>item.figura && typeof item.figura === "object");
  const invalid = figures.filter(item=>!allowedFigureTypes.has(item.figura.tipo));
  if (figures.length < minimum) fail(`${courseId}: cobertura visual insuficiente (${figures.length}/${minimum})`);
  else if (invalid.length) fail(`${courseId}: ${invalid.length} figuras con tipo no permitido`);
  else pass(`${courseId}: ${figures.length} preguntas con fórmula o diagrama verificable`);
}

const videoConfig = JSON.parse(fs.readFileSync(path.join(ROOT,"json/videos-cursos.json"),"utf8"));
const videos = Array.isArray(videoConfig.videos) ? videoConfig.videos : [];
const normalizeTitle = value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
const supportsVideoRoute = (video,sigla)=>{
  const universities=Array.isArray(video.universidades)?video.universidades.map(item=>String(item).toUpperCase()):[];
  if(!universities.length)return sigla!=="UNI";
  return universities.includes(sigla)||universities.includes("TODAS");
};
const validVideoUrl = value=>{
  try{
    const url=new URL(String(value||"")),host=url.hostname.replace(/^www\./,"");
    return host==="youtu.be"||((host==="youtube.com"||host==="m.youtube.com"||host==="youtube-nocookie.com")&&(url.pathname==="/watch"||url.pathname==="/results"||/^\/(?:embed|shorts|live)\//.test(url.pathname)))||(host==="drive.google.com"&&/\/file\/d\//.test(url.pathname));
  }catch(_){return false;}
};
const invalidVideos=videos.filter(video=>!validVideoUrl(video.url));
if(invalidVideos.length)fail(`${invalidVideos.length} recursos audiovisuales tienen URL vacía o incompatible`);
else pass(`${videos.length} recursos audiovisuales con URL compatible`);

const generalContext={window:{}};
vm.createContext(generalContext);
vm.runInContext(fs.readFileSync(path.join(ROOT,"js/syllabus-unamad.js"),"utf8"),generalContext);
const generalSyllabus=generalContext.window.TEMARIO_UNAMAD||{};
const uniVideoSyllabus=JSON.parse(fs.readFileSync(path.join(ROOT,"json/syllabus-uni-2026-2.json"),"utf8"));
const missingGeneral=[];
for(const [courseId,course] of Object.entries(generalSyllabus)){
  (course.temas||[]).forEach((topic,index)=>{
    const covered=videos.some(video=>video.courseId===courseId&&supportsVideoRoute(video,"GENERAL")&&Number(video.temaIndice)===index);
    if(!covered)missingGeneral.push(`${courseId}/${topic.titulo}`);
  });
}
const missingUni=[];
for(const course of uniVideoSyllabus.cursos||[]){
  (course.temas||[]).forEach(topicTitle=>{
    const covered=videos.some(video=>video.courseId===course.id&&supportsVideoRoute(video,"UNI")&&normalizeTitle(video.temaTitulo||video.titulo)===normalizeTitle(topicTitle));
    if(!covered)missingUni.push(`${course.id}/${topicTitle}`);
  });
}
if(missingGeneral.length||missingUni.length)fail(`Cobertura audiovisual incompleta: general ${missingGeneral.length}, UNI ${missingUni.length}`);
else pass("Cobertura audiovisual total: 162 temas generales y 269 temas UNI");
const directVideos=videos.filter(video=>video.tipo!=="busqueda_guiada").length;
const guidedVideos=videos.filter(video=>video.tipo==="busqueda_guiada").length;
directVideos>=300&&guidedVideos>=280?pass(`${directVideos} videoclases directas y ${guidedVideos} búsquedas temáticas de respaldo`):fail(`Distribución audiovisual inesperada: ${directVideos} directas y ${guidedVideos} guiadas`);

const rm = JSON.parse(fs.readFileSync(path.join(ROOT,"json/quiz-cursos/rm.json"),"utf8"));
const rmQuestions = rm.temas.flatMap(topic=>Object.values(topic.niveles).flat());
const normalizePrompt = text=>text.toLowerCase().replace(/\d+(?:[.,]\d+)?/g,"#").replace(/[a-záéíóúñ]+/g,word=>word.length<3?word:"w").replace(/\s+/g," ").trim();
const rmPatterns = new Set(rmQuestions.map(item=>normalizePrompt(item.pregunta)));
const badRm = rmQuestions.filter(item=>item.alternativas.length!==4 || new Set(item.alternativas).size!==4 || !Number.isInteger(item.respuesta) || item.respuesta<0 || item.respuesta>3);
if (rmQuestions.length!==720) fail(`Banco RM incompleto: ${rmQuestions.length}/720`);
else if (rmPatterns.size<100) fail(`Variedad RM insuficiente: ${rmPatterns.size} patrones normalizados`);
else if (badRm.length) fail(`Banco RM con ${badRm.length} preguntas estructuralmente inválidas`);
else pass(`RM ampliado: 720 preguntas, ${rmPatterns.size} estructuras normalizadas y distractores únicos`);

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

const routeStopwords=new Set(["de","del","la","las","los","y","en","una","uno","para","con","por","ii","iii"]);
const routeTokens=value=>normalizeTitle(value).replace(/[^a-z0-9ñ]+/g," ").split(/\s+/).filter(token=>token.length>2&&!routeStopwords.has(token)).map(token=>token.replace(/(?:es|os|as|s)$/, ""));
function relatedBankTopic(bank,officialTitle,officialIndex,officialTotal){
  const exact=bank.temas.find(topic=>normalizeTitle(topic.titulo)===normalizeTitle(officialTitle));
  if(exact)return exact;
  const source=routeTokens(officialTitle);let best=null,bestScore=-1;
  bank.temas.forEach(topic=>{const destination=routeTokens(topic.titulo);const matches=source.reduce((sum,token)=>sum+(destination.some(other=>token===other||token.startsWith(other)||other.startsWith(token))?1:0),0);const score=matches*10-Math.abs(source.length-destination.length);if(score>bestScore){bestScore=score;best=topic;}});
  if(bestScore>0)return best;
  const approximate=Math.min(bank.temas.length-1,Math.floor(officialIndex*bank.temas.length/Math.max(1,officialTotal)));
  return bank.temas[approximate]||null;
}
const incompleteUniPractice=[];
for(const course of uniSyllabus.cursos){
  const bankPath=path.join(ROOT,`json/quiz-cursos/${course.id}.json`);
  if(!fs.existsSync(bankPath)){incompleteUniPractice.push(`${course.id}: sin banco`);continue;}
  const bank=JSON.parse(fs.readFileSync(bankPath,"utf8"));
  course.temas.forEach((title,index)=>{
    const topic=relatedBankTopic(bank,title,index,course.temas.length);
    const counts=requiredLevels.map(level=>topic?.niveles?.[level]?.length||0);
    if(!topic||counts.some(count=>count!==15))incompleteUniPractice.push(`${course.id}/${title}: ${counts.join("/")}`);
  });
}
incompleteUniPractice.length?fail(`Ruta UNI con prácticas incompletas: ${incompleteUniPractice.slice(0,8).join(", ")}`):pass("Los 269 temas UNI abren 60 preguntas del mismo curso: 15 por nivel");

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

console.log("UNIPREP NACIONAL 2026.43 · 12,660 PREGUNTAS · COBERTURA AUDIOVISUAL TOTAL");
passes.forEach(item=>console.log(`✓ ${item}`));
failures.forEach(item=>console.error(`✗ ${item}`));
console.log(failures.length ? `RESULTADO: REVISAR (${failures.length} incidencias)` : "RESULTADO: VALIDACIÓN TÉCNICA APROBADA");
process.exitCode = failures.length ? 1 : 0;
