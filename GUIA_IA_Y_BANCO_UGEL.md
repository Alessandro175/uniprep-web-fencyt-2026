# UniPrep UGEL: activar la IA e importar un banco

La versión 2026.20 Harmony conserva **Uni, Tutor IA**, la función privada `api/tutor.js`,
consulta educativa libre y multimodal, preparación desde archivos, guía local,
personalización avanzada, orientación renovada, ranking temporal, foto de perfil
y herramienta de importación. Faltan únicamente las credenciales del propietario
y ejecutar las migraciones de Supabase.

## 1. Activar el Tutor IA en Vercel

No se compra un modelo por separado y una suscripción de ChatGPT no activa la API. En la plataforma de API se compra **saldo prepago** y cada uso descuenta una cantidad pequeña según los tokens.

1. Entra a la facturación de la plataforma de OpenAI y agrega el método de pago.
2. Compra el saldo inicial. La documentación oficial indica un mínimo de **USD 5**; los créditos vencen al año y no son reembolsables.
3. Para el concurso, desactiva inicialmente la recarga automática o configura un límite mensual pequeño.
4. Crea un proyecto llamado `UniPrep UGEL` y después una clave secreta de ese proyecto.

UniPrep está configurado con `gpt-5.6-luna`, el modelo económico de esa familia. Su tarifa publicada es USD 0.20 por millón de tokens de entrada y USD 1.20 por millón de tokens de salida. Los archivos largos o con muchas páginas consumen más; empieza con temarios pequeños y revisa el panel de uso.

