# UniPrep 2 · Friendly Path 2026.22

Esta versión reorganiza la experiencia para que un estudiante nuevo entienda la aplicación sin recibir demasiadas opciones al mismo tiempo.

## Nueva organización

La navegación principal quedó reducida a cinco decisiones:

1. **Inicio:** muestra la misión y la ruta recomendada del día.
2. **Aprender:** reúne cursos, temas, teoría y acceso a lecciones.
3. **Practicar:** concentra preguntas, niveles, favoritos y repaso de errores.
4. **Tutor Uni:** ofrece conversación educativa y preparación con materiales.
5. **Más:** agrupa simulacros, ranking, videoclases, fórmulas, biblioteca, agenda, orientación, perfil, notificaciones, diseño, concentración y búsqueda.

En computadora, Simulacros y Ranking también permanecen visibles en la barra lateral. En celular se encuentran dentro de **Más** para conservar una navegación inferior de cinco opciones.

## Ruta diaria inspirada en el aprendizaje por etapas

- Una acción principal: **Continuar mi ruta**.
- Curso y tema recomendados según universidad, carrera, peso del examen y progreso.
- Secuencia clara: aprender, practicar, corregir errores, pedir ayuda y realizar un desafío.
- Meta diaria sencilla, racha, XP, precisión y avance real.
- Todas las etapas están disponibles; no se bloquea artificialmente al estudiante.

La experiencia toma como referencia la claridad y la progresión de las aplicaciones de aprendizaje por niveles, pero mantiene identidad, colores, módulos y lógica propios de UniPrep.

## Mejoras de facilidad de uso

- Menos opciones simultáneas y textos más directos.
- Panel **Más herramientas** organizado por intención.
- Nuevo tutorial de cinco pasos sin pantallas inexistentes.
- Navegación móvil fija con cinco opciones grandes.
- Botones con estados de foco, etiquetas accesibles y áreas táctiles cómodas.
- Modo claro, oscuro, automático y fondos personalizados conservados.
- Funciones Hyperdrive conservadas, pero retiradas de la vista principal; siguen disponibles mediante búsqueda, atajos y ajustes.
- Preferencias, Supabase, ranking, IA, preguntas, simulacros y modo sin conexión conservados.

## Supabase

Este rediseño no agrega tablas ni columnas nuevas. Si la base ya fue configurada con los archivos siguientes, no es necesario ejecutar otro SQL:

1. `SUPABASE_UGEL_RANKING_FOTOS.sql`
2. `SUPABASE_UGEL_EVOLUCION.sql`
