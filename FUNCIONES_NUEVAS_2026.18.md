# UniPrep UGEL 2026.18 · Funciones nuevas

Esta versión añade **36 mejoras funcionales**. No son botones de demostración: cada función guarda estado local, usa la interfaz real y, cuando corresponde, se sincroniza con Supabase.

## Uni, Tutor IA

1. **Consulta educativa libre:** permite hablar de tareas, proyectos, ciencia, redacción, creatividad, organización y orientación; ya no se limita a concursos.
2. **Alcance por conversación:** el alumno elige entre Consulta libre, Mi curso o Mi material.
3. **Seis inicios amigables:** tarea, proyecto, redacción, ciencia, orientación y práctica.
4. **Dictado por voz:** usa Web Speech cuando el navegador lo admite.
5. **Imagen en el chat:** comprime una foto del ejercicio y la envía temporalmente al modelo.
6. **Tres perfiles de aprendizaje:** visual, práctico y teórico.
7. **Seis modos pedagógicos:** fácil, paso a paso, solo pista, socrático, ejemplo y plan.
8. **Tres profundidades:** breve, normal y profunda.
9. **Favoritos:** guarda respuestas útiles dentro de la cuenta local del alumno.
10. **Valoración útil/no útil:** registra feedback propio en Supabase.
11. **Copiar respuesta:** copia texto al portapapeles.
12. **Añadir a apuntes:** incorpora una explicación al cuaderno del curso.
13. **Lectura en voz alta:** reproduce respuestas con la voz española disponible.
14. **Exportar conversación:** descarga un archivo TXT con fecha y participantes.
15. **Compartir conversación:** utiliza el menú nativo del dispositivo o copia el contenido.
16. **Control estimado del piloto:** muestra consultas y costo aproximado frente a la meta de S/250 por tres meses.
17. **Guía local de respaldo:** si la API no responde, el alumno sigue recibiendo una ruta educativa básica.
18. **Preferencias del Tutor en Supabase:** sincroniza alcance, modo, profundidad, perfil y curso.
19. **Materiales IA en Supabase:** sincroniza los paquetes generados, nunca el archivo original.
20. **Carga multimodal de estudio:** PDF, Word, PowerPoint, Excel, texto e imagen, con validación de tipo y tamaño.

## Apariencia y accesibilidad

21. **Modo automático:** sigue el modo claro u oscuro del equipo.
22. **Modo oscuro manual.**
23. **Modo claro manual.**
24. **Ocho fondos listos:** incluye Cielo claro y Papel cálido.
25. **Paleta completamente personalizada:** fondo, tarjetas, dos acentos, texto y bordes.
26. **Bordes minuciosos:** grosor y redondeado ajustables.
27. **Superficie ajustable:** opacidad y desenfoque de paneles.
28. **Imagen propia controlable:** escala y posición arriba, centro, abajo, izquierda o derecha.
29. **Texturas ajustables:** sin textura, cuadrícula, puntos o diagonal.
30. **Lectura accesible:** tres tamaños y tres espaciados.
31. **Contraste reforzado, reducción de movimiento y modo enfoque.**
32. **Preferencias visuales en Supabase** con respaldo local y cola sin conexión.

## Orientación, carga y simulacros

33. **Intro cinematográfica de una sola vez:** progreso real, estados de carga y sin botón para repetirla.
34. **Test CHASIDE renovado:** letra grande, dos fases visibles, porcentaje, atajos S/N, borrador automático y opción de pausar.
35. **Resultado vocacional visual:** radar comparativo de interés, aptitud y afinidad, lectura personalizada, compartir, imprimir y sincronizar con Supabase.
36. **Cinco simulacros nuevos:** Diagnóstico 20, Reto Express 30, Ruta UNAMAD 100, Ruta UNSAAC 80 y Maratón Nacional 100.

## Protección y límites honestos

- La clave `OPENAI_API_KEY` permanece en la función privada `/api/tutor.js`; nunca llega al navegador.
- Las consultas usan `store:false`.
- Los archivos se procesan para la consulta y no se guardan como archivo en Supabase.
- Los ejercicios universitarios están rotulados como entrenamiento referencial y no como pruebas oficiales.
- “Sin límite visible para el alumno” no significa costo infinito: el panel permite observar el presupuesto y la guía local evita que la experiencia se quede vacía.

## Fuentes técnicas y académicas contrastadas

- OpenAI, entrada de archivos en Responses API: https://developers.openai.com/api/docs/guides/file-inputs
- OpenAI, referencia de Responses API: https://developers.openai.com/api/reference/resources/responses
- Supabase, Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JavaScript, `upsert`: https://supabase.com/docs/reference/javascript/upsert
- Dirección de Admisión UNI, estructura de tres pruebas: https://www.admision.uni.edu.pe/admision2026-2/index.html
- Dirección General de Admisión UNSAAC, distribución oficial de 80 preguntas por área: https://admision.unsaac.edu.pe/temario/

Consulta siempre la convocatoria vigente de cada universidad. UniPrep no sustituye sus reglamentos, prospectos ni temarios oficiales.
