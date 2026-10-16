import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from execution.restoration.verified_feature_runner import (
    GateError,
    exact_paths,
    patch_bytes,
    release_contract,
    resolve_target_baseline,
)


class VerifiedFeatureRunnerTests(unittest.TestCase):
    def test_exact_path_scope_passes_only_on_exact_match(self):
        exact_paths(["a.py", "b.py"], ["b.py", "a.py"])

    def test_exact_path_scope_rejects_extra_path(self):
        with self.assertRaisesRegex(GateError, "EXACT_PATH_MISMATCH"):
            exact_paths(["a.py", "unexpected.py"], ["a.py"])

    def test_missing_release_contract_stops(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(GateError, "REQUIRED_FILE_MISSING"):
                release_contract(
                    Path(temp),
                    {"path": "missing-contract.json", "sha256": "0" * 64},
                    ["a.py"],
                    "1" * 40,
                    "2" * 40,
                )

    def test_patch_checksum_is_checked_before_use(self):
        with tempfile.TemporaryDirectory() as temp:
            patch = Path(temp) / "candidate.patch"
            patch.write_bytes(b"patch")
            with self.assertRaisesRegex(GateError, "PATCH_DIGEST_MISMATCH"):
                patch_bytes(Path(temp), "candidate.patch", "0" * 64)

    @patch("execution.restoration.verified_feature_runner.command")
    def test_target_baseline_uses_origin_main(self, mocked_command):
        expected = "b" * 40
        mocked_command.side_effect = [b"", (expected + "\n").encode()]
        actual = resolve_target_baseline(
            Path("/repo"),
            {"branch": "main", "baseline_sha": expected},
        )
        self.assertEqual(actual, expected)
        self.assertEqual(
            mocked_command.call_args_list[1].args[0],
            ["git", "rev-parse", "refs/remotes/origin/main"],
        )

    @patch("execution.restoration.verified_feature_runner.command")
    def test_target_baseline_mismatch_stops(self, mocked_command):
        mocked_command.side_effect = [b"", (("c" * 40) + "\n").encode()]
        with self.assertRaisesRegex(GateError, "TARGET_BASELINE_MISMATCH"):
            resolve_target_baseline(
                Path("/repo"),
                {"branch": "main", "baseline_sha": "b" * 40},
            )


if __name__ == "__main__":
    unittest.main()
