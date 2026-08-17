(function () {
  "use strict";

  function esc(valor) {
    const nodo = document.createElement("div");
    nodo.textContent = String(valor ?? "");
    return nodo.innerHTML;
  }

  function numero(valor) {
    return Number(valor || 0).toLocaleString("es-PE");
  }

  async function generarReporteAcademico() {
    const usuario = typeof window.obtenerUsuarioActivo === "function"
      ? await window.obtenerUsuarioActivo()
      : null;
    if (!usuario) {
      alert("Inicia sesión para generar tu reporte académico.");
      return;
    }

    const cursos = Object.values(window.CURSOS_PREUNI || {});
    const total = Number(usuario.respuestasTotales) || 0;
    const precision = total
      ? Math.round(((Number(usuario.respuestasCorrectas) || 0) / total) * 100)
      : 0;
    const filas = cursos.map(curso => {
      const progreso = Math.round(Number(usuario.progreso?.[curso.id]) || 0);
      return '<tr><td>' + curso.icono + " " + esc(curso.nombre) +
        '</td><td><div class="bar"><span style="width:' + progreso +
        '%"></span></div></td><td>' + progreso + "%</td></tr>";
    }).join("");

    const ventana = window.open("", "_blank", "width=900,height=720");
    if (!ventana) {
      alert("Permite las ventanas emergentes para abrir tu reporte.");
      return;
    }

    ventana.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Mi reporte académico</title><style>body{font-family:Arial,sans-serif;color:#182039;margin:42px}header{display:flex;justify-content:space-between;border-bottom:4px solid #7455ff;padding-bottom:18px}h1{margin:0;color:#34216f}.brand{font-weight:900;color:#7455ff}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:25px 0}.stats div{padding:15px;background:#f2efff;border-radius:12px}.stats b{display:block;font-size:24px;color:#5a3ed3}.stats span{font-size:11px;color:#667}table{width:100%;border-collapse:collapse}td{padding:9px;border-bottom:1px solid #e5e7ef;font-size:12px}.bar{height:7px;background:#ececf4;border-radius:99px}.bar span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7455ff,#3ecfa8)}footer{margin-top:25px;padding-top:12px;border-top:1px solid #ddd;color:#777;font-size:10px}@media print{button{display:none}}</style></head><body><header><div><div class="brand">UNIPREP</div><h1>Mi reporte académico</h1><p>' + esc(usuario.nombre) + " · " + esc(usuario.carrera || "Preuniversitario") + '</p></div><div>' + new Date().toLocaleDateString("es-PE") + '</div></header><section class="stats"><div><b>' + numero(usuario.ejercicios) + '</b><span>EJERCICIOS</span></div><div><b>' + precision + '%</b><span>PRECISIÓN</span></div><div><b>' + numero(usuario.xp) + '</b><span>XP</span></div><div><b>' + numero(usuario.racha) + '</b><span>RACHA</span></div></section><h2>Progreso por curso</h2><table>' + filas + '</table><footer>Reporte personal generado por UniPrep con la actividad registrada hasta la fecha.</footer><script>setTimeout(function(){window.print()},400)<\/script></body></html>');
    ventana.document.close();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const acciones = document.querySelector(".profile-actions");
    if (!acciones || document.getElementById("profile-report-btn")) return;
    const boton = document.createElement("button");
    boton.id = "profile-report-btn";
    boton.className = "btn btn-ghost";
    boton.type = "button";
    boton.textContent = "📄 Mi reporte";
    boton.onclick = generarReporteAcademico;
    acciones.insertBefore(boton, acciones.lastElementChild);
  });

  window.generarReporteAcademico = generarReporteAcademico;
})();
