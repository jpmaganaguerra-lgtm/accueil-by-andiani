# Accueil by Andiani — Portal institucional B2B

Página institucional (single-page) para captar propietarios de hoteles, edificios,
desarrolladores, family offices y fondos. Tailwind CSS ya compilado localmente
(no usa el CDN de Tailwind, así que no aparece el warning de consola).

## Estructura

```
accueil/
├── index.html          ← la página (ábrela directo en el navegador para verla)
├── admin/                ← panel de administración de contenido (Decap CMS)
│   ├── index.html
│   └── config.yml
├── content/
│   ├── insights/         ← un .md por artículo publicado — Decap CMS escribe aquí
│   └── insights.json     ← generado automáticamente, no editar a mano
├── insights/              ← generado automáticamente: una carpeta por artículo (no editar a mano)
├── scripts/
│   └── build-insights.mjs  ← convierte los .md en páginas + el índice JSON
├── assets/
│   ├── brand/            ← logo y favicon oficiales
│   ├── photos/           ← todas las fotos del sitio, organizadas por sección
│   └── insights/uploads/ ← imágenes que subas desde el panel de administración
├── src/
│   ├── input.css        ← fuente de Tailwind + estilos custom (edítalo aquí)
│   └── main.js          ← scroll reveals, animación del diagrama, nav on scroll, carga de Insights
├── dist/
│   └── output.css       ← CSS ya compilado y minificado (esto es lo que carga index.html)
├── netlify.toml         ← config de build para Netlify
├── tailwind.config.js   ← paleta, tipografías y tokens de diseño del sitio
├── package.json
└── .gitignore
```

## Ver el sitio ahora mismo

No necesitas nada instalado: abre `index.html` directamente en el navegador.
El CSS ya está compilado en `dist/output.css`.

**Importante:** `index.html` carga el logo, el favicon y las fotos por ruta
relativa (`./assets/...`). Si abres o previsualizas solo el archivo `index.html`
suelto — sin el resto de la carpeta al lado — esas imágenes no van a cargar.
Descarga y descomprime el `.zip` completo, y abre `index.html` desde ahí.

**Sobre la sección Insights:** las tarjetas de artículos se cargan con
`fetch()`, que los navegadores bloquean cuando abres el archivo directo desde
tu disco (protocolo `file://`) — es una restricción de seguridad del navegador,
no un error del sitio. El resto de la página funciona igual, pero para ver las
tarjetas de Insights necesitas servir la carpeta con un servidor real (lo que
Netlify hace automáticamente en producción, o localmente con algo como
`npx serve` o la extensión "Live Server" de VS Code).

## Si vas a editar estilos o clases nuevas de Tailwind

Cada vez que agregues una clase de Tailwind nueva en `index.html`, o cambies algo
en `src/input.css`, hay que recompilar:

```bash
npm install       # solo la primera vez
npm run build     # compila una vez, minificado, listo para producción
```

Mientras editas y quieres ver cambios en vivo sin recompilar a mano cada vez:

```bash
npm run dev       # deja el compilador escuchando cambios (Ctrl+C para salir)
```

`npm run dev` solo compila CSS. Si editaste algo en `content/insights/` a mano
localmente, corre `npm run content:build` (o `npm run build`, que hace ambas
cosas) para regenerar las páginas de artículo y el índice JSON.

## Insights — publicar artículos sin tocar código

El sitio tiene un panel de administración en `/admin` (Decap CMS) donde puedes
escribir y publicar artículos desde el navegador, sin editar HTML ni usar
GitHub directamente. Así queda armado:

```
Escribes en /admin  →  se guarda como .md en content/insights/  →
Netlify hace build automático  →  scripts/build-insights.mjs genera
la página del artículo + actualiza el índice  →  aparece en Insights
```

### Activación (una sola vez, en el dashboard de Netlify)

1. En tu sitio dentro de Netlify: **Site configuration → Identity → Enable Identity**.
2. Todavía en Identity: **Registration → Invite only** (para que nadie más se
   registre sola/o) y guarda.
3. **Site configuration → Identity → Git Gateway → Enable Git Gateway**
   (esto es lo que le da permiso al panel para escribir en el repositorio).
