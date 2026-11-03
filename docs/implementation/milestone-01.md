# Milestone 01: shared geometry foundation

**Status:** initial code implemented and locally tested. No user-facing application yet.

## Added

- A platform-neutral TypeScript core with no runtime dependencies.
- A versioned project contract (`schemaVersion: 1`) with sources, parts, materials and layouts.
- Editable line, quadratic and cubic path segments, plus physical units in millimeters.
- Affine path transforms and mathematically computed curve bounds.
- Validation of physical dimensions, geometry fields, IDs and cross-references.
- Warning when an unverified-scale part is used in a proposed layout.
- JSON round-trip serialization of **project metadata only**.
- Automated Node tests and GitHub Actions checks.

## What this does **not** implement

- Photo or PDF import, camera calibration, SVG parsing or export.
- Path topology, self-intersection detection, offsets, holes/contour containment or nesting.
- Full persistence of imported binaries; `storageKey` is a reference, not a file store.
- Material grain, defects, remnant polygons or pattern matching.
- A graphical editor, undo/redo, end-user printing or verified manufacturing output.

## Engineering cautions

- Geometry coordinates are millimeters only after a source has been calibrated or imported from a correctly interpreted physical unit system.
- `scaleStatus` records manual/source verification; it is not an accuracy certificate.
- Layout validation presently checks references and measurements, **not** collision, containment or physical feasibility.
- Version 1 is an early internal contract, not a guarantee of backward-compatible project files.

## Next milestone proposal

Define a focused integration fixture: import a known-dimension SVG (including a curved outer contour and a hole), preserve all geometry in the shared model, render it in a common canvas, then export with matching dimensions. Add independent stubs for all three workspaces only once the geometry contract is exercised end to end.
