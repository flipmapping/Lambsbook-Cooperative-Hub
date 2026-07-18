import type { PropsWithChildren } from "react";

import { GrowthProvider } from "../GrowthProvider";
import { Navigation } from "../Navigation";

export interface GrowthLayoutProps
  extends PropsWithChildren {

  onNavigate?(id: string): void;

}

export function GrowthLayout(
  props: GrowthLayoutProps
) {

  return (

    <GrowthProvider>

      <Navigation
        onSelect={props.onNavigate}
      />

      <main>

        {props.children}

      </main>

      <footer>

        Growth Platform

      </footer>

    </GrowthProvider>

  );

}
