# Cloudflare Pages deployment

**Status:** repository is ready for a Git-connected Pages deployment. It is **not** automatically deployed until a Cloudflare account owner connects the repository and completes setup.

## Why Pages

The current CUTMETRY workspace is a static browser application with a compiled TypeScript core, no backend, and no accounts. Git-connected Cloudflare Pages provides hosting and deployment previews. The site is publicly accessible to anyone who knows its URL, unless access controls are added.

## Initial setup (one time)

1. Open the Cloudflare dashboard and navigate to **Workers & Pages**.
2. Select **Create application → Pages → Connect to Git** (sometimes shown as *Import an existing Git repository*).
3. Authorize the Cloudflare GitHub app for `Treenixie/Cutmetry` if it is not already authorized. Prefer access to selected repositories only.
4. Select **Treenixie/Cutmetry**.
5. Configure the Pages project:

| Setting | Value |
| --- | --- |
| Project name | `cutmetry` if available; otherwise choose a unique name |
| Framework preset | None |
| Production branch | `dev` (temporary prototype setup) |
| Root directory | Repository root `/` |
| Build command | `npm run build:pages` |
| Build output directory | `build/pages` |
| Environment variable (if needed) | `NODE_VERSION=22` |

6. Save and deploy. Cloudflare will provide a `*.pages.dev` URL after a successful deployment.
7. Test `/`, `/app.js` and `/dist/core/index.js`. Check browser developer tools for errors.

Cloudflare's Pages Git integration will automatically rebuild and publish pushes to the production branch and generate preview deployments for other branches/PRs, subject to branch controls.

## What is published

The build command compiles `src/core`, then produces `build/pages` with only `index.html`, `app.js`, `styles.css`, `_headers`, and compiled JavaScript runtime files under `dist/core`. It does **not** publish source TypeScript, tests, original repository documentation, or working project files.

The app still runs in the visitor's browser. Local JSON open/save stays client-side; no project file upload endpoint is introduced by this deployment. Cloudflare still handles ordinary requests and access logs for served website assets.

## Local validation

```sh
npm install
npm run build:pages
npm run check:pages
```

CI also runs these commands to catch missing runtime dependencies and broken path assumptions before deploying.

## Important prototype limitations

- The visible interface includes demonstration geometry, not photo/PDF/SVG import.
- Nest is a manual preview; constraint validation and automatic optimization are not implemented.
- Projects are not stored on Cloudflare; saving downloads JSON locally.
- A public Pages URL is **not** private access control. Use Cloudflare Access or avoid publishing confidential examples.
- `X-Robots-Tag: noindex` discourages indexing but does not hide the site or restrict access.
- When a release branch exists, move the production branch away from `dev` to avoid every experimental change becoming public.

References:
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- https://developers.cloudflare.com/pages/configuration/monorepos/
