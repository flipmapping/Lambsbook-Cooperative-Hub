from execution.automation.loader.checkpoint_loader import CheckpointLoader
from execution.automation.model.adapter import CheckpointAdapter


def run(checkpoint_path: str):
    loader = CheckpointLoader()
    raw = loader.load(checkpoint_path)

    adapter = CheckpointAdapter()
    execution = adapter.normalize(raw)

    print("Automation Pipeline")
    print("-------------------")
    print(f"Checkpoint : {execution.checkpoint_id}")
    print(f"Execution  : {execution.execution_id}")
    print(f"State      : {execution.execution_state}")
    print(f"Pipeline   : {execution.pipeline}")
    print(f"Schema     : {execution.schema_version}")

    return execution


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        raise SystemExit(
            "Usage: python run_pipeline.py EXECUTION-CHECKPOINT.json"
        )

    run(sys.argv[1])
