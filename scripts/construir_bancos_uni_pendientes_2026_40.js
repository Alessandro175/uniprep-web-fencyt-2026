#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const bankDir = path.join(root, "json", "quiz-cursos");
const syllabus = JSON.parse(fs.readFileSync(path.join(root, "json", "syllabus-uni-2026-2.json"), "utf8"));
const levels = ["basico", "intermedio", "avanzado", "admision"];
const levelLabel = {basico:"Fundamento",intermedio:"Aplicación",avanzado:"Análisis",admision:"Reto UNI"};
const levelCode = {basico:"B",intermedio:"I",avanzado:"V",admision:"A"};

function rotate(values, seed) {
  const unique = [...new Set(values.map(String))];
  const numericCorrect = Number(unique[0]);
  let offset = 4;
  while (unique.length < 4) {
    const candidate = Number.isFinite(numericCorrect) ? String(numericCorrect + offset) : `Alternativa ${offset}`;
    if (!unique.includes(candidate)) unique.push(candidate);
    offset++;
  }
  const shift = seed % 4;
  return unique.slice(shift).concat(unique.slice(0, shift));
}

function item(courseId, topic, topicIndex, level, data) {
  const seed = topicIndex * 4 + levels.indexOf(level);
  const alternatives = rotate([data.correct, ...data.wrong], seed);
  return {
    id:`UNI-${courseId.toUpperCase()}-${String(topicIndex + 1).padStart(2,"0")}-${levelCode[level]}`,
    universidadReferencia:"UNI",
    dificultad:level,
    tema:topic,
    subarea:data.subarea,
    competencia:`${levelLabel[level]} · ${data.competencia}`,
    pregunta:data.prompt,
    alternativas:alternatives,
    respuesta:alternatives.indexOf(String(data.correct)),
    solucion:data.solution,
    explicacion:data.explanation || data.solution,
    pasosMinimos:level === "basico" ? 1 : level === "intermedio" ? 2 : level === "avanzado" ? 3 : 4,
    fuenteReferencia:data.source,
    alineacionUniversitaria:"Pregunta original de entrenamiento alineada al temario de la ruta UNI; no es una pregunta oficial."
  };
}

function numeric(prompt, answer, solution, subarea, source, competencia) {
  const a = Number(answer);
  return {prompt,correct:String(a),wrong:[String(a + 1),String(a + 2),String(a + 3)],solution,subarea,source,competencia};
}

