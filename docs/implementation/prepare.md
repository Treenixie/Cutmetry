# Implementation: Prepare

**Status:** requirements confirmed; diagnostic details proposed.

## User flow

1. Import a PDF pattern (or select project parts).
2. Inspect page boxes, intended page sizes, visible geometry and optional PDF layers.
3. Review scale/measurement references, clipping risks, and page alignment.
4. Prepare a test print and verify a physical measured reference.
5. Export a checked print layout or report issues requiring manual intervention.

## Proposed checks

- Page count, mixed page dimensions, orientation, A4/Letter mismatch.
- MediaBox/CropBox and printable-area warnings, with user-specific printer margins when known.
- Detection of potential clipped lines and registration marks.
- Optional content groups (PDF layers), where supported by the source.
- Control-square measurements and a calibration worksheet.
- Virtual assembly using reliable registration data; manual ordering/alignment if inference is insufficient.
- Lightweight preview of individual pages and reconstructed full layouts.

## Accuracy boundaries

- PDF dimensions and a simulated page layout do not prove a printer's physical scale.
- An absent or ambiguous control reference must not be treated as a passed check.
- Virtual assembly cannot promise correct joins if the source lacks reliable markers or ordering.
- Nonuniform print distortion requires investigation rather than blind scaling.

## Acceptance experiments

- Different page boxes and A4/Letter edge cases.
- Layered and flattened PDFs.
- Missing/cropped registration marks.
- Intentional black fills and thin lines that may disappear on rasterization.
- Physical test pages measured after printing.

## Reuse

Verified contours and page-derived parts should be available to the shared editor and Nest, with uncertainty and origin preserved.
