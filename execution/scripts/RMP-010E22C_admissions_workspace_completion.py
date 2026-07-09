from pathlib import Path
import sys

    # ---------------------------------------------------------------------
    # Canonical Repository Bootstrap
    # ---------------------------------------------------------------------

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]

if str(REPOSITORY_ROOT) not in sys.path:
        sys.path.insert(0, str(REPOSITORY_ROOT))

    # ---------------------------------------------------------------------
    # Frozen Execution Framework
    # ---------------------------------------------------------------------

from execution.framework import (
        RepositoryMutationPackage,
        Mutation,
        execute,
    )

    # ---------------------------------------------------------------------
    # Repository Mutation Package
    # ---------------------------------------------------------------------

PACKAGE = RepositoryMutationPackage(
        work_package="RMP-010E22C",

        authorized_scope=(
            "client/src/pages/AdmissionsWorkspace.tsx",
            "client/src/pages/HubAdminDashboard.tsx",
        ),

        mutations=(
            Mutation(
                target=Path("client/src/pages/AdmissionsWorkspace.tsx"),
                description=(
                    "Add admissions summary metrics showing total prospects "
                    "and counts grouped by lifecycle stage using the existing "
                    "GET endpoint."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/AdmissionsWorkspace.tsx"),
                description=(
                    "Add client-side search over prospect name, email, country, "
                    "and programme of interest without introducing additional "
                    "API requests."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/AdmissionsWorkspace.tsx"),
                description=(
                    "Add client-side lifecycle stage filtering using the existing "
                    "retrieved prospect collection."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/AdmissionsWorkspace.tsx"),
                description=(
                    "Add created-date sorting with ascending and descending "
                    "options while preserving the backend default ordering."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/AdmissionsWorkspace.tsx"),
                description=(
                    "Preserve exclusive consumption of the production admissions "
                    "APIs and existing PATCH-based stage updates."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/HubAdminDashboard.tsx"),
                description=(
                    "Correct the top Admin navigation alignment so the Admissions "
                    "entry matches the existing navigation layout and spacing."
                ),
            ),

            Mutation(
                target=Path("client/src/pages/HubAdminDashboard.tsx"),
                description=(
                    "Preserve all existing dashboard tabs, Admissions integration, "
                    "routing, and behaviour."
                ),
            ),
        ),
    )

    # ---------------------------------------------------------------------
    # Entry Point
    # ---------------------------------------------------------------------

if __name__ == "__main__":
        execute(PACKAGE)