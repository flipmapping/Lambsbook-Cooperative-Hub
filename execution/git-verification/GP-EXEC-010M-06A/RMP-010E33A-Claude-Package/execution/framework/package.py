from __future__ import annotations

from dataclasses import dataclass

from .mutations import Mutation


@dataclass(frozen=True)
class RepositoryMutationPackage:
    """
    Immutable Repository Mutation Package.

    Pure repository intent.
    Contains no execution behaviour.
    """

    work_package: str

    authorized_scope: tuple[str, ...]

    mutations: tuple[Mutation, ...]