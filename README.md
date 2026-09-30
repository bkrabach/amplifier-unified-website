# Amplifier Unified website

Deployment package for **https://unified.amplifier.ms/**, prepared September 30, 2026.

## Deployable files

Publish the contents of `dist/` as the site's static document root. The complete HTML, styles, interactions, fonts, and font licenses are included. No build, application server, package installation, API keys, database, or Sites account is needed to serve this website.

See `DEPLOYMENT.md` for hosting requirements and `WORKER-HANDOFF.md` for the worker session's task.

## What changed

- Removed both decorative material photographs and their references from the home, capabilities, and story pages. The green workspace illustrations and Material typography remain.
- Made ordinary page navigation, scripts, stylesheets, and font URLs relative to their document or stylesheet. There are no links or asset dependencies on the earlier preview host.
- Made the host-served custom 404 use a configurable mount point, defaulting to `/` for unified.amplifier.ms.

MADE, GitHub, Microsoft privacy, and license links remain intentional external destinations. The site's rendered visual assets are HTML/CSS and an embedded SVG favicon; it contains no photographic assets or remote asset loads. Instrument Serif and Manrope are bundled with their SIL Open Font Licenses.

## Pages

Home, examples collection, workshop planner, decision brief, priority picker, capabilities, get started, built with Amplifier, and questions and answers. The utility `not-found/` route and `404.html` provide recovery pages.

The three examples use illustrative data and deterministic browser interactions. They do not call an AI service or create Amplifier sessions. Their downloads are generated in the browser. The getting started page points to product documentation, rather than a hosted app signup.

## Edit or regenerate

Page content lives in `generate.mjs` and `content.mjs`. Styles and interactions live in `dist/assets/site.css` and `dist/assets/site.js`. With a current Node.js runtime:

```sh
node generate.mjs
node verify.mjs
```

To mount the site under a prefix, regenerate only the custom 404 base with that prefix:

```sh
SITE_BASE_PATH=/preview/unified/ node generate.mjs
node verify.mjs
```

Normal pages already work under a prefix. Use a static HTTP server for review; directory-style navigation expects directory index serving.

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

## Validation boundary

`VERIFICATION.json` records the package checks and browser review. Routing, asset resolution, fragments, page metadata, and source syntax were checked. All page references were verified at a domain root and under a nested prefix. Prior example calculations and core controls were exercised; the latest change leaves those implementations intact. The browser did not return a download receipt in the earlier review. Clipboard controls were left unclicked to preserve the user's clipboard. Optional WebMCP acceptance requires a supported browser.

Live product onboarding and the target domain's DNS, TLS, server configuration, and deployed-browser acceptance belong to the worker session. This archive has not been deployed to unified.amplifier.ms.
