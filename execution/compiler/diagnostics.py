from dataclasses import dataclass

@dataclass
class Diagnostic:
    severity: str
    message: str
