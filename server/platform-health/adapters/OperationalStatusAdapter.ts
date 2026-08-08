import { PlatformHealthAdapter } from "./PlatformHealthAdapter";

export interface OperationalStatusSnapshot {
}

export class OperationalStatusAdapter
  implements PlatformHealthAdapter<OperationalStatusSnapshot> {

  readonly name = "OperationalStatusAdapter";

  async collect(): Promise<OperationalStatusSnapshot> {
    return {};
  }

}
