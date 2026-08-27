# UniPrep 2026.20 Harmony: color integral

La personalización ya no modifica únicamente el fondo. La misma paleta controla
las partes visibles de toda la experiencia y continúa guardándose dentro de
`user_preferences.visual` cuando Supabase está configurado.

## Nuevos controles

- Barras y navegación.
- Color inicial y final del banner del Tutor.
- Tarjetas principales y tarjetas internas.
- Fondo inicial y final.
- Botones principales, brillos y detalles.
- Texto, bordes, grosor, radio, opacidad, textura e imagen propia.

## Protección visual

- Seis combinaciones listas: Cósmica, Océano, Amazonía, Aurora, Grafito y Cielo claro.
- Sincronización automática entre fondo, acentos, barras, banner y tarjetas.
- La sincronización se desactiva al editar manualmente una superficie concreta.
- El botón final revisa contraste y corrige el texto si resultaría difícil de leer.
- La vista previa representa una barra, un banner, una tarjeta interna y un botón.
- Los botones calculan automáticamente si necesitan texto claro u oscuro.

## Zonas conectadas

- Barra superior y navegación lateral.
- Banner principal del Tutor, insignias, órbita y estado.
- Pestañas del Tutor, accesos de consulta, chat y compositor.
- Preparación para examen, materiales, tarjetas internas y formularios.
- Banner del Inicio, panel del Ranking y superficies generales.
- Centro de Comandos, dock y controles Hyperdrive mediante las variables existentes.

Las preferencias antiguas son compatibles: al cargar una paleta de una versión
anterior, UniPrep calcula automáticamente los nuevos colores faltantes.