Fuentes oficiales: [facturación prepaga](https://help.openai.com/es-419/articles/8264778-what-is-prepaid-billing), [crear y proteger la clave](https://help.openai.com/en/articles/4936850-how-to-create-and-use-an-api-key) y [precio de GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

5. Configura un límite mensual de gasto y alertas. Para comenzar con un concurso, usa un límite pequeño y auméntalo solo después de medir el uso.
6. En Vercel abre tu proyecto de UniPrep y entra a **Settings → Environment Variables**.
7. Crea estas variables en Production, Preview y Development:

| Variable | Valor |
|---|---|
| `OPENAI_API_KEY` | Tu clave privada del proyecto de OpenAI |
| `OPENAI_MODEL` | `gpt-5.6-luna` |
| `SUPABASE_URL` | La URL de tu proyecto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | La clave publicable usada por la web |

8. Guarda y realiza un nuevo despliegue en Vercel.
9. Abre `https://TU-DOMINIO.vercel.app/api/tutor`. Debe responder con `"available": true`.
10. Inicia sesión y prueba **Consulta libre**, **Mi curso** y los modos **Fácil**,
    **Paso a paso**, **Solo pista**, **Pregúntame**, **Con ejemplo** y **Plan**.
11. Prueba dictado y una foto pequeña de un ejercicio.
12. Abre **Preparación para examen**, genera un paquete y usa después **Mi material**.

La clave de OpenAI debe permanecer en Vercel. Nunca la escribas en `index.html`, `js/tutor.js`, Supabase, GitHub, una captura o una exposición. La implementación usa la Responses API, no guarda las respuestas en OpenAI (`store: false`) y envía un identificador de seguridad anónimo por usuario.

La generación usa entradas de archivo compatibles con Responses y una salida JSON con esquema estricto. Documentación oficial: [File inputs](https://developers.openai.com/api/docs/guides/file-inputs), [Responses API](https://developers.openai.com/api/reference/resources/responses), [Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices) y [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices).

### Flujo nuevo de preparación con IA

1. El alumno elige curso, fecha, meta, institución y nivel.
2. Sube PDF, Word, PowerPoint, Excel, TXT/CSV/JSON o imagen, o pega sus apuntes.
3. Por seguridad y por el límite de transporte de esta versión, cada archivo puede pesar hasta **2.4 MB**. Para uno mayor, comprímelo o pega solo las páginas importantes.
4. Una sola consulta genera resumen, conceptos, tarjetas, verdadero/falso, simulacro con explicaciones, plan y guion de audio.
5. El archivo original no se guarda en el navegador. Se conserva por cuenta únicamente el paquete de estudio generado.
6. El audio usa la voz disponible en el dispositivo; no consume otra consulta de IA.
7. Si falta sesión, clave o conexión, UniPrep crea un paquete local de demostración sin interrumpir el estudio.

El contenido subido se trata como **material académico no confiable**. La ruta privada ignora instrucciones que puedan aparecer dentro del archivo, valida el tipo real y nunca envía la clave de OpenAI al navegador.

## 2. Activar Supabase: ranking, fotos y evolución 2026.18

1. Abre Supabase → **SQL Editor**.
2. Copia y ejecuta una sola vez todo `SUPABASE_UGEL_RANKING_FOTOS.sql`.
3. Ejecuta después `SUPABASE_UGEL_EVOLUCION.sql`.
4. Cierra sesión, vuelve a ingresar y sube una foto desde **Mi perfil**.
5. Cambia fondo, borde y modo claro/oscuro; vuelve a ingresar y comprueba el estado.
6. Completa una práctica, un simulacro y parte del test vocacional.
7. Abre **Ranking** y comprueba Hoy, Semana, Mes e Histórico; después prueba
   Nacional, Mi región y la vista Regiones.

Sin la primera migración, UniPrep no puede calcular periodos ni sincronizar fotos.
Sin la segunda, funciona con respaldo local, pero no sincroniza preferencias,
paquetes IA, orientación, feedback ni eventos estimados de uso entre dispositivos.

## 3. Preparar el banco comprado

Antes de comprar, solicita:

- licencia o permiso de uso digital;
- curso, tema y dificultad de cada pregunta;
- alternativas separadas;
- clave correcta;
- solución explicada;
- archivo Excel, CSV o JSON, no solo PDF escaneado.

No publiques exámenes oficiales copiados sin autorización. Guarda el comprobante, la licencia y la fuente.

## 4. Formato recomendado

Abre `plantillas/banco-preguntas.csv` en Excel o Google Sheets. Usa una fila por pregunta y conserva estas columnas:

`tema, dificultad, pregunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, respuesta, solucion, universidad, subarea, competencia`

Reglas:

- `tema` debe coincidir con el título visible del tema en el JSON de ese curso;
- `dificultad`: `basico`, `intermedio`, `avanzado` o `admision`;
- `respuesta`: usa A, B, C, D o E;
- no escribas etiquetas como `[Básico · 2/10]` dentro del enunciado;
- explica el procedimiento en `solucion`, no solo “la respuesta es C”;
- exporta como **CSV UTF-8**.

## 5. Combinar sin destruir el banco actual

1. Abre `HERRAMIENTA_IMPORTAR_BANCO.html` en Chrome o Edge.
2. En “Curso base”, elige por ejemplo `json/quiz-cursos/algebra.json`.
3. En “Banco nuevo”, elige el CSV o JSON comprado.
4. Pulsa **Validar y combinar**.
5. Corrige las filas que aparezcan con error. La herramienta también omite duplicados y limpia etiquetas iniciales.
6. Descarga el archivo `algebra-CON-BANCO.json`.
7. Revisa manualmente al menos 30 preguntas y sus claves.
8. Solo después, guarda una copia del original y reemplaza `json/quiz-cursos/algebra.json` con el archivo validado.
9. Repite el proceso curso por curso.

La herramienta trabaja dentro del navegador y no sube el banco a internet. Nunca reemplaza automáticamente el archivo original.

## 6. Control de calidad antes del concurso

- prueba preguntas cortas, largas, con lectura y con símbolos matemáticos;
- confirma que la alternativa marcada coincide con la solución;
- comprueba móvil y computadora;
- realiza un simulacro completo con la universidad objetivo;
- verifica que el puntaje, la escala y el aviso “referencial” sean visibles;
- crea una cuenta de demostración sin datos personales reales;
- ensaya qué harás si ese día falla internet: prácticas, apuntes y guía local siguen funcionando.
