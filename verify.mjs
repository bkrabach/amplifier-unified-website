import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, 'dist');
const errors = [];
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else files.push(path.relative(root, file).split(path.sep).join('/'));
  }
}
walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const ids = new Map();
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const values = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  ids.set(file, new Set(values));
  if (values.length !== ids.get(file).size) errors.push(`${file}: duplicate IDs`);
  if ([...html.matchAll(/<h1(?:\s|>)/g)].length !== 1) errors.push(`${file}: expected one h1`);
  if (!html.includes('name="description"')) errors.push(`${file}: missing description`);
  if (!html.includes('rel="icon"')) errors.push(`${file}: missing favicon`);
  if (/chatgpt\.site|material-hero|material-story|<img\b/i.test(html)) errors.push(`${file}: removed image or preview-host reference`);
}
let referencesChecked = 0;
function checkReference(ref, base, prefix, from) {
  if (/^(?:https?:|data:|mailto:|tel:|blob:)/i.test(ref)) return;
  const url = new URL(ref.replaceAll('&amp;', '&'), base);
  if (!url.pathname.startsWith(prefix)) {
    errors.push(`${from}: reference escapes mount: ${ref}`);
    return;
  }
  const relative = decodeURIComponent(url.pathname.slice(prefix.length));
  let target = relative || 'index.html';
  if (target.endsWith('/')) target += 'index.html';
  if (!files.includes(target)) errors.push(`${from}: missing ${ref} -> ${target}`);
  else if (url.hash && ids.has(target) && !ids.get(target).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${from}: missing fragment ${ref}`);
  referencesChecked++;
}
for (const prefix of ['/', '/nested/preview/']) {
  for (const file of htmlFiles.filter(file => file !== '404.html')) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const route = file === 'index.html' ? '' : file.replace(/index\.html$/, '');
    const base = `https://package.invalid${prefix}${route}`;
    for (const match of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      if (match[1].startsWith('/')) errors.push(`${file}: non-relative normal-page reference ${match[1]}`);
      checkReference(match[1], base, prefix, file);
    }
  }
}
const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
const mount = notFound.match(/<base href="([^"]+)">/)?.[1];
if (!mount || !/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(mount)) errors.push('404.html: invalid mount base');
else {
  for (const match of notFound.replace(/<base[^>]*>/, '').matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    checkReference(match[1], `https://package.invalid${mount}`, mount, '404.html');
  }
}
for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  if (/material-hero|material-story|chatgpt\.site/.test(css)) errors.push(`${file}: stale image/preview reference`);
  for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
    if (match[1].startsWith('/')) errors.push(`${file}: non-relative CSS URL`);
    checkReference(match[1], `https://package.invalid/${file}`, '/', file);
  }
}
const result = {
  passed: errors.length === 0,
  htmlFiles: htmlFiles.length,
  visitorPages: htmlFiles.filter(file => file !== '404.html' && file !== 'not-found/index.html').length,
  relativeReferencesChecked: referencesChecked,
  normalPageMountsVerified: ['/', '/nested/preview/'],
  custom404Mount: mount,
  decorativePhotosPresent: files.some(file => /\.(?:webp|png|jpe?g)$/i.test(file)),
  errors
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
