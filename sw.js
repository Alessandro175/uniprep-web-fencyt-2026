const CACHE = "uniprep-2-v57-harmony-comfort";
const CORE = [
  "./","index.html","privacy.html","terms.html","delete-account.html","manifest.webmanifest",
  "css/style.css","css/style.css?v=2026.12.0","css/premium.css","css/practice-center.css","css/tutor.css","css/tutor.css?v=2026.18.0","css/admission-profile.css","css/study-tools.css","css/visual-wow.css","css/vocational.css","css/vocational.css?v=2026.18.0","css/celebrations.css","css/showcase-mode.css","css/showcase-mode.css?v=2026.18.0","css/ugel-2026.css","css/ugel-2026.css?v=2026.20.0","css/evolution-2026.css","css/evolution-2026.css?v=2026.18.0","css/hyperdrive-2026.css","css/hyperdrive-2026.css?v=2026.20.1","css/light-comfort-2026.css","css/light-comfort-2026.css?v=2026.21.0",
  "assets/uniprep-logo.png","assets/uniprep-icon.svg","assets/uniprep-icon-192.png","assets/uniprep-icon-512.png",
  "js/supabase.js","js/db.js","js/db.js?v=2026.16.0","js/user-storage.js","js/cloud-sync.js","js/cloud-sync.js?v=2026.18.0","js/admission-profile.js","js/university-syllabus.js","js/auth.js","js/navigation.js","js/streak.js",
  "js/syllabus-unamad.js","js/courses.js","js/dashboard.js","js/notifications.js",
  "js/calendar.js","js/schedule.js","js/formula-center.js","js/profile.js","js/profile.js?v=2026.16.0","js/account-settings.js","js/quiz.js","js/questions-cepre.js",
  "js/celebrations.js","js/practice-center.js","js/practice-center.js?v=2026.16.0","js/exam.js","js/exam.js?v=2026.18.0","js/timer.js","js/ranking.js","js/ranking.js?v=2026.16.0",
  "js/academic-report.js","js/tutor-studio.js","js/tutor-studio.js?v=2026.18.0","js/tutor.js","js/tutor.js?v=2026.18.0","js/vocational.js","js/vocational.js?v=2026.18.0","js/pwa.js","js/pwa.js?v=2026.20.0","js/app.js","js/onboarding.js","js/premium.js","js/showcase-mode.js","js/showcase-mode.js?v=2026.18.0","js/theme-bootstrap.js","js/theme-bootstrap.js?v=2026.21.0","js/ugel-ui.js","js/ugel-ui.js?v=2026.21.0","js/hyperdrive.js","js/hyperdrive.js?v=2026.20.1","js/learning-content.js","js/questions-exams-2026.js","js/auth.js?v=2026.12.0","js/app.js?v=2026.12.0","js/onboarding.js?v=2026.12.0",
  "js/admission-profile.js?v=2026.10.2","js/university-syllabus.js?v=2026.13.0","js/courses.js?v=2026.13.0","js/questions-exams-2026.js?v=2026.11.0","js/pwa.js?v=2026.10.2","js/syllabus-unamad.js?v=2026.9.0","js/learning-content.js?v=2026.13.0",
  "css/premium.css?v=2026.10.2","css/practice-center.css?v=2026.13.0","css/study-tools.css?v=2026.9.0","js/formula-center.js?v=2026.9.0",
  "json/recursos-biblioteca.json","json/videos-cursos.json","json/admission-profiles.json","json/university-exam-profiles.json","json/formulario-inteligente.json","json/formulario-avanzado.json","json/vocational-data.json","json/chaside-data.json",
  "json/quiz-cursos/rm.json","json/quiz-cursos/aritmetica.json",
  "json/quiz-cursos/algebra.json","json/quiz-cursos/geometria.json",
  "json/quiz-cursos/trigonometria.json","json/quiz-cursos/fisica.json",
  "json/quiz-cursos/quimica.json","json/quiz-cursos/biologia.json",
  "json/quiz-cursos/medio_ambiente.json","json/quiz-cursos/anatomia.json","json/quiz-cursos/psicologia.json",
  "json/quiz-cursos/rv.json","json/quiz-cursos/comprension_lectora.json","json/quiz-cursos/lenguaje.json","json/quiz-cursos/literatura.json",
  "json/quiz-cursos/historia.json","json/quiz-cursos/historia_peru.json","json/quiz-cursos/geografia.json","json/quiz-cursos/filosofia.json","json/quiz-cursos/economia.json",
  "json/quiz-cursos/civica.json"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  // Las rutas privadas y su estado nunca deben quedar congelados en la caché.
  if(url.pathname.startsWith("/api/")){
    event.respondWith(fetch(request));
    return;
  }

  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{const clone=response.clone();caches.open(CACHE).then(cache=>cache.put("index.html",clone));return response}).catch(()=>caches.match("index.html")));
    return;
  }

  if(url.pathname.includes("/json/")){
    event.respondWith(fetch(request).then(response=>{const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(request,clone));return response}).catch(()=>caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(request,clone));return response})));
});
