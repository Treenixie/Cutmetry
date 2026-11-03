# Milestone 02: shared workspace preview

**Status:** interactive desktop-sized browser prototype. This is not a production editor or a decision to ship as a website.

## Why the visual workspace comes first

An SVG parser without a canvas and project controls offers no usable workflow. This milestone gives Cutmetry a visible place for three areas to share and inspect geometry, before importing real documents.

## Implemented in the preview

- Shared workspace shell with Digitize, Prepare and Nest tabs.
- Shared parts browser and editable part names.
- Scalable SVG canvas, zoom, pan and fit-to-view.
- Physical-size A4 reference preview in Prepare. **Not PDF parsing or print validation.**
- Material sheet with draggable part placements in Nest. **Not a nesting optimizer or collision validator.**
- Sample project with Bezier paths, parts and layout references.
- Add a rectangle, open a Cutmetry project JSON and save JSON locally.
- Inspector with dimensions computed from the shared geometry model.
- Visible explanations for unfinished features.

## Not yet implemented

- Native photo, PDF or SVG import/export.
- Bezier node editing, snapping, topology validation, production-scale printing.
- Automatic nesting, collision checks, material grain/defect handling or manufacturing verification.
- Source binary storage in the JSON metadata project.
- Undo/redo, accessibility audit, localization, and responsive mobile editing.

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4173/` in a desktop browser. The Node.js server serves `web/` and the compiled `dist/` core without a cloud service. Refresh after source edits; hot reload is not enabled.

## Acceptance checks

- Switching tools preserves the same project and part selection.
- The same geometry appears in three context-specific views.
- Dragging a Nest placement changes only its placement, not part master geometry.
- Zoom/pan and project JSON save/open work.
- The interface does not claim that imports or nesting optimization already work.

## Next milestone

Review interface ergonomics with realistic templates, then connect native SVG import, path editing and dimension-preserving SVG export. Maintain all three product areas as parts of the same initial project scope.
