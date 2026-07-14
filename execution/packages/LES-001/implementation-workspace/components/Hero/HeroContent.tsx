export interface HeroContentProps {

  title: string;

  subtitle?: string;

  description?: string;

  primaryAction?: string;

  secondaryAction?: string;

}

export function HeroContent(
  props: HeroContentProps
) {

  return (
    <section>

      <h1>{props.title}</h1>

      {props.subtitle && (
        <h2>{props.subtitle}</h2>
      )}

      {props.description && (
        <p>{props.description}</p>
      )}

      <div>

        {props.primaryAction && (
          <button type="button">
            {props.primaryAction}
          </button>
        )}

        {props.secondaryAction && (
          <button type="button">
            {props.secondaryAction}
          </button>
        )}

      </div>

    </section>
  );

}
