# Shared architecture proposal

**Status:** partly prototyped. The shared project/geometry contract exists; importer, topology, solver and editor architecture remain proposals.

## Guiding invariant

Digitize, Prepare, and Nest operate on the same canonical set of parts and dimensions. Imported documents and images are sources; part geometry is not tied to the tool that created it.

## Proposed data model

| Entity | Responsibility |
| --- | --- |
| Project | Metadata, units, sources, parts, materials, sheets, layouts, and document versions |
| Source | Immutable original image, SVG, PDF, or related input reference |
| Calibration | Reference measurements, geometric transform, confidence, and residual error |
| Part | Stable ID, name, quantity, contours, holes, notches, annotations and provenance |
| Geometry | Closed paths, open construction paths, transformations, and explicit unit conversion |
| Material | Dimensions, usable regions, grain direction, pattern repeat and defects |
| Layout | Part instances, placements, rotations, mirrored state, constraints and scoring |
| Validation | Issue code, severity, affected source/part/page and diagnostic evidence |
| Export | Output intent and settings, not an uncontrolled rewrite of the source |

These are logical entities, not an approved file schema.

## Coordinate spaces

- Source pixels for photographs.
- PDF user space for imported documents, with page boxes and transformations retained.
- Canonical physical space expressed in millimeters (proposed).
- Material space for layouts.
- Viewport pixels for display only.

Every conversion must be explicit and testable. Do not infer real dimensions from an uncalibrated image.

## Geometry rules

- Use a well-defined representation for paths, holes, winding, mirrored pieces, and offsets.
- Store full-precision geometry internally; round only for display/export as appropriate.
- Define tolerances for joins, intersections and topology checks. Avoid treating screen pixels as manufacturing units.
- Distinguish original contour from seam allowance, cutting allowance, kerf, or safety gap.
- Keep copies/instances separate from the master part definition.

## Proposed processing flow

1. Import source and store its metadata.
2. Parse/recognize candidate geometry while recording uncertainties.
3. Calibrate and validate dimensions before promoting it to canonical parts.
4. Edit parts once, reusing them in Prepare and Nest.
5. Apply material-specific constraints to layout instances.
6. Export with units, configuration, and validation summary.

## Proposed non-destructive history

Retain imported originals, calibration settings, and editable operations; derived representations can be rebuilt. An undo/redo model and reproducible exports should be designed alongside the shared editor rather than bolted on later.

## Architecture boundaries

Image processing, PDF parsing, geometry, layout optimization, and UI rendering should expose separate interfaces even though the user sees one editor. This permits swapping algorithms without fragmenting the product.

## Open questions

- Browser-first, desktop-first, or hybrid delivery.
- Reliable handling of multi-page and layered PDFs.
- Precision and tolerance strategy for curves, offsets and polygon Boolean operations.
- A portable, versioned project format and migration plan.
- How expensive optimization runs and cancellation are handled on different platforms.
