import { useMemo } from "react";

import { loadRegistry } from "../runtime/loader";

import type { RegistryDocument } from "../types/registry";
import type { RegistryName } from "../runtime/registry";

export function useRegistry(
  name: RegistryName
): RegistryDocument {

  return useMemo(() => {

    return loadRegistry(name);

  }, [name]);

}
