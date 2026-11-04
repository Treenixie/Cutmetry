# CUTMETRY — Visual Art Direction

**Working title:** Cozy Tactile Drafting Workspace  
**Status:** Visual direction approved in principle; exact HEX values, spacing and texture parameters are proposed implementation tokens, subject to visual review.  
**Applies to:** Shared editor, Digitize, Prepare, Nest, dialogs and landing states.  
**Last updated:** 2026-11-04

## 1. Design intent

A quiet, precise digital craft workspace inspired by pattern paper, tracing paper, a cutting mat, chalk marks and drafting tools. It should feel tactile, warm and pleasant without sacrificing geometric accuracy or looking like a decorative scrapbook.

Approved direction:
- Warm white–beige–grey foundation rather than the previous dark interface.
- Several **muted pastel accents**, used sparingly and purposefully; no dominant purple.
- Subtle dashed lines, chalk-like annotations, a muted green gridded cutting mat and **watercolor drawing-paper texture with a fine, porous tooth**.
- Paper and mat textures must be **seamless, soft, low contrast and barely perceptible**. Real texture assets are permitted.
- A single coherent product identity across Digitize, Prepare and Nest.

**Principle:** the material metaphor lives primarily in the **surface**. Controls, labels, rulers and data stay sharp, clean and readable.

## 2. Color palette

Hex colors below are suggested values, not individually approved. The semantic roles are more important than any single swatch.

### Neutrals

| Token | HEX | Role |
| --- | --- | --- |
| `--cm-bg` | `#F3F0EB` | App background, warm greige |
| `--cm-panel` | `#FAF8F4` | Side panels and toolbars |
| `--cm-raised` | `#FFFCF8` | Popovers, raised cards, menus |
| `--cm-inset` | `#EBE7E0` | Recessed inputs and controls |
| `--cm-paper` | `#FCFAF6` | Precision drawing/pattern sheet |
| `--cm-border` | `#DCD7CF` | Regular separators |
| `--cm-border-soft` | `#E8E3DB` | Light dividers |
| `--cm-ink` | `#444640` | Primary text and critical geometry |
| `--cm-ink-muted` | `#676B64` | Secondary body text |
| `--cm-ink-faint` | `#8A8C84` | Decorative metadata only |

### Pastel accents (fill + readable ink pairing)

| Accent | Fill | Ink | Intended semantic use |
| --- | --- | --- | --- |
| Dusty rose | `#D6B6BA` | `#704E54` | Current selection and active part |
| Powder blue | `#BACBD3` | `#405A67` | Guides, references, Digitize indicators |
| Sage green | `#BFCFBF` | `#42614A` | Validated status, Nest workspace indicators |
| Soft peach | `#E8CCB5` | `#77543B` | Cautions, Prepare indicators |
| Hushed lilac-grey | `#CDC7D7` | `#5C536B` | Secondary annotations, never a dominant brand accent |

**Material:** `--cm-mat: #879B90` (muted green-grey rubber cutting mat), with `--cm-mat-grid-minor: rgba(250,248,239,.12)` and `--cm-mat-grid-major: rgba(250,248,239,.24)`.

### Usage rules

- Approx. **85–90%** of the static chrome uses neutrals; accents occupy small interactive/semantic regions.
- Multiple pastel colors can coexist, but do not use them interchangeably. One status → one stable color role.
- Pastel backgrounds should pair with **dark ink**, not white text. Do not rely on color alone to distinguish errors, validity, selected state or line types.
- Main buttons should be visible through form, border and ink contrast; do not turn every action into a colored pill.
- Dim labels should not carry essential information. Target WCAG-style text contrast checks (4.5:1 for ordinary text, 3:1 for nontext controls) when implementing.

## 3. Materials and seamless textures

### Paper

- Use on the drawing sheet, paper-like cards, preview pages and optionally some panel backgrounds.
- **Reference material: cold-pressed watercolor/drawing paper**, not smooth printer paper, tracing paper or a generic digital noise overlay. The surface has a shallow, irregular **porous tooth**: softly rounded micro-pits, small raised fibers and gentle variations in relief.
- Keep the sheet warm off-white. A hint of tactile micro-shadow/highlight should make the pores apparent when viewed closely, while the overall surface remains calm and nearly uniform from normal working distance.
- Texture must be **seamless, non-directional and organic**. A carefully tiled photographic scan or purpose-made height-map is permitted; test a sufficiently large repeat (suggested 512–1024 CSS px) at multiple scales and under different display densities to prevent visible repetition.
- Keep contrast restrained (starting target around 1–3% perceived local variation, adjusted by visual testing); texture should be felt rather than distract. Preserve the porous structure without turning it into rough sandpaper, dots, stains, wrinkles, scratches or pronounced watercolor paint blooms.
- Use on Digitize/Prepare work surfaces and paper-like parts/cards where appropriate. Do not put texture over small text, precision handles, scans being analyzed or accurate linework. Render it behind geometry in a distinct visual layer.
- Do not bake watercolor-paper texture into SVG/PDF outputs unless the user explicitly requests a decorative textured export.

