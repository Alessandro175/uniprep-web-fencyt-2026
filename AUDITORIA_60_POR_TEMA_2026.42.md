# Auditoría académica y técnica UniPrep 2026.42

## Resultado

La edición 2026.42 contiene **12,660 preguntas distribuidas en 211 temas de 25 cursos**. Cada tema tiene exactamente **60 preguntas**:

- 15 de nivel básico.
- 15 de nivel intermedio.
- 15 de nivel avanzado.
- 15 de nivel admisión.

El validador automático confirma 12,660 identificadores únicos, ausencia de enunciados exactamente duplicados, cuatro alternativas diferentes por pregunta, clave dentro del rango y solución explicada.

## Cobertura por curso

| Curso | Temas | Preguntas | Apoyos visuales |
|---|---:|---:|---:|
| Actualidad | 6 | 360 | 0 |
| Álgebra | 14 | 840 | 642 |
| Anatomía | 10 | 600 | 0 |
| Aritmética | 12 | 720 | 0 |
| Biología | 12 | 720 | 0 |
| Cálculo | 20 | 1,200 | 0 |
| Cívica | 6 | 360 | 0 |
| Comprensión Lectora | 1 | 60 | 0 |
| Economía | 8 | 480 | 0 |
| Filosofía | 5 | 300 | 0 |
| Física | 16 | 960 | 795 |
| Geografía | 5 | 300 | 0 |
| Geometría | 11 | 660 | 480 |
| Historia Universal | 7 | 420 | 0 |
| Historia del Perú | 8 | 480 | 0 |
| Inglés | 6 | 360 | 0 |
| Lenguaje | 6 | 360 | 0 |
| Literatura | 3 | 180 | 0 |
| Lógica | 3 | 180 | 0 |
| Medio Ambiente | 5 | 300 | 0 |
| Psicología | 7 | 420 | 0 |
| Química | 8 | 480 | 0 |
| Razonamiento Matemático | 12 | 720 | 140 |
| Razonamiento Verbal | 11 | 660 | 0 |
| Trigonometría | 9 | 540 | 120 |
| **Total** | **211** | **12,660** | **2,177** |

## Variedad comprobable

Las preguntas se clasifican en once formatos: opción múltiple conceptual, resolución de problemas, aplicación directa, verificación de condiciones, análisis de error, resultado con justificación, selección de justificación, análisis de proposiciones, interpretación visual, casos contextualizados y justificación del procedimiento. Cada tema presenta al menos tres formatos distintos.

Los apoyos visuales se generan como SVG accesible dentro de la interfaz y conservan los datos del enunciado. Incluyen expresiones algebraicas, triángulos, polígonos, circunferencias, funciones trigonométricas, movimiento, diagramas de fuerzas, ondas, circuitos, fluidos, procesos térmicos, cuadrículas, conjuntos, disposiciones circulares y engranajes.

## Alcance académico

Las preguntas añadidas son **variantes originales de entrenamiento del proyecto** construidas a partir del mismo curso y tema. No se presentan como preguntas oficiales de una universidad. La etiqueta de fuente y alineación dentro de cada registro mantiene esa distinción.

## Verificación ejecutada

Comando:

```bash
node VALIDAR_UNIPREP_NACIONAL.js
```

Resultado final: `VALIDACIÓN TÉCNICA APROBADA`.

Además se comprobó por servidor HTTP local que la página principal, los scripts, los estilos y bancos representativos de Álgebra, Física e Inglés responden correctamente.
