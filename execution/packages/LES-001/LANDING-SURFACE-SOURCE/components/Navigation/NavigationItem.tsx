export interface NavigationItemProps {

  id: string;

  label: string;

  onClick?(): void;

}

export function NavigationItem(
  props: NavigationItemProps
) {

  return (
    <button
      type="button"
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );

}
