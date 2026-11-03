# Cutmetry
A tool for digitizing physical patterns, verifying digital templates, and optimizing material cutting.

## Workspace preview

Cutmetry has an **early interactive workspace prototype**, connected to its shared TypeScript geometry model. It contains Digitize, Prepare and Nest tabs, a scalable canvas, a parts browser and a properties inspector. This is **not** a complete application: photo, PDF and SVG import, advanced editing and real nesting optimization have not been implemented.

The prototype runs locally and does not upload files or require an account.

### Run locally

Requires Node.js 20+ and npm:

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4173/`. Use the sample project, inspect shapes, switch tabs and save/open a Cutmetry JSON project. The preview is designed for desktop-sized windows.

### Test the core

```sh
npm test
```

This compiles TypeScript and runs the unit tests.

## Documentation

Project scope, implementation plans, decisions and ideas are maintained in [docs](docs/README.md). See [Milestone 02](docs/implementation/workspace-ui.md) for the prototype's exact capabilities and limitations, and [Milestone 01](docs/implementation/milestone-01.md) for the shared geometry foundation.
