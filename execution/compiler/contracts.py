from dataclasses import dataclass

@dataclass
class CompilerContext:
    execution_authority: str
    implementation_context: object
    repository: object
