import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from execution.restoration.verified_feature_runner import (
    GateError,
    cleanup_worktree,
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
            patch_file = Path(temp) / "candidate.patch"
            patch_file.write_bytes(b"patch")
            with self.assertRaisesRegex(GateError, "PATCH_DIGEST_MISMATCH"):
                patch_bytes(Path(temp), "candidate.patch", "0" * 64)

    @patch("execution.restoration.verified_feature_runner.command")
    def test_target_baseline_uses_origin_main(self, mocked_command):
        expected = "b" * 40
        mocked_command.side_effect = [b"", expected.encode()]
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
        mocked_command.side_effect = [b"", ("c" * 40).encode()]
        with self.assertRaisesRegex(GateError, "TARGET_BASELINE_MISMATCH"):
            resolve_target_baseline(
                Path("/repo"),
                {"branch": "main", "baseline_sha": "b" * 40},
            )

    def make_registered_worktree(self, parent):
        root = Path(parent) / "repo"
        root.mkdir()
        subprocess.run(["git", "init", "-q", str(root)], check=True)
        subprocess.run(
            ["git", "config", "user.name", "Runner Test"], cwd=root, check=True
        )
        subprocess.run(
            ["git", "config", "user.email", "runner-test@example.invalid"],
            cwd=root,
            check=True,
        )
        (root / "seed.txt").write_text("seed\\n", encoding="utf-8")
        subprocess.run(["git", "add", "seed.txt"], cwd=root, check=True)
        subprocess.run(["git", "commit", "-qm", "seed"], cwd=root, check=True)
        worktree = Path(parent) / "temporary-worktree"
        subprocess.run(
            ["git", "worktree", "add", "--detach", str(worktree), "HEAD"],
            cwd=root,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        return root, worktree

    def assert_cleanup_removes_registered_worktree(self):
        with tempfile.TemporaryDirectory() as temp:
            root, worktree = self.make_registered_worktree(temp)
            cleanup_worktree(root, worktree, True)
            self.assertFalse(worktree.exists())
            entries = subprocess.check_output(
                ["git", "worktree", "list", "--porcelain"], cwd=root, text=True
            )
            self.assertEqual(entries.count("worktree "), 1)

    def test_cleanup_after_success(self):
        self.assert_cleanup_removes_registered_worktree()

    def test_cleanup_after_failure(self):
        self.assert_cleanup_removes_registered_worktree()


if __name__ == "__main__":
    unittest.main()
