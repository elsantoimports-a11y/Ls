#!/usr/bin/env node
// Verificaciones estáticas sin dependencias: node scripts/check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const errors = [];
const warns = [];
const fail = (m) => errors.push(m);

// --- config.js ---
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read('assets/js/config.js'), ctx);
const C = ctx.window.LS_CONFIG;
if (!C) { console.error('config.js no define LS_CONFIG'); process.exit(1); }

// --- catálogo ---
const ids = new Set();
for (const s of C.catalog) {
  if (!/^[a-z0-9-]+$/.test(s.id)) fail(`id inválido: ${s.id}`);
  if (ids.has(s.id)) fail(`id duplicado: ${s.id}`);
  ids.add(s.id);
  if (!s.name || !s.description || !s.category) fail(`${s.id}: faltan name/description/category`);
  if (!Number.isInteger(s.price) || s.price <= 0) fail(`${s.id}: price debe ser entero positivo`);
  if (s.duration !== null && (!Number.isInteger(s.duration) || s.duration <= 0)) fail(`${s.id}: duration debe ser null o entero positivo`);
  if (typeof s.active !== 'boolean') fail(`${s.id}: active debe ser true/false`);
}

// --- coherencia con Code.gs (precios y nombres) ---
const gs = read('Code.gs');
const block = gs.match(/const LSOS_SERVICES = \{([\s\S]*?)\n\};/);
if (!block) fail('No se encontró LSOS_SERVICES en Code.gs');
else {
  const gsSvc = {};
  for (const m of block[1].matchAll(/'([^']+)':\s*\{\s*price:\s*(\d+),\s*duration:\s*(\d+)/g)) gsSvc[m[1]] = { price: +m[2], duration: +m[3] };
  for (const s of C.catalog.filter((x) => x.active)) {
    const g = gsSvc[s.name];
    if (!g) fail(`"${s.name}" no existe en LSOS_SERVICES (Code.gs)`);
    else {
      if (g.price !== s.price) fail(`Precio distinto en Code.gs para "${s.name}": ${g.price} vs ${s.price}`);
      if (s.duration !== null && g.duration !== s.duration) fail(`Duración distinta en Code.gs para "${s.name}"`);
    }
  }
  for (const [n, g] of Object.entries(gsSvc)) {
    const s = C.catalog.find((x) => x.name === n);
    if (s && s.duration === null) warns.push(`Code.gs asume ${g.duration} min para "${n}", pero la duración no está confirmada en el catálogo.`);
  }
}

// --- contacto y reserva ---
const html = read('index.html');
if (!/^549\d{10}$/.test(C.business.whatsapp)) fail('whatsapp debe tener formato 549 + 10 dígitos');
if (!html.includes(`wa.me/${C.business.whatsapp}`)) fail('El enlace WhatsApp de <noscript> no coincide con config.js');
if (!html.includes(C.booking.url)) fail('La URL de reservas de <noscript> no coincide con config.js');
if (!/^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\//.test(C.booking.url)) fail('booking.url no parece una página de citas de Google Calendar');
if (C.analytics.ga4MeasurementId && !/^G-[A-Z0-9]+$/.test(C.analytics.ga4MeasurementId)) fail('ga4MeasurementId inválido');
if (C.booking.apiUrl && !/\/exec$/.test(C.booking.apiUrl)) fail('apiUrl debe terminar en /exec (no usar /dev)');
if (C.booking.apiUrl) warns.push('booking.apiUrl está completo: confirmar que se probó de punta a punta (ver docs/AUTOMATIZACION.md).');

// --- horarios: HTML estático = config ---
for (const h of C.business.hours) {
  if (!html.includes(`<span>${h.days}</span><span>${h.time}</span>`)) fail(`Horario del HTML no coincide con config: ${h.days}`);
}

// --- reseñas ---
for (const r of C.reviews.items) if (r.verified && !C.reviews.sourceUrl) fail(`Reseña de ${r.author} verificada pero falta reviews.sourceUrl`);

// --- recursos locales y basura ---
for (const m of html.matchAll(/(?:src|href)="(assets\/[^"#?]+)"/g)) if (!existsSync(join(root, m[1]))) fail(`Recurso faltante: ${m[1]}`);
for (const f of ['index.html', 'assets/css/styles.css', 'assets/js/app.js', 'assets/js/config.js']) {
  if (/\\n(?=[<@.}#a-z])/.test(read(f).replace(/'[^'\n]*\\n[^'\n]*'/g, ''))) fail(`Secuencia "\\n" literal sospechosa en ${f}`);
}
const ids2 = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dup = ids2.filter((v, i) => ids2.indexOf(v) !== i);
if (dup.length) fail(`ids duplicados en index.html: ${dup.join(', ')}`);
for (const m of html.matchAll(/href="#([^"]+)"/g)) if (m[1] && !ids2.includes(m[1])) fail(`Ancla rota: #${m[1]}`);

warns.forEach((w) => console.warn('AVISO:', w));
if (errors.length) { errors.forEach((e) => console.error('ERROR:', e)); process.exit(1); }
console.log(`OK: ${C.catalog.length} servicios, enlaces y coherencia con Code.gs verificados.`);
