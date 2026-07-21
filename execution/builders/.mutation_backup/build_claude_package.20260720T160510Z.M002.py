#!/usr/bin/env python3
"""
Namespace-independent Claude Package Builder

Status:
SPRINT 5 — Implementation Context Manifest (ICM)

Sprint 1 (CERTIFIED — EOS-RMP-001A):
  Read the supplied Claude Instruction Brief.
  Validate that the file exists.
  Parse and extract required fields.
  Verify each mandatory field exists exactly once.
  Emit structured metadata.
  Exit PASS.

Sprint 2 (CERTIFIED — EOS-RMP-001B / HF1):
  Locate Execution Derivation artifact from CIB field.
  Locate Implementation Authority artifact from authority ID.
  Locate synchronization artifacts (canonical set).
  Verify existence of all located artifacts.
  Verify authority consistency across certified artifacts.
  Emit verified Repository Truth metadata.

Sprint 3 (CERTIFIED — EOS-RMP-001C):
  Create package root directory.
  Create required subdirectories (governance/, execution/, ...).
  Generate START-HERE.md.
  Generate PACKAGE-MANIFEST.md.
  Assemble required artifacts into the package directory.

Sprint 4 (CERTIFIED — EOS-RMP-001D):
  Generate ZIP archive from materialized package.
  Generate SHA256 digest file for the archive.
  Verify archive integrity after generation.
  Emit deterministic package finalization summary.

Sprint 5 (EOS-RMP-001E):
  Consume explicit Implementation Context Manifest (ICM).
  Verify every ICM-listed repository file exists.
  Copy listed files into implementation-context/.
  Record copied files in PACKAGE-MANIFEST.

Input:
    Claude Instruction Brief

Output (Sprint 4):
    Structured metadata to stdout
    Repository Truth metadata to stdout
    Package directory materialized on disk
    START-HERE.md generated
    PACKAGE-MANIFEST.md generated
    Required artifacts assembled
    ZIP archive generated
    SHA256 digest file generated
    PASS / FAIL report
"""

import argparse
import hashlib
import re
import shutil
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from execution.builders.services.artifact_materialization.implementation.artifact_materialization_service import ArtifactMaterializationService


# ── Exit codes ────────────────────────────────────────────────
EXIT_PASS                     = 0
EXIT_REPOSITORY_TRUTH         = 1
EXIT_MISSING_ARTIFACT         = 2
EXIT_AUTHORITY_INCONSISTENCY  = 3
EXIT_SYNC_VERIFICATION        = 4
EXIT_PACKAGE_VERIFICATION     = 5


# ── Mandatory CIB fields ───────────────────────────────────────
MANDATORY_FIELDS = [
    "Implementation Authority",
    "Repository",
    "Production Surface",
    "Implementation Context Manifest",
]

# Optional CIB fields
OPTIONAL_FIELDS = [
    "Authority Stream",
    "Derived From",
]

# ── Canonical synchronization artifact paths ─────────────────
SYNC_ARTIFACTS = [
    "governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md",
    "governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md",
    "governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md",
    "governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md",
    "governance/BASELINE.md",
    "governance/execution/EXECUTION-PIPELINE.md",
]

# ── Implementation Authority artifact path template ──────────
IA_ARTIFACT_TEMPLATE = "governance/rmp/{ia}-IMPLEMENTATION-AUTHORITY.md"

# ── Package subdirectory structure ───────────────────────────
# Created inside the package root directory.
PACKAGE_SUBDIRS = [
    "governance",
    "governance/startup",
    "governance/execution",
    "governance/cib",
    "governance/cib/generated",
    "governance/execution-derivation",
    "governance/rmp",
    "execution",
    "execution/builders",
    "implementation-context",
]


# ── Output helpers ─────────────────────────────────────────────
def _banner(msg: str) -> None:
    print("=" * 40)
    print(msg)
    print("=" * 40)


def fail(message: str, code: int = EXIT_MISSING_ARTIFACT) -> None:
    print()
    print(f"FAIL: {message}")
    sys.exit(code)


# ── CIB field extraction ───────────────────────────────────────

