    # execution/scripts/RMP-010E22B_admissions_workspace_refinement.py

    """
    RMP-010E22B — Admissions Workspace Refinement

    Implementation Authority
        RMP-010E22B

    Repository Authority
        Repository Truth Established

    Execution Model

        RepositoryMutationPackage
                  │
                  ▼
            execute(PACKAGE)
                  │
                  ▼
        Frozen Execution Framework
                  │
                  ▼
              Repository

    This Repository Mutation Package declares repository mutation intent only.

    Repository inspection, anchor verification, corridor verification,
    bounded mutation execution, post-mutation verification, reporting,
    and acceptance verification are delegated exclusively to the
    canonical Execution Framework.
    """

    from execution.framework import (
        RepositoryMutationPackage,
        Mutation,
        execute,
    )

    PACKAGE = RepositoryMutationPackage(
        work_package="RMP-010E22B",
        title="Admissions Workspace Refinement",

        authorized_scope=(
            "client/src/pages/AdmissionsWorkspace.tsx",
            "client/src/pages/HubAdminDashboard.tsx",
        ),

        mutations=(

            #
            # AdmissionsWorkspace.tsx
            #

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Add admissions summary metrics showing total prospects "
                    "and counts grouped by lifecycle stage using the existing "
                    "loaded prospect collection."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Add client-side search supporting Full Name, Email, "
                    "Country and Program of Interest."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Add client-side lifecycle stage filter using the existing "
                    "current_stage values returned by the production API."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Add client-side Created Date sorting supporting newest-first "
                    "and oldest-first ordering."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Compute summary metrics, search, filtering and sorting "
                    "entirely from the already retrieved dataset without "
                    "introducing additional backend requests."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Preserve exclusive use of the production admissions APIs: "
                    "GET /api/admissions/prospects and "
                    "PATCH /api/admissions/prospects/:id/stage."
                ),
            ),

            Mutation(
                target="client/src/pages/AdmissionsWorkspace.tsx",
                description=(
                    "Preserve existing lifecycle stage update behaviour, "
                    "query invalidation, optimistic user workflow and "
                    "backend validation."
                ),
            ),

            #
            # HubAdminDashboard.tsx
            #

            Mutation(
                target="client/src/pages/HubAdminDashboard.tsx",
                description=(
                    "Correct visual alignment of the Admin navigation entry "
                    "to match the existing top navigation layout."
                ),
            ),

            Mutation(
                target="client/src/pages/HubAdminDashboard.tsx",
                description=(
                    "Preserve Admissions tab placement, dashboard layout, "
                    "existing tab ordering and navigation behaviour."
                ),
            ),

            Mutation(
                target="client/src/pages/HubAdminDashboard.tsx",
                description=(
                    "Do not modify existing dashboard business logic or "
                    "administrator workflows."
                ),
            ),
        ),
    )

    if __name__ == "__main__":
        execute(PACKAGE)