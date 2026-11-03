import test from "node:test";
import assert from "node:assert/strict";
import {
  createProject, IDENTITY, inchesToMm, mmToInches, mmToPdfPoints,
  pdfPointsToMm, transformPath, pathBounds, serializeProject, parseProject,
  validateProject, ProjectValidationError
} from "../dist/core/index.js";

const rectangle = (id = "path-a") => ({
  id, role: "outline", closed: true, start: { x: 0, y: 0 },
  segments: [
    { kind: "line", to: { x: 100, y: 0 } },
    { kind: "line", to: { x: 100, y: 50 } },
    { kind: "line", to: { x: 0, y: 50 } }
  ]
});

function populatedProject() {
  const project = createProject("project-a", "Sample pattern");
  project.sources.push({ id: "source-a", filename: "sample.svg", mimeType: "image/svg+xml", storageKey: "assets/sample.svg" });
  project.parts.push({ id: "part-a", name: "Panel", quantity: 2, sourceIds: ["source-a"], scaleStatus: "verified", paths: [rectangle()] });
  project.materials.push({ id: "material-a", name: "Sheet", widthMm: 300, heightMm: 200 });
  project.layouts.push({ id: "layout-a", materialId: "material-a", placements: [
    { id: "placement-a", partId: "part-a", position: { x: 10, y: 20 }, rotationDeg: 0, mirrored: false }
  ] });
  return project;
}

test("creates one shared empty project for all three workflows", () => {
  assert.deepEqual(createProject("p", "Blank"), {
    schemaVersion: 1, id: "p", name: "Blank", unit: "mm",
    sources: [], parts: [], materials: [], layouts: []
  });
});

test("converts precise physical units and PDF points", () => {
  assert.equal(inchesToMm(1), 25.4);
  assert.equal(mmToInches(25.4), 1);
  assert.equal(pdfPointsToMm(72), 25.4);
  assert.ok(Math.abs(mmToPdfPoints(25.4) - 72) < 1e-10);
  assert.throws(() => inchesToMm(Number.NaN), RangeError);
});

test("preserves geometry identity and applies affine transforms", () => {
  const path = rectangle();
  assert.deepEqual(transformPath(path, IDENTITY), path);
  const moved = transformPath(path, { a: 0, b: 1, c: -1, d: 0, e: 20, f: 40 });
  assert.deepEqual(moved.start, { x: 20, y: 40 });
  assert.deepEqual(pathBounds(moved), { minX: -30, minY: 40, maxX: 20, maxY: 140 });
  assert.deepEqual(path.start, { x: 0, y: 0 }, "original must remain unchanged");
});

test("finds the interior maximum of a quadratic curve, not the control point", () => {
  const path = { id: "q", role: "construction", closed: false, start: { x: 0, y: 0 },
    segments: [{ kind: "quadratic", control: { x: 5, y: 10 }, to: { x: 10, y: 0 } }] };
  assert.deepEqual(pathBounds(path), { minX: 0, minY: 0, maxX: 10, maxY: 5 });
});

test("finds the interior maximum of a cubic curve", () => {
  const path = { id: "c", role: "construction", closed: false, start: { x: 0, y: 0 },
    segments: [{ kind: "cubic", control1: { x: 0, y: 10 }, control2: { x: 10, y: 10 }, to: { x: 10, y: 0 } }] };
  const bounds = pathBounds(path);
  assert.equal(bounds.minX, 0);
  assert.equal(bounds.maxX, 10);
  assert.equal(bounds.maxY, 7.5);
});

test("serializes validated project metadata with reusable part references", () => {
  const original = populatedProject();
  assert.deepEqual(validateProject(original), []);
  assert.deepEqual(parseProject(serializeProject(original)), original);
});

test("rejects missing source and part references", () => {
  const project = populatedProject();
  project.parts[0].sourceIds.push("missing-source");
  project.layouts[0].placements[0].partId = "missing-part";
  const codes = validateProject(project).map((issue) => issue.code);
  assert.ok(codes.includes("UNKNOWN_SOURCE"));
  assert.ok(codes.includes("UNKNOWN_PART"));
  assert.throws(() => serializeProject(project), ProjectValidationError);
});

test("rejects duplicate identifiers within collections and invalid coordinates", () => {
  const project = populatedProject();
  project.parts.push(structuredClone(project.parts[0]));
  project.parts[0].paths[0].segments[0].to.x = Infinity;
  const codes = validateProject(project).map((issue) => issue.code);
  assert.ok(codes.includes("DUPLICATE_ID"));
  assert.ok(codes.includes("INVALID_POINT"));
});

test("rejects open cutting contours and unsupported schema versions", () => {
  const project = populatedProject();
  project.parts[0].paths[0].closed = false;
  project.schemaVersion = 2;
  const codes = validateProject(project).map((issue) => issue.code);
  assert.ok(codes.includes("OPEN_CUT_CONTOUR"));
  assert.ok(codes.includes("UNSUPPORTED_SCHEMA"));
});

test("warns instead of silently treating uncalibrated photo geometry as precise", () => {
  const project = populatedProject();
  project.parts[0].scaleStatus = "unverified";
  const issues = validateProject(project);
  assert.ok(issues.some((issue) => issue.code === "UNVERIFIED_PART_SCALE" && issue.severity === "warning"));
  assert.doesNotThrow(() => serializeProject(project));
});

test("rejects unknown materials and invalid physical sheet dimensions", () => {
  const project = populatedProject();
  project.layouts[0].materialId = "missing";
  project.materials[0].heightMm = -10;
  const codes = validateProject(project).map((issue) => issue.code);
  assert.ok(codes.includes("UNKNOWN_MATERIAL"));
  assert.ok(codes.includes("INVALID_DIMENSION"));
});

test("rejects non-JSON project roots safely", () => {
  assert.deepEqual(validateProject(null).map((issue) => issue.code), ["INVALID_PROJECT"]);
  assert.throws(() => parseProject("null"), ProjectValidationError);
});