function calcCase(topicIndex, seed) {
  const n = seed + 2;
  const source = "Temario de Cálculo mostrado en la ruta UNI 2026-2";
  const subarea = topicIndex <= 10 ? "Cálculo diferencial" : "Cálculo integral";
  const cases = [
    ()=>numeric(`Sea f(x)=x^${n}. ¿Cuánto vale f'(${n})?`,n*Math.pow(n,n-1),`Por la regla de la potencia, f'(x)=${n}x^${n-1}; al evaluar en x=${n} se obtiene ${n*Math.pow(n,n-1)}.`,subarea,source,"Deriva una función potencial"),
    ()=>numeric(`Para f(x)=(x²−${n*n})/(x−${n}), x≠${n}, calcule el límite cuando x tiende a ${n}.`,2*n,`Se factoriza x²−${n*n}=(x−${n})(x+${n}); el límite es ${n}+${n}=${2*n}.`,subarea,source,"Relaciona función, límite y simplificación"),
    ()=>numeric(`Calcule lim x→${n} de (x²+${n}x).`,2*n*n,`Los polinomios son continuos: se sustituye x=${n} y resulta ${n*n}+${n*n}=${2*n*n}.`,subarea,source,"Evalúa un límite en un punto"),
    ()=>({prompt:`Calcule lim x→0 de sen(${n}x)/x.`,correct:String(n),wrong:["0","1",String(n*n)],solution:`Usando lim u→0 sen(u)/u=1, se obtiene sen(${n}x)/x=${n}·sen(${n}x)/(${n}x)→${n}.`,subarea,source,competencia:"Aplica un límite notable"}),
    ()=>({prompt:`Determine k para que f(x) sea continua en x=${n}: f(x)=(x²−${n*n})/(x−${n}) si x≠${n}, y f(${n})=k.`,correct:String(2*n),wrong:[String(n),String(n*n),"0"],solution:`La continuidad exige k=lim x→${n}(x+${n})=${2*n}.`,subarea,source,competencia:"Impone continuidad en un punto"}),
    ()=>({prompt:`Si f es continua en [0,${n}] y f(0)<0 mientras f(${n})>0, ¿qué garantiza el teorema del valor intermedio?`,correct:`Existe c en (0,${n}) tal que f(c)=0`,wrong:["f es derivable en todo el intervalo","f tiene exactamente una raíz","f es siempre creciente"],solution:"Al cambiar de signo y ser continua, la función toma el valor 0 en al menos un punto interior.",subarea,source,competencia:"Interpreta un teorema de continuidad"}),
    ()=>numeric(`La posición de una partícula es s(t)=t²+${n}t. ¿Cuál es su velocidad cuando t=${n}?`,3*n,`v(t)=s'(t)=2t+${n}; entonces v(${n})=${3*n}.`,subarea,source,"Aplica la derivada a una razón de cambio"),
    ()=>({prompt:`Halle la pendiente de la recta tangente a y=x²+${n}x en x=1.`,correct:String(n+2),wrong:[String(n),String(n+1),String(2*n)],solution:`y'=2x+${n}. Al evaluar x=1, la pendiente es ${n+2}.`,subarea,source,competencia:"Determina una recta tangente"}),
    ()=>({prompt:`Derive f(x)=x^${n}+${n}x.`,correct:`${n}x^${n-1}+${n}`,wrong:[`${n}x^${n-1}`,`x^${n-1}+${n}`,`${n}x^${n}+${n}`],solution:"Se aplica linealidad y la regla de la potencia término a término.",subarea,source,competencia:"Aplica reglas de derivación"}),
    ()=>({prompt:`Si x²+y²=${n*n}, determine dy/dx.`,correct:"−x/y",wrong:["x/y","−y/x","2x+2y"],solution:"Al derivar implícitamente: 2x+2y·y'=0; por tanto y'=−x/y.",subarea,source,competencia:"Realiza derivación implícita"}),
    ()=>({prompt:`La función f(x)=x²−${2*n}x tiene un punto crítico. ¿Cuál es su abscisa?`,correct:String(n),wrong:["0",String(2*n),String(n+1)],solution:`f'(x)=2x−${2*n}; al resolver f'(x)=0 resulta x=${n}.`,subarea,source,competencia:"Localiza un extremo"}),
    ()=>({prompt:`¿Cuál es una antiderivada de ${n}x^${n-1}?`,correct:`x^${n}+C`,wrong:[`${n}x^${n}+C`,`x^${n-1}+C`,`${n-1}x^${n}+C`],solution:`La derivada de x^${n} es ${n}x^${n-1}; se añade la constante C.`,subarea,source,competencia:"Reconoce una integral indefinida"}),
    ()=>numeric(`Calcule ∫₀¹ ${n}x^${n-1} dx.`,1,`Una primitiva es x^${n}; al evaluar entre 0 y 1 se obtiene 1.`,subarea,source,"Evalúa una integral definida"),
    ()=>({prompt:`Calcule ∫ ${n}cos(${n}x) dx.`,correct:`sen(${n}x)+C`,wrong:[`cos(${n}x)+C`,`−sen(${n}x)+C`,`${n}sen(x)+C`],solution:`Como d[sen(${n}x)]/dx=${n}cos(${n}x), la integral es sen(${n}x)+C.`,subarea,source,competencia:"Integra una función trigonométrica"}),
    ()=>({prompt:`Calcule ∫ ${n}e^(${n}x) dx.`,correct:`e^(${n}x)+C`,wrong:[`${n}e^(${n}x)+C`,`e^x+C`,`ln|${n}x|+C`],solution:`La derivada de e^(${n}x) es ${n}e^(${n}x).`,subarea,source,competencia:"Integra una función trascendente"}),
    ()=>numeric(`Una velocidad está dada por v(t)=${n}t m/s. ¿Qué desplazamiento ocurre entre t=0 y t=2 s?`,2*n,`El desplazamiento es ∫₀² ${n}t dt=${n}[t²/2]₀²=${2*n} m.`,subarea,source,"Aplica la integral definida"),
    ()=>numeric(`Calcule el área bajo y=${n}x entre x=0 y x=2.`,2*n,`A=∫₀² ${n}x dx=${2*n}.`,subarea,source,"Calcula un área plana"),
    ()=>({prompt:`Al girar alrededor del eje x la región bajo y=${n} entre x=0 y x=1, ¿cuál es el volumen?`,correct:`${n*n}π`,wrong:[`${n}π`,`2${n}π`,`π/${n}`],solution:`Por discos, V=π∫₀¹(${n})²dx=${n*n}π.`,subarea,source,competencia:"Calcula un sólido de revolución"}),
    ()=>numeric(`Un sólido tiene secciones perpendiculares al eje x con área A(x)=${n}x, para 0≤x≤2. Halle su volumen.`,2*n,`V=∫₀² A(x)dx=∫₀² ${n}x dx=${2*n}.`,subarea,source,"Integra áreas de secciones planas"),
    ()=>({prompt:`Halle la longitud del segmento de la curva y=${n}x entre x=0 y x=1.`,correct:`√${n*n+1}`,wrong:[String(n+1),`√${n*n}`,String(n*n+1)],solution:`L=∫₀¹√(1+(y')²)dx=∫₀¹√(1+${n*n})dx=√${n*n+1}.`,subarea,source,competencia:"Calcula longitud de arco"})
  ];
  return cases[topicIndex]();
}

