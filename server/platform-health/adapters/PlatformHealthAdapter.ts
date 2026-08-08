export interface PlatformHealthAdapter<T> {
  readonly name: string;
  collect(): Promise<T>;
}
