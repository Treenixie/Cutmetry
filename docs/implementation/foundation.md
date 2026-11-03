# Implementation: shared foundation

**Status:** proposed implementation approach.

## Objective

Build one usable project, one precise geometry model, and one canvas for all three product areas before treating them as independent feature flows.

## Suggested work packages

1. **Project persistence:** import references, versioned project metadata, units, parts, materials and layouts.
2. **Geometry kernel:** paths with holes, transforms, offsets, tolerance handling, bounding boxes, and geometry validation.
3. **Canvas:** pan/zoom, physical rulers, snapping, selection, inspection, and editable paths.
4. **Workflow state:** Digitize/Prepare/Nest tools operate on existing project data, not duplicated copies.
5. **History:** proposed undo/redo and provenance for derived contours, calibrations and layouts.
6. **Import/export contracts:** file formats, units, page boxes, coordinate transforms and error diagnostics.

## Integration checkpoints

- A contour created through Digitize appears unchanged in Prepare and can be placed in Nest.
- An SVG imported directly becomes a reusable part without image calibration.
- A PDF imported in Prepare remains inspectable without requiring Digitize.
- Changing a part updates dependent layouts or marks them stale explicitly.
- Saving/reopening a project preserves real dimensions, material constraints and annotations.
- Invalid/unknown scale blocks claims about real-world dimensions.

## Proposed test fixtures

Keep a small, redistributable set of known-geometry SVG/PDF files, photographed calibration targets, multipage patterns, and irregular shapes. Include cases with holes, mirrored parts, distorted images, missing references, and conflicting constraints.

## Technical evaluation before commitment

Compare feasible browser, desktop and hybrid stacks for local-file access, PDF layer support, memory use, large canvases, and long optimization jobs. Choose dependencies based on measured capability, not familiarity alone.