const logicCases = [
  [
    {prompt:"¿Cuál es la negación de «Todos los postulantes aprobaron»?",correct:"Al menos un postulante no aprobó",wrong:["Ningún postulante aprobó","Todos los postulantes desaprobaron","Algunos postulantes aprobaron"],solution:"La negación de un cuantificador universal afirma que existe al menos un contraejemplo."},
    {prompt:"Si p es verdadera y q es falsa, ¿qué valor tiene p ∧ q?",correct:"Falso",wrong:["Verdadero","Indeterminado","Equivalente a p"],solution:"Una conjunción solo es verdadera cuando ambas proposiciones son verdaderas."},
    {prompt:"¿Cuál de las siguientes expresiones es una proposición?",correct:"Lima es la capital del Perú",wrong:["Cierra la puerta","¿Qué hora es?","x+2"],solution:"Una proposición es un enunciado declarativo al que se puede asignar verdad o falsedad."},
    {prompt:"La expresión «Si estudio, entonces apruebo» es una proposición:",correct:"Condicional",wrong:["Conjuntiva","Disyuntiva","Bicondicional"],solution:"La forma «si p, entonces q» corresponde al conectivo condicional."}
  ],
  [
    {prompt:"¿Cómo se formaliza «No estudio o apruebo», usando p: estudio y q: apruebo?",correct:"¬p ∨ q",wrong:["p ∧ q","¬(p ∨ q)","p ↔ q"],solution:"«No estudio» es ¬p y «o apruebo» introduce la disyunción con q."},
    {prompt:"¿Cuántas filas tiene la tabla de verdad de tres proposiciones simples?",correct:"8",wrong:["3","6","9"],solution:"Con n proposiciones existen 2^n combinaciones; para n=3 hay 8."},
    {prompt:"¿Qué expresión es lógicamente equivalente a p → q?",correct:"¬p ∨ q",wrong:["p ∧ q","p ∨ ¬q","¬p ∧ q"],solution:"El condicional solo es falso cuando p es verdadera y q falsa, igual que ¬p ∨ q."},
    {prompt:"La fórmula p ∨ ¬p es una:",correct:"Tautología",wrong:["Contradicción","Contingencia","Falacia"],solution:"Siempre resulta verdadera, cualquiera sea el valor de p."}
  ],
  [
    {prompt:"Si «Todo ingeniero estudia matemática» y «Ana es ingeniera», ¿qué se concluye válidamente?",correct:"Ana estudia matemática",wrong:["Ana enseña matemática","Todo el que estudia matemática es ingeniero","Ana no es ingeniera"],solution:"Se aplica instanciación universal y modus ponens."},
    {prompt:"De p → q y ¬q se concluye:",correct:"¬p",wrong:["p","q","p ∧ q"],solution:"La regla válida es modus tollens."},
    {prompt:"De p ∨ q y ¬p se concluye:",correct:"q",wrong:["p","¬q","p ∧ q"],solution:"El silogismo disyuntivo elimina p y conserva q."},
    {prompt:"«Todos los A son B; todos los B son C; por tanto, todos los A son C» es un razonamiento:",correct:"Válido",wrong:["Contradictorio","Circular","Inductivo débil"],solution:"La inclusión A⊆B y B⊆C implica A⊆C."}
  ]
];

