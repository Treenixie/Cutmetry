import {
  createProject,
  parseProject,
  serializeProject,
  pathBounds,
} from "../dist/core/index.js";

const $ = (id) => document.getElementById(id);
const modeInfo = {
  digitize: {
    hint: "Physical template → editable geometry",
    title: "Geometry canvas",
    subtitle: "Source tracing will use this shared physical space",
    chip: "GEOMETRY PREVIEW",
    info: "Digitize",
    message: "Photo calibration and vector tracing are planned. The visible geometry is project data, not a traced image.",
    status: "Photo import not yet implemented",
  },
  prepare: {
    hint: "Inspect dimensions and print readiness",
    title: "Print preparation",
    subtitle: "A4 reference page · PDF reader not yet connected",
    chip: "A4 REFERENCE PREVIEW",
    info: "Prepare",
    message: "The A4 sheet is a physical-size reference. PDF loading, layers, registration and print checks are not implemented.",
    status: "PDF import not yet implemented",
  },
  nest: {
    hint: "Arrange pieces on a physical material",
    title: "Material layout",
    subtitle: "Manual sample placements · optimization not yet connected",
    chip: "MANUAL LAYOUT PREVIEW",
    info: "Nest",
    message: "Drag the sample pieces to move their saved placements. Collision detection, constraints and optimization are not implemented.",
    status: "Sample arrangement only · No solver",
  },
};

let project = makeDemoProject();
let mode = "digitize";
let selection = "front";
let toastTimer;
let camera = { x: -60, y: -80, width: 480, height: 385 };
let pointer = null;
let dirty = false;
let overlayOpacity = 62;
let overlayVisible = true;

