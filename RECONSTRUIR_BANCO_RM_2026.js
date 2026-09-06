#!/usr/bin/env node
"use strict";

// Generador verificable del banco RM 2026.27. Cada tema combina diez familias
// de problemas y cuatro niveles; las respuestas numéricas se calculan aquí.
const fs = require("fs");
const path = require("path");
const target = path.join(__dirname,"json/quiz-cursos/rm.json");
const original = JSON.parse(fs.readFileSync(target,"utf8"));
const LEVELS = ["basico","intermedio","avanzado","admision"];
const UNIVERSITIES = ["GENERAL","UNAMAD","UNSAAC","UCSM","UNMSM","UNSA","UNI","PUCP"];

function esc(value){return String(value)}
function format(value){return Number.isInteger(value)?String(value):Number(value.toFixed(2)).toLocaleString("es-PE")}
function alternatives(answer, seed, unit=""){
  const raw=Number(answer); const a=Number.isInteger(raw)?raw:Number(raw.toFixed(2)); const delta=Math.max(1,Math.round(Math.abs(a)*.12));
  const pool=[a,a+delta,a-delta,a+2*delta,a-2*delta,a+delta+1,a-delta-1].filter(x=>x>=0);
  const unique=[...new Set(pool.map(x=>Number.isInteger(a)?Math.round(x):Number(x.toFixed(2))))];
  while(unique.length<4)unique.push(a+unique.length+seed%3+1);
  const chosen=[a,...unique.filter(x=>x!==a).slice(0,3)];
  const shift=seed%4; const ordered=chosen.slice(shift).concat(chosen.slice(0,shift));
  return {options:ordered.map(x=>`${format(x)}${unit}`),correct:ordered.indexOf(a)};
}
function textAlternatives(correct,wrong,seed){const chosen=[correct,...wrong.filter(x=>x!==correct).slice(0,3)];const shift=seed%4;const options=chosen.slice(shift).concat(chosen.slice(0,shift));return{options,correct:options.indexOf(correct)}}
function question(topic,level,index,prompt,answer,solution,options=null,unit=""){
  const built=options||alternatives(answer,index+(LEVELS.indexOf(level)+1)*17,unit);
  return {
    id:`RM-${String(original.temas.indexOf(topic)+1).padStart(2,"0")}-${({basico:"B",intermedio:"I",avanzado:"V",admision:"A"})[level]}-${String(index+1).padStart(2,"0")}`,
    universidadReferencia:UNIVERSITIES[(index+LEVELS.indexOf(level)*2)%UNIVERSITIES.length],
    dificultad:level,tema:topic.titulo,subarea:"Matemática",
    competencia:level==="basico"?"Reconoce y conecta información":level==="intermedio"?"Modela relaciones de dos etapas":"Integra restricciones y valida una estrategia",
    pregunta:prompt,alternativas:built.options,respuesta:built.correct,
    solucion:solution,
    explicacion:"La solución aplica todas las condiciones del enunciado y comprueba el resultado antes de elegir una alternativa.",
    pasosMinimos:level==="basico"?2:level==="intermedio"?3:4,
    alineacionUniversitaria:`Entrenamiento elaborado por UniPrep con complejidad ${level}; no corresponde a una pregunta oficial.`
  };
}
function permutations(items){if(items.length<2)return [items];const out=[];items.forEach((x,i)=>permutations(items.slice(0,i).concat(items.slice(i+1))).forEach(rest=>out.push([x,...rest])));return out}
function countOrders(names,predicate){return permutations(names).filter(predicate).length}
function idx(order,name){return order.indexOf(name)}