def _extract_field(text: str, field: str) -> list[str]:
    """
    Extract all occurrences of a named field from a CIB-format document.

    Pattern: field label on its own line, blank line, value on next line.
    Returns list of stripped values (empty list if absent).
    """
    pattern = rf"^{re.escape(field)}\n\n(.+?)$"
    matches = re.findall(pattern, text, re.MULTILINE)
    return [m.strip() for m in matches if m.strip()]


def extract_cib_fields(cib_text: str) -> dict[str, list[str]]:
    """Extract all tracked fields from the CIB."""
    results: dict[str, list[str]] = {}
    for field in MANDATORY_FIELDS + OPTIONAL_FIELDS:
        results[field] = _extract_field(cib_text, field)
    return results


def validate_mandatory_fields(
    fields: dict[str, list[str]],
) -> dict[str, str]:
    """
    Validate that each mandatory field exists exactly once.
    Returns clean dict of field → single value.
    Aborts on missing or duplicate field.
    """
    clean: dict[str, str] = {}
    for field in MANDATORY_FIELDS:
        values = fields.get(field, [])
        if len(values) == 0:
            fail(
                f"Mandatory field absent from CIB: '{field}'",
                EXIT_MISSING_ARTIFACT,
            )
        if len(values) > 1:
            fail(
                f"Duplicate mandatory field in CIB: '{field}' "
                f"(found {len(values)} occurrences)",
                EXIT_AUTHORITY_INCONSISTENCY,
            )
        clean[field] = values[0]
    return clean


def get_optional(fields: dict[str, list[str]], field: str) -> str | None:
    """Return the single value of an optional field, or None if absent."""
    values = fields.get(field, [])
    return values[0] if len(values) == 1 else None


# ── Repository Truth artifact discovery ───────────────────────

def locate_artifacts(
    repo_root: Path,
    mandatory: dict[str, str],
    optional: dict[str, str | None],
) -> dict[str, Path]:
    """
    Deterministically locate all Repository Truth artifacts.

    No authority prefixes are hard-coded.
    Returns mapping of artifact label → absolute Path.
    """
    located: dict[str, Path] = {}

    # Execution Derivation — path is the direct value from the CIB field
    ed_path = repo_root / mandatory["Execution Derivation"]
    located["Execution Derivation"] = ed_path

    # Implementation Authority artifact
    ia = mandatory["Implementation Authority"]
    ia_path = repo_root / IA_ARTIFACT_TEMPLATE.format(ia=ia)
    located["Implementation Authority Artifact"] = ia_path

    # Implementation Context Manifest — path is the direct value from the CIB field
    icm_path = repo_root / mandatory["Implementation Context Manifest"]
    located["Implementation Context Manifest"] = icm_path

    # CIB itself — included in the package
    # (resolved at assembly time from the argument; stored separately)

    # Canonical synchronization artifacts
    for sync_path in SYNC_ARTIFACTS:
        located[f"Sync:{sync_path}"] = repo_root / sync_path

    return located


def verify_artifact_existence(
    located: dict[str, Path],
) -> tuple[list[str], list[str]]:
    """Verify existence of all located artifacts."""
    present: list[str] = []
    missing: list[str] = []
    for label, path in located.items():
        if path.exists():
            present.append(label)
        else:
            missing.append(f"{label} → {path}")
    return present, missing


def verify_authority_consistency(
    repo_root: Path,
    mandatory: dict[str, str],
    optional: dict[str, str | None],
    ia_artifact_path: Path,
) -> list[str]:
    """Verify authority consistency across certified artifacts."""
    violations: list[str] = []
    ia = mandatory["Implementation Authority"]
    cib_stream = optional.get("Authority Stream")

    if ia not in ia_artifact_path.name:
        violations.append(
            f"Implementation Authority '{ia}' "
            f"not reflected in artifact filename '{ia_artifact_path.name}'"
        )

    if ia_artifact_path.exists():
        try:
            ia_text = ia_artifact_path.read_text(encoding="utf-8")
            ia_values = _extract_field(ia_text, "Implementation Authority")
            if ia_values and ia_values[0] != ia:
                violations.append(
                    f"Implementation Authority mismatch: "
                    f"CIB='{ia}', IA artifact='{ia_values[0]}'"
                )
            if cib_stream:
                ia_streams = _extract_field(ia_text, "Authority Stream")
                if ia_streams and ia_streams[0] != cib_stream:
                    violations.append(
                        f"Authority Stream mismatch: "
                        f"CIB='{cib_stream}', IA artifact='{ia_streams[0]}'"
                    )
        except OSError:
            violations.append(
                f"IA artifact unreadable: {ia_artifact_path}"
            )

    return violations


