from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json


@dataclass
class SurfaceRegistryService:
    """
    Consumes the certified constitutional Surface Registry.
    """

    repository_root: Path

    @property
    def registry_root(self) -> Path:
        return (
            self.repository_root
            / "execution"
            / "registry"
            / "surfaces"
        )

    def load(self) -> dict:
        files = {
            "surface_registry": "SURFACE-REGISTRY.json",
            "lease_registry": "LEASE-REGISTRY.json",
            "surface_catalog": "SURFACE-CATALOG.json",
            "surface_dependencies": "SURFACE-DEPENDENCIES.json",
        }

        loaded = {}

        for key, filename in files.items():
            path = self.registry_root / filename

            if not path.exists():
                raise FileNotFoundError(path)

            loaded[key] = json.loads(
                path.read_text(encoding="utf-8")
            )

        return loaded


    def validate_surface_lease(
        self,
        surface_id: str,
        execution_stream: str,
    ) -> tuple[bool, str]:
        """
        Validate whether an execution stream owns an active lease
        for the requested surface.
        """

        leases = self.load()["lease_registry"]

        for lease in leases.get("active_leases", []):

            if lease.get("surface_id") != surface_id:
                continue

            if lease.get("execution_stream") != execution_stream:
                return (
                    False,
                    "Surface leased by another execution stream.",
                )

            if lease.get("status") != "ACTIVE":
                return (
                    False,
                    "Surface lease is not ACTIVE.",
                )

            return (
                True,
                "Lease validated.",
            )

        return (
            False,
            "Surface lease not found.",
        )


    def detect_surface_collision(
        self,
        surface_id: str,
        execution_stream: str,
    ) -> tuple[bool, str]:
        """
        Detect whether Builder may safely mutate the requested
        surface under the current lease.
        """

        valid, message = self.validate_surface_lease(
            surface_id,
            execution_stream,
        )

        if valid:
            return (
                False,
                "No collision detected.",
            )

        return (
            True,
            message,
        )