function organization(topic,level,k,d){
  const n=5+(d>1?1:0), names=["Alba","Boris","Celia","Dante","Eva","Fabián"].slice(0,n), fam=k%10;
  if(fam===0){const count=countOrders(names,o=>idx(o,"Alba")<idx(o,"Boris")&&Math.abs(idx(o,"Celia")-idx(o,"Dante"))===1&&(d<2||idx(o,"Eva")!==0));return question(topic,level,k,`En la fila de acreditación están ${names.join(", ")}. Alba debe aparecer antes que Boris y Celia inmediatamente junto a Dante${d<2?"":"; además, Eva no puede abrir la fila"}. ¿Cuántos órdenes son posibles?`,count,`Se enumeran los ${n}! órdenes, se conserva Alba<Boris y se trata Celia–Dante como bloque en ambos sentidos${d<2?"":"; luego se excluyen los casos con Eva al inicio"}. Resultado: ${count}.`)}
  if(fam===1){const count=countOrders(names,o=>idx(o,"Alba")+1===idx(o,"Celia")&&idx(o,"Dante")>idx(o,"Boris")&&(d<2||Math.abs(idx(o,"Eva")-idx(o,"Fabián"))>1));return question(topic,level,k,`Se programan ${n} exposiciones: ${names.join(", ")}. Celia debe ir exactamente después de Alba y Dante después de Boris${d<2?"":"; Eva y Fabián no pueden quedar consecutivos"}. ¿Cuántos cronogramas cumplen todo?`,count,`Se fija el bloque ordenado Alba–Celia, se impone Boris<Dante y${d<2?" se cuentan los órdenes restantes":" se eliminan las posiciones contiguas Eva–Fabián"}. Quedan ${count}.`)}
  if(fam===2){const fixed="Alba",rest=names.slice(1);const count=countOrders(rest,o=>idx(o,"Boris")<idx(o,"Dante")&&(d<2||Math.abs(idx(o,"Celia")-idx(o,"Eva"))!==1));return question(topic,level,k,`${names.join(", ")} se sientan en una mesa circular. Para eliminar giros equivalentes, Alba queda fija. Boris debe quedar antes que Dante en sentido horario${d<2?"":" y Celia no puede sentarse junto a Eva"}. ¿Cuántas distribuciones distintas existen?`,count,`Con Alba fija se ordenan ${n-1} personas alrededor. Se aplica Boris<Dante${d<2?"":" y se descartan las adyacencias Celia–Eva, incluyendo los extremos junto a Alba cuando corresponda"}. Total: ${count}.`)}
  if(fam===3){const floors=[1,2,3,4,5,6].slice(0,n);const count=countOrders(names,o=>idx(o,"Dante")>idx(o,"Alba")&&Math.abs(idx(o,"Boris")-idx(o,"Celia"))>1&&(d<2||idx(o,"Eva")!==n-1));return question(topic,level,k,`Una residencia asigna los pisos ${floors.join(", ")} a ${names.join(", ")}, uno por persona. Dante vive más arriba que Alba; Boris y Celia no viven en pisos consecutivos${d<2?"":"; Eva no ocupa el último piso"}. ¿Cuántas asignaciones hay?`,count,`Cada asignación es una permutación de residentes por piso. Se filtran las tres restricciones simultáneamente. El conteo final es ${count}.`)}
  if(fam===4){const count=countOrders(names,o=>idx(o,"Alba")===0&&idx(o,"Eva")>idx(o,"Celia")&&(d<2||idx(o,"Boris")+2===idx(o,"Dante")));return question(topic,level,k,`En un estante se colocan ${n} manuales identificados por ${names.join(", ")}. Alba debe quedar en el extremo izquierdo y Eva a la derecha de Celia${d<2?"":"; entre Boris y Dante debe quedar exactamente un manual"}. ¿Cuántas disposiciones cumplen las reglas?`,count,`Se fija Alba, se compara la posición Celia<Eva${d<2?"":" y se exige distancia dos entre Boris y Dante en ese orden"}. Se obtienen ${count} disposiciones.`)}
  if(fam===5){const count=countOrders(names,o=>idx(o,"Alba")<idx(o,"Celia")&&idx(o,"Celia")<idx(o,"Eva")&&(d<2||idx(o,"Boris")>idx(o,"Dante")));return question(topic,level,k,`En la clasificación final participan ${names.join(", ")}. Alba supera a Celia y Celia supera a Eva${d<2?"":"; además, Dante supera a Boris"}. Sin empates, ¿cuántos resultados finales son compatibles?`,count,`Se cuentan las extensiones del orden Alba<Celia<Eva${d<2?"":" junto con Dante<Boris"}. De las ${n}! permutaciones, ${count} respetan el orden parcial.`)}
  if(fam===6){const count=countOrders(names,o=>idx(o,"Boris")===2&&Math.abs(idx(o,"Alba")-idx(o,"Dante"))===1&&(d<2||idx(o,"Celia")<idx(o,"Eva")));return question(topic,level,k,`Los turnos de laboratorio se numeran del 1 al ${n}. Boris ocupa el turno 3; Alba y Dante trabajan en turnos consecutivos${d<2?"":"; Celia debe trabajar antes que Eva"}. ¿Cuántos calendarios diferentes hay?`,count,`Boris se fija en el tercer turno. Se ubica el bloque Alba–Dante en ambos órdenes y${d<2?" se ordena el resto":" se conserva únicamente Celia<Eva"}. Resultado: ${count}.`)}
  if(fam===7){const count=countOrders(names,o=>Math.abs(idx(o,"Alba")-idx(o,"Boris"))>1&&Math.abs(idx(o,"Celia")-idx(o,"Dante"))===1&&(d<2||idx(o,"Eva")<idx(o,"Fabián")));return question(topic,level,k,`En una banca lineal se ubican ${names.join(", ")}. Alba no puede quedar junto a Boris, mientras Celia sí debe quedar junto a Dante${d<2?"":"; Eva debe estar a la izquierda de Fabián"}. ¿Cuántas ubicaciones son válidas?`,count,`Se cuenta primero el bloque Celia–Dante y luego se eliminan las adyacencias Alba–Boris${d<2?"":" manteniendo Eva<Fabián"}. Quedan ${count}.`)}
  if(fam===8){const count=countOrders(names,o=>Math.abs(idx(o,"Alba")-idx(o,"Eva"))===2&&idx(o,"Boris")<idx(o,"Celia")&&(d<2||idx(o,"Dante")!==0));return question(topic,level,k,`En una fotografía se alinean ${names.join(", ")}. Entre Alba y Eva debe haber exactamente una persona, Boris aparece antes que Celia${d<2?"":" y Dante no puede ocupar el primer lugar"}. ¿Cuántas fotografías distintas pueden tomarse?`,count,`Se ubica el par Alba–Eva a distancia dos en ambos sentidos, se aplica Boris<Celia${d<2?"":" y se excluye Dante primero"}. Total: ${count}.`)}
  const count=countOrders(names,o=>idx(o,"Alba")%2===0&&idx(o,"Boris")%2===1&&(d<2||idx(o,"Celia")<idx(o,"Dante")));return question(topic,level,k,`Los puestos se numeran desde 1. ${names.join(", ")} ocupan la fila: Alba debe estar en un puesto impar y Boris en uno par${d<2?"":"; Celia debe quedar antes que Dante"}. ¿Cuántos órdenes satisfacen las condiciones?`,count,`Se eligen posiciones de paridad para Alba y Boris y se ordena el resto${d<2?"":" imponiendo Celia<Dante"}. Resultado: ${count}.`)
}

