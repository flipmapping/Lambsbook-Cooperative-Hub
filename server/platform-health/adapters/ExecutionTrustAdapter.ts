import { PlatformHealthAdapter } from "./PlatformHealthAdapter";

export interface ExecutionTrustSnapshot {
}

export class ExecutionTrustAdapter
  implements PlatformHealthAdapter<ExecutionTrustSnapshot> {

  readonly name = "ExecutionTrustAdapter";

  async collect(): Promise<ExecutionTrustSnapshot> {
    return {};
  }

}
