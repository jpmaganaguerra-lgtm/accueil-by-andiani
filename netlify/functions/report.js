// Sirve un reporte protegido SOLO si quien lo pide tiene una sesión válida
// de Netlify Identity y el rol específico de ese reporte (ej. "report:montes-de-ame").
//
// Por qué existe esta función en vez de usar los redirects por rol de Netlify:
// esa función (Role-based redirects) es exclusiva de planes Business/Enterprise.
// Esto hace lo mismo — validar el JWT de Identity y su rol — pero corriendo en
// una Netlify Function, que sí está disponible en el plan gratuito.
//
// El archivo HTML real del reporte NUNCA se sirve como archivo estático: vive
// dentro de netlify/functions/_reports/, una carpeta que Netlify empaqueta con
// la función pero que no publica en el sitio, así que no tiene URL propia.

const fs = require('fs');
const path = require('path');

// mapa id -> { archivo, rol requerido }
const REPORTS = {
  'montes-de-ame': {
    file: path.join(__dirname, '_reports', 'montes-de-ame.html'),
    role: 'report:montes-de-ame',
  },
};

exports.handler = async (event) => {
  const id = (event.queryStringParameters && event.queryStringParameters.id) || '';
  const report = REPORTS[id];

  if (!report) {
    return { statusCode: 404, body: 'Reporte no encontrado.' };
  }

  const cookieHeader = event.headers.cookie || '';
  const match = cookieHeader.match(/nf_jwt=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  if (!token) {
    return {
      statusCode: 302,
      headers: { Location: `/reportes/${id}/?auth=requerido` },
      body: '',
    };
  }

  let userData;
  try {
    const siteUrl = process.env.URL || `https://${event.headers.host}`;
    const res = await fetch(`${siteUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return {
        statusCode: 302,
        headers: { Location: `/reportes/${id}/?auth=expirado` },
        body: '',
      };
    }
    userData = await res.json();
  } catch (err) {
    return { statusCode: 500, body: 'No se pudo validar la sesión. Intenta de nuevo.' };
  }

  const roles = (userData.app_metadata && userData.app_metadata.roles) || [];
  const isAdmin = roles.includes('admin');
  const hasAccess = isAdmin || roles.includes(report.role);

  if (!hasAccess) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `<!doctype html><html lang="es"><body style="font-family:sans-serif;background:#0d0d0f;color:#f3f1ea;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <p>Tu cuenta no tiene acceso a este reporte. Si crees que es un error, contacta a Accueil by Andiani.</p>
      </body></html>`,
    };
  }

  const html = fs.readFileSync(report.file, 'utf-8');
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, private',
    },
    body: html,
  };
};