### Cutting mat

- Mainly the **Nest** workspace background (may later be a user-selectable canvas surface).
- Muted sage/grey-green, not saturated emerald. Faint orthogonal grid.
- The grid is *functional*: fine every proposed 10 mm, major every 50 mm, labels as needed. These are suggested increments and must remain tied to real-world dimensions and zoom.
- A light seamless rubber-like surface texture is optional, but low contrast and non-directional. It may **never** obscure piece outlines.
- **Implementation:** render the measurement grid from canonical mm coordinates in the SVG/canvas viewport, following zoom/pan. A repeating CSS pixel grid alone is unsuitable for physically accurate measurement.

### Tracing paper / translucent overlays

- For photo-to-vector comparison, pattern layer visualization and ghosted shapes.
- Slight warm/translucent treatment; linework remains distinct.
- Avoid actual backdrop blur on geometry. Blur harms precision and creates unnecessary compositing cost.

### Chalk marks

- Express **temporary annotations, guides, hand-drawn notes or measurement sketches**.
- Thin, slightly soft/stippled strokes with modest, irregular-looking edges; smooth enough to avoid looking like noise.
- **Never apply chalk fuzziness to production cut paths, precise measurement rulers, hit targets or saved vector geometry**.
- If texture has animations, honor reduced-motion preferences. Static by default.

### Dashed lines

Use an explicit line vocabulary:

| Geometry meaning | Suggested appearance |
| --- | --- |
| Cut edge | Clean solid graphite line |
| Fold | Regular medium dash |
| Stitch / seam allowance guide | Short dashed/dotted path |
| Construction guide | Fine powder-blue dash |
| Current selection | Dusty-rose solid outline, soft dashed bounding box |
| Temporary chalk note | Slightly textured short stroke |
| Print bleed / no-print area | Peach dashed boundary + warning text |

Line styles must be distinguished by **dash, weight and labeling** rather than color alone. Dash lengths are examples, not yet fixed manufacturing conventions.

## 4. Layout and component language

- Retain the current three-zone desktop layout: **project + parts / shared canvas / contextual inspector**.
- Top bar: understated paper-colored surface; project breadcrumb, New/Open/Save and later Export.
- Workflow tabs: Digitize, Prepare, Nest. Indicate active mode by subtle paper-tab background and small semantic pastel indicator, not a broad colored gradient.
- Left pane: quiet part rows, small line icon and optional colored part label. Avoid extra card borders around every item.
- Inspector: measured dimensions and selected-object properties in crisp numeric typography. Inputs as soft inset wells; section headers as tiny graphite labels.
- Canvas: largest and visually calmest area; no loud textures, thick strokes or glows. Toolbar floats above without covering geometry.
- Status and error messages: precise wording and target-specific markers, not only colored toasts.
- Use one sans-serif stack (existing Inter/Segoe UI stack is acceptable); no novelty handwriting font for functional controls. Handwritten style, if used at all, belongs to optional decorative chalk notes.
- Proposed radii: inputs 6 px, panels 8 px, popovers 10 px. 1 px low-contrast borders, shadows as shallow ambient layers.
- Focus rings: visible dark tinted blue/rose with strong enough contrast, keyboard access preserved. Tool click targets should be comfortably sized.

## 5. Mode-specific art direction

### Digitize — paper + tracing

- Base: warm paper `#FCFAF6`, soft powder-blue guidelines.
- Photo is a user source layer; adjustable tracing transparency and vector comparison sit over it.
- Calibration markers should look precise and legible, not chalk-smudged.
- Provide a clear reference/real-size status; never imply an uncalibrated source has measured dimensions.

### Prepare — paper sheets + drafting marks

- Distinct warm off-white sheets with subtle boundaries and a barely visible **porous watercolor-paper surface**; page measurements and registration marks stay perfectly crisp.
- Show registration marks, overlap, clipping and print-safe areas with thin structured lines.
- Soft peach warns about issues, combined with icon/text; muted sage can denote checked requirements, not a guarantee about a physical printer.
- Page arrangement must remain crisp at all zoom levels.

