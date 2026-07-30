export interface ExecutionStep {
  capability: string;
  authority: string;
  runtimeSurface: string;
  workspace: string;
}

export type ExecutionPlan = ExecutionStep[];