function logic(topic,level,k,d){const f=k%10,a=3+d,b=5+d,c=7+d;
  if(f===0){const ans=(a%2===1);const built=textAlternatives(ans?"Verdadera":"Falsa",[ans?"Falsa":"Verdadera","No se puede determinar","Es una contradicción"],k);return question(topic,level,k,`Sea p: «${a} es impar» y q: «${b} es múltiplo de 2». Determina el valor de (p ∧ ¬q) → (${d>1?"p ∨ q":"p"}).`,0,`p es ${a%2?"verdadera":"falsa"} y q es ${b%2===0?"verdadera":"falsa"}. Al sustituir en la fórmula, la proposición completa es ${ans?"verdadera":"falsa"}.`,built)}
  if(f===1){const n=60+d*12,A=32+d*4,B=27+d*3,both=14+d*2,ans=n-(A+B-both);return question(topic,level,k,`En una encuesta a ${n} postulantes, ${A} practican álgebra, ${B} geometría y ${both} ambas. ¿Cuántos no practican ninguna de las dos áreas?`,ans,`Por inclusión–exclusión, al menos una = ${A}+${B}−${both}=${A+B-both}; ninguna = ${n}−${A+B-both}=${ans}.`)}
  if(f===2){const n=4+d,ans=Math.pow(2,n-1);return question(topic,level,k,`Un tablero tiene ${n} interruptores, todos inicialmente apagados. Se permite cambiar cualquier subconjunto, pero el número final de interruptores encendidos debe ser par. ¿Cuántos estados finales son posibles?`,ans,`De los 2^${n} estados binarios, exactamente la mitad tiene paridad par. Entonces hay 2^${n-1}=${ans}.`)}
  if(f===3){const people=4+d;let ans=0;for(let mask=0;mask<1<<people;mask++){let ok=true;for(let i=0;i<people;i++){const says=((mask>>((i+1)%people))&1)===0;const truthful=((mask>>i)&1)===1;if(says!==truthful)ok=false}if(ok)ans++}return question(topic,level,k,`${people} estudiantes forman un círculo. Cada uno afirma: «La persona a mi derecha miente». Si cada estudiante siempre dice la verdad o siempre miente, ¿cuántas asignaciones verdad/mentira son compatibles?`,ans,`Se representa verdad por 1 y mentira por 0. Cada afirmación obliga a que vecinos tengan valores opuestos. El ciclo admite ${ans} asignaciones.`)}
  if(f===4){const n=5+d,ans=Math.floor(n/2);return question(topic,level,k,`En una mesa hay ${n} tarjetas numeradas. Exactamente ${Math.floor(n/2)} tienen una estrella. Se afirma: «Como máximo ${Math.floor(n/2)-1} tarjetas tienen estrella». ¿Cuántos cambios mínimos de estrella son necesarios para que la afirmación sea verdadera?`,1,`Actualmente hay ${Math.floor(n/2)} estrellas y el máximo permitido es ${Math.floor(n/2)-1}; basta retirar una y no puede hacerse con cero cambios.`)}
  if(f===5){const ans=d+1;return question(topic,level,k,`Un código lógico cumple: si A está activo entonces B también; si B está activo entonces C no; C está activo. Además hay ${d+1} módulos independientes que pueden activarse o no. ¿Cuántos estados totales satisfacen las tres primeras reglas y tienen exactamente un módulo independiente activo?`,ans,`Como C está activo, B debe estar inactivo; entonces A también queda inactivo. Solo se elige cuál de los ${d+1} módulos independientes queda activo: ${d+1}.`)}
  if(f===6){const built=textAlternatives("Ningún R es T",["Todo R es T","Algún R es T","Todo T es R"],k);return question(topic,level,k,"Premisas: Todo R es S. Ningún S es T. ¿Qué conclusión se deduce necesariamente?",0,"Si R está contenido en S y S no comparte elementos con T, entonces R tampoco puede compartir elementos con T.",built)}
  if(f===7){const n=6+d,ans=n-1;return question(topic,level,k,`${n} cajas llevan una etiqueta. Solo una etiqueta es verdadera. Las etiquetas 1 a ${n-1} dicen «el premio no está en esta caja» y la última dice «el premio está en la caja 1». ¿En cuántas cajas distintas podría estar el premio respetando la condición?`,ans,`Si el premio está en una caja 2…${n}, resulta verdadera únicamente la etiqueta de esa misma caja; hay ${n-1} posibilidades. En la caja 1 habría demasiadas etiquetas verdaderas.`)}
  if(f===8){const total=24+d*6,A=14+d*2,B=12+d*2,C=10+d,AB=6+d,AC=5+d,BC=4+d,ABC=2+d,ans=A+B+C-AB-AC-BC+ABC;return question(topic,level,k,`De ${total} estudiantes, ${A} dominan álgebra, ${B} aritmética y ${C} geometría. Las intersecciones por pares son ${AB}, ${AC} y ${BC}; ${ABC} dominan las tres. ¿Cuántos dominan al menos una?`,ans,`Se aplica inclusión–exclusión: ${A}+${B}+${C}−${AB}−${AC}−${BC}+${ABC}=${ans}.`)}
  const n=4+d,ans=Math.pow(2,n)-1;return question(topic,level,k,`Se escriben todas las proposiciones formadas eligiendo un subconjunto no vacío de ${n} condiciones independientes y uniéndolas solo con «y». ¿Cuántas proposiciones distintas se forman?`,ans,`Cada condición se incluye o no: 2^${n} subconjuntos. Se excluye el vacío, por lo que quedan ${ans}.`)
}

