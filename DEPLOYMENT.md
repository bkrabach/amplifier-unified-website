# Deploy to unified.amplifier.ms

## Artifact

`dist/` is the complete static website. Upload its contents, preserving every directory, to the document root used by **https://unified.amplifier.ms/**. Retain `dist/assets/*-OFL.txt` with the fonts.

The archive also contains editable source, a dependency-free verifier, a verification receipt, and a SHA-256 file manifest. Only `dist/` should be exposed as web content. No private-preview configuration or credentials are included.

## Host behavior

1. Serve `index.html` for directory requests and redirect directory URLs without a trailing slash to the slash form. Relative navigation relies on that normal static-host behavior.
2. Serve JavaScript as JavaScript, CSS as CSS, and fonts with their normal font MIME type.
3. Return real 404 responses for unknown paths, with `404.html` as the error body when supported. Do not configure a catch-all rewrite to the home page: this is a multipage site.
4. The packaged `404.html` has `<base href="/">`, so its relative assets and recovery links resolve correctly even at an unknown deep path. This is intentional for the target domain root. For a subdirectory deployment, regenerate using `SITE_BASE_PATH=/your/prefix/`.
5. Use the existing target host's DNS, HTTPS, access policy, and deployment mechanism. Assets are not fingerprinted; do not give them an immutable year-long cache policy. HTML should revalidate during updates.

All normal pages use relative URLs. The custom 404 mount base is the only origin-root reference. The site contains no hard-coded preview-domain URLs, API endpoints, analytics, service worker, runtime environment settings, or remote image/font dependencies.

## Verify the files

From the extracted package folder:

```sh
node verify.mjs
```

On Linux, the original package manifest can also be verified with:

```sh
sha256sum -c MANIFEST.sha256
```

If you edit the source, regenerate HTML with `node generate.mjs` before verification. The bundled manifest describes the original package and must be refreshed after intentional edits.

## Acceptance after deployment

Verify the home page and these direct URLs, including a refresh on an example detail page:

- `/examples/`
- `/examples/workshop/`
- `/examples/decision-brief/`
- `/examples/little-tools/`
- `/capabilities/`
- `/get-started/`
- `/built-with-amplifier/`
- `/help/`

Check navigation back to home from a detail page, the phone menu, self-hosted font loading, and a deliberately unknown deep path such as `/missing/deep/page/`. On the workshop page, 24 people over one day at the default rates should total $2,420. Try the three example downloads in the deployed browser and confirm file delivery. Confirm that no paper/folio photographs appear on home, capabilities, or the story page.

Retain the existing site's deployable version as rollback evidence before activation. Report the deployed URL, deployment revision, and results of the target-domain browser checks to the user.
