"""
Execution Context Resolver

First execution compiler stage.

Responsibilities
----------------
* Construct CanonicalExecutionModel
* Populate execution context
* Validate local invariants
* Emit ExecutionEvent
* Return updated model

The resolver is intentionally pure.
It performs no repository mutation and no orchestration.
"""

from .models import CanonicalExecutionModel
from .contracts import CompilerContext
from .events import ExecutionEvent


class ContextResolver:

    stage = "ContextResolver"

    def resolve(
        self,
        context: CompilerContext
    ) -> tuple[CanonicalExecutionModel, ExecutionEvent]:

        model = CanonicalExecutionModel()

        model.execution_authority = {
            "authority": context.execution_authority
        }

        model.implementation_context = (
            context.implementation_context
        )

        model.repository = context.repository

        event = ExecutionEvent(
            event_type="STAGE_COMPLETED",
            stage=self.stage,
            authority=context.execution_authority,
            payload={
                "resolver": self.stage
            }
        )

        return model, event
