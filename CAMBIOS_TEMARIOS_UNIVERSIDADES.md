# UniPrep — adaptación por universidad y carrera

Actualización: 16 de agosto de 2026

## Qué se corrigió

- La universidad y la carrera seleccionadas ahora determinan los cursos activos, la prioridad y los bloques del examen.
- Los temas pueden filtrarse por perfil institucional. La PUCP, por ejemplo, ya no recibe automáticamente todos los contenidos del banco matemático general.
- El Centro de Práctica muestra la estructura del examen, el estilo de pregunta, el ritmo recomendado y el área o grupo activo.
- Las prácticas priorizan preguntas etiquetadas para la universidad elegida y preguntas generales. Ya no mezclan deliberadamente referencias de otras universidades.
- Cuando un banco antiguo no tiene rotación por universidad, se presenta como práctica general y no se atribuye falsamente a otra institución.
- El nivel inicial cambia según el perfil: exigente para UNI, UNMSM, UNSA y PUCP; admisión para UNAMAD, UNSAAC y UCSM.
- El simulacro general adapta su cantidad cuando existe una matriz oficial de preguntas. También oculta modelos especiales que no corresponden a la universidad elegida.
- El caché PWA fue actualizado para incluir el nuevo motor de temarios y evitar que el navegador conserve una versión anterior.

## Perfiles incluidos

1. UNAMAD: grupos P, Q, R y S según carrera.
2. UNSAAC: áreas A, B, C y D; 80 preguntas con asignaturas diferentes.
3. UNMSM: áreas A-E; 100 preguntas entre competencia actitudinal, habilidades y conocimientos.
4. UNSA: Ingenierías, Biomédicas y Sociales; matriz 2027 de 80 preguntas.
5. UNI: tres pruebas separadas: Aptitud Académica y Humanidades, Matemática, Física y Química.
6. PUCP: Comprensión de Lectura y Matemática; 68 o 76 preguntas según la unidad académica.
7. UCSM: temario 2027 con prioridades de preparación según familia de carrera.

## Archivos principales

- `json/admission-profiles.json`: universidades, carreras, grupos, cursos y pesos.
- `json/university-exam-profiles.json`: estructura, estilo de preguntas, dificultad y reglas temáticas.
- `js/university-syllabus.js`: motor que aplica el perfil seleccionado.
- `js/courses.js`: catálogo y temas personalizados.
- `js/practice-center.js`: preguntas alineadas y configuración de dificultad.
- `js/exam.js`: simulacros ajustados a la ruta.

## Fuentes institucionales revisadas

- UNAMAD: `https://admision.unamad.edu.pe/documentos/temarios`
- UNSAAC: `https://admision.unsaac.edu.pe/temario/`
- UNMSM: `https://admision.unmsm.edu.pe/portal/admision2026-ii/`
- UNSA: `https://admision.unsa.edu.pe/temario-y-matriz-de-evaluacion-2027/`
- UNI: `https://admision.uni.edu.pe/admision2026-2/`
- PUCP: `https://admision.pucp.edu.pe/guia-del-postulante/modalidades-de-admision/evaluacion-del-talento-r`
- UCSM: `https://ucsm.edu.pe/admision-pregrado/`

## Aviso académico

Los temarios y estructuras se basan en publicaciones institucionales vigentes al momento de la actualización. Las preguntas de UniPrep son ejercicios de entrenamiento elaborados por la plataforma: no son preguntas oficiales ni garantizan la composición de futuras convocatorias.