const currentCases = {
  "Política nacional":[
    ["¿Qué fuente debe priorizarse para verificar una nueva ley peruana?","El diario oficial El Peruano",["Una cadena anónima","Un comentario sin autor","Una imagen sin fecha"],"El texto promulgado y publicado oficialmente es la fuente primaria."],
    ["Si una noticia afirma que una norma ya está vigente, ¿qué dato debe comprobarse primero?","Su publicación y fecha de vigencia",["La cantidad de reacciones","El color de la portada","La opinión más compartida"],"Una norma puede haber sido anunciada sin estar todavía publicada o vigente."],
    ["¿Qué poder del Estado peruano aprueba leyes?","El Poder Legislativo",["El Poder Judicial","La Contraloría","El Ministerio Público"],"La función legislativa corresponde al Congreso de la República."],
    ["Para comparar dos propuestas públicas responsablemente se debe revisar:","Objetivos, costos, evidencia e impacto",["Solo el eslogan","Únicamente la popularidad","El número de publicaciones"],"La evaluación pública exige criterios y evidencia comparables."]
  ],
  "Economía":[
    ["¿Qué indicador mide la variación general de precios al consumidor?","El índice de precios al consumidor",["El tipo de cambio fijo","La tasa de natalidad","El área cultivada"],"El IPC se utiliza para observar la evolución promedio de precios de una canasta."],
    ["Si los precios suben y el ingreso permanece igual, el poder adquisitivo normalmente:","Disminuye",["Aumenta","Se duplica","No puede variar"],"Con el mismo ingreso se pueden comprar menos bienes y servicios."],
    ["¿Qué institución peruana publica información oficial sobre política monetaria?","El Banco Central de Reserva del Perú",["La FIFA","La UNESCO","La RENIEC"],"El BCRP es la autoridad monetaria peruana."],
    ["Para comparar cifras económicas de dos años se debe considerar especialmente:","La unidad, la fuente y si son valores reales o nominales",["Solo el titular","El tamaño del gráfico","La red social utilizada"],"Sin esas condiciones la comparación puede ser engañosa."]
  ],
  "Ciencia y tecnología":[
    ["¿Qué práctica reduce el riesgo de perder una cuenta digital?","Activar autenticación en dos pasos",["Compartir la contraseña","Repetir la misma clave","Abrir enlaces desconocidos"],"El segundo factor dificulta el acceso aunque una contraseña sea comprometida."],
    ["Una afirmación científica nueva es más confiable cuando:","Presenta método, datos y revisión especializada",["No identifica autores","Promete certeza absoluta","Solo aparece en un video viral"],"La trazabilidad metodológica permite evaluar y reproducir resultados."],
    ["¿Qué describe mejor a un modelo de inteligencia artificial generativa?","Produce contenido a partir de patrones aprendidos",["Comprueba automáticamente toda afirmación","Posee siempre información en tiempo real","Sustituye toda decisión humana"],"Un modelo genera resultados probabilísticos y requiere verificación."],
    ["Antes de usar una herramienta tecnológica en educación se debe evaluar:","Utilidad, privacidad, accesibilidad y resultados",["Solo su apariencia","Únicamente su precio","La cantidad de animaciones"],"La adopción responsable considera impacto y riesgos."]
  ],
  "Ambiente":[
    ["¿Qué actividad está fuertemente relacionada con la contaminación por mercurio en la Amazonía peruana?","La minería aurífera informal",["La energía solar","El reciclaje de papel","La agricultura hidropónica"],"El mercurio se emplea para amalgamar oro y puede contaminar agua y organismos."],
    ["¿Qué acción ayuda a verificar una alerta ambiental?","Contrastar reportes de organismos oficiales y mediciones",["Reenviar inmediatamente","Confiar solo en una fotografía","Eliminar la fecha del reporte"],"La evidencia ambiental necesita ubicación, fecha, método y fuente."],
    ["La pérdida extensa de bosques puede provocar:","Pérdida de biodiversidad y mayores emisiones",["Mayor captura garantizada de carbono","Desaparición de la erosión","Reducción automática de temperatura"],"Los bosques almacenan carbono y sostienen hábitats y ciclos hídricos."],
    ["En gestión de residuos, la segregación en la fuente consiste en:","Separar los residuos desde el lugar donde se generan",["Mezclarlos antes del recojo","Quemarlos al aire libre","Arrojarlos a un río"],"Separar desde el origen facilita reciclaje y tratamiento seguro."]
  ],
  "Relaciones internacionales":[
    ["¿Qué organización reúne a Estados para tratar asuntos de paz y cooperación mundial?","La Organización de las Naciones Unidas",["La FIFA","La OPEP como organismo universal","La Cruz Roja como Estado"],"La ONU es una organización intergubernamental de alcance mundial."],
    ["Antes de afirmar que dos países firmaron un tratado se debe revisar:","El comunicado o documento oficial de las partes",["Un meme sin autor","Una encuesta informal","Un comentario aislado"],"Los acuerdos internacionales deben comprobarse en fuentes diplomáticas u oficiales."],
    ["APEC es un foro centrado principalmente en:","Cooperación económica en Asia-Pacífico",["Competiciones deportivas","Administración de justicia penal","Regulación mundial de idiomas"],"APEC promueve cooperación, comercio e integración económica regional."],
    ["Una sanción económica internacional puede afectar:","Comercio, finanzas y cadenas de suministro",["Solo el clima","Únicamente la geografía","La rotación terrestre"],"Las restricciones económicas repercuten en transacciones y abastecimiento."]
  ],
  "Fuentes y verificación de hechos":[
    ["¿Cuál es la mejor primera acción frente a una noticia alarmante?","Identificar autor, fecha y fuente original",["Compartirla sin leer","Recortar el contexto","Confiar en el número de likes"],"La trazabilidad permite evaluar actualidad, autoridad y propósito."],
    ["Una fotografía verdadera puede desinformar cuando:","Se publica con fecha o contexto falsos",["Tiene buena resolución","Incluye colores","Fue tomada con un teléfono"],"La descontextualización cambia el significado aun si la imagen no fue editada."],
    ["¿Qué confirma mejor una cifra pública?","El informe primario y su metodología",["Una captura sin enlace","Una opinión anónima","Un titular sin documento"],"La fuente primaria permite revisar definición, muestra y periodo."],
    ["Si dos fuentes confiables discrepan, lo correcto es:","Comparar fechas, definiciones y metodología",["Elegir la más popular","Combinar cifras sin explicación","Ocultar la diferencia"],"Las discrepancias suelen depender del periodo o de cómo se midió el dato."]
  ]
};

