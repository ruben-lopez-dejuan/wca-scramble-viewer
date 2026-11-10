# Ficha para la Chrome Web Store

Textos listos para copiar en el panel de desarrollador
(<https://chrome.google.com/webstore/devconsole>).

## Producto

**Nombre:** WCA Scramble Viewer

**Descripción breve** (máx. 132 caracteres):

> Muestra la imagen de cada mezcla, como en TNoodle, junto a las mezclas de las competiciones de la WCA. Colores configurables.

**Categoría:** Herramientas

**Idioma:** Español

**Descripción detallada:**

> WCA Scramble Viewer añade una columna «Imagen» en las páginas de mezclas de las competiciones de la World Cube Association (worldcubeassociation.org/competitions/…/scrambles). Cada imagen muestra cómo debe quedar el puzzle después de aplicar la mezcla, dibujada igual que en TNoodle, el programa oficial de mezclas de la WCA. Así puedes comprobar de un vistazo si un puzzle está bien mezclado.
>
> Categorías: 2x2 a 7x7, 3x3 a una mano, a ciegas (3x3, 4x4, 5x5), FMC, MBLD, Pyraminx, Skewb, Megaminx, Square-1 y Clock.
>
> Colores configurables como en TNoodle:
> • Haz clic en una pegatina de cualquier imagen para cambiar el color de esa cara.
> • La página de opciones tiene una vista previa de cada puzzle, un selector de color por cara y botones para volver a los colores de TNoodle.
> • También puedes cambiar el tamaño de las imágenes u ocultarlas.
>
> Funciona sin conexión: no carga código externo y no recoge ningún dato. Es de código abierto (GPL-3.0) y la lógica de los puzzles está basada en TNoodle.
>
> Extensión no oficial: no está afiliada a la World Cube Association.

**Capturas (1280×800):** `store/screenshots/1-cubo-3x3.png`, `2-square-1.png`, `3-colores.png`

**Icono de la tienda (128×128):** `wca-scramble-viewer/icons/icon128.png`

## Prácticas de privacidad

**Propósito único:**

> Mostrar, junto a cada mezcla de las páginas de mezclas de la WCA, una imagen del estado del puzzle tras aplicarla, para comprobar que está bien mezclado.

**Justificación de permisos:**

- `storage`: guarda las preferencias del usuario (colores de cada puzzle, tamaño de las imágenes y si se muestran o no).
- Acceso a `https://www.worldcubeassociation.org/competitions/*` (script de contenido): lee el texto de las mezclas de la página y añade las imágenes al lado. No envía nada a ningún servidor.

**¿Usas código remoto?** No. Todo el código va incluido en el paquete.

**Uso de datos:** no se recoge ningún dato de usuario. Marca todas las casillas como «No» y acepta las tres declaraciones del panel.