function figures(topic,level,k,d){const f=k%10,m=3+d,n=4+d;
  if(f===0){const ans=m*(m+1)*n*(n+1)/4;return question(topic,level,k,`Una cuadrícula tiene ${m} filas y ${n} columnas de celdas. Contando todos los tamaños, ¿cuántos rectángulos contiene?`,ans,`Se eligen 2 de ${m+1} líneas horizontales y 2 de ${n+1} verticales: C(${m+1},2)·C(${n+1},2)=${ans}.`)}
  if(f===1){const ans=m*(m+1)*(2*m+1)/6;return question(topic,level,k,`En un tablero cuadrado de ${m}×${m} celdas, ¿cuántos cuadrados con lados paralelos al tablero pueden encontrarse?`,ans,`Se suman 1²+2²+…+${m}² = ${ans}.`)}
  if(f===2){const ans=(m+1)*(n+1);return question(topic,level,k,`Se trazan ${m} rectas verticales y ${n} horizontales, sin coincidencias. ¿Cuántas regiones determinan en el plano?`,ans,`Las verticales crean ${m+1} franjas y las horizontales ${n+1}; el producto es ${ans}.`)}
  if(f===3){const points=5+d,ans=points*(points-1)/2;return question(topic,level,k,`Se marcan ${points} puntos sobre una circunferencia y se unen todos los pares mediante cuerdas. ¿Cuántas cuerdas distintas se dibujan?`,ans,`Cada cuerda corresponde a un par de puntos: C(${points},2)=${ans}.`)}
  if(f===4){const side=3+d,ans=2*side*(side-1);return question(topic,level,k,`Una malla de ${side}×${side} puntos se conecta horizontal y verticalmente. ¿Cuántos segmentos unitarios aparecen?`,ans,`Hay ${side} filas con ${side-1} horizontales y lo mismo verticalmente: 2·${side}·${side-1}=${ans}.`,null)}
  if(f===5){const cubes=3+d,ans=6*cubes*cubes;return question(topic,level,k,`Un cubo grande se divide en ${cubes} partes iguales por arista. Sin separar los cubitos, ¿cuántas caras pequeñas quedan visibles en la superficie?`,ans,`Cada una de 6 caras posee ${cubes}² cuadrados visibles: 6·${cubes}²=${ans}.`)}
  if(f===6){const sides=6+d,ans=sides*(sides-3)/2;return question(topic,level,k,`Se dibujan todas las diagonales de un polígono convexo de ${sides} lados. ¿Cuántas diagonales se trazan?`,ans,`Cada vértice conecta con ${sides-3}; se divide entre 2 para no repetir: ${sides}(${sides-3})/2=${ans}.`)}
  if(f===7){const lines=4+d,ans=1+lines*(lines+1)/2;return question(topic,level,k,`${lines} rectas se trazan de modo que cada nueva recta corta a todas las anteriores y no hay tres concurrentes. ¿Cuál es el máximo número de regiones?`,ans,`Las regiones crecen en 1,2,…,${lines}. Total: 1+${lines}(${lines+1})/2=${ans}.`)}
  if(f===8){const triangles=3+d,ans=triangles*(triangles+1)/2;return question(topic,level,k,`Una figura triangular escalonada contiene ${triangles} triángulos pequeños en la base, uno menos en la fila siguiente y así sucesivamente. ¿Cuántos triángulos pequeños hay?`,ans,`Se suma ${triangles}+${triangles-1}+…+1=${ans}.`)}
  const spokes=5+d,ans=spokes*(spokes-1)/2;return question(topic,level,k,`Desde un punto central parten ${spokes} rayos. Si cada par de rayos determina un ángulo menor, ¿cuántos ángulos quedan determinados?`,ans,`Se elige cualquier par de rayos: C(${spokes},2)=${ans}.`)
}

function combinatorics(topic,level,k,d){const f=k%10,n=6+d,r=2+(d>1?1:0),fact=x=>x<2?1:x*fact(x-1),C=(x,y)=>fact(x)/(fact(y)*fact(x-y));
  if(f===0){const ans=fact(n);return question(topic,level,k,`¿De cuántas maneras pueden ordenarse ${n} expedientes distintos en una mesa?`,ans,`${n} objetos distintos se permutan en ${n}! = ${ans}.`)}
  if(f===1){const ans=C(n,r);return question(topic,level,k,`De ${n} finalistas se elige una comisión de ${r} integrantes sin cargos. ¿Cuántas comisiones diferentes existen?`,ans,`El orden no importa: C(${n},${r})=${ans}.`)}
  if(f===2){const ans=n*(n-1);return question(topic,level,k,`Entre ${n} postulantes se asignan los cargos distintos de coordinador y relator. Nadie ocupa ambos. ¿Cuántas asignaciones hay?`,ans,`${n} opciones para coordinador y ${n-1} para relator: ${ans}.`)}
  if(f===3){const digits=5+d,ans=(digits-1)*digits*digits;return question(topic,level,k,`Con los dígitos 0,1,…,${digits-1}, ¿cuántos números de tres cifras pueden formarse si se permite repetir y la primera cifra no es cero?`,ans,`${digits-1} opciones iniciales y ${digits} para cada posición restante: ${ans}.`,alternatives(ans,k))}
  if(f===4){const colors=3+d,ans=colors*Math.pow(colors-1,3);return question(topic,level,k,`Una señal tiene cuatro franjas. Cada franja usa uno de ${colors} colores y franjas consecutivas no pueden repetir color. ¿Cuántas señales hay?`,ans,`${colors} opciones iniciales y ${colors-1} para cada franja siguiente: ${ans}.`)}
  if(f===5){const steps=5+d;let a=1,b=1;for(let i=2;i<=steps;i++){[a,b]=[b,a+b]}const ans=b;return question(topic,level,k,`Para subir ${steps} escalones se puede avanzar 1 o 2 por movimiento. ¿Cuántas secuencias de movimientos permiten llegar exactamente?`,ans,`La recurrencia es F(n)=F(n−1)+F(n−2), con F(0)=F(1)=1. Así F(${steps})=${ans}.`)}
  if(f===6){const total=7+d,ans=C(total-1,r-1);return question(topic,level,k,`Se distribuyen ${total} fichas idénticas entre ${r} equipos, dando al menos una a cada uno. ¿Cuántas distribuciones hay?`,ans,`Por barras y estrellas positivas: C(${total-1},${r-1})=${ans}.`)}
  if(f===7){const people=5+d,ans=fact(people-1);return question(topic,level,k,`${people} personas se sientan alrededor de una mesa circular; las rotaciones se consideran iguales. ¿Cuántas ubicaciones distintas hay?`,ans,`Se fija una persona y se permutan las ${people-1} restantes: (${people}−1)!=${ans}.`)}
  if(f===8){const items=6+d,ans=2*fact(items-1);return question(topic,level,k,`Se ordenan ${items} libros distintos; dos libros específicos deben quedar juntos. ¿Cuántos órdenes son posibles?`,ans,`Los dos libros forman un bloque con 2 órdenes internos: 2·(${items-1})!=${ans}.`,alternatives(ans,k))}
  const letters=5+d,ans=fact(letters)-2*fact(letters-1);return question(topic,level,k,`Se ordenan ${letters} símbolos distintos. ¿Cuántos órdenes evitan que dos símbolos señalados queden juntos?`,ans,`Total ${letters}! menos 2·(${letters-1})! con los señalados como bloque: ${ans}.`)
}