4. **Identity → Invite users**, escribe tu correo. Te va a llegar un email de
   Netlify — el link te lleva al sitio y te pide poner una contraseña.
5. Listo. Desde ahora entras en `tusitio.com/admin` con ese correo y contraseña.

### Publicar un artículo

1. Entra a `tusitio.com/admin`.
2. **New Insights** (o el botón equivalente para crear una entrada nueva).
3. Llena: título, slug (la URL — sin espacios ni acentos, ej.
   `mi-nuevo-articulo`), imagen de portada, extracto corto (el que se ve en la
   tarjeta), categoría, fecha, y el cuerpo del artículo en el editor.
4. Marca **Publicado**. Si lo dejas sin marcar, el artículo se guarda como
   borrador y no aparece en el sitio — puedes volver después a marcarlo.
5. Guarda / publica desde el panel. Netlify arranca el build solo; en 1-2
   minutos el artículo ya está en `/insights/tu-slug/` y en la sección
   Insights de la home.

### Cómo funciona por dentro

- Cada artículo es un archivo `content/insights/tu-slug.md`, con metadatos
  arriba (título, portada, extracto, categoría, fecha, publicado) y el cuerpo
  en Markdown abajo.
- `scripts/build-insights.mjs` corre en cada build (`npm run build`, que
  Netlify ejecuta automáticamente vía `netlify.toml`) y por cada artículo con
  `published: true` genera `insights/tu-slug/index.html` — una página completa
  con el mismo header, footer y tipografía del resto del sitio. También
  escribe `content/insights.json`, que es lo que la sección Insights de la
  home consulta en el navegador para pintar las 3 tarjetas más recientes.
- El header y el footer de cada página de artículo **no se escriben a mano**:
  el script los toma directo de `index.html` en cada build. Si rediseñas el
  header o el footer del sitio, las páginas de artículo se actualizan solas
  la próxima vez que se genere el sitio — no hay que tocar nada en `scripts/`.
- Las imágenes que subas desde el panel se guardan en
  `assets/insights/uploads/`.

### Si quieres probarlo en tu computadora antes de subirlo

El panel de `/admin` necesita Netlify Identity + Git Gateway para funcionar,
así que **no funciona abriendo `admin/index.html` directo desde tu disco** —
solo funciona una vez desplegado en Netlify. Lo que sí puedes hacer local: crear
o editar un archivo `.md` a mano dentro de `content/insights/` siguiendo el
formato de los que ya existen, correr `npm run build`, y revisar el resultado
en `insights/` e `index.html`.

## Marca — logo y favicon

`assets/brand/` tiene el logo, el favicon y la textura de fondo oficiales:

- `logo-accueil-by-andiani-blanco.webp` / `.png` — el header sirve WebP primero
  (19 KB) y cae a PNG (40 KB) solo en navegadores muy antiguos que no soportan
  WebP, vía `<picture>`. El logo se usa tal cual (blanco) cuando el header está
  arriba del todo, sobre el hero oscuro. Al hacer scroll, el header cambia a
  fondo Olive y el logo se invierte a negro automáticamente con un filtro CSS
  (`filter: brightness(0)` en `#nav.is-scrolled .nav-logo`, ver `src/input.css`)
  — no hace falta subir una segunda versión del logo en otro color.
- `favicon.ico` — ícono de pestaña del navegador, referenciado en el `<head>`
  de `index.html`.
- `texture-platform-concrete.webp` — foto real de concreto usada como fondo de
  la sección "La plataforma", en su tono gris natural (sin tinte de color).
  Se aplica en `src/input.css` como `background-image` de `.platform-bg`, con
  un velo oscuro neutro encima (`.platform-bg::before`, `rgba(10,10,9,0.58)`)
  solo para mantener el contraste del texto — ese velo es negro puro, no verde,
  a propósito. Para ajustar qué tan oscuro se ve, cambia ese valor `rgba`; para
  reemplazar la foto, sustituye el archivo manteniendo el nombre.

Si el logo cambia, reemplaza **ambos** archivos (`.webp` y `.png`) manteniendo
el nombre — si el archivo que subes no tiene fondo transparente, avísame y lo
proceso de nuevo (recorte + canal alpha + optimización) antes de subirlo al
proyecto. Si cambia el favicon, reemplaza `favicon.ico` igual.

