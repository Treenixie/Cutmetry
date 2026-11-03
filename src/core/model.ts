/** All canonical physical coordinates are in millimeters. */
export type Point = Readonly<{ x: number; y: number }>;

export type PathSegment =
  | Readonly<{ kind: "line"; to: Point }>
  | Readonly<{ kind: "quadratic"; control: Point; to: Point }>
  | Readonly<{ kind: "cubic"; control1: Point; control2: Point; to: Point }>;

export type PathRole = "outline" | "hole" | "construction";

/** The closing edge is implicit when closed = true. Curve control points stay editable. */
export interface GeometryPath {
  id: string;
  role: PathRole;
  start: Point;
  segments: PathSegment[];
  closed: boolean;
}

export type ScaleStatus = "verified" | "unverified";

export interface Part {
  id: string;
  name: string;
  quantity: number;
  /** A part can originate from a photo, PDF, vector input, or manual drawing. */
  sourceIds: string[];
  /** Never silently treat image pixels as physical millimeters. */
  scaleStatus: ScaleStatus;
  paths: GeometryPath[];
}

export interface SourceDocument {
  id: string;
  filename: string;
  mimeType: string;
  /** Source contents can be stored externally; this is a metadata reference only. */
  storageKey: string;
}

export interface Material {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export interface Placement {
  id: string;
  partId: string;
  position: Point;
  rotationDeg: number;
  mirrored: boolean;
}

export interface Layout {
  id: string;
  materialId: string;
  placements: Placement[];
}

/** Versioned, intentionally small shared contract. Higher-level tools extend it later. */
export interface CutmetryProject {
  schemaVersion: 1;
  id: string;
  name: string;
  unit: "mm";
  sources: SourceDocument[];
  parts: Part[];
  materials: Material[];
  layouts: Layout[];
}

export function createProject(id: string, name: string): CutmetryProject {
  return {
    schemaVersion: 1,
    id,
    name,
    unit: "mm",
    sources: [],
    parts: [],
    materials: [],
    layouts: []
  };
}