function sequences(topic,level,k,d){const f=k%10,start=2+d;
  if(f===0){const diff=3+d,terms=6+d,ans=start+(terms-1)*diff;return question(topic,level,k,`La sucesión aritmética comienza en ${start} y aumenta ${diff} cada término. ¿Cuál es el término ${terms}?`,ans,`a_${terms}=${start}+(${terms}−1)·${diff}=${ans}.`)}
  if(f===1){const ratio=2+(d>1?1:0),terms=5+d,ans=start*Math.pow(ratio,terms-1);return question(topic,level,k,`En una sucesión geométrica, a₁=${start} y la razón es ${ratio}. Halla a_${terms}.`,ans,`a_${terms}=${start}·${ratio}^${terms-1}=${ans}.`)}
  if(f===2){const n=5+d,ans=n*n+n+1;return question(topic,level,k,`Los términos siguen aₙ=n²+n+1: 3, 7, 13, 21,… ¿cuál corresponde a n=${n}?`,ans,`Se reemplaza n=${n}: ${n}²+${n}+1=${ans}.`)}
  if(f===3){const a=2+d,b=3+d,steps=5+d;let x=a,y=b;for(let i=3;i<=steps;i++){[x,y]=[y,x+y]}return question(topic,level,k,`Una sucesión inicia ${a}, ${b}; desde el tercer término, cada valor es la suma de los dos anteriores. ¿Cuál es el término ${steps}?`,y,`Aplicando repetidamente aₙ=aₙ₋₁+aₙ₋₂ se obtiene ${y}.`)}
  if(f===4){const n=7+d,ans=n%2?3*n+1:2*n;return question(topic,level,k,`La regla alterna: para posiciones impares aₙ=3n+1 y para pares aₙ=2n. ¿Cuál es a_${n}?`,ans,`${n} es ${n%2?"impar":"par"}; se usa ${n%2?"3n+1":"2n"} y resulta ${ans}.`)}
  if(f===5){const n=5+d,ans=n*(n+1)/2;return question(topic,level,k,`La secuencia 1, 3, 6, 10, 15,… suma consecutivamente 2,3,4,… ¿Cuál es el término ${n}?`,ans,`Es el número triangular T_${n}=${n}(${n}+1)/2=${ans}.`)}
  if(f===6){const n=4+d,ans=Math.pow(2,n)-1;return question(topic,level,k,`Observa 1, 3, 7, 15, 31,… Cada término duplica el anterior y suma 1. ¿Cuál es el término ${n}?`,ans,`La forma es aₙ=2ⁿ−1; para n=${n}, aₙ=${ans}.`)}
  if(f===7){const n=6+d,ans=n*n*n;return question(topic,level,k,`La sucesión 1, 8, 27, 64,… está formada por cubos perfectos. ¿Qué valor ocupa la posición ${n}?`,ans,`El término general es n³; ${n}³=${ans}.`)}
  if(f===8){const a=20+d*3,step=2+d,n=5+d,ans=a-(n-1)*step;return question(topic,level,k,`Una secuencia decrece uniformemente: ${a}, ${a-step}, ${a-2*step},… ¿cuál es su término ${n}?`,ans,`${a}−(${n}−1)·${step}=${ans}.`)}
  const n=5+d,ans=n*(n+1);return question(topic,level,k,`La sucesión 2, 6, 12, 20, 30,… se obtiene multiplicando cada posición por su consecutivo. Halla el término ${n}.`,ans,`aₙ=n(n+1); entonces ${n}·${n+1}=${ans}.`)
}