## Fotografía — reemplazo directo desde la carpeta

Todas las imágenes del sitio viven en `assets/photos/`, organizadas por sección.
Cada archivo es por ahora un placeholder generado localmente (fondo con el
nombre del archivo impreso) — para publicar el sitio, sustituye cada uno por
la fotografía real **manteniendo exactamente el mismo nombre de archivo**
(mismo nombre, misma extensión `.jpg`, misma carpeta). Al hacerlo, `index.html`
recoge la foto nueva automáticamente sin tocar código.

```
assets/photos/
├── hero/
│   └── hero-aparthotel-boutique-fachada-accueil.jpg      (1600×1000 o mayor, horizontal)
└── insights/
    ├── insights-conversion-edificio-residencial-hotel.jpg        (1200×900, horizontal 4:3)
    ├── insights-ia-revenue-management-hospitalidad.jpg           (1200×900, horizontal 4:3)
    └── insights-futuro-hospedaje-premium-boutique.jpg             (1200×900, horizontal 4:3)
```

Las carpetas `casos-exito/` y `portafolio/` ya no se usan — esas secciones se
retiraron del sitio (ver más abajo, "Hospitality Operating System") y quedaron
solo como archivos sueltos en disco; puedes borrarlas si quieres liberar espacio.

Los nombres de archivo están pensados como parte de la estrategia SEO: describen
el contenido real de la imagen con las palabras clave del negocio (aparthotel
boutique, hotel boutique, revenue management, conversión de edificio, hospitalidad),
en minúsculas y separadas por guiones — el formato que Google recomienda para
indexar imágenes en búsquedas. Si más adelante agregas `<img>` reales con `alt`,
usa ese mismo texto descriptivo (ya está puesto como `aria-label` en cada bloque
dentro de `index.html`, listo para reutilizar).


- **Fotografía:** las imágenes en `assets/photos/` son placeholders con el nombre
  del archivo impreso. Reemplázalas por fotografía real de las propiedades
  (ver sección "Fotografía" arriba) — el posicionamiento del sitio depende de
  que se vea auténtico, no de stock.
- **Formulario de contacto:** el formulario de diagnóstico solo simula el envío
  en el navegador (`onsubmit` en `index.html`). Hay que conectarlo a un backend,
  CRM o servicio de formularios (ej. HubSpot, un endpoint propio, Formspree, etc.)
  antes de que capture leads reales.
- **Dominio y hosting:** al ser HTML/CSS/JS estático, se puede desplegar tal cual
  en Netlify, Vercel, Cloudflare Pages, GitHub Pages o cualquier hosting estático.
  Solo sube la carpeta completa (`index.html`, `src/`, `dist/`).

## Paleta y tipografía (tokens de diseño)

Inspirada en la arquitectura contemporánea de la Península de Yucatán — sobria,
institucional, sin colores saturados ni degradados. Definidos en `tailwind.config.js`:

| Token | Valor | Nombre / uso |
|---|---|---|
| `bg` | `#FCFAF6` | Background — fondo principal |
| `surface` | `#F3EEE5` | Surface — secciones claras alternas |
| `surface2` | `#E7DFD2` | Secondary Surface — tarjetas, placeholders de foto |
| `text` | `#000000` | Text — texto principal |
| `subtext` | `#000000` | Secondary Text — texto secundario (jerarquía vía opacidad/peso tipográfico, no color) |
| `dark` | `#32493E` | Primary Brand (Jungle Green) — secciones oscuras, header en hover |
| `accent` | `#86915A` | Primary Accent (Olive) — CTAs, header en scroll, énfasis |
| `highlight` | `#86915A` | Secondary Accent — unificado con Olive |
| `success` | `#6E8B6B` | Confirmaciones (ej. mensaje de formulario enviado) |
| `warning` | `#C48A3A` | Estados de advertencia (disponible para validaciones futuras) |
| `error` | `#A6574B` | Estados de error (disponible para validaciones futuras) |

Tipografías: **Fraunces** (display/editorial), **Inter** (cuerpo), **JetBrains Mono**
(datos, métricas, eyebrows).
