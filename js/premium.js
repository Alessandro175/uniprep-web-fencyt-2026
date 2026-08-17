(function(){
  "use strict";
  let bibliotecaDecorada=false,celebracionHecha=false,observadorVisual=null;

  function crearAtmosfera(){
    if(document.querySelector(".visual-atmosphere"))return;
    const capa=document.createElement("div");
    capa.className="visual-atmosphere";
    capa.setAttribute("aria-hidden","true");
    capa.innerHTML="<span></span><span></span><span></span>";
    document.body.prepend(capa);
  }

  function prepararEntradaVisual(){
    if(!document?.querySelectorAll)return;
    const activos=document.querySelectorAll(".screen.active");
    activos.forEach(pantalla=>{
      pantalla.querySelectorAll(":scope > *, .quick-stats > *, .grid > *").forEach((elemento,indice)=>{
        elemento.style.setProperty("--visual-order",String(Math.min(indice,12)));
      });
    });
  }

  function activarProfundidadHero(){
    document.addEventListener("pointermove",evento=>{
      const hero=evento.target.closest(".welcome-banner");
      if(!hero)return;
      const caja=hero.getBoundingClientRect();
      hero.style.setProperty("--visual-x",`${Math.round(((evento.clientX-caja.left)/caja.width)*100)}%`);
      hero.style.setProperty("--visual-y",`${Math.round(((evento.clientY-caja.top)/caja.height)*100)}%`);
    },{passive:true});
  }

  function toast(mensaje){
    document.querySelectorAll(".premium-toast").forEach(x=>x.remove());
    const t=document.createElement("div");t.className="premium-toast";t.textContent=mensaje;document.body.appendChild(t);
    setTimeout(()=>t.remove(),3700);
  }

  function decorarBiblioteca(){
    const pantalla=document.getElementById("biblioteca"),barra=pantalla?.querySelector(".library-toolbar");
    if(!pantalla||!barra||pantalla.querySelector(".premium-library-stats"))return;
    barra.insertAdjacentHTML("beforebegin",`<div class="premium-library-stats">
      <div class="premium-library-stat"><b id="library-visible-count">16</b><span>Recursos visibles</span></div>
      <div class="premium-library-stat"><b>4</b><span>Colecciones maestras</span></div>
      <div class="premium-library-stat"><b>Drive</b><span>Teoría y ejercicios</span></div>
      <div class="premium-library-stat"><b>Seguro</b><span>Acceso de solo lectura</span></div>
    </div>`);
    const titulo=pantalla.querySelector(".page-title");if(titulo)titulo.textContent="Biblioteca Premium";
    bibliotecaDecorada=true;
  }

  function decorarNavegacion(){
    if(!document?.querySelector)return;
    const item=document.querySelector('[data-screen="biblioteca"]');
    if(item&&!item.querySelector(".nav-new"))item.insertAdjacentHTML("beforeend",'<span class="nav-new" style="margin-left:auto;font-size:8px;font-weight:800;color:#07101e;background:linear-gradient(90deg,#42c8ff,#39e6b0);padding:3px 6px;border-radius:99px">PLUS</span>');
  }

  function celebrarResultado(){
    const pantalla=document.getElementById("exam-result");
    if(!pantalla?.classList.contains("active")||celebracionHecha)return;
    celebracionHecha=true;
    const score=parseInt(document.getElementById("exam-final-score")?.textContent)||0;
    toast(score>=70?"🏆 ¡Excelente! Tu resultado quedó guardado.":"💪 Resultado guardado. Revisa tus errores y vuelve más fuerte.");
  }

  function observar(){
    observadorVisual=new MutationObserver(()=>{
      if(!document?.body)return;
      decorarNavegacion();
      prepararEntradaVisual();
      if(document.getElementById("biblioteca")?.classList.contains("active"))decorarBiblioteca();
      if(!document.getElementById("exam-result")?.classList.contains("active"))celebracionHecha=false;
      celebrarResultado();
    });
    observadorVisual.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],childList:true});
  }

  function iniciar(){
    document.documentElement.classList.add("uniprep-premium");
    crearAtmosfera();decorarNavegacion();decorarBiblioteca();prepararEntradaVisual();activarProfundidadHero();observar();
    requestAnimationFrame(()=>document.body.classList.add("visual-ready"));
    window.addEventListener("pagehide",()=>observadorVisual?.disconnect(),{once:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
  window.mostrarToastPremium=toast;
})();
