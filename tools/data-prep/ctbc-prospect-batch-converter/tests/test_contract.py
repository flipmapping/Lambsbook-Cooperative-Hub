from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(
    0,
    str(ROOT / "tools/data-prep/ctbc-prospect-batch-converter")
)

from ctbc_prospect_batch_converter import HEADERS

def test_canonical_headers():
    assert HEADERS == [
        "full_name","phone","email","country",
        "program_of_interest","student_number",
        "external_reference","school","province",
        "notes","campaign_source"
    ]
