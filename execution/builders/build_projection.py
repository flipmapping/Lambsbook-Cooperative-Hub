#!/usr/bin/env python3

from pathlib import Path
import argparse
import json
import sys

ROOT = Path(__file__).resolve().parents[2]

REGISTRY = ROOT / "execution" / "contracts" / "registry.json"
PROJECTION_REGISTRY = ROOT / "execution" / "projections" / "registry.json"

def main():
    parser = argparse.ArgumentParser(
        description="Canonical Projection Builder"
    )

    parser.add_argument(
        "execution_contract_id",
        help="Registered Execution Contract identifier"
    )

    parser.add_argument(
        "target_agent",
        help="Target projection agent"
    )

    args = parser.parse_args()

    if not REGISTRY.exists():
        sys.exit("Missing Execution Contract Registry")

    if not PROJECTION_REGISTRY.exists():
        sys.exit("Missing Projection Registry")

    contract_registry = json.loads(REGISTRY.read_text())

    contracts = contract_registry.get("contracts", {})

    if args.execution_contract_id not in contracts:
        sys.exit("Execution Contract is not registered")

    projection_registry = json.loads(PROJECTION_REGISTRY.read_text())

    capabilities = projection_registry.get(
        "projection_capabilities",
        {}
    )

    capability = None

    for metadata in capabilities.values():
        if (
            metadata.get("target_agent") == args.target_agent
            and metadata.get("status") == "active"
        ):
            capability = metadata
            break

    if capability is None:
        sys.exit("Projection Capability is not registered")

    contract = {
        "execution_contract_id": args.execution_contract_id,
        "contract_provenance": contract_registry
            .get("contracts", {})
            .get(args.execution_contract_id, {})
    }

    projection_model = {
        "execution_contract_id":
            contract["execution_contract_id"],

        "source_fep":
            contract["contract_provenance"].get(
                "source_fep"
            ),

        "target_agent":
            args.target_agent,

        "projection_capability":
            capability,

        "schema_version":
            capability.get(
                "schema_version"
            ),

        "contract_provenance":
            contract["contract_provenance"]
    }

    print("STATUS : PROJECTION MODEL DERIVED")

    print("=" * 78)
    print("PROJECTION BUILDER")
    print("=" * 78)
    print(f"Execution Contract : {args.execution_contract_id}")
    print(f"Target Agent       : {args.target_agent}")
    print()
    print("STATUS : SCAFFOLD VALIDATED")
    print("Projection generation not yet implemented.")
    print("=" * 78)

if __name__ == "__main__":
    main()
