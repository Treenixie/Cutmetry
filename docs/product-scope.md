# Product scope

**Status:** confirmed product direction, with noted implementation uncertainties.

## Purpose

Cutmetry bridges physical patterns and precise digital cutting workflows. It is intended for users working with fabric, paper, leather, wood, and other sheet materials, subject to material-specific constraints.

## One product, three areas

### Digitize (formerly TraceTrue)
- Import photographs of flat physical patterns and templates.
- Correct perspective when reliable reference geometry is present.
- Calibrate actual dimensions and extract editable vector contours.
- Allow manual corrections and export to SVG or another supported format.

### Prepare (formerly PrintProof)
- Import existing PDF patterns directly, without requiring Digitize.
- Inspect page sizes, margins, clipping risks, scale references, and available size layers.
- Support pre-print inspection, test prints, and virtual page assembly where page order/alignment can be determined.
- Preserve the distinction between digital PDF geometry and the physical result of a printer.

### Nest (formerly NestCraft)
- Import prepared geometry or existing ready-made contours directly.
- Arrange parts inside sheets, fabric widths, or irregular material remnants.
- Respect rotation, material grain/nap, spacing, pattern direction, defects, and other explicitly configured constraints.
- Compare candidate layouts and export usable cutting layouts.

## Confirmed cross-cutting requirements

1. One workspace, one shared project and one geometry model, not three separately built applications.
2. A consistent canvas and common parts library across all areas.
3. Workflows remain independent: users may start in Digitize, Prepare, or Nest.
4. Preserve dimensions, units, contours, and necessary metadata when passing between areas.
5. Include all three areas in the initial development scope.
6. Prefer local processing where practical and avoid requiring an account for core workflows.
7. Make diagnostics actionable and visible rather than relying on decorative visualizations.

## Quality principles

- **Accuracy over false certainty.** A reconstructed contour is only as reliable as its image, calibration and manual corrections.
- **Traceability.** Keep originals and derived geometry distinguishable; proposed non-destructive edits should retain the user's ability to revisit inputs.
- **User control.** Display uncertainties and let the user confirm edits, scale, assembly and layout.
- **Manufacturability.** A mathematically compact layout is not necessarily a valid real-world cut.
- **No guarantees without evidence.** A valid PDF preview does not guarantee that a physical printer will reproduce it at 100%.

## Not yet decided

Platform (web/desktop/hybrid), implementation language, libraries, project file format, interaction design, algorithm performance targets, and supported export variants require evaluation. Specific technical choices elsewhere in these docs are proposals, not approved dependencies.
