const CACHE = "uniprep-2-v50-web-stable";
const CORE = [
  "./","index.html","privacy.html","terms.html","delete-account.html","manifest.webmanifest",
  "css/style.css","css/style.css?v=2026.12.0","css/premium.css","css/practice-center.css","css/tutor.css","css/admission-profile.css","css/study-tools.css","css/visual-wow.css","css/vocational.css","css/celebrations.css","css/showcase-mode.css","css/showcase-mode.css?v=2026.14.0",
  "assets/uniprep-logo.png","assets/uniprep-icon.svg","assets/uniprep-icon-192.png","assets/uniprep-icon-512.png",
  "js/supabase.js","js/supabase.js?v=2026.15.0","js/db.js","js/user-storage.js","js/user-storage.js?v=2026.15.0","js/admission-profile.js","js/university-syllabus.js","js/auth.js","js/navigation.js","js/streak.js",
  "js/syllabus-unamad.js","js/courses.js","js/dashboard.js","js/notifications.js",
  "js/calendar.js","js/schedule.js","js/formula-center.js","js/profile.js","js/account-settings.js","js/quiz.js","js/questions-cepre.js",
  "js/celebrations.js","js/practice-center.js","js/exam.js","js/timer.js","js/ranking.js",
  "js/academic-report.js","js/tutor.js","js/vocational.js","js/pwa.js","js/app.js","js/app.js?v=2026.15.0","js/onboarding.js","js/premium.js","js/showcase-mode.js","js/showcase-mode.js?v=2026.14.0","js/learning-content.js","js/questions-exams-2026.js","js/auth.js?v=2026.12.0","js/onboarding.js?v=2026.12.0",
  "js/admission-profile.js?v=2026.10.2","js/university-syllabus.js?v=2026.13.0","js/courses.js?v=2026.15.0","js/practice-center.js?v=2026.13.0","js/exam.js?v=2026.11.0","js/questions-exams-2026.js?v=2026.11.0","js/pwa.js?v=2026.15.0","js/syllabus-unamad.js?v=2026.9.0","js/learning-content.js?v=2026.15.0","js/account-settings.js?v=2026.15.0",
  "css/premium.css?v=2026.10.2","css/practice-center.css?v=2026.13.0","css/study-tools.css?v=2026.9.0","js/formula-center.js?v=2026.9.0","css/vocational.css?v=2026.9.0","js/vocational.js?v=2026.9.0",
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

  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const clone=response.clone();
            caches.open(CACHE).then(cache=>cache.put(request,clone));
          }
          return response;
        })
        .catch(()=>caches.match(request).then(cached=>cached||caches.match("index.html")))
    );
    return;
  }

  if(url.pathname.includes("/json/")){
    event.respondWith(fetch(request).then(response=>{const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(request,clone));return response}).catch(()=>caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(request,clone));return response})));
});
