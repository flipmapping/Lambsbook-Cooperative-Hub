import { useRegistry } from "../../hooks/useRegistry";
import { NavigationItem } from "./NavigationItem";

export interface NavigationProps {

  onSelect?(id: string): void;

}

interface NavigationEntry {

  id: string;

  label: string;

}

export function Navigation(
  props: NavigationProps
) {

  const registry =
    useRegistry("navigation");

  const items =
    registry.items as NavigationEntry[];

  return (

    <nav>

      {items.map((item) => (

        <NavigationItem
          key={item.id}
          id={item.id}
          label={item.label}
          onClick={() => props.onSelect?.(item.id)}
        />

      ))}

    </nav>

  );

}
