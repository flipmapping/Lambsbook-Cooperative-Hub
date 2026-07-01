import { useRegistry } from "../../hooks/useRegistry";

export function ScholarshipsSection() {

  const registry =
    useRegistry("scholarships");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Scholarships</h2>

      {items.length === 0 ? (

        <p>No scholarships available.</p>

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
                : `Scholarship ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
