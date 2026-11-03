export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
}

type RecordValue = Record<string, unknown>;

function record(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Structural and reference validation. Spatial collision checks are not implemented here. */
export function validateProject(input: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (code: string, path: string, message: string): void => {
    issues.push({ severity: "error", code, path, message });
  };
  const warning = (code: string, path: string, message: string): void => {
    issues.push({ severity: "warning", code, path, message });
  };
  const checkPoint = (point: unknown, path: string): void => {
    if (!record(point) || !finite(point.x) || !finite(point.y)) {
      error("INVALID_POINT", path, "Expected finite x and y coordinates in millimeters");
    }
  };
  const checkId = (obj: RecordValue, path: string, seen: Set<string>): void => {
    if (!nonempty(obj.id)) {
      error("INVALID_ID", path + ".id", "ID must be a nonempty string");
    } else if (seen.has(obj.id)) {
      error("DUPLICATE_ID", path + ".id", "Duplicate ID: " + obj.id);
    } else {
      seen.add(obj.id);
    }
  };
  const checkArray = (obj: RecordValue, key: string): unknown[] => {
    if (!Array.isArray(obj[key])) {
      error("INVALID_COLLECTION", key, key + " must be an array");
      return [];
    }
    return obj[key];
  };

  if (!record(input)) {
    error("INVALID_PROJECT", "$", "Project must be a JSON object");
    return issues;
  }
  if (input.schemaVersion !== 1) error("UNSUPPORTED_SCHEMA", "schemaVersion", "Only schemaVersion 1 is supported");
  if (input.unit !== "mm") error("INVALID_UNIT", "unit", "Canonical unit must be mm");
  if (!nonempty(input.id)) error("INVALID_ID", "id", "Project ID must be a nonempty string");
  if (!nonempty(input.name)) error("INVALID_NAME", "name", "Project name must be a nonempty string");

  const sources = checkArray(input, "sources");
  const parts = checkArray(input, "parts");
  const materials = checkArray(input, "materials");
  const layouts = checkArray(input, "layouts");
  const sourceIds = new Set<string>();
  const partIds = new Set<string>();
  const materialIds = new Set<string>();
  const layoutIds = new Set<string>();

  sources.forEach((source, index) => {
    const path = "sources[" + index + "]";
    if (!record(source)) { error("INVALID_SOURCE", path, "Source must be an object"); return; }
    checkId(source, path, sourceIds);
    for (const field of ["filename", "mimeType", "storageKey"]) {
      if (!nonempty(source[field])) error("INVALID_SOURCE_FIELD", path + "." + field, field + " must be a nonempty string");
    }
  });

  parts.forEach((part, index) => {
    const path = "parts[" + index + "]";
    if (!record(part)) { error("INVALID_PART", path, "Part must be an object"); return; }
    checkId(part, path, partIds);
    if (!nonempty(part.name)) error("INVALID_NAME", path + ".name", "Part name must be nonempty");
    if (!Number.isSafeInteger(part.quantity) || (part.quantity as number) < 1) {
      error("INVALID_QUANTITY", path + ".quantity", "Quantity must be a positive safe integer");
    }
    if (part.scaleStatus !== "verified" && part.scaleStatus !== "unverified") {
      error("INVALID_SCALE_STATUS", path + ".scaleStatus", "Scale status must be verified or unverified");
    }
    if (!Array.isArray(part.sourceIds) || !part.sourceIds.every(nonempty)) {
      error("INVALID_SOURCE_IDS", path + ".sourceIds", "sourceIds must be an array of IDs");
    } else {
      for (const id of part.sourceIds) {
        if (!sourceIds.has(id)) error("UNKNOWN_SOURCE", path + ".sourceIds", "Unknown source: " + id);
      }
    }
    if (!Array.isArray(part.paths)) {
      error("INVALID_COLLECTION", path + ".paths", "paths must be an array");
      return;
    }
    const pathIds = new Set<string>();
    part.paths.forEach((geometry, pathIndex) => {
      const pathRef = path + ".paths[" + pathIndex + "]";
      if (!record(geometry)) { error("INVALID_PATH", pathRef, "Path must be an object"); return; }
      checkId(geometry, pathRef, pathIds);
      if (!["outline", "hole", "construction"].includes(String(geometry.role))) {
        error("INVALID_PATH_ROLE", pathRef + ".role", "Unknown path role");
      }
      if (typeof geometry.closed !== "boolean") {
        error("INVALID_CLOSED_FLAG", pathRef + ".closed", "closed must be boolean");
      } else if ((geometry.role === "outline" || geometry.role === "hole") && !geometry.closed) {
        error("OPEN_CUT_CONTOUR", pathRef + ".closed", "Cut contours must be closed");
      }
      checkPoint(geometry.start, pathRef + ".start");
      if (!Array.isArray(geometry.segments) || geometry.segments.length === 0) {
        error("INVALID_SEGMENTS", pathRef + ".segments", "Path must have at least one segment");
        return;
      }
      geometry.segments.forEach((segment, segmentIndex) => {
        const segmentRef = pathRef + ".segments[" + segmentIndex + "]";
        if (!record(segment)) { error("INVALID_SEGMENT", segmentRef, "Segment must be an object"); return; }
        checkPoint(segment.to, segmentRef + ".to");
        switch (segment.kind) {
          case "line": break;
          case "quadratic": checkPoint(segment.control, segmentRef + ".control"); break;
          case "cubic":
            checkPoint(segment.control1, segmentRef + ".control1");
            checkPoint(segment.control2, segmentRef + ".control2");
            break;
          default: error("INVALID_SEGMENT_KIND", segmentRef + ".kind", "Unknown segment kind");
        }
      });
    });
  });

  materials.forEach((material, index) => {
    const path = "materials[" + index + "]";
    if (!record(material)) { error("INVALID_MATERIAL", path, "Material must be an object"); return; }
    checkId(material, path, materialIds);
    if (!nonempty(material.name)) error("INVALID_NAME", path + ".name", "Material name must be nonempty");
    for (const field of ["widthMm", "heightMm"]) {
      if (!finite(material[field]) || (material[field] as number) <= 0) {
        error("INVALID_DIMENSION", path + "." + field, "Material dimensions must be positive finite values");
      }
    }
  });

  layouts.forEach((layout, index) => {
    const path = "layouts[" + index + "]";
    if (!record(layout)) { error("INVALID_LAYOUT", path, "Layout must be an object"); return; }
    checkId(layout, path, layoutIds);
    if (!nonempty(layout.materialId) || !materialIds.has(layout.materialId)) {
      error("UNKNOWN_MATERIAL", path + ".materialId", "Layout references a missing material");
    }
    if (!Array.isArray(layout.placements)) {
      error("INVALID_COLLECTION", path + ".placements", "placements must be an array");
      return;
    }
    const placementIds = new Set<string>();
    layout.placements.forEach((placement, pIndex) => {
      const placementRef = path + ".placements[" + pIndex + "]";
      if (!record(placement)) { error("INVALID_PLACEMENT", placementRef, "Placement must be an object"); return; }
      checkId(placement, placementRef, placementIds);
      if (!nonempty(placement.partId) || !partIds.has(placement.partId)) {
        error("UNKNOWN_PART", placementRef + ".partId", "Placement references a missing part");
      } else {
        const p = parts.find((v) => record(v) && v.id === placement.partId);
        if (record(p) && p.scaleStatus === "unverified") {
          warning("UNVERIFIED_PART_SCALE", placementRef + ".partId", "Do not manufacture from unverified part scale");
        }
      }
      checkPoint(placement.position, placementRef + ".position");
      if (!finite(placement.rotationDeg)) error("INVALID_ROTATION", placementRef + ".rotationDeg", "Rotation must be finite");
      if (typeof placement.mirrored !== "boolean") error("INVALID_MIRROR", placementRef + ".mirrored", "mirrored must be boolean");
    });
  });

  return issues;
}