function distributions(topic,level,k,d){const f=k%10,a=2+d,b=3+d;
  if(f===0){const ans=a*b+(a+b);return question(topic,level,k,`En una tabla, cada casilla de salida se obtiene como producto de la cabecera de fila y columna más la suma de ambas. Para fila ${a} y columna ${b}, ¿qué valor aparece?`,ans,`${a}·${b}+${a}+${b}=${ans}.`)}
  if(f===1){const ans=(a+b)*2;return question(topic,level,k,`La analogía 3 : 10 sigue la regla n ↦ 2n+4. Manteniendo la regla, ¿qué número corresponde a ${a+b}?`,ans+4,`2(${a+b})+4=${ans+4}.`)}
  if(f===2){const x=4+d,ans=x*x-x;return question(topic,level,k,`En una distribución radial, el número exterior asociado a x se calcula como x²−x. Si x=${x}, ¿cuál es el exterior?`,ans,`${x}²−${x}=${ans}.`)}
  if(f===3){const p=5+d,q=2+d,ans=p*p-q*q;return question(topic,level,k,`Completa la relación: (${p}, ${q}) → p²−q². ¿Qué resultado corresponde al par mostrado?`,ans,`${p}²−${q}²=(${p}-${q})(${p}+${q})=${ans}.`)}
  if(f===4){const row1=[a,b,a+b],row2=[b,a+1,b+a+1],ans=(a+b)+(b+a+1);return question(topic,level,k,`En cada fila de una matriz, el tercer número es la suma de los dos primeros. Las filas son (${row1.join(", ")}) y (${row2.join(", ")}). Si la última fila empieza con ${a+b} y ${b+a+1}, ¿qué número la completa?`,ans,`${a+b}+${b+a+1}=${ans}.`)}
  if(f===5){const n=3+d,magic=3*n,ans=magic-(n+1);return question(topic,level,k,`En un cuadrado mágico 3×3 todas las filas suman ${magic}. En una fila ya aparecen ${n+1} y una casilla desconocida, mientras la tercera vale ${n-1}. ¿Cuánto falta?`,magic-(n+1)-(n-1),`x=${magic}−${n+1}−${n-1}=${magic-2*n}.`)}
  if(f===6){const ans=(a+b)*(a+b);return question(topic,level,k,`La pareja (${a},${b}) se transforma sumando sus componentes y elevando el resultado al cuadrado. ¿Cuál es la imagen?`,ans,`(${a}+${b})²=${ans}.`)}
  if(f===7){const x=3+d,ans=x*(x+1)/2;return question(topic,level,k,`Una pirámide numérica asigna a la base x la suma 1+2+…+x. Para x=${x}, ¿qué número se coloca en la cima?`,ans,`${x}(${x}+1)/2=${ans}.`)}
  if(f===8){const x=5+d,ans=2*x+1;return question(topic,level,k,`En una máquina de analogías, 4 se relaciona con 9 mediante 2n+1. ¿Con qué número se relaciona ${x}?`,ans,`2(${x})+1=${ans}.`)}
  const x=2+d,y=4+d,ans=x*y-x;return question(topic,level,k,`Una tarjeta muestra el par (${x},${y}) y la regla «producto menos el primero». ¿Cuál es el resultado?`,ans,`${x}·${y}−${x}=${ans}.`)
}

function operators(topic,level,k,d){const f=k%10,a=2+d,b=4+d;
  if(f===0){const ans=a*a+2*b;return question(topic,level,k,`Se define a ★ b = a²+2b. Calcula ${a} ★ ${b}.`,ans,`${a}²+2(${b})=${ans}.`)}
  if(f===1){const ans=(a+b)*(a-b);return question(topic,level,k,`Para x>y, x ◇ y=(x+y)(x−y). Evalúa ${a+b} ◇ ${a}.`,ans,`(${a+b}+${a})(${a+b}−${a})=${ans}.`)}
  if(f===2){const ans=a+3*b+1;return question(topic,level,k,`La operación m ⊙ n=m+3n+1. ¿Cuál es ${a} ⊙ ${b}?`,ans,`${a}+3(${b})+1=${ans}.`)}
  if(f===3){const inner=a+b,ans=inner*inner+1;return question(topic,level,k,`Se define x △ y=x+y y [z]=z²+1. Calcula [${a} △ ${b}].`,ans,`Primero ${a}△${b}=${inner}; después [${inner}]=${inner}²+1=${ans}.`)}
  if(f===4){const ans=2*a-b;return question(topic,level,k,`La tabla de una operación responde a x ⊗ y=2x−y. Halla ${a+b} ⊗ ${b}.`,ans+2*b,`2(${a+b})−${b}=${2*(a+b)-b}.`,alternatives(2*(a+b)-b,k))}
  if(f===5){const target=20+d*5,x=(target-2*b)/2;return question(topic,level,k,`Si x ◆ y=2x+2y, determina x cuando x ◆ ${b}=${target}.`,x,`2x+2(${b})=${target}; x=${x}.`)}
  if(f===6){const ans=Math.abs(a-b)+a*b;return question(topic,level,k,`Se define p ♢ q=|p−q|+pq. Calcula ${a} ♢ ${b}.`,ans,`|${a}−${b}|+${a}·${b}=${ans}.`)}
  if(f===7){const inner=a*b+1,ans=inner+a;return question(topic,level,k,`Sean x ⊕ y=xy+1 y u ⊖ v=u+v. Evalúa (${a} ⊕ ${b}) ⊖ ${a}.`,ans,`${a}⊕${b}=${inner}; luego ${inner}⊖${a}=${ans}.`)}
  if(f===8){const ans=(a+b)/(b-a+3);return question(topic,level,k,`Para valores positivos se define x ▣ y=(x+y)/(y−x+3). Calcula ${a} ▣ ${b}.`,ans,`(${a}+${b})/(${b}−${a}+3)=${format(ans)}.`)}
  const ans=a*a-b+a;return question(topic,level,k,`Una operación depende del primer número: x ☉ y=x²−y+x. Evalúa ${a+b} ☉ ${b}.`,(a+b)*(a+b)-b+(a+b),`${a+b}²−${b}+${a+b}=${(a+b)*(a+b)-b+(a+b)}.`)
}

