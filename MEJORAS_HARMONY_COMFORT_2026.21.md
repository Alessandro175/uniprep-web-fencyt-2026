# UniPrep 2026.21 Harmony Comfort

## Problema corregido

El modo claro anterior cambiaba las variables principales, pero algunos módulos
conservaban fondos y textos definidos para el modo oscuro. El resultado podía verse
demasiado blanco, mezclado o con contrastes incómodos.

## Nuevo sistema claro

- Fondo general azul grisáceo suave en lugar de blanco puro.
- Tres niveles visuales: lienzo, tarjeta principal y tarjeta interna.
- Sombras ligeras y bordes visibles sin endurecer la pantalla.
- Texto principal, secundario y auxiliar con contraste protegido.
- Barras, navegación, banners, tarjetas y botones conectados a la paleta elegida.
- Colores personalizados transformados automáticamente a una versión clara armónica.
- Acentos demasiado luminosos se ajustan para seguir siendo visibles sobre blanco.
- Vista previa del personalizador basada en el modo realmente activo.
- Aplicación del tema antes del primer dibujo para evitar destellos al recargar.

## Módulos adaptados

- Inicio, navegación lateral y barra superior.
- Tutor con IA, chat, materiales, tarjetas, prácticas y preparación para examen.
- Orientación vocacional, radar, carreras, universidades y comparador.
- Prácticas, preguntas, alternativas, correcciones y resultados.
- Simulacros, cursos, formulario inteligente, ranking, perfil, agenda y horario.
- Ventanas, notificaciones, autenticación, Centro de Comandos y personalizador.

La terminal conserva deliberadamente una superficie oscura propia porque forma parte
de su identidad técnica y mantiene mejor la lectura de comandos.

## Persistencia

No se requiere una tabla nueva. El modo y la paleta continúan guardándose en
`user_preferences.visual` mediante la sincronización existente de Supabase, con
respaldo local por cuenta.
