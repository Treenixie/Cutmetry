# CUTMETRY — Tracing paper and material UI implementation

**Status:** Approved visual behaviors; implementation pending. This is a technical execution plan, **not a claim of finished functionality**.  
**Scope:** Shared editor, Digitize, Prepare, Nest.  
**Related:** [Art direction](art-direction.md) · [Tokens](tokens.css) · [Workspace preview](../implementation/workspace-ui.md).

## 0. Agreed design decisions

- A cohesive warm white / beige / grey interface, with small, meaningful rose, powder-blue, sage, peach and muted-lilac accents.
- Main pattern surfaces use **plain sewing pattern drafting paper**: matte, slightly fibrous, warm off-white, no school-style squared ruling.
- **Translucent tracing paper** is a functional material for overlays, comparisons, previews and temporary marks. It is **not** the global visual style for all panels.
- Nest uses a subdued green cutting mat with an accurate physical grid. Paper and mat textures are subtle, seamless, and stay *behind* geometry.
- Chalk-like marks and dashed lines are temporary guides/annotations, never a substitute for numerically precise cut contours.
- The UI must distinguish simulated visual states from implemented import, measurement, PDF merging and nesting algorithms.

## 1. User scenarios (approved)

| Workflow | Interaction | Visual behavior | Real engine work required |
| --- | --- | --- | --- |
| Digitize | Photo → tracing layer | Source photo under milky semi-transparent tracing-paper sheet, with sharp editable vector contours above | Photo import, calibration, tracing tools |
| Digitize | Lift / hide tracing sheet | Temporarily reveal source photo without altering tracing geometry | Layer visibility + input state |
| Compare | Original / revised patterns | Versions in identical local coordinates; trace overlay shows changed contours, optional highlighted differences | Version snapshots, geometric correspondence, difference calculation |
| Prepare | Align neighboring PDF pages | Neighbor page temporarily semi-transparent with registration crosses and overlap zones | PDF parser, page transforms, alignment validation |
| Prepare | Compare multiple pattern sizes | Selected size sharp, other sizes shown as separate faint overlays distinguished by labels/dashes | PDF layer/size detection, semantic layer mapping |
| Nest | Pick up / move paper part | Dragged paper shape subtly raised and slightly translucent; former position shown as a ghost outline | Pointer state and placement transform; later constraints |
| All modes | Temporary measure, guide and mark | Optional translucent annotation layer separated from manufacturing geometry | Overlay tools, units and positioning |

All workflows are in scope as a coherent system, but **none** of the proposed production tracing, PDF, version-comparison or placement-preview behavior exists in the current prototype. Current Nest can manually drag sample placements only.

## 2. Design layers / render order

Keep presentation separated from physical/vector source data. Proposed layer stack from back to front:

1. **Surface:** plain paper (Digitize/Prepare) or muted green cutting mat (Nest).
2. **Reference sources:** imported image/PDF page when implemented.
3. **Translucent sheet material:** low-opacity warm tracing-paper surface, optional seam-free fiber texture and faint paper edge.
4. **Comparison / ghost geometry:** original version, adjacent page or prior placement (lightweight).
5. **Working cut geometry:** sharp cut contour, fold, notch, labels and measurement anchor points.
6. **Temporary work marks:** guides, seam allowance previews, chalk annotations and measuring rulers.
7. **Selection and controls:** bounding boxes, handles, active measurement, tooltips and local feedback.

Important exception: the translucency belongs to the **sheet background**. Never group precise contour paths inside an opacity-faded parent if they should remain fully readable; use separate SVG/DOM groups or layers. Cut edges and exported geometry stay clean.

## 3. State model

Keep UI-only parameters out of canonical geometry and layout placement data unless explicitly part of project document semantics.

