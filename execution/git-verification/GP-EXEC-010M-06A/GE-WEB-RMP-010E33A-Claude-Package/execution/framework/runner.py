from __future__ import annotations

from .context import ExecutionContext
from .repository import Repository
from .mutations import MutationEngine
from .verification import VerificationEngine
from .reporting import Reporter
from .applier import MutationApplier
from .package import RepositoryMutationPackage
from .realizer import MutationRealizer


def execute(
        package: RepositoryMutationPackage,
    ):
        """
        Canonical Repository Mutation Package runner.

        Orchestrates the existing execution framework.
        """

        repository_root = Repository.discover_root()

        context = ExecutionContext.create(
            implementation_authority=package.work_package,
            repository_root=repository_root,
        )

        reports = []

        for mutation in package.mutations:

            plan = MutationEngine.plan(
                repository_root,
                mutation,
            )

            verification = VerificationEngine.verify(
                plan,
            )

            status = "FAILED"

            if verification.verified:

                realization = MutationRealizer.realize(
                    mutation,
                )

                if realization.replacements:

                    MutationApplier.apply(
                        mutation.target,
                        realization.replacements,
                    )

                status = "READY"

            reports.append(
                Reporter.report(
                    authority=context.implementation_authority,
                    repository=str(repository_root),
                    status=status,
                )
            )

        return reports