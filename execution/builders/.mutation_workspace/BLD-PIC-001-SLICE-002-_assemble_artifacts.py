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