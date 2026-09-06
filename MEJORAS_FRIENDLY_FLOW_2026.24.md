# UniPrep 2 · Friendly Flow 2026.24

Esta versión conserva todos los módulos académicos, pero cambia la forma de llegar a
ellos. El objetivo es que una persona nueva entienda qué hacer sin ver todas las
funciones al mismo tiempo.

## Navegación que se siente como una aplicación

- Flechas Atrás y Adelante visibles en la barra superior.
- Historial interno de hasta 40 cambios de pantalla, sin sacar al alumno del sitio.
- Nombres de destino en la ayuda de cada flecha y estados desactivados correctos.
- Atajos `Alt + ←` y `Alt + →`, excepto mientras se escribe en un formulario.
- Transición distinta al avanzar o volver, con compatibilidad para movimiento reducido.
- Migas de navegación y hasta dos acciones contextuales por pantalla.

## Funciones ordenadas por intención

Universo sigue teniendo 51 ideas, pero al abrirlo presenta solo cuatro caminos:

1. Quiero aprender sin perderme.
2. Quiero un reto emocionante.
3. Necesito ayuda de Uni.
4. Quiero estudiar a mi ritmo.

Cada camino muestra una recomendación principal y dos alternativas. La biblioteca
completa permanece cerrada y, al abrirla, conserva búsqueda y siete categorías. De
esta manera no se elimina ninguna idea y tampoco se obliga al alumno a leer 51 tarjetas.

## Pulido visual y facilidad de uso

- Barra superior más limpia: la guía vive en Más y «En línea» solo aparece si cambia
  a estado sin conexión.
- Botones con tamaño táctil, contraste, foco visible y respuesta consistente.
- Inicio con una jerarquía más marcada, decoración suave y acción principal evidente.
- Tarjetas, panel Más y caminos de Universo comparten bordes, sombras y colores.
- Adaptación específica para computadora, tablet, celular, modo claro y modo oscuro.
- La apariencia usa movimiento corto para orientar, no animaciones que interrumpan.

## Registro sin carga infinita

- El catálogo local se carga antes de consultar la sesión de Supabase.
- La sincronización de la cuenta sucede en segundo plano y no bloquea los selectores.
- La petición tiene límite de tiempo y un segundo intento desde caché.
- Si falta `json/admission-profiles.json`, la pantalla deja de decir «Cargando» y
  explica el problema con un botón Reintentar.
- Si se abre `index.html` con doble clic, explica que debe usarse Vercel o Live Server.

## Supabase

Friendly Flow no crea datos nuevos. Continúa utilizando
`SUPABASE_UNIPREP_COMPLETO_2026.sql`, que instala cuentas, progreso, ranking, agenda,
preferencias, Tutor, orientación, fotos y Universo con Row Level Security.

No se debe colocar `service_role` ni una clave privada de OpenAI en el navegador.
