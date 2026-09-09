#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const bankPath = path.join(root, "json", "quiz-cursos", "aritmetica.json");
const sourceUrl = "https://drive.google.com/file/d/13UcsKXJv6C0Tm0OJSVC8n119yUZpHYjJ/view";
const sourceName = "ARITMÉTICA_01_ANUAL.pdf · ASEUNI · Razones y series de razones geométricas";

function question(number, prompt, options, answer, solution) {
  // El motor de práctica trabaja con cuatro alternativas. Conservamos la
  // respuesta original y tres distractores, retirando solo el último distractor.
  const correct = options[answer];
  const droppedIndex = options.map((_, index) => index).filter(index => index !== answer).at(-1);
  const compatibleOptions = options.filter((_, index) => index !== droppedIndex);
  return {
    id: `ASEUNI-ARI-RP-${String(number).padStart(2, "0")}`,
    universidadReferencia: "UNI",
    dificultad: "admision",
    tema: "Razones y proporciones",
    subarea: "Matemática",
    competencia: "Modela razones y proporciones en un problema tipo UNI",
    pregunta: prompt,
    alternativas: compatibleOptions,
    respuesta: compatibleOptions.indexOf(correct),
    solucion: solution,
    explicacion: "Se traduce la relación verbal a una proporción, se determina el factor común y se comprueba el resultado en el enunciado.",
    pasosMinimos: 3,
    fuenteReferencia: sourceName,
    fuenteUrl: sourceUrl,
    origenDrive: true,
    alineacionUniversitaria: "Ejercicio del material ASEUNI compartido por el propietario del proyecto; clave recalculada y verificada para la ruta UNI."
  };
}

