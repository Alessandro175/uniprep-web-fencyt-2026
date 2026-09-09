# Auditoría urgente de videos y preguntas · UniPrep 2026.43

## Resultado comprobado

- **12,660 preguntas únicas** almacenadas en 25 bancos de curso.
- **211 bloques temáticos de banco**, cada uno con exactamente 60 preguntas.
- Distribución fija por tema: 15 básicas, 15 intermedias, 15 avanzadas y 15 de admisión.
- Al elegir **UNI**, sus **269 temas visibles** resuelven un bloque de 60 preguntas del mismo curso; no se cruza contenido entre materias.
- El botón de práctica completa ahora solicita 60 preguntas, no 40.
- Los botones por nivel ahora solicitan 15 preguntas, no 10.

## Cobertura audiovisual

| Ruta | Temas visibles | Temas con recurso audiovisual | Cobertura |
|---|---:|---:|---:|
| Preparación general / UNAMAD y rutas basadas en el catálogo general | 162 | 162 | 100 % |
| UNI 2026-2 | 269 | 269 | 100 % |

El archivo `json/videos-cursos.json` contiene 591 recursos con URL compatible:

- 305 videoclases directas reproducibles desde YouTube o Google Drive.
- 286 búsquedas temáticas exactas de respaldo en YouTube.

Las búsquedas de respaldo se muestran como recursos externos y no se presentan falsamente como videos propios o verificados. Se generan con el nombre exacto del curso, el tema y la ruta académica. De este modo ningún tema queda con el mensaje “videoclase en preparación”, aunque la disponibilidad final de los resultados externos depende de YouTube.

## Material de Google Drive revisado

Se comprobó que la carpeta compartida contiene ciclos y bibliotecas preuniversitarias. La colección **ASEUNI – Anual UNI** dispone de carpetas por curso y archivos MP4 para Aritmética, Álgebra, Geometría, Trigonometría, Física, Química, Razonamiento Matemático, Razonamiento Verbal, Economía, Psicología e Historia Universal. Los enlaces directos ya integrados se conservan.

## Validación

```bash
node VALIDAR_UNIPREP_NACIONAL.js
```

Resultado: `VALIDACIÓN TÉCNICA APROBADA`.

El validador rechaza la entrega si detecta un tema bancario distinto de 60 preguntas, un nivel distinto de 15, una URL audiovisual vacía/incompatible o un tema general/UNI sin cobertura audiovisual.
