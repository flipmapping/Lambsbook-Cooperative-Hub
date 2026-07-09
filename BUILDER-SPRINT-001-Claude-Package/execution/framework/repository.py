from __future__ import annotations

import subprocess
from pathlib import Path


class Repository:

    @staticmethod
    def discover_root() -> Path:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        )
        return Path(result.stdout.strip()).resolve()
