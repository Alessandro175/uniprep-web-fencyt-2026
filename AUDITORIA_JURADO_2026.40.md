# UniPrep 2026.40 — Auditoría para jurado

## Estado comprobado

La versión 2026.40 supera la validación técnica automatizada del proyecto:

- 52 archivos JavaScript con sintaxis válida.
- 39 archivos JSON válidos.
- 8,075 preguntas académicas con identificadores únicos.
- Ningún enunciado exactamente duplicado.
- 7 universidades y 290 rutas de carrera enlazadas.
- Ruta UNI aislada: 20 cursos y 269 temas de referencia.
- Los 20 cursos de la ruta UNI tienen un banco de preguntas accesible.
- 344 referencias de video catalogadas en 22 cursos; 272 proceden del material ASEUNI compartido.
- 163 recursos incluidos en la configuración sin conexión.
- 12 tablas de Supabase con políticas de seguridad por fila declaradas.

## Correcciones cerradas en esta versión

1. La universidad elegida controla el rótulo, cursos, bloques, temario, práctica y biblioteca. Se eliminó el texto inicial fijo «Ruta UNAMAD P».
2. Se actualizó la versión de los módulos para impedir que el navegador conserve código antiguo y vuelva a mostrar UNAMAD después de elegir UNI.
3. Se incorporaron bancos iniciales específicos para Cálculo, Lógica, Actualidad e Inglés.
4. Cívica aparece con ese nombre e incluye desarrollo personal, ética, ciudadanía, Estado, democracia, derechos e identidad.
5. Cálculo, Lógica, Actualidad e Inglés aparecen también en práctica, perfil, progreso, universo académico y modo sin conexión.
6. Cuando el temario oficial es más detallado que un banco antiguo, la práctica busca primero una coincidencia exacta y luego un bloque relacionado del mismo curso. Nunca toma preguntas de otra materia.

## Recorrido recomendado de demostración

1. Registro: elegir UNI y una carrera. Mostrar que el grupo se detecta automáticamente.
2. Inicio: señalar el rótulo «Tu preparación · UNI 2026».
3. Cursos: abrir «Ver cursos y temas» y enseñar las tres pruebas de la UNI.
4. Abrir un curso y un tema: mostrar la descripción «¿En qué consiste?», puntos clave y recursos.
5. Practicar: responder una pregunta, mostrar corrección y explicación, y terminar una sesión corta.
6. Simulacro: enseñar instrucciones, temporizador, navegación, entrega y revisión de resultados.
7. Perfil: mostrar progreso, XP, racha y actividad.
8. Biblioteca y fórmulas: enseñar que la ruta activa filtra y prioriza los recursos.
9. Estado para exposición: ejecutar la comprobación visible al final.

## Lo que depende de servicios externos

- Registro, inicio de sesión, sincronización, ranking y recuperación de contraseña necesitan que Supabase esté configurado y tenga conexión.
- Tutor Uni necesita la API configurada; sin ella conserva una guía local, pero no puede prometer respuestas generativas completas.
- Los archivos de Google Drive deben tener permiso «Cualquier persona con el enlace».
- Los videos externos necesitan internet y que YouTube o Drive permitan la reproducción incrustada.
- Cálculo, Actualidad e Inglés todavía no tienen videos propios verificados en la carpeta compartida. El tema, descripción y preguntas sí están disponibles.
- Las preguntas creadas por UniPrep son ejercicios originales de entrenamiento alineados al temario; no se presentan como preguntas oficiales de la UNI.

## Plan de contingencia para el miércoles

- Abrir la aplicación una vez con internet antes de exponer para actualizar la caché.
- Mantener una sesión ya iniciada y una ruta UNI ya guardada.
- No depender del Tutor IA ni de un video externo para la parte central de la exposición.
- Usar como recorrido principal: Inicio → Cursos → tema → práctica → resultado → perfil.
- Llevar el ZIP 2026.40 en una memoria USB y conservar una copia en la nube.