```ts
type WorkspaceMode = "digitize" | "prepare" | "nest";
type SheetMaterial = "plain-pattern-paper" | "tracing-paper" | "kraft" | "cutting-mat";
type OverlayKind =
  | "tracing"
  | "version-compare"
  | "pdf-page-alignment"
  | "size-compare"
  | "placement-ghost"
  | "measurement"
  | "guide"
  | "annotation";

type UiLayer = {
  id: string;
  kind: OverlayKind;
  visible: boolean;
  opacity: number; // 0..1; presentation only
  sourceRef?: string;
  lockInteraction?: boolean;
};

type WorkspaceViewState = {
  mode: WorkspaceMode;
  activeTool: string;
  selectedPartId: string | null;
  layers: UiLayer[];
  showSurfaceTexture: boolean;
  camera: { x: number; y: number; width: number; height: number };
};

type PointerPreview = {
  placementId: string;
  originMm: { x: number; y: number };
  currentMm: { x: number; y: number };
} | null;
```

A layer’s `sourceRef` should resolve to an existing document/source object. **Do not save photos as base64 into the current project JSON**, or give the impression that unimplemented photo/PDF import already works. Persist view settings later under a versioned, optional UI namespace, not inside geometry coordinates or `scaleStatus`. The canonical part outline and a Nest placement are different models.

## 4. Interaction rules

### Tracing opacity

- A slider adjusts just the tracing sheet/reference composite (`0–100%` in the UI), initialized to a sensible midrange rather than a magic hardcoded constant.
- Show an actual numeric percentage, visibility toggle and a separate "Lift sheet" / temporarily hide action.
- When lifted, underlying image becomes visible; drawing handles and contours remain fixed in the same physical coordinates.
- No double-opacity on labels, selection handles or hit targets.
- For accessibility, layers must also carry names and distinct line styles.

### Version and size comparison

- Only compare coordinate-aligned, correctly scaled patterns. If sources are uncalibrated, clearly label the comparison **unverified**.
- Preserve original and revised geometry as independent immutable sources; comparison is a derived view.
- A version overlay must never mutate the base part. Provide explicit 'Reference' and 'Current' legend.

### PDF alignment

- Display real page borders, trim marks and optional overlap guides.
- Semi-transparent page is a viewport transformation, not a destructively altered PDF.
- "Aligned" requires measurable registration tolerance, not just a visual overlap.
- Do not imply import/page merging exists until a PDF implementation lands.

### Nest pickup / ghost

- On pointer-down save `originMm`; render a thin dashed ghost at that original placement.
- During drag, show a slightly raised/translucent **paper fill** but a sharp cut contour.
- On pointer-up commit exactly one placement change and remove temporary ghost. On cancel / Escape restore origin.
- Invalid placement, future collisions and material bounds should be indicated separately from the pleasant paper effect.
- Keep `rotationDeg`, `mirrored`, original path vertices and mm-based positions unchanged except for the actual placement edit.

### Temporary measuring / annotations

- Render in viewport-relative physical units, with labels/measurements in a sharp overlaid group.
- Switchable visibility per tool / layer; annotations must be distinguishable from manufacturing cut paths.
- No chalk texture applied to actual geometry in the data layer.

## 5. Visual recipes and tokens

Use [tokens.css](tokens.css) as the source of color/material tokens. Suggested new primitives:

```css
:root {
  --cm-tracing-paper: #F5F1E9;
  --cm-tracing-border: rgba(110, 102, 92, .20);
  --cm-tracing-opacity: .62;
  --cm-ghost-stroke: #7D8E86;
  --cm-ghost-opacity: .48;
  --cm-float-shadow: 0 8px 22px rgba(77, 71, 60, .13);
}
```

Texture must be almost invisible, **truly seamless** and, if present, on its own `pointer-events: none` layer. A tiny organic texture scan may be used after checking tile edges; do not put a school-style grid on paper. The Nest mat grid is an SVG/canvas pattern in **millimeters** and follows zoom/pan. Suggested trials: fine 10 mm / major 50 mm, tuned for zoom level and visual readability.

Avoid `backdrop-filter: blur()`, large inner glows, saturated highlight strokes and heavy decorative corner tape in functional editor controls. Warm paper shadows are subtle.

### Semantic line vocabulary

- **Cut:** solid graphite, crisp.
- **Fold:** long dash with label.
- **Seam allowance:** short dash.
- **Guide:** thin powder-blue dash.
- **Current selection:** rose contour and soft dashed bbox.
- **Unverified/print warning:** peach boundary plus readable text/icon.
- **Temporary ghost:** thin low-contrast dashed outline.

