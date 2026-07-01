export interface RegistryDocument<T = unknown> {
  version: string;
  items: T[];
}
