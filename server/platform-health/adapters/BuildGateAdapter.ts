import { PlatformHealthAdapter } from "./PlatformHealthAdapter";

export interface BuildGateSnapshot {
}

export class BuildGateAdapter
  implements PlatformHealthAdapter<BuildGateSnapshot> {

  readonly name = "BuildGateAdapter";

  async collect(): Promise<BuildGateSnapshot> {
    return {};
  }

}
