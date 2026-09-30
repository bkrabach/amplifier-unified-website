import fs from 'node:fs';
import path from 'node:path';
import { populate } from './content.mjs';

const root = path.resolve(import.meta.dirname, 'dist');
// Normal pages use document-relative URLs. A host-served 404 can appear at
// any depth, so its base is the configured mount point (the domain root by default).
const mountPath = process.env.SITE_BASE_PATH || '/';
if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(mountPath)) {
  throw new Error('SITE_BASE_PATH must be an absolute path ending in /');
}
function relativeReferences(html, route) {
  const directory = route.slice(1);
  return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g, (_, attribute, value) => {
    const match = value.match(/^([^?#]*)([?#].*)?$/);
    let relative = path.posix.relative(directory, match[1].slice(1));
    if (!relative) relative = './';
    else if (match[1].endsWith('/')) relative += '/';
    return `${attribute}="${relative}${match[2] || ''}"`;
  });
}
const nav = [['/examples/', 'Examples'], ['/capabilities/', 'Capabilities'], ['/built-with-amplifier/', 'Our story']];
export const link = (href, text, cls = 'text-link') => `<a class="${cls}" href="${href}">${text}</a>`;
export const button = (href, text, secondary = false) => link(href, text, `button${secondary ? ' button-secondary' : ''}`);
export const eyebrow = text => `<p class="eyebrow">${text}</p>`;
export const breadcrumb = text => `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/examples/">Examples</a><span aria-hidden="true">/</span><span>${text}</span></nav>`;
export const pageIntro = (label, title, copy) => `<header class="page-intro wrap">${eyebrow(label)}<h1>${title}</h1><p class="intro-copy">${copy}</p></header>`;
export const related = () => `<section class="closing wrap"><div>${eyebrow('A PLACE TO BEGIN')}<h2>Bring an idea.<br>See where it goes.</h2></div><div><p>Start with a small piece of real work. A plan you need, a decision to make, or a task you keep repeating.</p>${button('/get-started/', 'Get started')}${link('/examples/', 'Explore the examples')}</div></section>`;
export const preview = () => `<div class="workspace-preview" aria-label="Illustrative Amplifier Unified workspace"><aside class="workspace-sidebar"><span class="workspace-mark">a.</span><span>New chat</span><span>Search</span><span class="is-selected">Library</span></aside><div class="workspace-main"><div class="workspace-top"><span>Team workshop</span><span class="workspace-meta">Canvas</span></div><div class="workspace-tools"><span>18 people</span><span>2 days</span><span>Workshop plan</span></div><h3>A little room<br>to think together.</h3><div class="mini-agenda"><div><span>01</span><strong>Align on goals</strong><small>Day one · Morning</small></div><div><span>02</span><strong>Explore possibilities</strong><small>Day one · Afternoon</small></div><div><span>03</span><strong>Turn ideas into a plan</strong><small>Day two</small></div></div><div class="workspace-input">Let’s leave the first morning free.<span aria-hidden="true">+</span></div></div></div>`;

const home = `<section class="hero wrap"><div class="hero-copy">${eyebrow('AMPLIFIER UNIFIED')}<h1>Make something<br>of your ideas.</h1><p>A plan. A document. A little tool.<br>Work with AI to make something you can use.</p><div class="hero-actions">${button('/examples/workshop/', 'See it in action')}${link('/get-started/', 'Get started')}</div></div><div class="material-stage">${preview()}<span class="stage-caption">Illustrative workspace</span></div></section><section class="home-chapter wrap"><h2>Talk it through.<br>See it take shape.</h2><div><p>Your conversation and the work belong together. Keep the draft, the plan, or the tool in view while you refine it.</p>${link('/capabilities/', 'Explore the workspace')}</div></section><section class="home-index wrap" aria-labelledby="home-examples"><div class="section-heading">${eyebrow('WAYS TO WORK')}<h2 id="home-examples">Start with something familiar.</h2>${link('/examples/', 'All examples')}</div><div class="example-rows"><a href="/examples/workshop/"><span class="row-number">01</span><h3>Shape a plan</h3><p>Make room for the people, time, and budget you have.</p><span class="row-tag">Workshop planner</span></a><a href="/examples/decision-brief/"><span class="row-number">02</span><h3>Make sense of it</h3><p>Turn scattered information into a brief you can discuss.</p><span class="row-tag">Decision brief</span></a><a href="/examples/little-tools/"><span class="row-number">03</span><h3>Make a little tool</h3><p>Give a recurring task a useful shape of its own.</p><span class="row-tag">Priority picker</span></a></div></section><section class="home-note wrap"><p>Built on Amplifier.<br><span>Made for the way you work.</span></p>${link('/built-with-amplifier/', 'The story behind Unified')}</section>`;

export const pages = { '/': { title: 'Make something of your ideas', description: 'Work with AI on a plan, a document, or a little tool. See it take shape beside the conversation, and refine it together.', body: home } };

export function render(route, page) {
  const navigation = nav.map(([href, label]) => `<a href="${href}"${route.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#183e32"><title>${page.title} · Amplifier Unified</title><meta name="description" content="${page.description}"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23183e32'/%3E%3Cpath d='M8 23 16 7l8 16M11 18h10' fill='none' stroke='%23efeb67' stroke-width='3'/%3E%3C/svg%3E"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head><body class="${route.startsWith('/examples/') && route !== '/examples/' ? 'example-detail' : ''}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap"><a class="wordmark" href="/" aria-label="Amplifier Unified home">Amplifier <span>Unified</span><span class="wordmark-dot" aria-hidden="true"></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span></span><span></span></button><nav class="main-navigation" id="main-navigation" aria-label="Main navigation">${navigation}${button('/get-started/', 'Get started')}</nav></header><main id="main">${page.body}</main><footer class="site-footer"><div class="footer-inner wrap"><div><a class="wordmark footer-wordmark" href="/">Amplifier Unified</a><p>Ideas, with somewhere to go.</p></div><nav aria-label="Product"><strong>EXPLORE</strong><a href="/examples/">Examples</a><a href="/capabilities/">Capabilities</a><a href="/get-started/">Get started</a></nav><nav aria-label="Resources"><strong>GO DEEPER</strong><a href="/built-with-amplifier/">Built with Amplifier</a><a href="/help/">Questions &amp; answers</a><a href="https://github.com/microsoft/amplifier-unified">Source &amp; documentation</a></nav><nav aria-label="MADE"><strong>FROM MADE</strong><a href="https://made.amplifier.ms/">Meet the team</a><a href="https://made.amplifier.ms/how-we-build/">How we build</a></nav></div><div class="footer-bottom wrap"><span>Amplifier Unified · An early adopter experience</span><div><a href="https://privacy.microsoft.com/privacystatement">Microsoft privacy</a><a href="https://github.com/microsoft/amplifier-unified/blob/main/LICENSE">Open source license</a></div></div></footer></body></html>`;
  return relativeReferences(html, route);
}

export function writePages() {
  for (const [route, page] of Object.entries(pages)) {
    const target = path.join(root, route, 'index.html');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, render(route, page));
  }
}

populate(pages, { button, link, eyebrow, breadcrumb, pageIntro, related, preview });
writePages();
fs.writeFileSync(path.join(root, '404.html'), render('/', pages['/not-found/']).replace('<head>', `<head><base href="${mountPath}">`));
