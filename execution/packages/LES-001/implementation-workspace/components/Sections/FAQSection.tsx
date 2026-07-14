import { useRegistry } from "../../hooks/useRegistry";

export function FAQSection() {

  const registry =
    useRegistry("faq");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Frequently Asked Questions</h2>

      {items.length === 0 ? (

        <p>No FAQs available.</p>

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
                : `FAQ ${index + 1}`}

            </li>

          ))}

        </ul>

      )}

    </section>

  );

}
