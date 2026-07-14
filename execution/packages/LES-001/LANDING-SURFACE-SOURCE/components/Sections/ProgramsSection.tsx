import { useRegistry } from "../../hooks/useRegistry";

export function ProgramsSection() {

  const registry =
    useRegistry("programs");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Programs</h2>

      {items.length === 0 ? (

        <p>No programs available.</p>

      ) : (

        <ul>

          {items.map((item, index) => (

            <li key={index}>

              {typeof item === "object" &&
               item !== null &&
               "title" in item
                ? String(
                    (item as Record<string, unknown>).title
                  )
                : `Program ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
