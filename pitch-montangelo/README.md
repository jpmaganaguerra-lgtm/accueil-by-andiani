# Montangelo — Propuesta de Fractional Ownership

Sitio de una sola página (`index.html`), sin dependencias de build — solo HTML, CSS y JS vanilla. Pensado para Jade Urbana, documento interno.

## Estructura

```
montangelo-ppm/
├── index.html          ← el sitio completo
├── README.md
├── .gitignore
└── assets/
    └── img/             ← coloca aquí tus imágenes reales
```

## Cómo agregar tus imágenes

El sitio ya está preparado para mostrar fotos reales: si el archivo no existe todavía, cada espacio muestra automáticamente un patrón de marcador de posición con una etiqueta. En cuanto agregues el archivo con el nombre exacto, aparece solo — no hay que tocar el código.

Coloca estos archivos dentro de `assets/img/`:

| Archivo | Dónde aparece | Recomendación |
|---|---|---|
| `hero.jpg` | Fondo del encabezado principal | Horizontal, ideal 1920×1080 o más grande. Se oscurece automáticamente con un degradado para que el texto siga siendo legible. |
| `logo.svg` (o `.png`) | Barra de navegación y pie de página | Fondo transparente, preferible SVG o PNG. |
| `render-1.jpg` | Galería — fachada / vista aérea | — |
| `render-2.jpg` | Galería — interior | — |
| `render-3.jpg` | Galería — zona / Montes de Amé | — |

Si usas otro formato (`.png`, `.webp`), cambia la extensión correspondiente dentro de `index.html` (busca `assets/img/`).

## Publicarlo en GitHub Pages

```bash
cd montangelo-ppm
git init
git add .
git commit -m "Primera versión — propuesta Montangelo"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

Luego, en GitHub: **Settings → Pages → Deploy from a branch → main / (root)**. El sitio queda publicado en `https://<tu-usuario>.github.io/<tu-repo>/`.

## Notas

- No requiere servidor ni build — abrir `index.html` directamente en el navegador también funciona para revisarlo en local.
- Las fuentes (Fraunces, Inter, IBM Plex Mono) se cargan desde Google Fonts vía CDN — se necesita conexión a internet para verlas correctamente.
- Documento de trabajo interno — no constituye oferta de inversión, asesoría legal, fiscal o financiera.
