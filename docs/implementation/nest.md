# Implementation: Nest

**Status:** requirements confirmed; optimization strategy proposed.

## User flow

1. Select parts or import ready-made vectors.
2. Define material dimensions or usable irregular remnants.
3. Set quantities, allowed rotation/mirroring, grain, direction, spacing, and defects.
4. Generate candidate layouts with transparent validity checks.
5. Inspect/adjust placements manually and export the selected result.

## Proposed solver

- Normalize part geometry, including holes and allowance/kerf semantics.
- Build feasible material regions and exclusion zones.
- Use reliable polygon collision and containment tests with explicit tolerances.
- Start with a deterministic constructive heuristic; evaluate local improvement, multiple seeds and alternative orientations.
- Stop/cancel gracefully and keep the best valid result found.
- Report usable material, occupied area, waste estimate, unplaced parts, and violated constraints.

Optimization is generally heuristic: do not promise the mathematically global optimum.

## Constraints needing separate handling

- Grain/nap and permitted rotation/mirroring.
- Directional print and pattern repeat matching.
- Cutting spacing and tool kerf versus seam allowance.
- Defect zones and irregular leftover material.
- Piece quantities and paired/mirrored components.
- Material boundaries and safety margins.

## Acceptance experiments

- Regular rectangles and concave polygons.
- Parts with holes, narrow necks, and duplicate quantities.
- Grain-locked pieces and no-mirror rules.
- Irregular scraps and internal defect regions.
- Unsatisfiable layouts that must return useful diagnostics.

## Reuse

Placements refer to canonical part IDs. Editing a part invalidates or updates affected layouts, never silently leaves an outdated cut plan.
