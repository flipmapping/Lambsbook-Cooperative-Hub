from __future__ import annotations

from .normalized_execution import NormalizedExecution


class CheckpointAdapter:

    def normalize(self, checkpoint: dict) -> NormalizedExecution:

        return NormalizedExecution(
            checkpoint_id=checkpoint["checkpoint_id"],
            execution_id=checkpoint["execution_id"],
            pipeline=checkpoint.get("pipeline", ""),
            execution_state=checkpoint["execution_state"],
            schema_version=checkpoint["schema_version"],
            completed_stages=checkpoint.get("completed_stages", []),
            pending_stages=checkpoint.get("pending_stages", []),
            authorized_mutations=checkpoint.get("authorized_mutations", []),
            blocked_mutations=checkpoint.get("blocked_mutations", []),
            dependencies=checkpoint.get("dependencies", []),
            resume_from=checkpoint.get("resume_from"),
            evidence_boundary=checkpoint.get("evidence_boundary"),
            generated_at=checkpoint.get("generated_at"),
        )
