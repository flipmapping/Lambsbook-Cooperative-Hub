import { Link } from "wouter";
import { useRegistry } from "../../hooks/useRegistry";

export function AdmissionsSection() {

  const registry =
    useRegistry("admissions");

  const items =
    Array.isArray(registry.items)
      ? registry.items
      : [];

  return (

    <section>

      <h2>Admissions</h2>

      {items.length === 0 ? (

        <p>No admissions available.</p>

      ) : (

        <ul>

          {items.map((item, index) => {

            const isObject =
              typeof item === "object" &&
              item !== null;

            const title =
              isObject && "title" in item
                ? String(
                    (item as Record<string, unknown>).title
                  )
                : `Admission ${index + 1}`;

            const path =
              isObject && "path" in item
                ? String(
                    (item as Record<string, unknown>).path
                  )
                : null;

            return (

              <li key={index}>

                {path !== null ? (

                  <Link href={path}>{title}</Link>

                ) : (

                  title

                )}

              </li>

            );

          })}

        </ul>

      )}

    </section>

  );

}
