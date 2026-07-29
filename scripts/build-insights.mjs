// Lee content/insights/*.md, y genera:
//   1. insights/{slug}/index.html  — la página completa de cada artículo publicado
//   2. content/insights.json       — índice que la home usa para pintar las tarjetas
//
// Se corre con `npm run build` (o `npm run content:build` solo). No requiere
// ningún backend: Decap CMS escribe los .md directo al repositorio, y este
// script los convierte a HTML en cada build de Netlify.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'insights');
const OUTPUT_DIR = path.join(ROOT, 'insights');
const INDEX_HTML = path.join(ROOT, 'index.html');
const JSON_OUT = path.join(ROOT, 'content', 'insights.json');

function readIndexHtml() {
  return fs.readFileSync(INDEX_HTML, 'utf-8');
}

// Extrae un bloque de index.html entre un marcador de apertura literal y un
// tag de cierre, y reescribe las rutas relativas (./assets, ./dist, ./src)
// y los anclas (#seccion) para que funcionen desde /insights/{slug}/ dos
// niveles más abajo en el árbol de carpetas.
function extractBlock(html, startMarker, endTag) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`No encontré el marcador: ${startMarker}`);
  const end = html.indexOf(endTag, start) + endTag.length;
  let block = html.slice(start, end);
  block = block.replace(/\.\/assets\//g, '/assets/');
  block = block.replace(/\.\/dist\//g, '/dist/');
  block = block.replace(/\.\/src\//g, '/src/');
  block = block.replace(/href="#top"/g, 'href="/"');
  block = block.replace(/href="#/g, 'href="/#');
  return block;
}

function loadArticles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    return {
      title: data.title || 'Sin título',
      slug: data.slug || path.basename(file, '.md'),
      cover: data.cover || '',
      excerpt: data.excerpt || '',
      tag: data.tag || 'Insights',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      published: data.published !== false,
      bodyMarkdown: content,
    };
  });
  return articles
    .filter(a => a.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDateEs(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderArticlePage({ headerHtml, footerHtml, whatsappHtml }, article) {
  const bodyHtml = marked.parse(article.bodyMarkdown);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.title} — Accueil by Andiani</title>
<meta name="description" content="${article.excerpt.replace(/"/g, '&quot;')}">
<link rel="icon" type="image/x-icon" href="/assets/brand/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/dist/output.css">
</head>
<body class="bg-bg text-text font-body antialiased">

${headerHtml}

<article class="pt-40 pb-28 md:pb-36">
  <div class="max-w-2xl mx-auto px-6 md:px-10">
    <a href="/#insights" class="eyebrow text-dark hover:text-accent transition-colors">&larr; Insights</a>
    <p class="eyebrow text-accent mt-8 mb-4">${article.tag} &middot; ${formatDateEs(article.date)}</p>
    <h1 class="font-display font-light text-4xl md:text-5xl leading-tight mb-10">${article.title}</h1>
    ${article.cover ? `<div class="ph aspect-[16/9] mb-12" style="background-image:url('${article.cover}')"></div>` : ''}
    <div class="prose-accueil">
      ${bodyHtml}
    </div>
  </div>
</article>

${footerHtml}

${whatsappHtml}

<script src="/src/main.js" defer></script>
</body>
</html>
`;
}

function main() {
  const html = readIndexHtml();
  const headerHtml = extractBlock(html, '<header id="nav"', '</header>');
  const footerHtml = extractBlock(html, '<footer', '</footer>');
  const whatsappHtml = extractBlock(html, '<!-- ================= WHATSAPP FLOTANTE ================= -->', '</a>');

  const articles = loadArticles();

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const article of articles) {
    const outDir = path.join(OUTPUT_DIR, article.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const pageHtml = renderArticlePage({ headerHtml, footerHtml, whatsappHtml }, article);
    fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf-8');
  }

  const jsonIndex = articles.map(({ bodyMarkdown, ...rest }) => rest);
  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(jsonIndex, null, 2), 'utf-8');

  console.log(`✓ ${articles.length} artículo(s) publicados → insights/*/index.html + content/insights.json`);
}

main();