const englishCases = {
  "Making Contact":[
    ["Choose the correct sentence with the verb to be.","She is from Peru.",["She are from Peru.","She am from Peru.","She be from Peru."],"The third-person singular form of the verb to be is «is»."],
    ["Complete: ___ you study every day?","Do",["Does","Is","Are"],"Present simple questions with «you» use the auxiliary «do»."],
    ["Choose the correct possessive adjective: Carlos visits ___ family.","his",["he","him","their"],"The possessive adjective corresponding to «Carlos/he» is «his»."],
    ["Complete: I ___ arrive early for class.","usually",["usual","am usually to","use"],"An adverb of frequency can appear before the main verb."]
  ],
  "Same or Different?":[
    ["Complete: Ana ___ got a new laptop.","has",["have","is","can"],"The third-person singular form is «has got»."],
    ["Choose the correct article: He is ___ engineer.","an",["a","the always","no article ever"],"«Engineer» begins with a vowel sound, so it takes «an»."],
    ["Complete: Students ___ wear an identification card.","have to",["has to","having","can to"],"With a plural subject, obligation is expressed with «have to»."],
    ["Choose the correct object pronoun: I know María. I study with ___.","her",["she","hers","they"],"After a preposition, María is replaced by the object pronoun «her»." ]
  ],
  "Home Sweet Home":[
    ["Complete: There ___ two chairs in the room.","are",["is","be","was"],"A plural noun uses «there are»."],
    ["Choose the correct option: Is there ___ water?","any",["some always","many","a"],"Questions with an uncountable noun commonly use «any»."],
    ["Complete: How ___ books are there?","many",["much","any","lot"],"Countable plural nouns use «how many»."],
    ["Yesterday, we ___ at home.","were",["was","are","be"],"The past form of «be» with «we» is «were»." ]
  ],
  "Stuff Dot Com":[
    ["Choose the correct past question.","Did you buy the phone?",["Did you bought the phone?","Do you bought the phone?","Were you buy the phone?"],"After «did», the main verb remains in its base form."],
    ["Complete: Look! The computer ___ updating.","is",["does","has","are"],"An action happening now uses present continuous: «is updating»."],
    ["Choose the comparative form of «fast».","faster",["more fast","fastest","fastly"],"Short adjectives normally form the comparative with -er."],
    ["This tablet is mine; that one is ___.","yours",["your","you","yourself"],"A possessive pronoun replaces «your tablet»: «yours»." ]
  ],
  "Healthy Body":[
    ["Complete: I have ___ visited that hospital.","never",["yesterday","last","ago"],"Present perfect can use the frequency adverb «never»."],
    ["Choose the correct sentence about a finished past action.","She went to the doctor yesterday.",["She has gone yesterday.","She go yesterday.","She did went yesterday."],"A finished past time such as «yesterday» uses past simple."],
    ["Complete: I think technology ___ improve healthcare.","will",["is yesterday","did","has to be improve"],"«Will» can express a prediction about the future."],
    ["Choose the correct adverb: The nurse spoke ___.","clearly",["clear","clearest","more clear noun"],"An adverb modifies how the action was performed." ]
  ],
  "Projects":[
    ["Which opening is most appropriate for a presentation?","Good morning. Today I am going to present…",["Whatever, listen.","No introduction is needed.","You already know everything."],"A clear greeting and statement of purpose introduce the presentation."],
    ["In a job interview, the best response to «Tell me about yourself» should be:","Brief, relevant and connected to the position",["Unrelated and very long","Only one word","Based on invented experience"],"A professional answer selects truthful information relevant to the role."],
    ["A recipe presentation should normally include:","Ingredients and ordered steps",["Only the final photograph","Random verbs without sequence","No quantities or actions"],"A procedural presentation needs materials and chronological instructions."],
    ["Which phrase introduces a conclusion?","To sum up…",["By the way…","Maybe first again…","Without any reason…"],"«To sum up» signals that the main ideas will be synthesized." ]
  ]
};

