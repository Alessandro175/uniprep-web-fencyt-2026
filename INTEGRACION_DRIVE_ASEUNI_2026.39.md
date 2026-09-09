# Integración del Drive UNI — edición 2026.39

## Resultado incorporado

- Biblioteca UNI enlazada a la carpeta compartida del proyecto.
- Accesos directos a `ASEUNI · Anual UNI` y `CEPRE UNI · Material y prácticas`, visibles únicamente en la ruta UNI.
- 272 videoclases de Google Drive asociadas a 13 cursos y al tema oficial equivalente de la ruta UNI.
- 15 preguntas originales de la separata `ARITMÉTICA_01_ANUAL.pdf` incorporadas al tema `Razones y proporciones`.
- Cada pregunta importada conserva la fuente, el enlace, cinco alternativas, la respuesta recalculada, el procedimiento y la marca de referencia UNI.

## Videoclases vinculadas

| Curso | Videos |
|---|---:|
| Álgebra | 25 |
| Aritmética | 27 |
| Economía | 20 |
| Física | 26 |
| Geometría | 28 |
| Historia Universal | 6 |
| Psicología | 17 |
| Química | 54 |
| Razonamiento Matemático | 20 |
| Razonamiento Verbal | 20 |
| Trigonometría | 27 |
| Filosofía | 1 |
| Lógica | 1 |
| **Total** | **272** |

## Criterio de calidad para preguntas

La separata revisada contiene 30 ejercicios. Se incorporaron 15 cuyos enunciados y alternativas se leen completos y cuya respuesta pudo recalcularse. Los otros 15 no se cargaron porque contienen fórmulas destruidas por la extracción del PDF, una inconsistencia entre datos y alternativas o requieren gráficos que no aparecen en el texto. No se asignaron claves por aproximación.

Las prácticas CEPRE UNI antiguas sí incluyen varios solucionarios, pero gran parte de los exámenes está almacenada como imágenes escaneadas. Para incorporarlos correctamente hará falta un proceso adicional de OCR visual y emparejamiento entre cada imagen y su clave.

## Archivos modificados

- `json/videos-cursos.json`
- `json/recursos-biblioteca.json`
- `json/quiz-cursos/aritmetica.json`
- `js/learning-content.js`
- `scripts/importar_aseuni_aritmetica_2026_39.js`