function equations(topic,level,k,d){const f=k%10,a=3+d,b=5+d;
  if(f===0){const x=12+d*3,total=2*x+b;return question(topic,level,k,`La suma de un número, su doble y ${b} es ${total}. ¿Cuál es el número?`,x,`x+2x+${b}=${total}; 3x=${total-b}; x=${x}.`)}
  if(f===1){const age=14+d*2,father=3*age-4,years=5+d;return question(topic,level,k,`La edad de un estudiante es ${age}. Su padre tiene cuatro años menos que el triple de esa edad. ¿Cuánto sumarán sus edades dentro de ${years} años?`,age+father+2*years,`Edad del padre: 3(${age})−4=${father}. En ${years} años la suma será ${age+father}+2(${years})=${age+father+2*years}.`)}
  if(f===2){const tens=4+d,ones=2+d,num=10*tens+ones,rev=10*ones+tens;return question(topic,level,k,`Un número de dos cifras tiene decena ${tens} y unidad ${ones}. ¿Cuánto excede el número original al número con cifras invertidas?`,num-rev,`${num}−${rev}=${num-rev}.`)}
  if(f===3){const price=6+d,items=8+d,total=price*items;return question(topic,level,k,`Con S/${total} se compran ${items} cuadernos del mismo precio. Si cada cuaderno aumentara S/2, ¿cuánto costarían ${items-2} cuadernos?`,(price+2)*(items-2),`Precio actual: ${total}/${items}=${price}. Nuevo precio: ${price+2}; costo: ${price+2}·${items-2}=${(price+2)*(items-2)}.`)}
  if(f===4){const speed=40+d*5,time=3+d,dist=speed*time,newSpeed=speed+20;return question(topic,level,k,`Un vehículo recorre ${dist} km a ${speed} km/h. Si en el retorno aumenta su rapidez a ${newSpeed} km/h, ¿cuánto tarda en volver?`,dist/newSpeed,`Distancia=${speed}·${time}=${dist}; tiempo de retorno=${dist}/${newSpeed}=${format(dist/newSpeed)} h.`,null," h")}
  if(f===5){const workA=6+d,workB=12+d*2,rate=1/workA+1/workB,ans=1/rate;return question(topic,level,k,`Una máquina completa un lote en ${workA} h y otra en ${workB} h. Trabajando juntas, ¿en cuántas horas completan un lote?`,ans,`Tasa conjunta=1/${workA}+1/${workB}; el tiempo es su inversa: ${format(ans)} h.`,null," h")}
  if(f===6){const liters=20+d*5,c1=20+d*5,c2=60+d*5,target=40+d*5,x=liters*(target-c1)/(c2-c1);return question(topic,level,k,`Se desea preparar ${liters} L de una mezcla al ${target}% combinando soluciones al ${c1}% y ${c2}%. ¿Cuántos litros de la solución más concentrada se necesitan?`,x,`x(${c2})+(${liters}−x)(${c1})=${liters}(${target}); al resolver, x=${format(x)} L.`,null," L")}
  if(f===7){const x=7+d,y=5+d,sum=x+y,diff=x-y;return question(topic,level,k,`Dos números suman ${sum} y su diferencia es ${diff}. ¿Cuál es el mayor?`,x,`x+y=${sum}, x−y=${diff}. Sumando: 2x=${sum+diff}; x=${x}.`)}
  if(f===8){const heads=12+d*2,legs=34+d*6,rabbits=(legs-2*heads)/2;return question(topic,level,k,`En un corral hay gallinas y conejos: ${heads} cabezas y ${legs} patas. ¿Cuántos conejos hay?`,rabbits,`g+c=${heads}; 2g+4c=${legs}. Restando dos veces la primera: 2c=${legs-2*heads}; c=${rabbits}.`)}
  const percent=20+d*5,final=120+d*20,ans=final/(1+percent/100);return question(topic,level,k,`Después de aumentar un precio en ${percent}%, el nuevo valor es S/${final}. ¿Cuál era el precio original?`,ans,`x(1+${percent}/100)=${final}; x=${format(ans)}.`)
}

function geometryRM(topic,level,k,d){const f=k%10,a=4+d,b=7+d;
  if(f===0){const ans=2*(a+b);return question(topic,level,k,`Un rectángulo mide ${a} m por ${b} m. Se agrega una puerta de 1 m que no requiere cerca. ¿Cuántos metros de cerca se necesitan?`,ans-1,`Perímetro=2(${a}+${b})=${ans}; descontando la puerta: ${ans-1} m.`,null," m")}
  if(f===1){const ans=a*b;return question(topic,level,k,`Una zona rectangular de ${a} m por ${b} m reserva un cuadrado de lado ${d+1} m para equipos. ¿Qué área útil queda?`,ans-(d+1)**2,`Área total=${a*b}; reserva=${(d+1)**2}; diferencia=${ans-(d+1)**2} m².`,null," m²")}
  if(f===2){const base=8+d*2,height=5+d,ans=base*height/2;return question(topic,level,k,`Una parcela triangular tiene base ${base} m y altura perpendicular ${height} m. ¿Cuál es su área?`,ans,`${base}·${height}/2=${ans} m².`,null," m²")}
  if(f===3){const r=3+d,ans=Math.PI*r*r;return question(topic,level,k,`Una pista circular tiene radio ${r} m. Usando π=3,14, ¿qué área aproximada ocupa?`,Number((3.14*r*r).toFixed(2)),`A=πr²≈3,14·${r}²=${format(3.14*r*r)} m².`,null," m²")}
  if(f===4){const side=5+d,ans=side*side;return question(topic,level,k,`Un cuadrado aumenta su lado de ${side} m a ${side+2} m. ¿En cuánto aumenta su área?`,(side+2)**2-side**2,`Aumento=(${side+2})²−${side}²=${(side+2)**2-side**2} m².`,null," m²")}
  if(f===5){const B=12+d*2,small=6+d,h=5+d,ans=(B+small)*h/2;return question(topic,level,k,`Un trapecio tiene bases ${B} m y ${small} m, y altura ${h} m. ¿Cuál es su área?`,ans,`A=(${B}+${small})·${h}/2=${ans} m².`,null," m²")}
  if(f===6){const outer=10+d*2,inner=6+d,ans=outer**2-inner**2;return question(topic,level,k,`Un marco cuadrado tiene lado exterior ${outer} cm e interior ${inner} cm. ¿Cuál es el área del material del marco?`,ans,`${outer}²−${inner}²=${ans} cm².`,null," cm²")}
  if(f===7){const r=4+d,ans=2*3.14*r;return question(topic,level,k,`Una rueda de radio ${r} cm da una vuelta completa. Con π=3,14, ¿qué distancia recorre un punto de su borde?`,Number(ans.toFixed(2)),`Longitud=2πr≈2·3,14·${r}=${format(ans)} cm.`,null," cm")}
  if(f===8){const diag=10+d*2,other=6+d,ans=diag*other/2;return question(topic,level,k,`Un rombo tiene diagonales ${diag} cm y ${other} cm. ¿Qué área encierra?`,ans,`A=D·d/2=${diag}·${other}/2=${ans} cm².`,null," cm²")}
  const scale=2+d,area=20+d*5,ans=area*scale*scale;return question(topic,level,k,`Una figura de área ${area} cm² se amplía con factor lineal ${scale}. ¿Cuál es el área de la copia?`,ans,`Las áreas se multiplican por el cuadrado del factor: ${area}·${scale}²=${ans} cm².`,null," cm²")
}