function buildCourse(courseId, caseProvider, source, description) {
  const course = syllabus.cursos.find(entry => entry.id === courseId);
  if (!course) throw new Error(`Curso ausente en el temario: ${courseId}`);
  const topics = course.temas.map((topic, topicIndex) => {
    const niveles = Object.fromEntries(levels.map((level, seed) => {
      let data;
      if (courseId === "calculo") data = caseProvider(topicIndex, seed);
      else {
        const row = caseProvider(topic, topicIndex)[seed];
        data = {prompt:row[0] || row.prompt,correct:row[1] || row.correct,wrong:row[2] || row.wrong,solution:row[3] || row.solution};
      }
      data.subarea ||= course.area;
      data.source ||= source;
      data.competencia ||= `Resuelve una situación de ${topic}`;
      return [level,[item(courseId, topic, topicIndex, level, data)]];
    }));
    return {id:`uni-${courseId}-${topicIndex+1}`,titulo:topic,subarea:course.area,duracion:"35 min",teoria:course.detalles?.[topic]?.descripcion || `Conceptos y aplicaciones esenciales de ${topic}.`,puntos:course.detalles?.[topic]?.puntos || [`Fundamentos de ${topic}`,"Aplicación guiada","Problema tipo UNI"],distribucion:{basico:1,intermedio:1,avanzado:1,admision:1,total:4},niveles};
  });
  const total = topics.length * 4;
  const bank = {courseId,nombre:course.nombre,descripcion:description,version:"2026.40-uni-inicial-verificado",universidadesReferencia:["UNI"],total,distribucion:{basico:topics.length,intermedio:topics.length,avanzado:topics.length,admision:topics.length,total},temas:topics};
  fs.writeFileSync(path.join(bankDir, `${courseId}.json`), JSON.stringify(bank,null,2)+"\n");
  return total;
}

const totals = {};
totals.calculo = buildCourse("calculo", calcCase, "Temario de Cálculo mostrado en la ruta UNI 2026-2", "Banco inicial de Cálculo con cobertura de todos los temas visibles de la ruta UNI.");
totals.logica = buildCourse("logica", (_, index)=>logicCases[index], "Temario de Lógica de la ruta UNI 2026-2", "Banco inicial de proposiciones, tablas de verdad e inferencia.");
totals.actualidad = buildCourse("actualidad", topic=>currentCases[topic], "Fuentes institucionales y criterios de verificación vigentes a septiembre de 2026", "Banco inicial de análisis de actualidad y verificación responsable, sin depender de nombres que puedan quedar desactualizados.");
totals.ingles = buildCourse("ingles", topic=>englishCases[topic], "Programa ED131 English I · referencia académica UNI", "Banco inicial de Inglés A2 basado en los bloques del programa ED131.");
console.log(JSON.stringify({totals,total:Object.values(totals).reduce((a,b)=>a+b,0)}));
