# Amplifier Unified website

The static website introducing [Amplifier Unified](https://github.com/microsoft/amplifier-unified)
at [unified.amplifier.ms](https://unified.amplifier.ms/). It explains the product,
shows interactive examples, and points visitors to installation instructions.

This repository contains the website, not the Unified application. Its examples
use illustrative data and run entirely in the browser; they do not call an AI
service or create Amplifier sessions.

## Preview locally

The ready-to-serve site is in `dist/`. With Python 3 available, run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Any static server that supports
directory index pages can serve the same files. No application server, database,
API keys, or package installation is needed.

## Edit the site

Page content lives in `generate.mjs` and `content.mjs`. Styles and interactions
live in `dist/assets/site.css` and `dist/assets/site.js`. With Node.js available,
regenerate and check the pages:

```sh
node generate.mjs
node verify.mjs
```

## Publish

Serve the contents of `dist/` as the site's document root. See
[deployment instructions](DEPLOYMENT.md) for routing, custom 404 handling, and
hosting under a subdirectory.

Instrument Serif and Manrope are bundled with their SIL Open Font Licenses.
Keep those license files with the fonts when publishing. The source is licensed
under [MIT](LICENSE).

## Contributing

Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