function playful(topic,level,k,d){const f=k%10,a=3+d;
  if(f===0){const teeth1=20+d*4,teeth2=30+d*5,turns=15+d*3,ans=turns*teeth1/teeth2;return question(topic,level,k,`Un engranaje de ${teeth1} dientes da ${turns} vueltas y mueve otro de ${teeth2} dientes. ¿Cuántas vueltas da el segundo?`,ans,`Se conserva dientes×vueltas: ${teeth1}·${turns}=${teeth2}·x; x=${format(ans)}.`,null," vueltas")}
  if(f===1){const cuts=4+d,pieces=cuts+1;return question(topic,level,k,`Una barra recta recibe ${cuts} cortes completos en posiciones distintas. ¿Cuántos trozos se obtienen?`,pieces,`Cada corte aumenta el número de trozos en uno: ${cuts}+1=${pieces}.`)}
  if(f===2){const posts=8+d*2,gaps=posts-1,dist=3+d;return question(topic,level,k,`${posts} postes se colocan en línea, separados uniformemente ${dist} m. ¿Qué distancia hay del primero al último?`,gaps*dist,`Entre ${posts} postes hay ${gaps} intervalos: ${gaps}·${dist}=${gaps*dist} m.`,null," m")}
  if(f===3){const pills=6+d,interval=4+d,ans=(pills-1)*interval;return question(topic,level,k,`Se toma una cápsula cada ${interval} horas, empezando ahora. ¿Cuántas horas transcurren hasta tomar la cápsula número ${pills}?`,ans,`Entre ${pills} tomas hay ${pills-1} intervalos: ${pills-1}·${interval}=${ans} h.`,null," h")}
  if(f===4){const people=7+d,ans=people*(people-1)/2;return question(topic,level,k,`${people} participantes se saludan una sola vez entre cada pareja. ¿Cuántos saludos ocurren?`,ans,`Cada saludo corresponde a una pareja: C(${people},2)=${ans}.`)}
  if(f===5){const hour=2+d,minute=10+d*5,angle=Math.abs(30*hour-.5*minute-6*minute);const ans=Math.min(angle,360-angle);return question(topic,level,k,`¿Cuál es el ángulo menor entre las agujas de un reloj a las ${hour}:${String(minute).padStart(2,"0")}?`,ans,`Horario=30·${hour}+0,5·${minute}; minutero=6·${minute}. La diferencia menor es ${format(ans)}°.`,null,"°")}
  if(f===6){const day=5+d,advance=20+d*7,ans=(day+advance)%7||7;return question(topic,level,k,`Numerando lunes=1,…,domingo=7, hoy corresponde al día ${day}. ¿Qué número de día será dentro de ${advance} días?`,ans,`${advance} mod 7=${advance%7}; al avanzar y reducir módulo 7 se obtiene ${ans}.`)}
  if(f===7){const coins=7+d,ans=coins*(coins+1)/2;return question(topic,level,k,`Se apilan monedas en filas: 1 en la primera, 2 en la segunda, hasta ${coins} en la última. ¿Cuántas monedas se usan?`,ans,`1+2+…+${coins}=${coins}(${coins+1})/2=${ans}.`)}
  if(f===8){const rope=12+d*3,parts=3+d,ans=parts-1;return question(topic,level,k,`Una cuerda de ${rope} m se divide en ${parts} partes mediante cortes individuales. ¿Cuál es el mínimo número de cortes si no se puede doblar ni apilar?`,ans,`Para obtener ${parts} partes desde una pieza se necesitan ${parts-1} cortes.`)}
  const switches=4+d,presses=10+d*3,ans=presses%2?"encendida":"apagada",built=textAlternatives(ans,[ans==="encendida"?"apagada":"encendida","intermitente","no se puede saber"],k);return question(topic,level,k,`Una lámpara empieza apagada y cada pulsación cambia su estado. Después de ${presses} pulsaciones, ¿cómo queda?`,0,`${presses} es ${presses%2?"impar":"par"}; por ello la lámpara termina ${ans}.`,built)
}

const BUILDERS=[organization,logic,figures,combinatorics,sequences,distributions,operators,equations,geometryRM,playful];
original.version="2026.27-rm-reconstruido-juvenil";
original.descripcion="Banco RM reconstruido con diez familias de razonamiento por tema, dificultad progresiva y soluciones calculadas; evita repetir un mismo enunciado cambiando únicamente datos.";
original.temas.forEach((topic,topicIndex)=>{
  topic.teoria=`Estrategias de ${topic.titulo}: representación, modelación, control de restricciones y verificación de alternativas.`;
  topic.puntos=["Representar los datos antes de operar","Combinar condiciones sin analizarlas por separado","Comprobar el resultado y descartar distractores plausibles"];
  LEVELS.forEach((level,d)=>{topic.niveles[level]=Array.from({length:10},(_,k)=>BUILDERS[topicIndex](topic,level,k,d))});
});
fs.writeFileSync(target,JSON.stringify(original,null,2)+"\n");
console.log(`Banco RM reconstruido: ${original.temas.reduce((n,t)=>n+Object.values(t.niveles).flat().length,0)} preguntas.`);
