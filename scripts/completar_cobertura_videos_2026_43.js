#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const VIDEOS_FILE = path.join(ROOT, "json", "videos-cursos.json");
const UNI_FILE = path.join(ROOT, "json", "syllabus-uni-2026-2.json");

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function youtubeSearch(course, topic, university) {
  const query = `${course} ${topic} clase preuniversitaria ${university === "UNI" ? "UNI Perú" : "admisión Perú"}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function loadGeneralSyllabus() {
  const source = fs.readFileSync(path.join(ROOT, "js", "syllabus-unamad.js"), "utf8");
  const context = {window:{}};
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.TEMARIO_UNAMAD || {};
}

const data = JSON.parse(fs.readFileSync(VIDEOS_FILE, "utf8"));
data.videos = Array.isArray(data.videos) ? data.videos : [];
// Permite regenerar el archivo sin acumular recursos automáticos.
data.videos = data.videos.filter(video => video.origen !== "cobertura-automatica-2026.43" && String(video.url || "").trim());

const general = loadGeneralSyllabus();
const uni = JSON.parse(fs.readFileSync(UNI_FILE, "utf8"));
const courseNames = new Map();
for (const [courseId, course] of Object.entries(general)) courseNames.set(courseId, course.nombre || courseId);
for (const course of uni.cursos || []) courseNames.set(course.id, course.nombre || course.id);

function supports(video, sigla) {
  const universities = Array.isArray(video.universidades) ? video.universidades.map(item=>String(item).toUpperCase()) : [];
  if (!universities.length) return sigla !== "UNI";
  return universities.includes(sigla) || universities.includes("TODAS");
}

function hasGeneralVideo(courseId, topicIndex) {
  return data.videos.some(video => video.courseId === courseId && String(video.url || "").trim() && supports(video, "GENERAL") && Number(video.temaIndice) === Number(topicIndex));
}

function hasUniVideo(courseId, topicTitle) {
  return data.videos.some(video => video.courseId === courseId && String(video.url || "").trim() && supports(video, "UNI") && normalize(video.temaTitulo || video.titulo) === normalize(topicTitle));
}

let addedGeneral = 0;
let addedUni = 0;

for (const [courseId, course] of Object.entries(general)) {
  (course.temas || []).forEach((topic, topicIndex) => {
    if (hasGeneralVideo(courseId, topicIndex)) return;
    data.videos.push({
      courseId,
      temaIndice:topicIndex,
      temaTitulo:topic.titulo,
      titulo:`Videoclases sobre ${topic.titulo}`,
      url:youtubeSearch(course.nombre || courseId, topic.titulo, "GENERAL"),
      tipo:"busqueda_guiada",
      universidades:["TODAS"],
      origen:"cobertura-automatica-2026.43",
      nota:"Búsqueda temática externa; el estudiante selecciona la clase disponible."
    });
    addedGeneral++;
  });
}

for (const course of uni.cursos || []) {
  (course.temas || []).forEach((topicTitle, topicIndex) => {
    if (hasUniVideo(course.id, topicTitle)) return;
    data.videos.push({
      courseId:course.id,
      temaIndice:topicIndex,
      temaTitulo:topicTitle,
      titulo:`Videoclases UNI sobre ${topicTitle}`,
      url:youtubeSearch(course.nombre || course.id, topicTitle, "UNI"),
      tipo:"busqueda_guiada",
      universidades:["UNI"],
      origen:"cobertura-automatica-2026.43",
      nota:"Búsqueda temática externa; el estudiante selecciona la clase disponible."
    });
    addedUni++;
  });
}

data.version = "2026.43-cobertura-audiovisual-total";
data.instrucciones = "Las videoclases se vinculan por curso y tema. Los enlaces directos de YouTube o Drive se reproducen dentro de UniPrep; cuando no existe un video directo verificado, se ofrece una búsqueda exacta por tema en YouTube sin mezclar materias.";
data.cobertura = {
  rutas:["GENERAL","UNI"],
  temasGenerales:Object.values(general).reduce((sum,course)=>sum+(course.temas || []).length,0),
  temasUni:(uni.cursos || []).reduce((sum,course)=>sum+(course.temas || []).length,0),
  enlacesDirectos:data.videos.filter(video=>video.tipo!=="busqueda_guiada" && String(video.url || "").trim()).length,
  busquedasGuiadas:data.videos.filter(video=>video.tipo==="busqueda_guiada").length,
  totalRegistros:data.videos.filter(video=>String(video.url || "").trim()).length
};

fs.writeFileSync(VIDEOS_FILE, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify({addedGeneral, addedUni, ...data.cobertura}, null, 2));
