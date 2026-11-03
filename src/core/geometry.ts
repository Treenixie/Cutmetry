import type { GeometryPath, PathSegment, Point } from "./model.js";

/** Affine transform matrix [a c e; b d f; 0 0 1]. */
export interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const MM_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;
const EPSILON = 1e-12;

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new RangeError(label + " must be finite");
  return value;
}

export function inchesToMm(inches: number): number {
  return finite(inches, "inches") * MM_PER_INCH;
}

export function mmToInches(mm: number): number {
  return finite(mm, "mm") / MM_PER_INCH;
}

/** PDF points are 1/72 inch; PDF UserUnit and page transforms belong to the importer. */
export function pdfPointsToMm(points: number): number {
  return inchesToMm(finite(points, "points") / POINTS_PER_INCH);
}

export function mmToPdfPoints(mm: number): number {
  return mmToInches(mm) * POINTS_PER_INCH;
}

export const IDENTITY: Readonly<AffineTransform> = Object.freeze({
  a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
});

export function transformPoint(point: Point, matrix: AffineTransform): Point {
  finite(point.x, "point.x");
  finite(point.y, "point.y");
  for (const [name, value] of Object.entries(matrix)) finite(value, "matrix." + name);
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

export function transformPath(path: GeometryPath, matrix: AffineTransform): GeometryPath {
  const segments: PathSegment[] = path.segments.map((segment) => {
    switch (segment.kind) {
      case "line": return { kind: "line", to: transformPoint(segment.to, matrix) };
      case "quadratic": return {
        kind: "quadratic",
        control: transformPoint(segment.control, matrix),
        to: transformPoint(segment.to, matrix)
      };
      case "cubic": return {
        kind: "cubic",
        control1: transformPoint(segment.control1, matrix),
        control2: transformPoint(segment.control2, matrix),
        to: transformPoint(segment.to, matrix)
      };
    }
  });
  return { ...path, start: transformPoint(path.start, matrix), segments };
}

function quadraticAt(p0: number, p1: number, p2: number, t: number): number {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function quadraticRoots(p0: number, p1: number, p2: number): number[] {
  const denominator = p0 - 2 * p1 + p2;
  if (Math.abs(denominator) < EPSILON) return [];
  return [(p0 - p1) / denominator];
}

function cubicRoots(p0: number, p1: number, p2: number, p3: number): number[] {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  if (Math.abs(a) < EPSILON) {
    return Math.abs(b) < EPSILON ? [] : [-c / b];
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const d = Math.sqrt(discriminant);
  return [(-b - d) / (2 * a), (-b + d) / (2 * a)];
}

/** Exact Bezier extrema (up to floating-point error), not a sampled/polyline bound. */
export function pathBounds(path: GeometryPath): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const include = (point: Point): void => {
    finite(point.x, "point.x");
    finite(point.y, "point.y");
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  };
  let from = path.start;
  include(from);
  for (const segment of path.segments) {
    const to = segment.to;
    include(to);
    if (segment.kind === "quadratic") {
      for (const axis of ["x", "y"] as const) {
        const v0 = from[axis], v1 = segment.control[axis], v2 = to[axis];
        finite(v1, "quadratic control");
        for (const t of quadraticRoots(v0, v1, v2)) {
          if (t > 0 && t < 1) {
            const value = quadraticAt(v0, v1, v2, t);
            include(axis === "x" ? { x: value, y: from.y } : { x: from.x, y: value });
          }
        }
      }
    }
    if (segment.kind === "cubic") {
      for (const axis of ["x", "y"] as const) {
        const v0 = from[axis], v1 = segment.control1[axis];
        const v2 = segment.control2[axis], v3 = to[axis];
        finite(v1, "cubic control1");
        finite(v2, "cubic control2");
        for (const t of cubicRoots(v0, v1, v2, v3)) {
          if (t > 0 && t < 1) {
            const value = cubicAt(v0, v1, v2, v3, t);
            include(axis === "x" ? { x: value, y: from.y } : { x: from.x, y: value });
          }
        }
      }
    }
    from = to;
  }
  return { minX, minY, maxX, maxY };
}
