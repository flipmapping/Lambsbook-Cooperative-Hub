
#!/usr/bin/env python3

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]

_BUILDER_DIR = ROOT / "execution" / "builder"

def load_builder_context():
    """Load the canonical Builder governance artifacts."""

    spec = json.loads((_BUILDER_DIR / "builder-spec.json").read_text())
    activation = json.loads((_BUILDER_DIR / "activation.json").read_text())
    registration = json.loads((_BUILDER_DIR / "registration.json").read_text())

    return {
        "spec": spec,
        "activation": activation,
        "registration": registration,
    }
