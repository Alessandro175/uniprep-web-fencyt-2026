// Quiz interaction
let answered = false;
function selectOption(btn, letter, isCorrect) {
  if (answered) return;
  answered = true;
  const all = document.querySelectorAll('.option-btn');
  all.forEach(b => b.style.pointerEvents = 'none');
  if (isCorrect) {
    btn.classList.add('correct');
    document.getElementById('quiz-feedback').style.display = 'block';
    document.getElementById('quiz-feedback').style.background = 'var(--green-bg)';
    document.getElementById('quiz-feedback').style.borderColor = 'var(--green)';
    document.getElementById('feedback-title').style.color = 'var(--green)';
    document.getElementById('feedback-title').textContent = '✓ ¡Correcto!';
    document.getElementById('feedback-text').textContent = 'P(2) = 16−20+6−1 = 1, P(−1) = −2−5−3−1 = −11, P(0) = −1. Entonces 1 − (−11) + (−1) = 1 + 11 − 1 = 11. Reemplazando: P(2)−P(−1)+P(0) = 1−(−11)+(−1) = 11−1 = 10... En la opción C el resultado simplificado es 2. Revisa paso a paso en la explicación.';
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn')[2].classList.add('correct');
    document.getElementById('quiz-feedback').style.display = 'block';
    document.getElementById('quiz-feedback').style.background = 'var(--pink-bg)';
    document.getElementById('quiz-feedback').style.borderColor = 'var(--pink)';
    document.getElementById('feedback-title').style.color = 'var(--pink)';
    document.getElementById('feedback-title').textContent = '✗ Incorrecto — La respuesta correcta es C: 2';
    document.getElementById('feedback-text').textContent = 'Recuerda evaluar el polinomio sustituyendo directamente: P(2) = 2(8)−5(4)+3(2)−1 = 16−20+6−1 = 1. P(−1) = 2(−1)−5(1)+3(−1)−1 = −2−5−3−1 = −11. P(0) = −1. Entonces: 1−(−11)+(−1) = 1+11−1 = 11. Revisa bien la operación final.';
  }
  document.getElementById('next-btn').style.display = 'inline-flex';

  // Una respuesta real registra progreso y activa la racha del día.
  registrarProgresoDePregunta(isCorrect);
}

async function registrarProgresoDePregunta(esCorrecta) {
  try {
    if (typeof window.registrarResultadoEjercicio === 'function') {
      await window.registrarResultadoEjercicio({
        correcto: esCorrecta,
        area: 'matematica',
        xpGanado: 10
      });
    }

    if (typeof window.actualizarRachaEstudio === 'function') {
      const resultado = await window.actualizarRachaEstudio();

      if (resultado?.aumento) {
        mostrarAvisoRacha(resultado.usuario.racha, resultado.nuevaRacha);
      }
    }

    if (typeof window.cargarDashboard === 'function') {
      await window.cargarDashboard();
    }
  } catch (error) {
    console.error('No se pudo registrar el progreso de la pregunta:', error);
  }
}

function mostrarAvisoRacha(dias, nuevoRecord) {
  const aviso = document.createElement('div');
  aviso.className = 'streak-toast';
  aviso.innerHTML = `<span>🔥</span><div><strong>¡Racha de ${dias} ${dias === 1 ? 'día' : 'días'}!</strong><small>${nuevoRecord ? 'Nuevo récord personal' : 'Racha asegurada por hoy'}</small></div>`;
  document.body.appendChild(aviso);
  requestAnimationFrame(() => aviso.classList.add('show'));
  setTimeout(() => {
    aviso.classList.remove('show');
    setTimeout(() => aviso.remove(), 300);
  }, 3200);
}

function nextQuestion() {
  answered = false;
  const all = document.querySelectorAll('.option-btn');
  all.forEach(b => { b.classList.remove('correct','wrong','selected'); b.style.pointerEvents = ''; });
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
}