### Nest — cutting mat + paper pattern pieces

- Work area can use the muted green cutting mat, with physically scaled, restrained grid.
- Pieces feel like thin watercolor-paper cutouts: pale neutral fill, barely visible porous tooth, fine graphite cut contour, tiny gentle shadow if it does not obscure overlaps.
- Selected item gets dusty-rose edging; material constraint warnings can be peach.
- Keep overlap detection separate from decoration; a pretty-looking paper arrangement is not a validated cut plan.
- The shared header/sidebars stay neutral when mode changes. The *work surface* carries the main metaphor.

## 6. Implementation-ready tokens

See [tokens.css](tokens.css). They are a **proposed stylesheet reference**, not applied to the live app yet.

Token groups: base/ink, pastel fills and dark inks, canvas material backgrounds, measurement grid, typography, radii, elevation, and decorative texture intensities.

### Surface recipes

```css
/* Visual style references; not the final canvas implementation. */
.cm-paper {
  background-color: var(--cm-paper);
  /* Optional seamless cold-pressed watercolor-paper tile, porous and subtly relief-textured. */
}
.cm-mat {
  background-color: var(--cm-mat);
  /* Physical grid must come from zoom-aware geometry/SVG, not pixel wallpaper. */
}
.cm-selection {
  color: var(--cm-rose-ink);
  background: var(--cm-rose);
}
```

## 7. Exact migration plan for the existing prototype

Files inspected at `dev` on 2026-11-04: `web/styles.css`, `web/index.html`, `web/app.js`.

1. **`web/styles.css` root:** replace `color-scheme: dark`, `--bg`, `--panel`, `--edge`, `--text`, `--accent` and the other dark/purple root tokens with the semantic colors from `tokens.css`. Introduce light color scheme.
2. **Remove hard-coded dark values:** migrate `.app-header`, `.workflow-nav`, `.sidebar`, `.editor-toolbar`, `.canvas-wrap`, `.editor-status`, `.inspector`, `.toast`, `.part-row`, `.button` and hover/focus states to named tokens. Merely changing `:root` will **not** recolor this app.
3. **`web/index.html`:** change `theme-color`, canvas `smallGrid`/`bigGrid` SVG stroke colors and the static `sheetShadow` treatment. Keep dimensions aligned with millimeters.
4. **`web/app.js`:** refactor hardcoded dark purple fills/strokes in `drawPart()`, page/material rendering, selection, labels and helper marks. Use CSS custom properties on SVG elements where possible, or centrally named JS palette tokens. Preserve meaning of geometric paths.
5. **Material surfaces:** add an optional seamless **porous watercolor-paper texture (cold-pressed look)** to Digitize/Prepare as a separate low-opacity visual layer, not generic flat noise; use precise, zoom-aware muted mat grid in Nest.
6. **Selected/active states:** add consistent pastel selection and focus behavior for workflow tabs, part rows, toolbar buttons and inspector controls. Active state must also have structural affordances.
7. **Quality gate:** visually review at regular desktop widths, 100% and 200% zoom, check text/controls contrast, ensure no texture tiling artifacts, no lost rulers and no changes to saved JSON geometry.
8. **Deployment:** only then merge the CSS and rendering changes. Cloudflare Pages can rebuild from `dev`, but design documents alone should not silently change the live prototype.

## 8. Acceptance checklist for visual implementation

- [ ] The application reads as **warm white / beige / grey**, without a dominant purple or dark shell.
- [ ] Rose, blue, sage, peach and lilac-grey accents are small and semantically stable.
- [ ] Paper and cutting-mat texture tiles are seamless with no visible repeats at different zoom levels.
- [ ] Watercolor-paper texture has visible *porous tooth* on close inspection, but remains barely noticeable at normal distance; it never affects reading or measurement.
- [ ] The Nest grid represents physical dimensions at all view scales.
- [ ] Cut/fold/seam/guide/selection lines remain distinguishable without color.
- [ ] Vector source geometry, JSON output and future SVG/PDF exports stay precise and untextured by default.
- [ ] Keyboard focus, labels and warning states remain accessible and obvious.
- [ ] Mode switches feel like changing work surfaces, not switching between unrelated applications.

## 9. Non-goals

No realistic scissors, paper scraps, stitched borders, fake stains, coffee rings, animated dust, torn-card effects, textured large headings, or decorative motion by default. **Cozy ≠ cluttered.** Materials should support work rather than impersonate a physical craft kit.