function esc(text) {
  return String(text).replace(/[&<>"']/g, (symbol) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[symbol]);
}
function num(value) { return Number(value).toFixed(1).replace(/\.0$/, ""); }
function svgNum(value) { return String(Number(value)); }
function makeRectangle(id, width, height) {
  return {
    id: `${id}-outline`, role: "outline", closed: true,
    start: { x: 0, y: 0 },
    segments: [
      { kind: "line", to: { x: width, y: 0 } },
      { kind: "line", to: { x: width, y: height } },
      { kind: "line", to: { x: 0, y: height } },
    ],
  };
}
function makeDemoProject() {
  const p = createProject("cutmetry-demo", "Pattern study 01");
  p.parts.push({
    id: "front", name: "Front panel", quantity: 1, sourceIds: [], scaleStatus: "verified",
    paths: [
      { id: "front-outer", role: "outline", closed: true, start: { x: 0, y: 15 }, segments: [
        { kind: "quadratic", control: { x: 12, y: -1 }, to: { x: 42, y: 0 } },
        { kind: "line", to: { x: 130, y: 0 } },
        { kind: "cubic", control1: { x: 160, y: 0 }, control2: { x: 177, y: 18 }, to: { x: 180, y: 45 } },
        { kind: "line", to: { x: 180, y: 137 } },
        { kind: "quadratic", control: { x: 180, y: 155 }, to: { x: 162, y: 155 } },
        { kind: "line", to: { x: 18, y: 155 } },
        { kind: "quadratic", control: { x: 0, y: 155 }, to: { x: 0, y: 137 } },
      ] },
      { id: "front-hole", role: "hole", closed: true, start: { x: 76, y: 50 }, segments: [
        { kind: "cubic", control1: { x: 76, y: 38 }, control2: { x: 104, y: 38 }, to: { x: 104, y: 50 } },
        { kind: "cubic", control1: { x: 104, y: 63 }, control2: { x: 76, y: 63 }, to: { x: 76, y: 50 } },
      ] },
    ],
  });
  p.parts.push({ id: "back", name: "Back panel", quantity: 1, sourceIds: [], scaleStatus: "verified", paths: [makeRectangle("back", 160, 125)] });
  p.parts.push({ id: "strap", name: "Strap", quantity: 2, sourceIds: [], scaleStatus: "verified", paths: [makeRectangle("strap", 34, 175)] });
  p.materials.push({ id: "sheet", name: "Material sheet", widthMm: 490, heightMm: 330 });
  p.layouts.push({ id: "layout", materialId: "sheet", placements: [
    { id: "front-placement", partId: "front", position: { x: 22, y: 30 }, rotationDeg: 0, mirrored: false },
    { id: "back-placement", partId: "back", position: { x: 229, y: 40 }, rotationDeg: 0, mirrored: false },
    { id: "strap-placement", partId: "strap", position: { x: 410, y: 50 }, rotationDeg: 0, mirrored: false },
  ] });
  return p;
}
function partBounds(part) {
  const paths = part.paths.filter((path) => path.role === "outline");
  if (!paths.length) return null;
  const bounds = paths.map(pathBounds);
  return {
    minX: Math.min(...bounds.map((b) => b.minX)),
    minY: Math.min(...bounds.map((b) => b.minY)),
    maxX: Math.max(...bounds.map((b) => b.maxX)),
    maxY: Math.max(...bounds.map((b) => b.maxY)),
  };
}
function pathData(path) {
  let data = `M ${svgNum(path.start.x)} ${svgNum(path.start.y)}`;
  for (const step of path.segments) {
    if (step.kind === "line") data += ` L ${svgNum(step.to.x)} ${svgNum(step.to.y)}`;
    else if (step.kind === "quadratic") data += ` Q ${svgNum(step.control.x)} ${svgNum(step.control.y)} ${svgNum(step.to.x)} ${svgNum(step.to.y)}`;
    else data += ` C ${svgNum(step.control1.x)} ${svgNum(step.control1.y)} ${svgNum(step.control2.x)} ${svgNum(step.control2.y)} ${svgNum(step.to.x)} ${svgNum(step.to.y)}`;
  }
  return data + (path.closed ? " Z" : "");
}
function drawPart(part, x, y, selected, placementId = "", rotationDeg = 0, mirrored = false) {
  const bounds = partBounds(part) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const outlines = part.paths.filter((path) => path.role === "outline");
  const holes = part.paths.filter((path) => path.role === "hole");
  const constructions = part.paths.filter((path) => path.role === "construction");
  const dragging = Boolean(placementId && pointer?.type === "placement" && pointer?.placementId === placementId && pointer.changed);
  const paths = outlines.map((path) => `<path class="part-contour" d="${pathData(path)}" fill="url(#paperTexture)" stroke="${selected ? '#b47e81' : '#66574c'}" stroke-width="${selected ? 2 : 1.5}" />`).join("")
    + holes.map((path) => `<path class="part-hole" d="${pathData(path)}" fill="#ede5d9" stroke="#8f7867" stroke-width="1.2" stroke-dasharray="3 2"/>`).join("")
    + constructions.map((path) => `<path class="part-construction" d="${pathData(path)}" fill="none" stroke="#829b9b" stroke-width=".9" stroke-dasharray="6 4"/>`).join("");
  const labelY = bounds.minY - 12;
  const bbox = selected ? `<rect x="${num(bounds.minX - 4)}" y="${num(bounds.minY - 4)}" width="${num(bounds.maxX - bounds.minX + 8)}" height="${num(bounds.maxY - bounds.minY + 8)}" rx="1" fill="none" stroke="#ba8785" stroke-width=".7" stroke-dasharray="5 3"/>` : "";
  const grain = ["front", "back", "strap"].includes(part.id) && bounds.maxY - bounds.minY > 45
    ? `<g class="grain-line"><path d="M ${num((bounds.maxX + bounds.minX)/2)} ${num(bounds.minY + 23)} V ${num(bounds.maxY - 20)}" fill="none" stroke="#9a8271" stroke-width=".9"/><path d="M ${num((bounds.maxX + bounds.minX)/2 - 4)} ${num(bounds.minY + 29)} l4 -6 4 6 M ${num((bounds.maxX + bounds.minX)/2 - 4)} ${num(bounds.maxY - 26)} l4 6 4 -6" fill="none" stroke="#9a8271" stroke-width=".9"/></g>` : "";
  return `<g class="vector-part${selected ? " selected" : ""}${dragging ? " dragging" : ""}" data-part="${esc(part.id)}" data-placement="${esc(placementId)}" transform="translate(${svgNum(x)} ${svgNum(y)}) rotate(${svgNum(rotationDeg)}) scale(${mirrored ? -1 : 1} 1)">
    ${bbox}
    ${paths}
    ${grain}
    <text class="part-label" x="${num(bounds.minX + 4)}" y="${num(labelY)}" font-size="15">${esc(part.name)}</text>
  </g>`;
}
function dimensions(part) {
  const b = partBounds(part);
  return b ? `${num(b.maxX - b.minX)} × ${num(b.maxY - b.minY)} mm` : "No outline";
}
function showToast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 3400);
}
function renderSidebar() {
  $("projectTitle").textContent = project.name;
  $("sidebarProjectName").textContent = project.name;
  $("projectMeta").textContent = `${project.parts.length} ${project.parts.length === 1 ? "part" : "parts"} · mm`;
  $("partCount").textContent = project.parts.length;
  $("partsList").innerHTML = project.parts.length ? project.parts.map((part) => `<button type="button" class="part-row${selection === part.id ? " selected" : ""}" data-select="${esc(part.id)}" aria-pressed="${selection === part.id}">
    <span class="part-icon">⌗</span><span class="part-details"><span class="part-name">${esc(part.name)}</span><span class="part-dimensions">${esc(dimensions(part))}</span></span>
  </button>`).join("") : `<p class="inspector-empty">No parts yet.</p>`;
  for (const button of $("partsList").querySelectorAll("[data-select]")) {
    button.addEventListener("click", () => { selection = button.dataset.select; render(); });
  }
}
function renderInspector() {
  const part = project.parts.find((entry) => entry.id === selection);
  const info = modeInfo[mode];
  $("modeInfoTitle").textContent = info.info;
  $("modeInfoText").textContent = info.message;
  if (!part) {
    $("inspectorTitle").textContent = "Part properties";
    $("inspectorCaption").textContent = "Select a part to inspect its dimensions.";
    $("inspectorContent").innerHTML = `<p class="inspector-empty">No part selected. Choose a part on the canvas or add a new rectangle.</p>`;
    return;
  }
  const b = partBounds(part);
  $("inspectorTitle").textContent = part.name;
  $("inspectorCaption").textContent = "Shared source geometry · mm";
  $("inspectorContent").innerHTML = `
    <div class="property-group"><div class="property-heading">IDENTITY</div><label class="property-label" for="partName">Part name</label><input class="property-input" id="partName" type="text" maxlength="120" value="${esc(part.name)}" /></div>
    <div class="property-group"><div class="property-heading">DIMENSIONS</div><div class="property-grid"><div class="property-value"><div class="property-small">WIDTH</div><div class="property-number">${b ? num(b.maxX - b.minX) : "—"}<span class="property-unit">mm</span></div></div><div class="property-value"><div class="property-small">HEIGHT</div><div class="property-number">${b ? num(b.maxY - b.minY) : "—"}<span class="property-unit">mm</span></div></div></div></div>
    <div class="property-group"><div class="property-heading">GEOMETRY</div><div class="property-line"><span>Contours</span><strong>${part.paths.length}</strong></div><div class="property-line"><span>Quantity</span><strong>${part.quantity}</strong></div><div class="property-line"><span>Scale</span><strong class="${part.scaleStatus === 'verified' ? 'verified' : 'unverified'}">${part.scaleStatus === 'verified' ? 'Verified in sample' : 'Unverified'}</strong></div></div>
  `;
  $("partName").addEventListener("change", (event) => {
    const next = event.target.value.trim();
    if (!next) { event.target.value = part.name; return; }
    part.name = next;
    dirty = true;
    render();
  });
}
function makeScene() {
  if (mode === "nest") {
    const layout = project.layouts[0];
    const material = project.materials.find((entry) => entry.id === layout?.materialId) ?? project.materials[0];
    if (!material) return "";
    let output = `<rect class="cutting-mat" x="0" y="0" width="${num(material.widthMm)}" height="${num(material.heightMm)}" rx="2" filter="url(#sheetShadow)"/><rect class="cutting-mat-grain" x="0" y="0" width="${num(material.widthMm)}" height="${num(material.heightMm)}" /><rect x="0" y="0" width="${num(material.widthMm)}" height="${num(material.heightMm)}" fill="url(#bigGrid)" />`;
    if (layout) {
      for (const placement of layout.placements) {
        const part = project.parts.find((entry) => entry.id === placement.partId);
        if (!part) continue;
        if (pointer?.type === "placement" && pointer.placementId === placement.id && pointer.changed) {
          const ghostPaths = part.paths.filter(p => p.role === "outline").map(p => `<path class="ghost-contour" d="${pathData(p)}" />`).join("");
          output += `<g transform="translate(${svgNum(pointer.initial.x)} ${svgNum(pointer.initial.y)}) rotate(${svgNum(placement.rotationDeg)}) scale(${placement.mirrored ? -1 : 1} 1)">${ghostPaths}</g>`;
        }
        output += drawPart(part, placement.position.x, placement.position.y, selection === part.id, placement.id, placement.rotationDeg, placement.mirrored);
      }
    }
    output += `<text x="12" y="17" class="sheet-caption" font-size="15">${esc(material.name)}</text><text x="${num(material.widthMm - 12)}" y="17" text-anchor="end" class="sheet-caption" font-size="13">${num(material.widthMm)} × ${num(material.heightMm)} mm</text>`;
    return output;
  }
  if (mode === "prepare") {
    const selected = project.parts.find((entry) => entry.id === selection) ?? project.parts[0];
    const bounds = selected ? partBounds(selected) : null;
    const offsetX = bounds ? (210 - (bounds.maxX - bounds.minX)) / 2 - bounds.minX : 0;
    const offsetY = bounds ? 70 - bounds.minY : 0;
    const tracing = overlayVisible ? `<g style="opacity:${overlayOpacity / 100}"><rect class="tracing-sheet" x="16" y="-11" width="210" height="297" rx="1" fill="#f0ebe1" stroke="#ccb9a3"/><path d="M 26 15 H 206 M26 240 H206" stroke="#83969b" stroke-dasharray="6 4" stroke-width=".8" fill="none" /></g>` : "";
    return `<rect class="paper-page" x="0" y="0" width="210" height="297" filter="url(#sheetShadow)" /><rect x="10" y="10" width="190" height="277" fill="none" stroke="#c5af9e" stroke-width=".6" stroke-dasharray="5 4"/><text class="sheet-caption" x="14" y="23" font-size="15">A4 · 210 × 297 mm</text>${tracing}${selected ? drawPart(selected, offsetX, offsetY, true) : ""}<text x="105" y="282" text-anchor="middle" class="pattern-note" font-size="12">example · not printable</text>`;
  }
  const part = project.parts.find((entry) => entry.id === selection) ?? project.parts[0];
  if (!part) return "";
  const bounds = partBounds(part);
  const offsetX = bounds ? 90 - bounds.minX : 0;
  const offsetY = bounds ? 80 - bounds.minY : 0;
  const source = part.paths.filter(p => p.role === "outline").map(p => `<path class="source-contour" d="${pathData(p)}" transform="translate(${num(offsetX - 6)} ${num(offsetY + 5)})" />`).join("");
  const tracing = overlayVisible ? `<g style="opacity:${overlayOpacity / 100}"><rect class="tracing-sheet" x="51" y="44" width="288" height="235" rx="1"/><path d="M 80 63 h 20 M 90 53 v20" stroke="#a8a1a0" stroke-width=".6"/></g>` : "";
  return `<rect class="paper-page" x="40" y="30" width="320" height="265" rx="2" filter="url(#sheetShadow)"/><text x="55" y="50" class="sheet-caption" font-size="15">pattern draft · mm</text><g>${source}</g>${tracing}${drawPart(part, offsetX, offsetY, true)}`;
}
function renderCamera() {
  const wrap = $("canvasWrap");
  const ratio = wrap.clientWidth / Math.max(wrap.clientHeight, 1);
  camera.height = camera.width / Math.max(ratio, 0.1);
  $("canvas").setAttribute("viewBox", `${camera.x} ${camera.y} ${camera.width} ${camera.height}`);
  const nominal = Math.round((wrap.clientWidth / camera.width) * 100 / 3.2);
  $("zoomValue").textContent = `${nominal}%`;
}
function fitView() {
  const wrap = $("canvasWrap");
  const aspect = wrap.clientWidth / Math.max(wrap.clientHeight, 1);
  let bounds = { x: 30, y: 0, width: 340, height: 335 };
  if (mode === "prepare") bounds = { x: -30, y: -30, width: 270, height: 355 };
  if (mode === "nest") {
    const material = project.materials[0];
    if (material) bounds = { x: -50, y: -47, width: material.widthMm + 100, height: material.heightMm + 110 };
  }
  const width = Math.max(bounds.width, bounds.height * aspect);
  const height = width / aspect;
  camera = { x: bounds.x + (bounds.width - width) / 2, y: bounds.y + (bounds.height - height) / 2, width, height };
  renderCamera();
}
function render() {
  const info = modeInfo[mode];
  $("workflowHint").textContent = info.hint;
  $("editorTitle").textContent = info.title;
  $("editorSubtitle").textContent = info.subtitle;
  $("canvasKind").textContent = info.chip;
  $("statusLeft").textContent = `${dirty ? "Unsaved changes · " : "Ready · "}${info.status}`;
  $("canvasHint").textContent = mode === "nest" ? "Drag a placed part to move · Scroll to zoom · Drag background to pan" : "Scroll to zoom · Drag background to pan";
  for (const button of document.querySelectorAll("[data-mode]")) {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  }
  renderSidebar();
  renderInspector();
  $("canvasWrap").dataset.mode = mode;
  $("canvasNote").textContent = mode === "digitize" ? "trace · paper" : mode === "prepare" ? "align · A4" : "grain ↕ · cut × 1";
  $("materialControls").hidden = mode === "nest";
  $("overlayOpacityValue").textContent = `${overlayOpacity}%`;
  $("toggleOverlay").textContent = overlayVisible ? "Visible" : "Hidden";
  $("toggleOverlay").setAttribute("aria-pressed", String(overlayVisible));
  $("canvasScene").innerHTML = makeScene();
  $("emptyState").hidden = project.parts.length !== 0 || (mode === "nest" && project.materials.length > 0);
  renderCamera();
}
function svgPosition(event) {
  const rect = $("canvas").getBoundingClientRect();
  return { x: camera.x + (event.clientX - rect.left) * camera.width / rect.width,
    y: camera.y + (event.clientY - rect.top) * camera.height / rect.height };
}
function startPointer(event) {
  if (event.button !== 0 && event.button !== 1) return;
  const element = event.target.closest?.("[data-part]");
  const hitPart = element?.dataset.part;
  const hitPlacement = element?.dataset.placement;
  if (hitPart && event.button === 0) {
    selection = hitPart;
    render();
  }
  const layout = project.layouts[0];
  const placement = mode === "nest" && hitPlacement ? layout?.placements.find((p) => p.id === hitPlacement) : null;
  pointer = {
    type: placement ? "placement" : "pan",
    placementId: placement?.id,
    at: svgPosition(event),
    initial: placement ? { ...placement.position } : { x: camera.x, y: camera.y },
    changed: false,
  };
  $("canvas").setPointerCapture(event.pointerId);
  if (pointer.type === "pan") $("canvas").classList.add("panning");
}
function movePointer(event) {
  if (!pointer) return;
  const now = svgPosition(event);
  const dx = now.x - pointer.at.x, dy = now.y - pointer.at.y;
  if (pointer.type === "pan") {
    camera.x -= dx;
    camera.y -= dy;
    renderCamera();
  } else if (pointer.placementId) {
    const placement = project.layouts[0]?.placements.find((p) => p.id === pointer.placementId);
    if (!placement) return;
    placement.position = { x: Math.round((pointer.initial.x + dx) * 10) / 10, y: Math.round((pointer.initial.y + dy) * 10) / 10 };
    pointer.changed = true;
    $("canvasScene").innerHTML = makeScene();
  }
}
function endPointer() {
  if (!pointer) return;
  if (pointer.changed) {
    dirty = true;
    $("statusLeft").textContent = "Unsaved changes · Manual placement";
  }
  pointer = null;
  $("canvas").classList.remove("panning");
  render();
}
function zoomBy(factor, x = camera.x + camera.width / 2, y = camera.y + camera.height / 2) {
  const newWidth = Math.min(4000, Math.max(38, camera.width * factor));
  const scale = newWidth / camera.width;
  camera.x = x - (x - camera.x) * scale;
  camera.y = y - (y - camera.y) * scale;
  camera.width = newWidth;
  renderCamera();
}
function addRectangle() {
  let i = project.parts.length + 1;
  while (project.parts.some((part) => part.id === `rectangle-${i}`)) i++;
  const id = `rectangle-${i}`;
  project.parts.push({ id, name: `Rectangle ${i}`, quantity: 1, sourceIds: [], scaleStatus: "verified", paths: [makeRectangle(id, 120, 80)] });
  if (mode === "nest" && project.layouts[0]) {
    project.layouts[0].placements.push({ id: `${id}-placement`, partId: id, position: { x: 20, y: 20 }, rotationDeg: 0, mirrored: false });
  }
  selection = id;
  dirty = true;
  render();
  showToast("Rectangle added to the shared project");
}
async function openProject(file) {
  if (!file) return;
  try {
    const candidate = parseProject(await file.text());
    project = candidate;
    selection = project.parts[0]?.id ?? null;
    dirty = false;
    fitView();
    render();
    showToast(`Opened ${project.name}`);
  } catch (error) {
    showToast(`Cannot open project: ${error.message.slice(0, 140)}`);
  }
}
function saveProject() {
  try {
    const data = serializeProject(project);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cutmetry"}.cutmetry.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    dirty = false;
    render();
    showToast("Project JSON saved locally");
  } catch (error) {
    showToast(`Could not save: ${error.message.slice(0, 140)}`);
  }
}
function newProject() {
  if (dirty && !window.confirm("Discard unsaved changes and start a new project?")) return;
  project = createProject(`cutmetry-${Date.now()}`, "Untitled project");
  selection = null;
  dirty = false;
  mode = "digitize";
  fitView();
  render();
}
function loadDemo() {
  if (dirty && !window.confirm("Discard unsaved changes and load the example?")) return;
  project = makeDemoProject();
  selection = "front";
  dirty = false;
  fitView();
  render();
  showToast("Example project loaded");
}

