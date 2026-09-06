# UniPrep 2026.27 · Senior Challenge

Esta edición reorganiza la experiencia para estudiantes de 14 a 18+ años. Conserva la gamificación como sistema de progreso, pero elimina la apariencia infantil.

## Cambios visuales

- Interfaz de academia competitiva con violeta, azul y cian; el verde queda reservado para aciertos.
- Bordes más precisos, profundidad ligera y radios moderados.
- El personaje con rostro se reemplazó por un motor de ruta con monograma geométrico.
- Misiones renombradas como objetivos medibles: volumen, precisión y progreso.
- Modo claro reconstruido con superficies azuladas y contraste alto, sin blanco clínico.
- Tutor y Universo usan lenguaje académico juvenil.
- Se conserva la respuesta móvil y la reducción de movimiento del sistema.

## Reconstrucción de Razonamiento Matemático

- 400 preguntas conservadas: 10 temas × 40 preguntas.
- 10 familias de problemas por tema y cuatro niveles: base, intermedio, avanzado y admisión.
- 111 estructuras normalizadas frente a 31 aproximadas del banco anterior.
- Respuestas calculadas por el generador `RECONSTRUIR_BANCO_RM_2026.js`.
- Cuatro distractores únicos, clave válida, solución desarrollada y aviso de ejercicio no oficial.
- Los perfiles UNI, UNMSM, UNSA y PUCP priorizan el modo exigente; UNAMAD, UNSAAC y UCSM priorizan admisión.

## Qué decir al jurado

“UniPrep no convierte el estudio en un juego infantil. Utiliza objetivos, avance y retroalimentación para hacer visible el progreso. En Razonamiento Matemático reconstruimos el banco con diez familias distintas por tema, cuatro niveles y respuestas calculadas. Así evitamos simular variedad cambiando únicamente nombres o números.”

## Verificación

Ejecutar:

```bash
node VALIDAR_UNIPREP_NACIONAL.js
```

La validación comprueba sintaxis JavaScript, JSON, IDs HTML, recursos PWA, IDs de preguntas, variedad RM, distractores, Supabase RLS y cabeceras de seguridad.
