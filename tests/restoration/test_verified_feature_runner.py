import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from execution.restoration.verified_feature_runner import (
    GateError,
    cleanup_worktree,
    compare_typecheck_diagnostics,
    exact_paths,
    patch_bytes,
    release_contract,
    resolve_target_baseline,
    stage_and_verify_paths,
    verify_authority_wcs,
    verify_candidate_pr,
    stop_preview_process,
    wait_for_preview_start,
    ensure_preview_port_available,
)


class VerifiedFeatureRunnerTests(unittest.TestCase):
    def test_authority_accepts_matching_wcs004(self):
        verify_authority_wcs(
            {
                "status": "AUTHORIZED",
                "authority_id": "HUB-RESTORE-AUTO-001",
                "cycle_id": "HUB-RESTORE-AUTO-001-WCS-004",
            },
            {
                "status": "FOUNDER_APPROVED",
                "work_cycle_id": "HUB-RESTORE-AUTO-001-WCS-004",
            },
        )

    def test_authority_rejects_wcs_cycle_mismatch(self):
        with self.assertRaisesRegex(GateError, "WCS_AUTHORITY_CYCLE_MISMATCH"):
            verify_authority_wcs(
                {
                    "status": "AUTHORIZED",
                    "authority_id": "HUB-RESTORE-AUTO-001",
                    "cycle_id": "HUB-RESTORE-AUTO-001-WCS-004",
                },
                {
                    "status": "FOUNDER_APPROVED",
                    "work_cycle_id": "HUB-RESTORE-AUTO-001-WCS-003",
                },
            )

    def test_authority_rejects_unapproved_wcs(self):
        with self.assertRaisesRegex(GateError, "WCS_NOT_APPROVED"):
            verify_authority_wcs(
                {
                    "status": "AUTHORIZED",
                    "authority_id": "HUB-RESTORE-AUTO-001",
                    "cycle_id": "HUB-RESTORE-AUTO-001-WCS-004",
                },
                {
                    "status": "DRAFT",
                    "work_cycle_id": "HUB-RESTORE-AUTO-001-WCS-004",
                },
            )

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


    @patch("execution.restoration.verified_feature_runner.subprocess.run")
    def test_typecheck_comparison_allows_existing_errors_and_line_shifts(self, mocked_run):
        from subprocess import CompletedProcess

        mocked_run.side_effect = [
            CompletedProcess([], 2, "src/a.ts(1,2): error TS2322: Existing issue\n", ""),
            CompletedProcess([], 2, "src/a.ts(9,4): error TS2322: Existing issue\n", ""),
        ]
        compare_typecheck_diagnostics(
            Path("/tmp/baseline"), Path("/tmp/candidate"), ["npm", "run", "check"]
        )

    @patch("execution.restoration.verified_feature_runner.subprocess.run")
    def test_typecheck_comparison_rejects_new_error(self, mocked_run):
        from subprocess import CompletedProcess

        mocked_run.side_effect = [
            CompletedProcess([], 0, "", ""),
            CompletedProcess([], 2, "src/new.ts(3,1): error TS2304: New issue\n", ""),
        ]
        with self.assertRaisesRegex(GateError, "NEW_TYPESCRIPT_DIAGNOSTICS"):
            compare_typecheck_diagnostics(
                Path("/tmp/baseline"), Path("/tmp/candidate"), ["npm", "run", "check"]
            )

    def test_scope_check_includes_new_untracked_files(self):
        with tempfile.TemporaryDirectory() as temp:
            repo = Path(temp)
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            (repo / "new-a.txt").write_text("a", encoding="utf-8")
            (repo / "new-b.txt").write_text("b", encoding="utf-8")
            stage_and_verify_paths(repo, ["new-a.txt", "new-b.txt"])


    @patch("execution.restoration.verified_feature_runner.command")
    def test_candidate_pr_requires_exact_manifest_commit(self, mocked_command):
        mocked_command.return_value = (
            b'{"state":"OPEN","headRefOid":"5948cb503a861bd9dc9675f26bf31b9d9425c2a9"}'
        )
        verify_candidate_pr(Path("/repo"), "5948cb503a861bd9dc9675f26bf31b9d9425c2a9")

    @patch("execution.restoration.verified_feature_runner.command")
    def test_candidate_pr_rejects_different_head(self, mocked_command):
        mocked_command.return_value = b'{"state":"OPEN","headRefOid":"different"}'
        with self.assertRaisesRegex(GateError, "CANDIDATE_PR_HEAD_MISMATCH"):
            verify_candidate_pr(Path("/repo"), "5948cb503a861bd9dc9675f26bf31b9d9425c2a9")


    def test_preview_port_guard_allows_unused_port(self):
        with patch("execution.restoration.verified_feature_runner.socket.create_connection", side_effect=OSError("closed")):
            ensure_preview_port_available()

    def test_preview_port_guard_rejects_occupied_port(self):
        with patch("execution.restoration.verified_feature_runner.socket.create_connection") as connect:
            with self.assertRaisesRegex(GateError, "PREVIEW_PORT_IN_USE"):
                ensure_preview_port_available()
            connect.assert_called_once()

    def test_preview_start_wait_rejects_early_process_exit(self):
        process = unittest.mock.Mock()
        process.poll.return_value = 7
        with patch("execution.restoration.verified_feature_runner.time.monotonic", return_value=0):
            with self.assertRaisesRegex(GateError, "CANDIDATE_PREVIEW_EXITED_EARLY"):
                wait_for_preview_start(process, timeout=1)

    def test_preview_start_wait_times_out(self):
        process = unittest.mock.Mock()
        process.poll.return_value = None
        with patch("execution.restoration.verified_feature_runner.time.monotonic", side_effect=[0, 2]):
            with self.assertRaisesRegex(GateError, "CANDIDATE_PREVIEW_START_TIMEOUT"):
                wait_for_preview_start(process, timeout=1)

    def test_preview_process_shutdown_escalates_and_waits(self):
        process = unittest.mock.Mock()
        process.pid = 123
        process.poll.return_value = None
        process.wait.side_effect = [
            subprocess.TimeoutExpired("npm run dev", 10),
            None,
        ]
        with patch("execution.restoration.verified_feature_runner.os.killpg") as killpg:
            stop_preview_process(process)
        self.assertEqual(killpg.call_count, 2)
        self.assertEqual(process.wait.call_count, 2)



if __name__ == "__main__":
    unittest.main()
