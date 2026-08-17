
// Timer
let secs = 258;
setInterval(() => {
  secs--;
  if (secs < 0) secs = 300;
  const m = Math.floor(secs/60).toString().padStart(2,'0');
  const s = (secs%60).toString().padStart(2,'0');
  const el = document.getElementById('quiz-timer');
  if (el) el.textContent = '⏱ ' + m + ':' + s;
}, 1000);

// Countdown minutes
let cdSecs = 32 * 60;
setInterval(() => {
  cdSecs--;
  if (cdSecs < 0) cdSecs = 60 * 60;
  const m = Math.floor(cdSecs / 60);
  ['cd-min','sim-mins'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = m.toString().padStart(2,'0');
  });
}, 1000);
