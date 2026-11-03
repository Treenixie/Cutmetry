import type { CutmetryProject } from "./model.js";
import { validateProject } from "./validation.js";

export class ProjectValidationError extends Error {
  constructor(public readonly issues: ReturnType<typeof validateProject>) {
    super(issues.filter((issue) => issue.severity === "error").map((issue) => issue.path + ": " + issue.message).join("; "));
    this.name = "ProjectValidationError";
  }
}

function ensureValid(value: unknown): asserts value is CutmetryProject {
  const issues = validateProject(value);
  if (issues.some((issue) => issue.severity === "error")) throw new ProjectValidationError(issues);
}

/** JSON project metadata only; binary source documents need a separate storage layer. */
export function serializeProject(project: CutmetryProject): string {
  ensureValid(project);
  return JSON.stringify(project, null, 2);
}

export function parseProject(json: string): CutmetryProject {
  const parsed: unknown = JSON.parse(json);
  ensureValid(parsed);
  return parsed;
}