# ── Metadata emission ─────────────────────────────────────────

def emit_cib_metadata(mandatory: dict[str, str]) -> None:
    print()
    print("Structured Metadata")
    print("-" * 40)
    for field in MANDATORY_FIELDS:
        print(f"{field}: {mandatory[field]}")
    print()


def emit_repository_truth(
    located: dict[str, Path],
    present: list[str],
    missing: list[str],
) -> None:
    print("Repository Truth")
    print("-" * 40)
    for label, path in located.items():
        status = "✓" if path.exists() else "✗"
        print(f"  {status}  {label}")
    print()
    print(f"  Artifacts present: {len(present)}")
    print(f"  Artifacts missing: {len(missing)}")
    print()


# ── Package materialization ────────────────────────────────────

def _package_name(ia: str) -> str:
    """Derive deterministic package directory name from Implementation Authority."""
    return f"{ia}-Claude-Package"


def _resolve_package_root(
    repo_root: Path,
    ia: str,
    output_dir: Path | None,
) -> Path:
    """Resolve the package root directory path."""
    base = output_dir if output_dir else repo_root / "execution" / "packages"
    return base / _package_name(ia)


def _create_package_structure(package_root: Path) -> None:
    """Create the package directory and required subdirectories."""
    package_root.mkdir(parents=True, exist_ok=True)
    for subdir in PACKAGE_SUBDIRS:
        (package_root / subdir).mkdir(parents=True, exist_ok=True)


def _copy_artifact(
    src: Path,
    dest_dir: Path,
    dest_name: str | None = None,
) -> Path:
    """Copy a single artifact into the package directory."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / (dest_name or src.name)
    shutil.copy2(src, dest)
    return dest


def _assemble_artifacts(
    package_root: Path,
    repo_root: Path,
    cib_path: Path,
    mandatory: dict[str, str],
    located: dict[str, Path],
) -> list[str]:
    """
    Copy all required artifacts into the package directory.
    Returns list of assembled artifact relative paths (for manifest).
    """
    assembled: list[str] = []

    # CIB
    cib_dest = _copy_artifact(
        cib_path,
        package_root / "governance" / "cib" / "generated",
    )
    assembled.append(str(cib_dest.relative_to(package_root)))

    # Execution Derivation
    ed_path = located["Execution Derivation"]
    if ed_path.exists():
        ed_dest = _copy_artifact(
            ed_path,
            package_root / "governance" / "execution-derivation",
        )
        assembled.append(str(ed_dest.relative_to(package_root)))

    # Implementation Authority artifact
    ia_path = located["Implementation Authority Artifact"]
    if ia_path.exists():
        ia_dest = _copy_artifact(
            ia_path,
            package_root / "governance" / "rmp",
        )
        assembled.append(str(ia_dest.relative_to(package_root)))

    # Synchronization artifacts
    sync_dest_map = {
        "governance/startup/GOVERNANCE-SYNCHRONIZATION-INDEX.md":  "governance/startup",
        "governance/startup/EXECUTION-STARTUP-SYNCHRONIZATION.md": "governance/startup",
        "governance/startup/AUTHORITY-NAMESPACE-RULE-v1.0.md":     "governance/startup",
        "governance/startup/CLAUDE-NAMESPACE-SYNCHRONIZATION.md":  "governance/startup",
        "governance/BASELINE.md":                                   "governance",
        "governance/execution/EXECUTION-PIPELINE.md":              "governance/execution",
    }
    for sync_rel, dest_subdir in sync_dest_map.items():
        src = repo_root / sync_rel
        if src.exists():
            dest = _copy_artifact(src, package_root / dest_subdir)
            assembled.append(str(dest.relative_to(package_root)))


    # Implementation Context Manifest — parse, verify, and copy listed files
    icm_path = located.get("Implementation Context Manifest")
    if icm_path and icm_path.exists():
        icm_text = icm_path.read_text(encoding="utf-8")

        # Copy the ICM itself into governance/icm/generated/
        icm_dest = _copy_artifact(
            icm_path,
            package_root / "governance" / "icm" / "generated",
        )
        assembled.append(str(icm_dest.relative_to(package_root)))

        # Parse Implementation Context section — collect file paths
        # Pattern: lines between "Implementation Context" heading and next heading or EOF
        context_files: list[str] = []
        in_section = False
        for line in icm_text.splitlines():
            stripped = line.strip()
            heading = stripped.lstrip("#").strip()

            if heading == "Implementation Context":
                in_section = True
                continue
            if in_section:
                # End of Implementation Context:
                # - horizontal rule
                # - Builder Rule section
                # - any subsequent section heading (non-file line followed by blank line)
                if (
                    stripped.startswith("---")
                    or stripped.startswith("Builder Rule")
                    or (
                        stripped
                        and "/" not in stripped
                        and not stripped.startswith("#")
                        and not stripped.startswith("-")
                    )
                ):
                    break

                if (
                    stripped
                    and "/" in stripped
                    and not stripped.startswith("#")
                ):
                    context_files.append(stripped)

        # Verify, copy, and record each listed file
        ic_dest_root = package_root / "implementation-context"
        for rel_file in context_files:
            src_file = repo_root / rel_file
            if not src_file.exists():
                fail(
                    f"Implementation Context file not found: {rel_file}\n\n"
                    f"Every file listed in the ICM must exist in the repository.",
                    EXIT_MISSING_ARTIFACT,
                )
            # Preserve repository-relative directory structure
            dest_file = ic_dest_root / rel_file
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            assembled.append(str(dest_file.relative_to(package_root)))

    return assembled


def _generate_start_here(
    package_root: Path,
    mandatory: dict[str, str],
    optional: dict[str, str | None],
    generated_at: str,
) -> Path:
    """Generate START-HERE.md in the package root."""
    ia     = mandatory["Implementation Authority"]
    repo   = mandatory["Repository"]
    surface = mandatory["Production Surface"]
    stream = optional.get("Authority Stream") or "—"

    content = f"""# Claude Package

