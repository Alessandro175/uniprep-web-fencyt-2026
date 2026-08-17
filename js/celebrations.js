(function () {
  "use strict";

  const mensajes = [
    "¡Excelente! Tu constancia está dando resultados.",
    "¡Respuesta impecable! Sigue con ese ritmo.",
    "¡Muy bien! Acabas de fortalecer este tema.",
    "¡Correcto! Un paso más cerca de tu vacante.",
    "¡Lo dominaste! Mantén viva la racha."
  ];

  let cierre = 0;

  function celebrarRespuestaCorrecta({xp = 0, combo = 1, nivel = "", universidad = ""} = {}) {
    document.getElementById("uniprep-celebration")?.remove();
    window.clearTimeout(cierre);

    const reducida = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const capa = document.createElement("div");
    capa.id = "uniprep-celebration";
    capa.className = `uniprep-celebration${reducida ? " reduced" : ""}`;
    capa.setAttribute("role", "status");
    capa.setAttribute("aria-live", "polite");
    capa.innerHTML = `
      <div class="celebration-aura"></div>
      <div class="celebration-card">
        <span class="celebration-check">✓</span>
        <div><small>${combo > 1 ? `COMBO ×${combo}` : "RESPUESTA CORRECTA"}</small><strong>${mensajes[(combo - 1) % mensajes.length]}</strong><span>+${Number(xp) || 0} XP${nivel ? ` · ${nivel}` : ""}${universidad ? ` · ${universidad}` : ""}</span></div>
      </div>
      ${reducida ? "" : `<div class="celebration-particles">${Array.from({length:28},(_,i)=>`<i style="--i:${i};--x:${(i*47)%101};--d:${(i%7)*.04}s"></i>`).join("")}</div>`}
    `;
    document.body.appendChild(capa);
    if (navigator.vibrate) navigator.vibrate([35,25,55]);
    cierre = window.setTimeout(() => capa.remove(), reducida ? 1200 : 2100);
  }

  window.celebrarRespuestaCorrecta = celebrarRespuestaCorrecta;
})();
