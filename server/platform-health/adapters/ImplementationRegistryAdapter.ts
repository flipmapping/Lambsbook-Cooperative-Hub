import { PlatformHealthAdapter } from "./PlatformHealthAdapter";

export interface ImplementationRegistrySnapshot {
}

export class ImplementationRegistryAdapter
  implements PlatformHealthAdapter<ImplementationRegistrySnapshot> {

  readonly name = "ImplementationRegistryAdapter";

  async collect(): Promise<ImplementationRegistrySnapshot> {
    return {};
  }

}
