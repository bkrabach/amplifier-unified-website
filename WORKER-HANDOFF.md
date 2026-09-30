# Worker session handoff

Deploy this complete Amplifier Unified marketing website to **https://unified.amplifier.ms/** using the target site's existing hosting workflow. The user approved the Material design and requested removal of the decorative imagery resembling the MADE site. Both decorative material photos have been removed; retain the green native HTML workspace illustrations, typography, content, and three interactive examples.

Extract the archive, read `DEPLOYMENT.md`, verify `MANIFEST.sha256`, and run `node verify.mjs`. Publish the contents of `dist/` as the static document root. The prepared artifact requires no build or runtime service. The source is included for later edits, but no design changes are requested.

The pages use relative navigation and asset URLs. The custom 404 base is `/`, suitable for the target domain root. Preserve directory index serving and trailing-slash redirects, and return actual 404 responses instead of rewriting every route to home.

Keep the existing deployment as rollback evidence, deploy with the appropriate existing access policy, and verify the direct routes, phone navigation, fonts, example calculations, downloads, and a deep missing-page response on the target domain. Report the final URL and deployment evidence. DNS/TLS setup and real deployed-browser acceptance have not been done by the preparing session.
