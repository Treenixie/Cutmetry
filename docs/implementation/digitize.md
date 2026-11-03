# Implementation: Digitize

**Status:** requirements confirmed; pipeline proposed.

## User flow

1. Import a photograph or scan of a flat physical pattern.
2. Identify a reliable planar reference (for example a known-size sheet or calibration markers).
3. Correct perspective and establish millimeters per unit.
4. Extract candidate outlines, holes and marks.
5. Inspect uncertainty, correct geometry and validate dimensions.
6. Save as reusable part geometry and export when needed.

## Proposed processing pipeline

- Preflight: resolution, blur, glare, clipping and visibility of reference.
- Reference detection plus manual corner placement as a fallback.
- Planar rectification using a validated projective transform.
- Segmentation/edge extraction followed by contour fitting and simplification with explicit error bounds.
- Geometry checks for self-intersections, open paths, tiny fragments and ambiguous holes.
- Manual edit tools for nodes, curves, dimensions and reference measurements.

## Important limits

A photograph cannot guarantee accurate geometry if the template is wrinkled, curved, out of the reference plane, or partly obscured. Calibration should show residual error or an uncertainty warning instead of inventing precision.

## Acceptance experiments

- Compare known-size test templates against measured output at several viewing angles.
- Check shapes with internal cutouts and narrow notches.
- Compare manual correction before and after curve simplification.
- Verify SVG export dimensions against a trusted measurement reference.

## Reuse

Resulting parts must be immediately available to Prepare and Nest without re-importing the photograph.
