import { PlatformHealthAdapter } from "./PlatformHealthAdapter";

export interface AuthorityRegistrySnapshot {
}

export class AuthorityRegistryAdapter
  implements PlatformHealthAdapter<AuthorityRegistrySnapshot> {

  readonly name = "AuthorityRegistryAdapter";

  async collect(): Promise<AuthorityRegistrySnapshot> {
    return {};
  }

}
