# UniPrep 2026.32 · reconstrucción académica desde Drive

## Resultado

- 21 cursos, 176 temas y 7,920 preguntas.
- 315 preguntas nuevas distribuidas en 7 temas.
- Cada tema nuevo contiene 45 preguntas: 10 básicas, 10 intermedias, 10 avanzadas y 15 de admisión.
- Los ejercicios nuevos son originales de UniPrep. Los PDF del Drive se usaron para identificar cobertura y nivel; no se copiaron literalmente preguntas protegidas.

## Cobertura incorporada

| Área | Tema nuevo | Fuente temática del Drive |
|---|---|---|
| RV | Sinonimia directa y precisión léxica | UNMSM Preguntas de Admisión RV por temas; Razonamiento Verbal 1 |
| RV | Antonimia directa | UNMSM Preguntas de Admisión RV por temas; Razonamiento Verbal 1 |
| RV | Definiciones y vocabulario | UNMSM Preguntas de Admisión RV por temas; Razonamiento Verbal 1 |
| RM | Cronometría, relojes y ángulos | 05 Cronometría - Relojes |
| RM | Razonamiento inductivo y sucesiones | 02 Inductivo - Deductivo |
| Trigonometría | Circunferencia trigonométrica y reducción angular | 04 Circunferencia trigonométrica |
| Trigonometría | Gráficas y transformaciones trigonométricas | 08 Transformaciones; 09 Funciones trigonométricas directas |

## Mejoras funcionales

- Las preguntas de cronometría muestran un reloj real con manecillas según la hora indicada.
- Las preguntas de funciones muestran una gráfica cartesiana generada con valores matemáticos.
- La interfaz conserva el funcionamiento móvil y admite figuras antes del enunciado.
- El generador de esta ampliación queda en `scripts/reconstruir_cobertura_drive_2026_32.js` para que los datos sean reproducibles.

## Validación aplicada

- 7,920 identificadores únicos.
- Ningún enunciado exactamente duplicado.
- Cuatro alternativas diferentes por pregunta.
- Clave entera entre 0 y 3.
- Archivos JavaScript y JSON válidos.
- Recursos PWA presentes.
- 12 tablas de Supabase con RLS y función consolidada de ranking.

## Alcance honesto

La validación automática comprueba integridad técnica y coherencia estructural. No equivale a una certificación pedagógica oficial de las 7,920 preguntas por cada universidad. Para una publicación institucional definitiva conviene que un docente especialista revise por muestreo la dificultad, redacción y actualización de cada curso.
