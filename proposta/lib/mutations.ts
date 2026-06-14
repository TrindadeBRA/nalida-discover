import type { MvpData, Project } from "./types";

export function updateProject(data: MvpData, patch: Partial<Project>): MvpData {
  return { ...data, project: { ...data.project, ...patch } };
}
