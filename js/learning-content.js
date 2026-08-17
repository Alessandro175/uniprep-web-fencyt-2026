(function () {
  const CONTENIDO = {
    algebra: [
      {titulo:"Polinomios y factorización",teoria:"Un polinomio es una suma de monomios. Su grado es el mayor exponente. Para factorizar se transforma una suma en un producto usando factor común, diferencia de cuadrados, trinomio cuadrado perfecto o aspa simple.",puntos:["Factor común: ax + ay = a(x+y)","Diferencia de cuadrados: a²−b²=(a−b)(a+b)","TCP: a²±2ab+b²=(a±b)²"],preguntas:[
        {q:"Factoriza x²−25.",o:["(x−5)(x+5)","(x−25)(x+1)","(x−5)²","x(x−25)"],r:0,e:"Es diferencia de cuadrados: x²−5²."},
        {q:"El grado de 4x³−2x+7 es:",o:["1","2","3","4"],r:2,e:"El mayor exponente de x es 3."},
        {q:"Factoriza 3x²+6x.",o:["3x(x+2)","3(x²+2)","x(3x+2)","3x(x+6)"],r:0,e:"El factor común es 3x."}]},
      {titulo:"Ecuaciones cuadráticas",teoria:"Una ecuación cuadrática tiene forma ax²+bx+c=0, con a distinto de cero. Puede resolverse por factorización o mediante la fórmula general. El discriminante determina el tipo de raíces.",puntos:["x=(−b±√(b²−4ac))/2a","Δ>0: dos raíces reales","Δ=0: una raíz doble"],preguntas:[
        {q:"Resuelve x²−5x+6=0.",o:["1 y 6","2 y 3","−2 y −3","3 y 5"],r:1,e:"(x−2)(x−3)=0."},
        {q:"El discriminante de x²+2x+1=0 es:",o:["−4","0","2","4"],r:1,e:"Δ=2²−4(1)(1)=0."},
        {q:"En 2x²−3x+1=0, el valor de a es:",o:["−3","1","2","3"],r:2,e:"a es el coeficiente de x²."}]},
      {titulo:"Funciones",teoria:"Una función asigna a cada elemento del dominio un único valor del rango. En la función lineal f(x)=mx+b, m es la pendiente y b la intersección con el eje vertical.",puntos:["Dominio: valores permitidos de x","Rango: valores obtenidos de y","Función lineal: f(x)=mx+b"],preguntas:[
        {q:"Si f(x)=2x+3, calcula f(4).",o:["8","10","11","14"],r:2,e:"f(4)=2(4)+3=11."},
        {q:"La pendiente de y=5x−2 es:",o:["−2","2","5","7"],r:2,e:"La pendiente es el coeficiente de x."},
        {q:"El dominio de f(x)=1/x excluye:",o:["−1","0","1","2"],r:1,e:"No se puede dividir entre cero."}]}
    ],
    fisica: [
      {titulo:"Cinemática",teoria:"La cinemática describe el movimiento sin estudiar sus causas. En MRU la velocidad permanece constante; en MRUV existe aceleración constante.",puntos:["MRU: d=v·t","MRUV: v=v₀+at","Posición: x=x₀+v₀t+at²/2"],preguntas:[
        {q:"Un móvil recorre 120 m en 20 s. Su rapidez es:",o:["4 m/s","5 m/s","6 m/s","8 m/s"],r:2,e:"v=d/t=120/20=6 m/s."},
        {q:"Parte del reposo con a=3 m/s² durante 4 s. Velocidad final:",o:["7 m/s","12 m/s","16 m/s","24 m/s"],r:1,e:"v=0+3·4=12 m/s."},
        {q:"En MRU la aceleración es:",o:["Cero","Constante no nula","Variable","Infinita"],r:0,e:"La velocidad constante implica aceleración cero."}]},
      {titulo:"Leyes de Newton",teoria:"La primera ley explica la inercia; la segunda relaciona fuerza, masa y aceleración; la tercera establece pares de acción y reacción.",puntos:["Primera ley: inercia","Segunda ley: F=ma","Tercera ley: acción y reacción"],preguntas:[
        {q:"Fuerza sobre una masa de 4 kg con aceleración 3 m/s²:",o:["7 N","12 N","16 N","24 N"],r:1,e:"F=ma=4·3=12 N."},
        {q:"La tendencia a mantener el estado de movimiento se llama:",o:["Potencia","Inercia","Impulso","Trabajo"],r:1,e:"Es la propiedad descrita por la primera ley."},
        {q:"Acción y reacción actúan:",o:["Sobre el mismo cuerpo","En cuerpos diferentes","Solo en reposo","En un solo sentido"],r:1,e:"Son fuerzas iguales y opuestas aplicadas a cuerpos distintos."}]},
      {titulo:"Trabajo y energía",teoria:"El trabajo transfiere energía cuando una fuerza produce desplazamiento. La energía cinética depende del movimiento y la potencial gravitatoria de la altura.",puntos:["Trabajo: W=F·d·cosθ","Cinética: Ec=mv²/2","Potencial: Ep=mgh"],preguntas:[
        {q:"Trabajo de una fuerza de 10 N que desplaza 5 m en su dirección:",o:["2 J","15 J","50 J","100 J"],r:2,e:"W=F·d=10·5=50 J."},
        {q:"La energía asociada al movimiento es:",o:["Potencial","Cinética","Térmica solamente","Química"],r:1,e:"La energía cinética depende de la velocidad."},
        {q:"La unidad de potencia es:",o:["Joule","Newton","Watt","Pascal"],r:2,e:"La potencia se mide en watts."}]}
    ],
    quimica: [
      {titulo:"Estructura atómica",teoria:"El átomo posee un núcleo con protones y neutrones, rodeado por electrones. El número atómico Z indica protones y el número de masa A suma protones y neutrones.",puntos:["Z = número de protones","A = protones + neutrones","Átomo neutro: protones = electrones"],preguntas:[
        {q:"El número atómico representa la cantidad de:",o:["Neutrones","Protones","Nucleones","Orbitales"],r:1,e:"Z es el número de protones."},
        {q:"Un átomo con Z=8 neutro tiene:",o:["4 electrones","8 electrones","16 electrones","0 electrones"],r:1,e:"En un átomo neutro, electrones=protones."},
        {q:"La partícula sin carga es:",o:["Protón","Electrón","Neutrón","Catión"],r:2,e:"El neutrón posee carga eléctrica cero."}]},
      {titulo:"Enlaces químicos",teoria:"Los átomos se enlazan para alcanzar mayor estabilidad. El enlace iónico transfiere electrones, el covalente los comparte y el metálico forma un mar de electrones.",puntos:["Iónico: metal + no metal","Covalente: entre no metales","Metálico: entre metales"],preguntas:[
        {q:"En NaCl predomina el enlace:",o:["Covalente","Iónico","Metálico","Puente de hidrógeno"],r:1,e:"Sodio transfiere un electrón al cloro."},
        {q:"Dos no metales suelen formar enlace:",o:["Iónico","Covalente","Metálico","Nuclear"],r:1,e:"Los no metales comparten electrones."},
        {q:"En un enlace covalente los electrones se:",o:["Destruyen","Comparten","Convierten en protones","Pierden siempre"],r:1,e:"El enlace covalente implica compartición."}]},
      {titulo:"Estequiometría",teoria:"La estequiometría estudia las relaciones cuantitativas de una reacción química. Un mol contiene 6,022×10²³ partículas y su masa depende de la masa molar.",puntos:["n=m/M","1 mol=6,022×10²³ partículas","La ecuación debe estar balanceada"],preguntas:[
        {q:"Un mol contiene aproximadamente:",o:["6,022×10²³ partículas","3×10⁸ partículas","9,8 partículas","1 partícula"],r:0,e:"Es el número de Avogadro."},
        {q:"Masa molar aproximada del H₂O:",o:["16 g/mol","17 g/mol","18 g/mol","20 g/mol"],r:2,e:"2(1)+16=18 g/mol."},
        {q:"Antes de calcular una relación estequiométrica se debe:",o:["Calentar siempre","Balancear la ecuación","Eliminar productos","Cambiar símbolos"],r:1,e:"Los coeficientes balanceados dan la proporción molar."}]}
    ]
  };

  const RECURSOS_BASE = [
    {id:"superbiblioteca",titulo:"SuperBiblioteca",curso:"Todas las universidades",categoria:"coleccion",universidades:["TODAS"],destacado:true,tipo:"drive",icono:"🌟",descripcion:"Libros, resúmenes, exámenes recopilados, simulacros y material adicional para reforzar cualquier ruta de admisión.",url:"https://drive.google.com/drive/folders/1Mn_zvTYOMuE034l92NzXv0obgKLV-J8u"},
    {id:"biblioteca-uni",titulo:"Biblioteca UNI",curso:"Exclusiva para la ruta UNI",categoria:"universidad",universidades:["UNI"],destacado:true,tipo:"drive",icono:"🏗️",descripcion:"Ciclos, separatas, prácticas y videoclases orientadas a la Universidad Nacional de Ingeniería.",url:"https://drive.google.com/drive/folders/1fwWqVkDdsorQa4rwy-m53pM9lpWKXNGp"},
    {id:"biblioteca-unmsm",titulo:"Biblioteca San Marcos",curso:"Exclusiva para la ruta UNMSM",categoria:"universidad",universidades:["UNMSM"],destacado:true,tipo:"drive",icono:"🦁",descripcion:"Material anual, modular, cursos selectos y repaso orientado a la Universidad Nacional Mayor de San Marcos.",url:"https://drive.google.com/drive/folders/1_nxZQHmYgDyj97GPnB6fX1PgM1JxxeNb"},
    {id:"academias",titulo:"Academias",curso:"Todas las universidades",categoria:"coleccion",universidades:["TODAS"],destacado:true,tipo:"drive",icono:"🎓",descripcion:"Material organizado por academias y años: ADUNI, César Vallejo, Pamer, Saco Oliveros, grupos de ciencias y más.",url:"https://drive.google.com/drive/folders/1mew7Kxg-FLXkVN__c0rGLTbKNK401Bxr"},
    {titulo:"Razonamiento Matemático",curso:"Razonamiento Matemático",tipo:"drive",icono:"🧠",descripcion:"Teoría, métodos y problemas de razonamiento matemático.",url:"https://drive.google.com/drive/u/0/folders/1p3QQKit7C0_Gfr8oe42g9qXDHO_A3NzF"},
    {titulo:"Aritmética",curso:"Aritmética",tipo:"drive",icono:"🔢",descripcion:"Teoría, fórmulas y ejercicios de aritmética.",url:"https://drive.google.com/drive/u/0/folders/19guT8U5dyuocLVQ24hmSiLqj8NZ8eFv5"},
    {titulo:"Álgebra",curso:"Álgebra",tipo:"drive",icono:"📘",descripcion:"Teoría y ejercicios de álgebra.",url:"https://drive.google.com/drive/u/0/folders/10kQ1GyKz1WBJHavd4JgGO8UswTGqh-MF"},
    {titulo:"Geometría",curso:"Geometría",tipo:"drive",icono:"📐",descripcion:"Teoremas, gráficos y problemas de geometría.",url:"https://drive.google.com/drive/u/0/folders/1qFVIxTvHT9lBM_Pskxe0rUc2M_hfcj8g"},
    {titulo:"Trigonometría",curso:"Trigonometría",tipo:"drive",icono:"📊",descripcion:"Identidades, fórmulas y ejercicios de trigonometría.",url:"https://drive.google.com/drive/u/0/folders/1DEJLUzI0eoNz1AEP9rZ0nxk5u6gl2Uk9"},
    {titulo:"Física",curso:"Física",tipo:"drive",icono:"⚛️",descripcion:"Teoría, fórmulas y problemas de física.",url:"https://drive.google.com/drive/u/0/folders/1669mNrVxBhwnea97RNFMRZcvMzbGy9Vw"},
    {titulo:"Química",curso:"Química",tipo:"drive",icono:"🧪",descripcion:"Teoría y ejercicios de química preuniversitaria.",url:"https://drive.google.com/drive/u/0/folders/1y7L-KZH4nM9ANGbxU_ApbcGzWpvNzKH4"},
    {titulo:"Biología",curso:"Biología",tipo:"drive",icono:"🧬",descripcion:"Teoría y materiales de biología.",url:"https://drive.google.com/drive/u/0/folders/1pOSjJWcFTSTynrZIObioW-xoIqffQ4T1"},
    {titulo:"Lenguaje",curso:"Lenguaje",tipo:"drive",icono:"✍️",descripcion:"Gramática, normativa y comprensión del lenguaje.",url:"https://drive.google.com/drive/u/0/folders/1OXacvq8tnsXeva83ahNDdHp6z2w29abl"},
    {titulo:"Literatura",curso:"Literatura",tipo:"drive",icono:"📖",descripcion:"Obras, autores y teoría literaria.",url:"https://drive.google.com/drive/u/0/folders/180vVSJdEGlrm9hjFtTpTsKf8uxlkv9rs"},
    {titulo:"Razonamiento Verbal",curso:"Razonamiento Verbal",tipo:"drive",icono:"💬",descripcion:"Analogías, conectores, vocabulario y comprensión verbal.",url:"https://drive.google.com/drive/u/0/folders/160LzOGm5po3Y-lxlH-umMOUHA2xmfYO7"},
    {titulo:"Historia",curso:"Historia",tipo:"drive",icono:"🌎",descripcion:"Historia del Perú, universal y ciencias sociales.",url:"https://drive.google.com/drive/u/0/folders/1zjYJJEu1DfHG380o7ngt33ssK0LthEL9"},
    {titulo:"Economía",curso:"Economía",tipo:"drive",icono:"📈",descripcion:"Conceptos, mercado y economía peruana.",url:"https://drive.google.com/drive/u/0/folders/1B4c5xNv0w91DrbKr-67w7tbQZcoUP4IW"},
    {titulo:"Educación Cívica",curso:"Educación Cívica",tipo:"drive",icono:"⚖️",descripcion:"Constitución, ciudadanía y derechos.",url:"https://drive.google.com/drive/u/0/folders/1gqpwZz4jjigkf1GyXcsxpc4HjdRvKXaq"}
  ];

  let cursoActual = null, temaActual = 0, evaluacion = null, inicializado = false, bancoJSONActual = null, recursosJSON = [], videosJSON = [];
  const cacheBancos = {};

  function cursoParaRuta(cursoId) {
    return window.obtenerCursoRuta?.(cursoId) || window.CURSOS_PREUNI?.[cursoId] || null;
  }

  function preguntasBancoAlineadas(banco, cursoId) {
    const preguntas=[];
    (banco?.temas||[]).forEach((tema,temaIndice)=>Object.entries(tema.niveles||{}).forEach(([nivel,grupo])=>(grupo||[]).forEach(pregunta=>preguntas.push({...pregunta,courseId:cursoId,tema:tema.titulo,temaIndice,nivel}))));
    return window.filtrarPreguntasAdmision?.(cursoId,preguntas)||preguntas;
  }

  async function inicializar() {
    if (inicializado) return;
    inicializado = true;
    reemplazarLogo();
    inyectarNavegacion();
    inyectarTeoria();
    inyectarPantallas();
    await cargarConfiguracionMultimedia();
    renderizarBiblioteca();
  }

  async function cargarConfiguracionMultimedia(){
    try{const [r,v]=await Promise.all([fetch("json/recursos-biblioteca.json",{cache:"no-store"}),fetch("json/videos-cursos.json",{cache:"no-store"})]);if(r.ok){const data=await r.json();recursosJSON=Array.isArray(data.recursos)?data.recursos:[]}if(v.ok){const data=await v.json();videosJSON=Array.isArray(data.videos)?data.videos:[]}}catch(error){console.warn("No se pudo cargar la configuración multimedia; se usarán los recursos locales.",error)}
  }

  function reemplazarLogo() {
    const logo=document.querySelector(".sidebar-logo");
    if(logo) logo.innerHTML='<img class="sidebar-brand-image" src="assets/uniprep-logo.png" alt="UniPrep">';
  }

  function inyectarNavegacion() {
    if(document.querySelector('[data-screen="biblioteca"]')) return;
    const formula=[...document.querySelectorAll(".nav-item")].find(x=>x.textContent.includes("Formulario"));
    if(!formula) return;
    const item=document.createElement("div");
    item.className="nav-item"; item.dataset.screen="biblioteca"; item.innerHTML="<span class='nav-icon'>📚</span> Biblioteca";
    item.onclick=()=>window.go("biblioteca",item); formula.after(item);
  }

  function inyectarTeoria() {
    const temas=document.getElementById("lesson-topics");
    if(temas && !document.getElementById("lesson-theory")) temas.closest(".card").insertAdjacentHTML("afterend",'<div class="card lesson-theory-card" id="lesson-theory"><div class="card-title">Contenido teórico</div><p>Selecciona Álgebra, Física o Química.</p></div>');
    document.querySelectorAll('#videoclase [onclick*="ejercicios"]').forEach((card,i)=>card.onclick=()=>iniciarEvaluacionTema(["basico","intermedio","avanzado","admision"][i%4]));
    const player=document.querySelector("#videoclase .video-player"); if(player) player.id="lesson-video-container";
  }

  function inyectarPantallas() {
    const content=document.querySelector(".content"); if(!content) return;
    if(!document.getElementById("course-evaluation")) content.insertAdjacentHTML("beforeend",`<div class="screen" id="course-evaluation"><div class="quiz-header"><button class="btn btn-ghost btn-sm" onclick="salirEvaluacionCurso()">← Volver</button><div style="flex:1;margin:0 16px"><div class="eval-head-line"><span id="course-eval-counter"></span><span id="course-eval-subject"></span></div><div class="pbar"><div class="pbar-fill" id="course-eval-progress" style="background:var(--purple)"></div></div></div><div class="quiz-timer" id="course-eval-score"></div></div><div class="question-card"><div class="question-subject" id="course-eval-topic"></div><div class="question-text" id="course-eval-question"></div></div><div class="options-grid" id="course-eval-options"></div><div class="card eval-feedback" id="course-eval-feedback"></div><div class="eval-actions"><button class="btn btn-primary" id="course-eval-next" onclick="siguientePreguntaCurso()" disabled>Siguiente →</button></div></div>`);
    if(!document.getElementById("biblioteca")) content.insertAdjacentHTML("beforeend",`<div class="screen" id="biblioteca"><div class="page-header"><div><div class="page-title">Biblioteca UniPrep</div><div class="page-subtitle">Colecciones generales y material exclusivo según tu universidad</div></div><span class="badge badge-green">Solo lectura</span></div><div id="library-route-note" class="library-route-note"></div><div class="library-toolbar"><input id="library-search" type="search" placeholder="Buscar colección, curso o material..." oninput="renderizarBiblioteca()"><span class="library-readonly-label">☁️ Google Drive</span></div><div class="library-help card"><strong>📁 Biblioteca personalizada</strong><span>SuperBiblioteca y Academias aparecen en todas las rutas. Las bibliotecas UNI y San Marcos solo se muestran al estudiante que haya elegido esa universidad.</span></div><div id="library-grid" class="library-grid"></div></div>`);
  }

  async function cargarBancoCurso(cursoId) {
    if (cacheBancos[cursoId]) return cacheBancos[cursoId];
    try {
      const respuesta = await fetch(`json/quiz-cursos/${cursoId}.json`, {cache:"no-store"});
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const banco = await respuesta.json();
      cacheBancos[cursoId] = banco;
      return banco;
    } catch (error) {
      const automatico=crearBancoAutomatico(cursoId);
      if(automatico){cacheBancos[cursoId]=automatico;return automatico;}
      console.info(`UniPrep: no se encontró json/quiz-cursos/${cursoId}.json; se usará el contenido interno.`, error);
      return null;
    }
  }

  function crearBancoAutomatico(cursoId){
    const curso=cursoParaRuta(cursoId), banco=Array.isArray(window.PREGUNTAS_CEPRE)?window.PREGUNTAS_CEPRE:[];
    if(!curso||!banco.length)return null;
    const claves={rm:["razonamiento matemático"],aritmetica:["aritmética"],algebra:["álgebra"],geometria:["geometría"],trigonometria:["trigonometría"],fisica:["física"],quimica:["química"],biologia:["biología"],medio_ambiente:["medio ambiente","ecología"],anatomia:["anatomía"],psicologia:["psicología"],rv:["razonamiento verbal"],comprension_lectora:["comprensión lectora","lenguaje"],lenguaje:["lenguaje"],literatura:["literatura"],historia:["historia universal","historia"],historia_peru:["historia del perú","historia"],geografia:["geografía"],filosofia:["filosofía"],economia:["economía"],civica:["educación cívica"]}[cursoId]||[];
    let candidatas=banco.filter(p=>claves.some(k=>String(p.tema||"").toLowerCase().includes(k)));
    if(!candidatas.length)candidatas=banco.filter(p=>String(p.area||"").toLowerCase().includes(curso.nombre.split(" ")[0].toLowerCase()));
    if(!candidatas.length)return null;
    const convertir=p=>({pregunta:p.q,alternativas:p.o,respuesta:p.r,solucion:p.e,explicacion:`Este ejercicio pertenece al banco CEPRE de ${p.tema}. ${p.e}`});
    return {courseId:cursoId,nombre:curso.nombre,temas:curso.temas.map((t,ti)=>{const tomar=(inicio)=>Array.from({length:Math.min(3,candidatas.length)},(_,i)=>convertir(candidatas[(ti*3+inicio+i)%candidatas.length]));return {titulo:t.titulo,duracion:t.duracion,teoria:t.descripcion,puntos:[`Conceptos esenciales de ${t.titulo}`,"Aplicación guiada con preguntas CEPRE","Corrección inmediata y explicación completa"],niveles:{basico:tomar(0),intermedio:tomar(3),avanzado:tomar(6),admision:tomar(9)}};})};
  }

  function actualizarTarjetasNiveles(banco, cursoId, temaCatalogo) {
    const tarjetas=[...document.querySelectorAll('#videoclase [onclick*="ejercicios"]')].slice(0,4);
    const niveles=["basico","intermedio","avanzado","admision"];
    const alineadas=preguntasBancoAlineadas(banco,cursoId).filter(p=>String(p.tema).toLowerCase()===String(temaCatalogo?.titulo||"").toLowerCase());
    tarjetas.forEach((tarjeta,indice)=>{
      const nivel=niveles[indice], cantidad=alineadas.filter(p=>p.nivel===nivel).length;
      tarjeta.onclick=()=>iniciarEvaluacionTema(nivel);
      const detalle=[...tarjeta.querySelectorAll("div")].find(x=>x.style.fontSize==="11px");
      if(detalle) detalle.textContent=`${cantidad} preguntas de este tema · ${nivel==="basico"?"básico":nivel==="admision"?"admisión":nivel}`;
      const boton=tarjeta.querySelector("button");
      if(boton){boton.textContent=cantidad?"Entrenar":"Sin preguntas";boton.disabled=!cantidad;}
    });
  }

  async function renderizarContenido(cursoId, indice) {
    cursoActual=cursoId; temaActual=indice;
    bancoJSONActual=null;
    bancoJSONActual=await cargarBancoCurso(cursoId);
    if(cursoActual!==cursoId||temaActual!==indice)return;
    const cursoRuta=cursoParaRuta(cursoId);
    const temaCatalogo=cursoRuta?.temas?.[indice];
    const temaJSON=bancoJSONActual?.temas?.find(t=>String(t.titulo).toLowerCase()===String(temaCatalogo?.titulo||"").toLowerCase());
    const temaInterno=CONTENIDO[cursoId]?.find(t=>String(t.titulo).toLowerCase()===String(temaCatalogo?.titulo||"").toLowerCase());
    const tema=temaCatalogo||temaJSON||temaInterno;
    const teoria=document.getElementById("lesson-theory");
    const alineadas=preguntasBancoAlineadas(bancoJSONActual,cursoId);
    const total=alineadas.length;
    const totalTema=alineadas.filter(p=>String(p.tema).toLowerCase()===String(temaCatalogo?.titulo||"").toLowerCase()).length;
    if(teoria) teoria.innerHTML=tema?`<div class="card-title">📚 Tema de tu ruta académica</div><div class="official-topic-heading"><span>${esc(tema.subarea||cursoRuta?.area||"Preuniversitario")}</span><small>${esc(window.obtenerPerfilPreguntasAdmision?.()?.sigla||"RUTA")}</small></div><h3>${esc(tema.titulo)}</h3><p>${esc(tema.teoria||tema.descripcion||"Contenido incluido en tu ruta de preparación.")}</p><ul>${(tema.puntos||[]).map(p=>`<li>${esc(p)}</li>`).join("")}</ul><div class="official-topic-actions"><button class="btn btn-primary btn-sm" onclick="iniciarEvaluacionTema('todos')">Practicar ${totalTema} alineadas →</button><button class="btn btn-ghost btn-sm" onclick="go('biblioteca',null)">Abrir teoría en Drive</button></div>`:`<div class="card-title">Contenido en preparación</div><p>Este tema será incorporado próximamente.</p>`;
    txt("lesson-exercises",`📝 Este tema: ${totalTema} · Curso: ${total}`);
    actualizarTarjetasNiveles(bancoJSONActual,cursoId,temaCatalogo);
    renderizarVideo(cursoId,indice,tema);
  }

  function renderizarVideo(cursoId,indice,tema,seleccion=0) {
    const box=document.getElementById("lesson-video-container"); if(!box) return;
    const configs=videosJSON.filter(v=>v.courseId===cursoId&&Number(v.temaIndice)===Number(indice)&&String(v.url||"").trim());
    if(!configs.length) {box.innerHTML=`<div class="video-bg"><div class="video-pending-icon">🎬</div><div class="video-title">${esc(tema?.titulo||"Video de la clase")}</div><div class="video-subtitle">Videoclase en preparación</div></div>`;return;}
    const posicion=Math.max(0,Math.min(configs.length-1,Number(seleccion)||0)),config=configs[posicion],url=String(config.url).trim();
    const yt=convertirYoutube(url),drive=convertirDrive(url),directo=convertirVideoDirecto(url);
    const selector=configs.length>1?`<div class="lesson-video-picker" role="group" aria-label="Videoclases del tema">${configs.map((v,i)=>`<button type="button" class="${i===posicion?"active":""}" onclick="seleccionarVideoTema('${esc(cursoId)}',${Number(indice)},${i})">${i+1}. ${esc(v.titulo||`Clase ${i+1}`)}</button>`).join("")}</div>`:"";
    box.innerHTML=yt||drive?`<iframe src="${esc(yt||drive)}" title="${esc(config.titulo||"Video de clase")}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>${selector}`:directo?`<video src="${esc(directo)}" title="${esc(config.titulo||"Video de clase")}" controls preload="metadata" playsinline></video>${selector}`:`<div class="video-bg"><div class="video-pending-icon">⚠️</div><div class="video-title">Enlace de video no compatible</div><div class="video-subtitle">Usa YouTube, un archivo público de Drive o una ruta .mp4, .webm o .ogg.</div></div>`;
  }

  function seleccionarVideoTema(cursoId,indice,posicion){
    const tema=cursoParaRuta(cursoId)?.temas?.[Number(indice)];
    renderizarVideo(cursoId,Number(indice),tema,Number(posicion));
  }

  function convertirYoutube(url){
    try{
      const u=new URL(url),host=u.hostname.replace(/^www\./,"");
      let id="";
      if(host==="youtu.be") id=u.pathname.split("/").filter(Boolean)[0]||"";
      else if(host==="youtube.com"||host==="m.youtube.com"||host==="youtube-nocookie.com"){
        if(u.pathname==="/watch") id=u.searchParams.get("v")||"";
        else id=u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1]||"";
      }
      const tiempo=String(u.searchParams.get("t")||u.searchParams.get("start")||"").toLowerCase();
      const directo=tiempo.match(/^\d+s?$/)?parseInt(tiempo,10):0;
      const partes=tiempo.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      const inicio=directo||(partes?Number(partes[1]||0)*3600+Number(partes[2]||0)*60+Number(partes[3]||0):0);
      return /^[\w-]{6,}$/.test(id)?`https://www.youtube.com/embed/${id}${inicio?`?start=${inicio}`:""}`:"";
    }catch(_){return "";}
  }
  function convertirDrive(url){const m=url.match(/drive\.google\.com\/file\/d\/([^/]+)/);return m?`https://drive.google.com/file/d/${m[1]}/preview`:"";}
  function convertirVideoDirecto(url){
    try{
      const u=new URL(url,window.location.href);
      if(!/^https?:$/.test(u.protocol))return "";
      return /\.(?:mp4|webm|ogg)$/i.test(u.pathname)?u.href:"";
    }catch(_){return "";}
  }

  async function iniciarEvaluacionTema(nivel) {
    if(!cursoActual)return alert("Selecciona primero un curso y un tema.");
    const temaCatalogo=cursoParaRuta(cursoActual)?.temas?.[temaActual];
    if(typeof window.iniciarPracticaTemaNivel==="function"){
      const nivelElegido=nivel==="tema"?"todos":nivel;
      return window.iniciarPracticaTemaNivel(cursoActual,temaCatalogo?.titulo||temaActual,nivelElegido,nivelElegido==="todos"?40:10);
    }
    bancoJSONActual=await cargarBancoCurso(cursoActual);
    const temaJSON=bancoJSONActual?.temas?.find(t=>String(t.titulo).toLowerCase()===String(temaCatalogo?.titulo||"").toLowerCase()), temaInterno=CONTENIDO[cursoActual]?.[temaActual];
    let preguntas=[];
    if(temaJSON){
      const grupos=["tema","todos"].includes(nivel)?Object.values(temaJSON.niveles||{}):[temaJSON.niveles?.[nivel]||[]];
      preguntas=grupos.flat().map(p=>({q:p.pregunta,o:p.alternativas,r:Number(p.respuesta),solucion:p.solucion||"",explicacion:p.explicacion||""}));
    } else if(temaInterno) preguntas=(temaInterno.preguntas||[]).map(p=>({...p,solucion:"",explicacion:p.e||""}));
    if(!preguntas.length)return alert(`No hay preguntas en este nivel. Agrégalas en json/quiz-cursos/${cursoActual}.json`);
    evaluacion={preguntas,indice:0,correctas:0,respondida:false,tema:temaJSON||temaInterno,nivel};window.go("course-evaluation",null);pintarPregunta();
  }
  function pintarPregunta(){const e=evaluacion,p=e.preguntas[e.indice];txt("course-eval-counter",`Pregunta ${e.indice+1} de ${e.preguntas.length}`);txt("course-eval-subject",window.CURSOS_PREUNI?.[cursoActual]?.nombre||cursoActual);txt("course-eval-topic",e.tema.titulo);txt("course-eval-question",p.q);txt("course-eval-score",`${e.correctas} correctas`);document.getElementById("course-eval-progress").style.width=`${(e.indice+1)/e.preguntas.length*100}%`;document.getElementById("course-eval-feedback").style.display="none";const next=document.getElementById("course-eval-next");next.disabled=true;next.textContent=e.indice===e.preguntas.length-1?"Ver resultado":"Siguiente →";document.getElementById("course-eval-options").innerHTML=p.o.map((o,i)=>`<button class="option-btn" onclick="responderEvaluacionCurso(this,${i})"><span class="option-letter">${"ABCD"[i]}</span><span class="option-text">${esc(o)}</span></button>`).join("");}
  function responder(btn,i){if(evaluacion.respondida)return;evaluacion.respondida=true;const p=evaluacion.preguntas[evaluacion.indice],bien=i===p.r;p.seleccion=i;p.correcta=bien;if(bien){evaluacion.correctas++;window.celebrarRespuestaCorrecta?.({xp:5,combo:evaluacion.correctas,nivel:evaluacion.nivel})}document.querySelectorAll("#course-eval-options .option-btn").forEach((b,j)=>{b.disabled=true;if(j===p.r)b.classList.add("correct");else if(j===i)b.classList.add("wrong")});const f=document.getElementById("course-eval-feedback");f.style.display="block";f.className=`card eval-feedback ${bien?"is-correct":"is-wrong"}`;f.innerHTML=`<strong>${bien?"✓ ¡Correcto!":"✕ Incorrecto"}</strong><p><b>Respuesta correcta:</b> ${"ABCD"[p.r]}. ${esc(p.o[p.r])}</p>${p.solucion?`<p><b>Solución:</b> ${esc(p.solucion)}</p>`:""}<p><b>Explicación:</b> ${esc(p.explicacion||p.e||"Revisa la teoría del tema.")}</p>`;document.getElementById("course-eval-next").disabled=false;txt("course-eval-score",`${evaluacion.correctas} correctas`);}
  function siguiente(){if(!evaluacion.respondida)return;if(evaluacion.indice<evaluacion.preguntas.length-1){evaluacion.indice++;evaluacion.respondida=false;pintarPregunta();}else finalizarEvaluacion();}
  async function finalizarEvaluacion(){const e=evaluacion,total=e.preguntas.length,pc=Math.round(e.correctas/total*100);document.getElementById("course-eval-options").innerHTML="";document.getElementById("course-eval-question").innerHTML=`Resultado: ${e.correctas}/${total} (${pc}%)`;const revision=e.preguntas.map((p,i)=>`<div style="padding:12px 0;border-top:1px solid var(--border)"><b>${i+1}. ${esc(p.q)}</b><p>Tu respuesta: ${p.seleccion==null?"Sin responder":`${"ABCD"[p.seleccion]}. ${esc(p.o[p.seleccion])}`} ${p.correcta?"✓":"✕"}</p><p><b>Correcta:</b> ${"ABCD"[p.r]}. ${esc(p.o[p.r])}</p>${p.solucion?`<p><b>Solución:</b> ${esc(p.solucion)}</p>`:""}<p><b>Explicación:</b> ${esc(p.explicacion||p.e||"Revisa la teoría del tema.")}</p></div>`).join("");const f=document.getElementById("course-eval-feedback");f.style.display="block";f.className="card eval-feedback result";f.innerHTML=`<strong>${pc>=70?"🎉 Tema aprobado":"📚 Sigue practicando"}</strong><p>${pc>=70?"Dominaste los conceptos principales.":"Repasa la teoría y vuelve a intentarlo."}</p><h3>Revisión completa</h3>${revision}<button class="btn btn-primary btn-sm" onclick="salirEvaluacionCurso()">Volver a la clase</button>`;document.getElementById("course-eval-next").style.display="none";if(window.registrarNotificacion)registrarNotificacion({tipo:"curso",titulo:`Evaluación completada: ${e.tema.titulo}`,cuerpo:`Obtuviste ${pc}% (${e.correctas}/${total}).`});try{if(window.registrarActividad)await registrarActividad({tipo:"curso",titulo:`Evaluación: ${e.tema.titulo}`,descripcion:`Resultado ${pc}%`,xpGanado:e.correctas*5});if(window.actualizarRachaEstudio)await actualizarRachaEstudio();}catch(err){console.warn(err)}}
  function salirEvaluacion(){document.getElementById("course-eval-next").style.display="";window.go("videoclase",null);}

  function recursos(){return recursosJSON.length?recursosJSON:RECURSOS_BASE;}
  function enlaceDriveValido(url){try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="drive.google.com"||u.hostname.endsWith(".drive.google.com"));}catch(_){return false;}}
  function universidadBiblioteca(){return String(window.obtenerSeleccionAdmision?.()?.universidadCorta||"GENERAL").toUpperCase();}
  function recursoVisible(r,universidad){const permitidas=Array.isArray(r.universidades)&&r.universidades.length?r.universidades.map(x=>String(x).toUpperCase()):["TODAS"];return permitidas.includes("TODAS")||permitidas.includes(universidad);}
  function tarjetaBiblioteca(r){const disponible=enlaceDriveValido(r.url),clases=`library-card${r.destacado?" library-card-featured":""}${r.categoria==="universidad"?" library-card-university":""}`;return `<article class="${clases}"><div class="library-card-top"><div class="library-icon">${esc(r.icono||"📁")}</div>${r.destacado?'<span class="library-featured-badge">COLECCIÓN</span>':''}</div><div class="library-type">${r.categoria==="universidad"?"RUTA PERSONALIZADA":"GOOGLE DRIVE"}</div><h3>${esc(r.titulo)}</h3><p class="library-course">${esc(r.curso||"General")}</p>${r.descripcion?`<p class="library-description">${esc(r.descripcion)}</p>`:""}<div class="library-actions"><button class="btn btn-primary btn-sm" onclick="abrirRecursoBiblioteca(${r.realIndex})" ${disponible?"":"disabled"}>Explorar materiales ↗</button></div></article>`;}
  function renderizarBiblioteca(){const grid=document.getElementById("library-grid");if(!grid)return;const universidad=universidadBiblioteca(),q=(document.getElementById("library-search")?.value||"").trim().toLowerCase();const datos=recursos().map((r,realIndex)=>({...r,realIndex})).filter(r=>r.tipo==="drive"&&recursoVisible(r,universidad)&&`${r.titulo} ${r.curso} ${r.descripcion||""}`.toLowerCase().includes(q));const colecciones=datos.filter(r=>r.destacado),cursos=datos.filter(r=>!r.destacado);const nota=document.getElementById("library-route-note");if(nota)nota.innerHTML=`<span>🎯</span><div><small>RUTA ACTIVA</small><strong>${esc(universidad==="GENERAL"?"Preparación general":universidad)}</strong><em>${universidad==="UNI"?"Biblioteca UNI habilitada":universidad==="UNMSM"?"Biblioteca San Marcos habilitada":"SuperBiblioteca y Academias disponibles"}</em></div>`;const bloque=(titulo,subtitulo,items)=>items.length?`<section class="library-section"><div class="library-section-heading"><div><small>${esc(subtitulo)}</small><h2>${esc(titulo)}</h2></div><span>${items.length} ${items.length===1?"recurso":"recursos"}</span></div><div class="library-section-grid">${items.map(tarjetaBiblioteca).join("")}</div></section>`:"";grid.innerHTML=datos.length?`${bloque("Colecciones principales","ACCESO SEGÚN TU RUTA",colecciones)}${bloque("Materiales por curso","TEORÍA Y PRÁCTICA",cursos)}`:'<div class="card library-empty">No se encontraron materiales para esta búsqueda.</div>';document.getElementById("library-visible-count")?.replaceChildren(document.createTextNode(String(datos.length)));}
  function abrirRecurso(i){const r=recursos()[i],url=String(r?.url||"").trim();if(!enlaceDriveValido(url))return alert("Este material todavía no está disponible.");window.open(url,"_blank","noopener,noreferrer");}
  function txt(id,v){const e=document.getElementById(id);if(e)e.textContent=v} function esc(v){const d=document.createElement("div");d.textContent=String(v??"");return d.innerHTML}

  window.inicializarModulosAprendizaje=inicializar;window.renderizarContenidoAprendizaje=renderizarContenido;window.seleccionarVideoTema=seleccionarVideoTema;window.iniciarEvaluacionTema=iniciarEvaluacionTema;window.responderEvaluacionCurso=responder;window.siguientePreguntaCurso=siguiente;window.salirEvaluacionCurso=salirEvaluacion;window.renderizarBiblioteca=renderizarBiblioteca;window.abrirRecursoBiblioteca=abrirRecurso;
  document.addEventListener("uniprep:admission-change",renderizarBiblioteca);
  document.addEventListener("uniprep:admission-ready",renderizarBiblioteca);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",inicializar);else inicializar();
})();