Implementation Authority

{ia}

Repository

{repo}

Authority Stream

{stream}

Production Surface

{surface}

--------------------------------------------------

Package Is the Contract (PIC)

This package is the complete implementation contract.

Claude SHALL consume this package as the sole authoritative implementation contract.

Execution SHALL synchronize using the governance artifacts contained within this package.

--------------------------------------------------

Package Generated

{generated_at}

--------------------------------------------------

Execution

Synchronize all governance artifacts in this package before proceeding.

Begin with the Claude Instruction Brief in governance/cib/generated/.
"""
    dest = package_root / "START-HERE.md"
    dest.write_text(content, encoding="utf-8")
    return dest


def _generate_manifest(
    package_root: Path,
    mandatory: dict[str, str],
    assembled: list[str],
    generated_at: str,
) -> Path:
    """Generate PACKAGE-MANIFEST.md in the package root."""
    ia      = mandatory["Implementation Authority"]
    repo    = mandatory["Repository"]
    surface = mandatory["Production Surface"]

    lines = [
        "# Package Manifest",
        "",
        "Implementation Authority",
        "",
        ia,
        "",
        "Repository",
        "",
        repo,
        "",
        "Production Surface",
        "",
        surface,
        "",
        "--------------------------------------------------",
        "",
        "Generated",
        "",
        generated_at,
        "",
        "--------------------------------------------------",
        "",
        "Artifacts",
        "",
    ]
    for artifact in sorted(assembled):
        lines.append(f"- {artifact}")

    lines += [
        "",
        "--------------------------------------------------",
        "",
        f"Total Artifacts: {len(assembled)}",
        "",
    ]

    dest = package_root / "PACKAGE-MANIFEST.md"
    dest.write_text("\n".join(lines), encoding="utf-8")
    return dest


def _verify_package(
    package_root: Path,
    assembled: list[str],
) -> list[str]:
    """
    Verify package integrity after assembly.
    Returns list of missing artifacts (empty = intact).
    """
    missing: list[str] = []

    # START-HERE.md and PACKAGE-MANIFEST.md must exist
    for required in ["START-HERE.md", "PACKAGE-MANIFEST.md"]:
        if not (package_root / required).exists():
            missing.append(required)

    # All assembled artifacts must exist on disk
    for rel in assembled:
        if not (package_root / rel).exists():
            missing.append(rel)

    return missing


def emit_package_summary(
    package_root: Path,
    assembled: list[str],
) -> None:
    print("Package Materialization")
    print("-" * 40)
    print(f"  Package: {package_root}")
    print(f"  START-HERE.md: {'✓' if (package_root / 'START-HERE.md').exists() else '✗'}")
    print(f"  PACKAGE-MANIFEST.md: {'✓' if (package_root / 'PACKAGE-MANIFEST.md').exists() else '✗'}")
    print(f"  Artifacts assembled: {len(assembled)}")
    for rel in sorted(assembled):
        status = "✓" if (package_root / rel).exists() else "✗"
        print(f"    {status}  {rel}")
    print()



# ── Package finalization (Sprint 4) ──────────────────────────

def _archive_package(package_root: Path) -> Path:
    """
    Create a deterministic ZIP archive of the materialized package.

    Archive is placed as a sibling of the package root directory.
    Filename: {package-root-name}.zip
    Overwrites any previously generated archive.
    File ordering inside archive is deterministic (sorted by relative path).
    """
    zip_path = package_root.parent / f"{package_root.name}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in sorted(package_root.rglob("*")):
            if file_path.is_file():
                arcname = file_path.relative_to(package_root.parent)
                zf.write(file_path, arcname)
    return zip_path


def _sha256_file(path: Path) -> str:
    """Compute SHA256 digest of a file. Returns lowercase hex string."""
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _write_sha256(zip_path: Path, digest: str) -> Path:
    """
    Write a SHA256 digest file alongside the ZIP archive.
    Format: {digest}  {filename}
    Filename: {zip_name}.sha256
    """
    sha256_path = zip_path.with_suffix(".zip.sha256")
    sha256_path.write_text(f"{digest}  {zip_path.name}\n", encoding="utf-8")
    return sha256_path


def _verify_archive(zip_path: Path, expected_digest: str) -> bool:
    """
    Verify archive integrity by recomputing SHA256 and comparing to expected.
    Returns True if digest matches.
    """
    actual = _sha256_file(zip_path)
    return actual == expected_digest


def emit_finalization_summary(
    zip_path: Path,
    sha256_path: Path,
    digest: str,
    zip_size: int,
) -> None:
    print("Package Finalization")
    print("-" * 40)
    print(f"  Archive:  {zip_path}")
    print(f"  Size:     {zip_size:,} bytes")
    print(f"  SHA256:   {digest}")
    print(f"  Digest:   {sha256_path}")
    print()


# ── Main ───────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Namespace-independent Claude Package Builder"
    )
    parser.add_argument(
        "cib",
        help="Path to Claude Instruction Brief",
    )
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repository root directory (default: current directory)",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Output directory for package (default: <repo-root>/execution/packages/)",
    )

    args = parser.parse_args()
    cib_path  = Path(args.cib)
    repo_root = Path(args.repo_root).resolve()
    output_dir = Path(args.output_dir).resolve() if args.output_dir else None

    _banner("Claude Package Builder")
    print(f"CIB: {cib_path}")
    print(f"Sprint: 5 — Implementation Context Manifest (ICM)")
    print(f"Repository Root: {repo_root}")

    # ── Sprint 1: CIB validation ───────────────────────────────
    if not cib_path.exists():
        fail(f"CIB not found: {cib_path}", EXIT_MISSING_ARTIFACT)

    try:
        cib_text = cib_path.read_text(encoding="utf-8")
    except OSError as exc:
        fail(f"CIB unreadable: {exc}", EXIT_MISSING_ARTIFACT)

    print()
    print("PASS: CIB exists and is readable")

    raw_fields = extract_cib_fields(cib_text)
    mandatory  = validate_mandatory_fields(raw_fields)
    optional   = {f: get_optional(raw_fields, f) for f in OPTIONAL_FIELDS}

    print("PASS: All mandatory fields present and unique")

    emit_cib_metadata(mandatory)

    # ── Sprint 2: Repository Truth consumption ─────────────────
    print("Repository Truth Consumption")
    print("-" * 40)

    located = locate_artifacts(repo_root, mandatory, optional)
    ia_artifact_path = located["Implementation Authority Artifact"]

    present, missing = verify_artifact_existence(located)

    emit_repository_truth(located, present, missing)

    sync_missing = [m for m in missing if m.startswith("Sync:")]
    core_missing = [m for m in missing if not m.startswith("Sync:")]

    if core_missing:
        print("  Core artifact(s) missing:")
        for m in core_missing:
            print(f"    {m}")
        print()
        fail(
            f"Required Repository Truth artifacts not found "
            f"({len(core_missing)} missing). "
            "Verify repository is bootstrapped and artifacts exist.",
            EXIT_REPOSITORY_TRUTH,
        )

    if sync_missing:
        print("  Synchronization artifact(s) not found (warning):")
        for m in sync_missing:
            print(f"    {m}")
        print()

    print("PASS: Core Repository Truth artifacts located")

    violations = verify_authority_consistency(
        repo_root, mandatory, optional, ia_artifact_path
    )

    if violations:
        print()
        print("  Authority consistency violations:")
        for v in violations:
            print(f"    {v}")
        fail(
            f"Authority inconsistency detected ({len(violations)} violation(s)).",
            EXIT_AUTHORITY_INCONSISTENCY,
        )

    print("PASS: Authority consistency verified")

    # ── Sprint 3: Package materialization ─────────────────────
    print()
    print("Package Materialization")
    print("-" * 40)

    ia           = mandatory["Implementation Authority"]
    package_root = _resolve_package_root(repo_root, ia, output_dir)
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    print(f"  Package root: {package_root}")

    # Create directory structure
    _create_package_structure(package_root)
    print("  Directory structure created")

    # Assemble artifacts
    assembled = _assemble_artifacts(
        package_root, repo_root, cib_path, mandatory, located
    )
    print(f"  Artifacts assembled: {len(assembled)}")

    artifact_materialization_service = ArtifactMaterializationService()

    if not artifact_materialization_service.initialize_workspace(package_root):
        fail(
            "Artifact Materialization Service failed to initialize workspace.",
            EXIT_PACKAGE_VERIFICATION,
        )

    # Generate START-HERE.md
    _generate_start_here(package_root, mandatory, optional, generated_at)
    print("  START-HERE.md generated")

    # Generate PACKAGE-MANIFEST.md
    _generate_manifest(package_root, mandatory, assembled, generated_at)
    print("  PACKAGE-MANIFEST.md generated")

    # Verify package integrity
    pkg_missing = _verify_package(package_root, assembled)
    if pkg_missing:
        print()
        print("  Package verification failures:")
        for m in pkg_missing:
            print(f"    ✗  {m}")
        fail(
            f"Package verification failed ({len(pkg_missing)} missing artifacts).",
            EXIT_PACKAGE_VERIFICATION,
        )

    print()
    emit_package_summary(package_root, assembled)

    print("PASS: Package materialized and verified")
    # ── Sprint 4: Package finalization ────────────────────────
    print()
    print("Package Finalization")
    print("-" * 40)

    # Generate ZIP archive
    zip_path = _archive_package(package_root)
    print(f"  Archive generated: {zip_path.name}")

    # Compute SHA256 digest
    digest = _sha256_file(zip_path)

    # Write digest file
    sha256_path = _write_sha256(zip_path, digest)
    print(f"  SHA256 digest written: {sha256_path.name}")

    # Verify archive integrity
    if not _verify_archive(zip_path, digest):
        fail(
            "Archive integrity verification failed: "
            "SHA256 recomputed from archive does not match written digest.",
            EXIT_PACKAGE_VERIFICATION,
        )
    print("  Archive integrity verified")

    zip_size = zip_path.stat().st_size
    print()
    emit_finalization_summary(zip_path, sha256_path, digest, zip_size)

    print("PASS: Package finalized and verified")


    _banner("PASS")


if __name__ == "__main__":
    main()
