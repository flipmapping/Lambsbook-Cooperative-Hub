"""
Canonical Builder Consumer

First external consumer of the Projection Builder.
"""

from __future__ import annotations

import json

from builders.projection.builder_interface import execute_builder


def consume() -> dict:
    """
    Invoke the Builder exclusively through its public interface.
    """
    return execute_builder()


def main() -> int:
    result = consume()

    print(json.dumps(result, indent=2, sort_keys=True))

    return 0 if result["status"] == "EXECUTABLE" else 1


if __name__ == "__main__":
    raise SystemExit(main())
