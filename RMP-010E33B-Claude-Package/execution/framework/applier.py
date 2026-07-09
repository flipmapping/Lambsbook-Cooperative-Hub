from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Replacement:
    """
    Exact text replacement.
    """

    before: str
    after: str


@dataclass(frozen=True)
class ExecutionResult:
    """
    Result of executing a bounded mutation.
    """

    modified_files: tuple[Path, ...]
    replacements_applied: int
    success: bool


class MutationApplier:
    """
    Executes verified bounded mutations.
    """

    @staticmethod
    def apply(
        target: Path,
        replacements: tuple[Replacement, ...],
    ) -> ExecutionResult:

        original = target.read_text(
            encoding="utf-8",
        )

        updated = original

        applied = 0

        for replacement in replacements:

            if replacement.before not in updated:
                raise ValueError(
                    "Required anchor not found."
                )

            updated = updated.replace(
                replacement.before,
                replacement.after,
                1,
            )

            applied += 1

        if updated == original:
            return ExecutionResult(
                modified_files=(),
                replacements_applied=0,
                success=True,
            )

        target.write_text(
            updated,
            encoding="utf-8",
        )

        return ExecutionResult(
            modified_files=(target,),
            replacements_applied=applied,
            success=True,
        )