for (const button of document.querySelectorAll("[data-mode]")) {
  button.addEventListener("click", () => { mode = button.dataset.mode; fitView(); render(); });
}
$("overlayOpacity").addEventListener("input", (event) => { overlayOpacity = Number(event.target.value); $("overlayOpacityValue").textContent = `${overlayOpacity}%`; $("canvasScene").innerHTML = makeScene(); });
$("toggleOverlay").addEventListener("click", () => { overlayVisible = !overlayVisible; $("toggleOverlay").textContent = overlayVisible ? "Visible" : "Hidden"; $("toggleOverlay").setAttribute("aria-pressed", String(overlayVisible)); $("canvasScene").innerHTML = makeScene(); });
$("newProject").addEventListener("click", newProject);
$("loadDemo").addEventListener("click", loadDemo);
$("saveProject").addEventListener("click", saveProject);
$("openProject").addEventListener("click", () => $("projectFile").click());
$("projectFile").addEventListener("change", async (event) => { await openProject(event.target.files?.[0]); event.target.value = ""; });
$("addPart").addEventListener("click", addRectangle);
$("emptyAddPart").addEventListener("click", addRectangle);
$("renameProject").addEventListener("click", () => {
  const candidate = window.prompt("Project name", project.name)?.trim();
  if (candidate) { project.name = candidate.slice(0, 120); dirty = true; render(); }
});
$("fitView").addEventListener("click", fitView);
$("zoomIn").addEventListener("click", () => zoomBy(0.8));
$("zoomOut").addEventListener("click", () => zoomBy(1.25));
$("canvas").addEventListener("pointerdown", startPointer);
$("canvas").addEventListener("pointermove", movePointer);
$("canvas").addEventListener("pointerup", endPointer);
$("canvas").addEventListener("pointercancel", endPointer);
$("canvas").addEventListener("lostpointercapture", endPointer);
$("canvas").addEventListener("wheel", (event) => { event.preventDefault(); const p = svgPosition(event); zoomBy(event.deltaY > 0 ? 1.12 : 1 / 1.12, p.x, p.y); }, { passive: false });
window.addEventListener("resize", renderCamera);
window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
fitView();
render();
