# Cutmetry
A tool for digitizing physical patterns, verifying digital templates, and optimizing material cutting.

## Documentation

Project scope, implementation plans, decisions, and ideas are maintained in [docs](docs/README.md).

## Development status

Early foundation only. The user-facing editor and Digitize / Prepare / Nest workflows are not implemented yet.

A platform-neutral TypeScript geometry and project core lives in [src/core](src/core). It tracks real-world millimeter coordinates, editable curves, parts and basic layout references. See [Milestone 01](docs/implementation/milestone-01.md) for implemented capabilities and limitations.

### Run checks

Requires Node.js 20+ and npm:

```sh
npm install
npm test
```

The checks compile TypeScript and run the unit tests. No service, account, or external runtime is needed.
