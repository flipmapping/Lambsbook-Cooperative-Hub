from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


class CheckpointLoader:
    """Loads and minimally validates EXECUTION-CHECKPOINT.json."""


    REQUIRED_FIELDS = (
        "checkpoint_id",
        "execution_id",
        "schema_version",
        "execution_state",
    )


    def load(self, path: str | Path) -> Dict[str, Any]:
        data = json.loads(Path(path).read_text(encoding="utf-8"))

        missing = [
            field
            for field in self.REQUIRED_FIELDS
            if field not in data
        ]

        if missing:
            raise ValueError(
                f"Missing required checkpoint fields: {missing}"
            )

        return data
