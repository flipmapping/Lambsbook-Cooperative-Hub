
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]

def derive_pic(package: Path) -> int:
    """
    Execute the canonical PIC derivation engine.

    Parameters
    ----------
    package : Path
        Absolute path to the execution work package.

    Returns
    -------
    int
        Exit code from derive_pic.py
    """

    derive = ROOT / "execution" / "builder" / "derive_pic.py"

    cmd = [
        sys.executable,
        str(derive),
        "--package",
        str(package.relative_to(ROOT))
    ]

    result = subprocess.run(cmd)

    return result.returncode