const imported = [
  question(1, "La razón aritmética de dos números es 15 y la razón geométrica de sus cuadrados es 49/16. Indique el producto de dichos números.", ["420", "350", "700", "210", "140"], 2, "Si x²/y²=49/16, entonces x/y=7/4. Sean x=7k e y=4k. Como x−y=3k=15, k=5; por ello xy=35·20=700."),
  question(2, "La razón aritmética de dos números es 15. Si la razón geométrica es la misma que existe entre 74 y 111, determine el producto de las cifras del número mayor.", ["12", "15", "18", "20", "0"], 3, "74/111=2/3. Sean los números 2k y 3k; su diferencia es k=15. El mayor es 45 y el producto de sus cifras es 4·5=20."),
  question(3, "La razón aritmética de las edades de Juan y Luis es 24 y la razón geométrica es 21/13. Halle la suma de sus edades.", ["100", "102", "204", "68", "170"], 1, "Las edades son 21k y 13k. Su diferencia es 8k=24, de donde k=3. La suma es 34k=102."),
  question(5, "La cantidad de dinero de A es a la de B como 3 es a 4, y la de B es a la de C como 6 es a 5. Si A y C tienen juntos 380 soles, ¿cuántos soles tiene B?", ["192", "240", "144", "96", "288"], 1, "Al igualar la parte de B: A:B:C=9:12:10. Entonces 19k=380, k=20 y B=12k=240."),
  question(6, "La suma y la diferencia de A y B están en la relación de 5 a 2; además, la suma y la diferencia de B y C están en la relación de 7 a 3. Si la mayor diferencia entre dos de ellos es 87, calcule la suma de los tres números.", ["168", "112", "224", "158", "212"], 0, "De (A+B)/(A−B)=5/2 resulta A:B=7:3. De (B+C)/(B−C)=7/3 resulta B:C=5:2. Así, A:B:C=35:15:6. Como 29k=87, k=3 y la suma es 56·3=168."),
  question(7, "La suma, la diferencia y el producto de dos números son entre sí como 13, 3 y 80. Determine la suma de los cuadrados de dichos números.", ["269", "356", "244", "181", "337"], 1, "Sean x+y=13k y x−y=3k; entonces x=8k e y=5k. Como xy=40k²=80k, k=2. Los números son 16 y 10; 16²+10²=356."),
  question(8, "A una fiesta asisten 140 personas entre varones y mujeres, en razón de 4 varones por cada 3 mujeres. Si se retiran 20 parejas, ¿cuál es la razón entre el número de mujeres y de varones que quedan?", ["7/5", "4/5", "5/6", "2/3", "3/5"], 3, "Inicialmente hay 80 varones y 60 mujeres. Al retirarse 20 de cada grupo quedan 60 varones y 40 mujeres; la razón mujeres/varones es 40/60=2/3."),
  question(9, "La semana pasada, la relación entre quienes consumieron carne y pescado fue 2 a 3. Esta semana cambió a 3 a 5. Si cada semana se vendieron 1200 platos, determine la variación en el consumo de carne.", ["Aumentó en 18", "Disminuyó en 26", "Disminuyó en 30", "Disminuyó en 40", "Disminuyó en 50"], 2, "La semana pasada se consumieron (2/5)·1200=480 platos de carne; esta semana, (3/8)·1200=450. El consumo disminuyó en 30."),
  question(10, "Tres grupos de panes tienen cantidades proporcionales a 6, 7 y 11. Se sacan 12 panes del grupo mayor para distribuirlos entre los otros dos hasta que los tres queden iguales. ¿Cuántos panes se pasan al primer grupo?", ["3", "4", "8", "5", "2"], 2, "Las cantidades son 6k, 7k y 11k; el valor común final es el promedio 8k. El tercero entrega 3k=12, por lo que k=4. El primero recibe 2k=8 panes."),
  question(12, "Las cantidades de canicas de tres niños son proporcionales a 4, 7 y 11. Si al agregar 5 canicas a cada cantidad se forma una proporción geométrica continua, ¿cuántas canicas tienen en total inicialmente?", ["22", "44", "66", "88", "90"], 0, "Las cantidades son 4k, 7k y 11k. La continuidad exige (7k+5)²=(4k+5)(11k+5), que se reduce a 5k(k−1)=0. Como k>0, k=1 y el total es 22."),
  question(13, "Hay fichas crema, rojas y negras. Por cada 2 crema hay 3 rojas y por cada 2 rojas hay 3 negras. Si las negras exceden a las rojas en 15, ¿en cuánto exceden las negras a las crema?", ["49", "35", "12", "25", "20"], 3, "Las cantidades pueden escribirse como 4k, 6k y 9k. Como 9k−6k=15, k=5. La diferencia entre negras y crema es 5k=25."),
  question(14, "Las edades de dos personas están en razón 3 a 5. Hace n años estaban en razón 1 a 2 y dentro de m años estarán en razón 8 a 13. Calcule n/m.", ["7/3", "2/3", "3", "5", "1/3"], 3, "Sean las edades 3k y 5k. De (3k−n)/(5k−n)=1/2 se obtiene n=k. De (3k+m)/(5k+m)=8/13 se obtiene m=k/5. Por tanto n/m=5."),
  question(16, "Una moción fue votada por 120 congresistas y perdió por 18 votos. En una segunda votación ganó, quedando los votos a favor y en contra en razón 5 a 3. ¿Cuántos congresistas cambiaron de opinión?", ["22", "24", "25", "16", "20"], 1, "En la primera votación hubo 51 votos a favor y 69 en contra. En la segunda, la razón 5:3 sobre 120 da 75 a favor y 45 en contra. Cambiaron 75−51=24 congresistas."),
  question(17, "En un proceso de admisión UNI, la razón vacantes/postulantes es 3/10. Si se agregan 400 postulantes, la razón pasa a 2/15. ¿Cuántas vacantes deben aumentarse para que, al agregarse 910 postulantes al grupo original, no ingresen 13 de cada 15 postulantes?", ["81", "72", "69", "64", "68"], 4, "Sean V=3k y P=10k. La condición 3k/(10k+400)=2/15 da k=32; entonces V=96 y P=320. Con 910 postulantes adicionales hay 1230. Si ingresan 2 de cada 15, se requieren 164 vacantes; el aumento es 164−96=68."),
  question(18, "Una caja contiene 15 fichas blancas y 12 rojas. ¿Cuántas fichas blancas deben agregarse para que la razón entre blancas y rojas sea 3 a 2?", ["3", "4", "5", "6", "7"], 0, "Se plantea (15+x)/12=3/2. Entonces 15+x=18 y x=3.")
];

const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const topic = bank.temas.find(item => item.titulo === "Razones y proporciones");
if (!topic) throw new Error("No se encontró el tema Razones y proporciones.");

const ids = new Set(imported.map(item => item.id));
topic.niveles.admision = (topic.niveles.admision || []).filter(item => !ids.has(item.id)).concat(imported);
for (const level of ["basico", "intermedio", "avanzado", "admision"]) {
  topic.distribucion[level] = topic.niveles[level]?.length || 0;
}
topic.distribucion.total = Object.values(topic.niveles).reduce((sum, list) => sum + list.length, 0);
bank.total = bank.temas.reduce((sum, item) => sum + Object.values(item.niveles || {}).reduce((n, list) => n + list.length, 0), 0);
bank.distribucion = ["basico", "intermedio", "avanzado", "admision"].reduce((out, level) => {
  out[level] = bank.temas.reduce((sum, item) => sum + (item.niveles?.[level]?.length || 0), 0);
  return out;
}, {});
bank.distribucion.total = bank.total;
bank.version = "2026.39-aseuni-drive-curado";
bank.fuentesImportadas = [
  ...(bank.fuentesImportadas || []).filter(item => item.url !== sourceUrl),
  {nombre: sourceName, url: sourceUrl, preguntasIncorporadas: imported.length, preguntasDescartadas: 15, criterio: "Solo enunciados legibles, consistentes y con clave recalculada."}
];

fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2) + "\n");
console.log(JSON.stringify({curso: bank.nombre, tema: topic.titulo, importadas: imported.length, totalTema: topic.distribucion.total, totalCurso: bank.total}));
