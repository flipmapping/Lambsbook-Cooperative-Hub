PACKAGE = RepositoryMutationPackage(

    work_package="RMP-010E22D",

    authorized_scope=(

        "client/src/pages/AdmissionsWorkspace.tsx",

        "client/src/pages/HubAdminDashboard.tsx",

    ),

    mutations=(

        #
        # AdmissionsWorkspace
        #

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="useState",

            operation="insert_after",

            payload="Search state",

            verification="Exactly one search state exists.",

        ),

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="const prospects",

            operation="insert_after",

            payload="Derived filtered prospect collection",

            verification="Filtered collection computed once.",

        ),

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="return (",

            operation="insert_after",

            payload="Admissions summary metrics",

            verification="Summary cards rendered.",

        ),

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="return (",

            operation="insert_after",

            payload="Search input",

            verification="Search control rendered.",

        ),

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="return (",

            operation="insert_after",

            payload="Stage filter",

            verification="Stage filter rendered.",

        ),

        Mutation(

            target=Path(
                "client/src/pages/AdmissionsWorkspace.tsx"
            ),

            anchor="prospects.map",

            operation="replace",

            payload="filteredProspects.map",

            verification="Rendered list uses filtered collection.",

        ),

        #
        # HubAdminDashboard
        #

        Mutation(

            target=Path(
                "client/src/pages/HubAdminDashboard.tsx"
            ),

            anchor='TabsList className="',

            operation="replace",

            payload="Normalized top navigation alignment",

            verification="Admissions tab aligns with existing tabs.",

        ),

    ),

)