These must remain recognizable in monochrome screenshots.

## 6. Existing code: exact integration points

At the time of writing, the real repository has `web/index.html`, `web/styles.css`, `web/app.js` and TypeScript `src/core/*`. The app is one lightweight vanilla-JS web preview; a larger framework is unnecessary solely for these visuals.

| File / existing function | Proposed change |
| --- | --- |
| `docs/design/tokens.css` | Add tracing sheet, ghost, raised-state, and line semantics. |
| `web/styles.css` | Migrate the entire dark palette and hardcoded hexes to light semantic variables. Add layer/paper/mat classes and focus states. |
| `web/index.html` | Use light `theme-color`, add layer control region, slider, visibility controls; separate SVG scene containers. |
| `web/app.js: makeScene()` | Render the correct work surface, sample translucent sheet and sharp geometry in explicit order. Show illustrative placeholders only for absent import/PDF tools. |
| `web/app.js: drawPart()` | Separate geometry stroke/fill styling from selection; keep cut path solid even when drag fill is translucent. |
| `web/app.js: renderInspector()` | Contextual tracing/overlay controls, clear labels and percentages, not a universal panel full of disabled settings. |
| `web/app.js: startPointer()/movePointer()/endPointer()` | Introduce `originMm` ghost, cancel handling and drag visuals without losing pan/zoom or selection. |
| `web/app.js: render()` | Layer visibility and mode changes are UI-only; switching tools must preserve project geometry and selection. |
| `src/core/model.ts` | **No visual texture fields in geometry.** Add sources/version metadata only after designing a real persistence need. |
| `tests/` | Add state, geometry immutability, drag-cancel and serialization regression tests. Add browser visual tests where feasible. |

Do not rewrite the architecture into a new framework or start storing images in JSON solely for design polish.

## 7. Recommended work order

These steps are **implementation order**, not a release postponement for Digitize/Prepare/Nest. Every mode stays visible in the initial product.

1. **P0 — Design primitives:** semantic tokens, base layout, typography, accessible controls, paper/mat surface renderer. Check both light-theme readability and unchanged geometry.
2. **P1 — Layer infrastructure:** layer registry, ordering, visibility, opacity, selected object and isolated SVG groups. Render a tracing mock with sharp reference contours.
3. **P2 — Nest proof:** implement true pickup/drag/ghost/cancel for the existing sample placements and preserve accurate mm transformations.
4. **P3 — Mode previews:** visually exercise Digitize tracing, Prepare page alignment, version/size compare as **explicit non-production mock states** until their engines exist.
5. **P4 — Functional connections:** real image/PDF source handling, calibration, page/layer transforms, geometric comparison and constraint-driven Nest behavior as separate engineering tasks; each has its own tests.
6. **P5 — Polish and accessibility:** textures, responsive desktop sizes, keyboard controls, 100%/200%/300% zoom, reduced-motion, contrast and lossless export regression tests.

Do not ship or label mock visual interactions as working industrial validation.

## 8. Acceptance tests

- [ ] Light warm UI, no dominant dark/purple surfaces.
- [ ] Distinct plain pattern paper, translucent tracing paper and green cutting mat.
- [ ] Paper is **unruled**; grid exists only where physical mat measurement or optional guide tool requires it.
- [ ] No visible seams or repeat artifacts in textures at standard and high-DPI zoom.
- [ ] Tracing sheet opacity changes **without** fading precise contours or changing saved geometry.
- [ ] Overlay visibility is independent per layer and preserved across mode navigation as intended.
- [ ] Version/size comparison uses independently labeled sources and never edits their originals.
- [ ] PDF alignment view remains a mock until the parser and registration model are connected.
- [ ] Nest move shows previous-position ghost, and cancel returns exact original mm coordinates.
- [ ] No mock demo is confused with real file import, print verification or automatic nesting.
- [ ] Basic pointer, keyboard, focus and labels are usable.

## 9. Visual mockup

The first visual draft is an **independent review artifact**, deliberately not wired into `web/` and not deployed over `cutmetry.pages.dev`. It illustrates the proposed editor shell, materials, overlays and mode-specific states. Iterate on its composition and materials before replacing production UI.
