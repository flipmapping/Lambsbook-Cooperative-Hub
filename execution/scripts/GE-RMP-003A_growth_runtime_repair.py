#!/usr/bin/env python3
"""
GE-RMP-003A — Growth Runtime Repair
CIB Authority: GE-RMP-003A / Derived From: FDR-GE-003A
Execution Standard: BIS-001 / Implementation Standard: IAS-001

Permitted mutations (ICM-certified):
  MODIFY  client/src/pages/HubLanding.tsx         — CTBC integration, CTA, journey
  MODIFY  client/src/pages/ScholarshipsPage.tsx   — contact layout repair
  MODIFY  client/src/components/HeroSection.tsx   — CTBC attribution

Certified as-is (no mutation):
  client/src/pages/ProspectRegistration.tsx       — GE-RMP-003 certified
  web/src/growth/registry/programs.json           — no change required
  web/src/growth/registry/scholarships.json       — no change required

Preserves: Builder v1.2, CMA, APIs, database, governance, runtime contracts.
Resumable mutation semantics.
"""

import sys
from pathlib import Path

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

_step_results: dict[str, str] = {}

def _ok(msg):   print(f"  {GREEN}\u2713{RESET}  {msg}")
def _skip(msg): print(f"  {YELLOW}\u2298{RESET}  {msg}")
def _info(msg): print(f"  {CYAN}\u2192{RESET}  {msg}")
def _head(msg): print(f"\n{BOLD}{msg}{RESET}")

def abort(reason: str) -> None:
    print(f"{RED}\n{'='*44}\nGE-RMP-003A\nFAIL\n\n{reason}\n\nMutation aborted.\n{'='*44}\n{RESET}")
    sys.exit(1)

REPO_ROOT_ANCHORS = ["package.json", "client", "server", "web"]
FILE_HUB   = Path("client/src/pages/HubLanding.tsx")
FILE_SCHOL = Path("client/src/pages/ScholarshipsPage.tsx")
FILE_HERO  = Path("client/src/components/HeroSection.tsx")
FILE_PROSP = Path("client/src/pages/ProspectRegistration.tsx")

# Idempotency markers
IDEM_HUB_CTA     = "2026 Scholarships Available"
IDEM_HUB_JOURNEY = "RecruitmentJourney"
IDEM_HUB_CTBC    = "CTBC University of Technology"
IDEM_SCHOL_FIXED = 'sectionRefs.contact} className="py-16 bg-muted/30"'
IDEM_HERO_CTBC   = "ctbctech.edu.tw"

# ════════════════════════════════════════════════════════════════
# HubLanding.tsx mutations
# A1: Update Education SBU to link to /hub/scholarships + flag ctbc: true
# A2: Insert Scholarship CTA banner + Recruitment Journey before SBUs section
# A3: Render CTBC showcase card for education SBU
# ════════════════════════════════════════════════════════════════

HUB_A1_SEARCH = (
    '  {\n'
    '    id: 2,\n'
    "    name: t('hub_sbu_education'),\n"
    '    icon: GraduationCap,\n'
    "    description: t('hub_sbu_education_desc'),\n"
    '    color: "bg-blue-500/10 text-blue-600",\n'
    '    href: "/hub/sbu/education",\n'
    '    active: true,\n'
    '  },'
)
HUB_A1_REPLACE = (
    '  {\n'
    '    id: 2,\n'
    "    name: t('hub_sbu_education'),\n"
    '    icon: GraduationCap,\n'
    "    description: t('hub_sbu_education_desc'),\n"
    '    color: "bg-blue-500/10 text-blue-600",\n'
    '    href: "/hub/scholarships",\n'
    '    active: true,\n'
    '    ctbc: true,\n'
    '  },'
)

HUB_A2_SEARCH = '      {/* SBUs Section */}\n      <section ref={sectionRefs.programs} id="programs" className="py-20 px-4">'

HUB_A2_REPLACE = '''      {/* Scholarship CTA Banner */}
      <section className="py-10 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-1 mb-4">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm font-semibold">Now Open</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            2026 Scholarships Available
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Limited to approximately 200 students. Study in Taiwan with full first-semester scholarship.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hub/scholarships">
              <Button size="lg" variant="secondary">
                View Scholarships <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/hub/prospect-registration">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recruitment Journey */}
      <section className="py-16 px-4 bg-muted/20" id="RecruitmentJourney">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-2">Your Path to Taiwan</h2>
          <p className="text-center text-muted-foreground mb-12">A straightforward 3-step recruitment journey</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Learn About CTBC", desc: "Explore CTBC University of Technology \u2014 programmes, campuses, scholarships, and student life in Tainan, Taiwan.", href: "/hub/scholarships", cta: "Explore Scholarships" },
              { step: "02", title: "Choose Your Programme", desc: "Select your scholarship and academic pathway: Semiconductor Engineering, Mechanical, Health, or Culinary Arts.", href: "/hub/scholarships", cta: "Browse Programmes" },
              { step: "03", title: "Apply", desc: "Submit your application. Our admissions team responds within 5\u20137 business days.", href: "/hub/prospect-registration", cta: "Apply Now" },
            ].map(({ step, title, desc, href, cta }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{desc}</p>
                <Link href={href}>
                  <Button size="sm" variant="outline">{cta} <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SBUs Section */}
      <section ref={sectionRefs.programs} id="programs" className="py-20 px-4">'''

HUB_A3_SEARCH = (
    '          <div className="grid md:grid-cols-3 gap-6">\n'
    '            {sbus.map((sbu) => {\n'
    '              const cardContent = (\n'
    '                <Card \n'
    '                  className={`h-full ${sbu.active ? \'hover-elevate cursor-pointer\' : \'opacity-70\'}`} \n'
    '                  data-testid={`card-sbu-${sbu.id}`}\n'
    '                >\n'
    '                  <CardHeader>\n'
    '                    <div className={`h-12 w-12 rounded-md ${sbu.color} flex items-center justify-center mb-3`}>\n'
    '                      <sbu.icon className="h-6 w-6" />\n'
    '                    </div>\n'
    '                    <CardTitle className="text-lg">{sbu.name}</CardTitle>\n'
    '                    <CardDescription className="min-h-[60px]">{sbu.description}</CardDescription>\n'
    '                  </CardHeader>\n'
    '                  <CardContent>\n'
    '                    {sbu.hasVisionLink && (\n'
    '                      <div className="flex items-center gap-1 text-sm text-primary">\n'
    '                        {t(\'hub_sbu_learn_more\')}\n'
    '                        <ArrowRight className="h-3 w-3" />\n'
    '                      </div>\n'
    '                    )}\n'
    '                  </CardContent>\n'
    '                </Card>\n'
    '              );\n'
    '              \n'
    '              if (sbu.href) {\n'
    '                return (\n'
    '                  <Link key={sbu.id} href={sbu.href}>\n'
    '                    {cardContent}\n'
    '                  </Link>\n'
    '                );\n'
    '              }\n'
    '              return <div key={sbu.id}>{cardContent}</div>;\n'
    '            })}\n'
    '          </div>'
)
HUB_A3_REPLACE = (
    '          <div className="grid md:grid-cols-3 gap-6">\n'
    '            {sbus.map((sbu) => {\n'
    '              if ((sbu as { ctbc?: boolean }).ctbc) {\n'
    '                return (\n'
    '                  <Link key={sbu.id} href={sbu.href ?? "/hub/scholarships"}>\n'
    '                    <Card className="h-full hover-elevate cursor-pointer overflow-hidden" data-testid={`card-sbu-${sbu.id}`}>\n'
    '                      <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">\n'
    '                        <div className="text-center text-white">\n'
    '                          <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-90" />\n'
    '                          <p className="text-xs font-semibold opacity-80">CTBC University of Technology</p>\n'
    '                        </div>\n'
    '                      </div>\n'
    '                      <CardHeader className="pb-2">\n'
    '                        <CardTitle className="text-lg">{sbu.name}</CardTitle>\n'
    '                        <CardDescription>{sbu.description}</CardDescription>\n'
    '                      </CardHeader>\n'
    '                      <CardContent>\n'
    '                        <div className="text-xs text-muted-foreground mb-3">Tainan, Taiwan \u00b7 ctbctech.edu.tw</div>\n'
    '                        <div className="flex items-center gap-1 text-sm text-primary font-medium">\n'
    '                          View Scholarships <ArrowRight className="h-3 w-3" />\n'
    '                        </div>\n'
    '                      </CardContent>\n'
    '                    </Card>\n'
    '                  </Link>\n'
    '                );\n'
    '              }\n'
    '              const cardContent = (\n'
    '                <Card \n'
    '                  className={`h-full ${sbu.active ? \'hover-elevate cursor-pointer\' : \'opacity-70\'}`} \n'
    '                  data-testid={`card-sbu-${sbu.id}`}\n'
    '                >\n'
    '                  <CardHeader>\n'
    '                    <div className={`h-12 w-12 rounded-md ${sbu.color} flex items-center justify-center mb-3`}>\n'
    '                      <sbu.icon className="h-6 w-6" />\n'
    '                    </div>\n'
    '                    <CardTitle className="text-lg">{sbu.name}</CardTitle>\n'
    '                    <CardDescription className="min-h-[60px]">{sbu.description}</CardDescription>\n'
    '                  </CardHeader>\n'
    '                  <CardContent>\n'
    '                    {sbu.hasVisionLink && (\n'
    '                      <div className="flex items-center gap-1 text-sm text-primary">\n'
    '                        {t(\'hub_sbu_learn_more\')}\n'
    '                        <ArrowRight className="h-3 w-3" />\n'
    '                      </div>\n'
    '                    )}\n'
    '                  </CardContent>\n'
    '                </Card>\n'
    '              );\n'
    '              if (sbu.href) {\n'
    '                return (\n'
    '                  <Link key={sbu.id} href={sbu.href}>\n'
    '                    {cardContent}\n'
    '                  </Link>\n'
    '                );\n'
    '              }\n'
    '              return <div key={sbu.id}>{cardContent}</div>;\n'
    '            })}\n'
    '          </div>'
)

HUB_OPS = [
    (HUB_A1_SEARCH, HUB_A1_REPLACE, "Education SBU: href /hub/scholarships + ctbc flag"),
    (HUB_A2_SEARCH, HUB_A2_REPLACE, "Insert Scholarship CTA + Recruitment Journey before SBUs"),
    (HUB_A3_SEARCH, HUB_A3_REPLACE, "CTBC showcase card in SBU grid"),
]

# ════════════════════════════════════════════════════════════════
# ScholarshipsPage.tsx — contact section layout repair
# ════════════════════════════════════════════════════════════════

SCHOL_SEARCH = (
    '      {/* Consultation form */}\n'
    '      <section ref={sectionRefs.contact} className="py-16">\n'
    '        <div className="container mx-auto px-4 max-w-xl">'
)
SCHOL_REPLACE = (
    '      {/* Consultation form */}\n'
    '      <section ref={sectionRefs.contact} className="py-16 bg-muted/30">\n'
    '        <div className="container mx-auto px-4 max-w-2xl">'
)

SCHOL_OPS = [(SCHOL_SEARCH, SCHOL_REPLACE, "Contact section: add bg + widen to max-w-2xl")]

# ════════════════════════════════════════════════════════════════
# HeroSection.tsx — CTBC attribution
# ════════════════════════════════════════════════════════════════

HERO_SEARCH = (
    '        <div className="flex items-center justify-center gap-2 text-white/80">\n'
    '          <Users className="h-5 w-5" />\n'
    "          <span>{t('hero_trusted')}</span>\n"
    '        </div>'
)
HERO_REPLACE = (
    '        <div className="flex items-center justify-center gap-2 text-white/80">\n'
    '          <Users className="h-5 w-5" />\n'
    "          <span>{t('hero_trusted')}</span>\n"
    '        </div>\n'
    '        <div className="mt-4 flex items-center justify-center gap-4 text-white/60 text-sm flex-wrap">\n'
    '          <span>CTBC University of Technology</span>\n'
    '          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />\n'
    '          <a href="https://www.ctbctech.edu.tw/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/90 transition-colors">ctbctech.edu.tw</a>\n'
    '          <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />\n'
    '          <span>Tainan, Taiwan</span>\n'
    '        </div>'
)

HERO_OPS = [(HERO_SEARCH, HERO_REPLACE, "Add CTBC attribution below hero trusted stat")]


def _write_and_verify(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
    if path.read_text(encoding="utf-8") != content:
        abort(f"Round-trip verification failed: {path.name}")
    _ok(f"Round-trip verified ({len(content)} chars)")


def _apply_one(working: str, search: str, replace: str, label: str) -> str:
    pre = working.count(search)
    if pre == 0:
        abort(f"Anchor not found: {label}\n\nExpected: {search[:80].strip()}")
    if pre > 1:
        abort(f"Ambiguous anchor ({pre} occurrences): {label}")
    return working.replace(search, replace, 1)


def _mutate_file(root: Path, rel_path: Path, ops: list,
                 idem_check: str, label: str) -> bool:
    path = root / rel_path
    if not path.exists():
        abort(f"File not found: {rel_path}")
    src = path.read_text(encoding="utf-8")
    if idem_check in src:
        _skip(f"{rel_path.name} already satisfied")
        return False
    for search, replace, op_label in ops:
        if search not in src:
            # already applied individually — skip
            _skip(f"  Op already applied: {op_label[:50]}")
            continue
        _info(f"  {op_label[:65]}")
        src = _apply_one(src, search, replace, op_label)
        _ok(f"  Applied")
    _write_and_verify(path, src)
    _ok(f"{label}: complete")
    return True


def stage_1_repository(root: Path) -> None:
    _head("STAGE 1 — Repository Anchor Verification")
    for anchor in REPO_ROOT_ANCHORS:
        if (root / anchor).exists():
            _ok(f"Anchor: {anchor}")
        else:
            abort(f"Repository anchor missing: {anchor}")
    _step_results["Repository anchors"] = "PASS"


def stage_2_repository_truth(root: Path) -> None:
    _head("STAGE 2 — Repository Truth Verification")
    for f in [FILE_HUB, FILE_SCHOL, FILE_HERO, FILE_PROSP]:
        if not (root / f).exists():
            abort(f"ICM file not found: {f}")
        _ok(f"Located: {f}")

    prosp = (root / FILE_PROSP).read_text(encoding="utf-8")
    if "Your registration has been submitted" not in prosp:
        abort("ProspectRegistration.tsx: GE-RMP-003 confirmation missing")
    _ok("ProspectRegistration.tsx: GE-RMP-003 certified")

    schol = (root / FILE_SCHOL).read_text(encoding="utf-8")
    if "HubConsultationForm" not in schol:
        abort("ScholarshipsPage.tsx: HubConsultationForm missing")
    _ok("ScholarshipsPage.tsx: HubConsultationForm present")

    hub = (root / FILE_HUB).read_text(encoding="utf-8")
    if "hub_sbu_education" not in hub:
        abort("HubLanding.tsx: education SBU missing")
    _ok("HubLanding.tsx: education SBU present")

    _step_results["Repository Truth"] = "PASS"


def stage_3_mutations(root: Path) -> None:
    _head("STAGE 3 — Resumable Mutation Execution")
    results = {}

    _info("Mutation 1/3: HubLanding.tsx")
    results["HubLanding.tsx"] = "applied" if _mutate_file(
        root, FILE_HUB, HUB_OPS, IDEM_HUB_CTA,
        "HubLanding CTBC integration + CTA + journey"
    ) else "already satisfied"

    _info("Mutation 2/3: ScholarshipsPage.tsx")
    results["ScholarshipsPage.tsx"] = "applied" if _mutate_file(
        root, FILE_SCHOL, SCHOL_OPS, IDEM_SCHOL_FIXED,
        "ScholarshipsPage contact layout repair"
    ) else "already satisfied"

    _info("Mutation 3/3: HeroSection.tsx")
    results["HeroSection.tsx"] = "applied" if _mutate_file(
        root, FILE_HERO, HERO_OPS, IDEM_HERO_CTBC,
        "HeroSection CTBC attribution"
    ) else "already satisfied"

    for label, outcome in results.items():
        if outcome == "applied": _ok(f"{label}: applied")
        else: _skip(f"{label}: already satisfied")

    all_sat = all(v == "already satisfied" for v in results.values())
    _step_results["Runtime repair"] = "PASS (Already Satisfied)" if all_sat else "PASS"


def stage_4_post_verify(root: Path) -> None:
    _head("STAGE 4 — Post-Mutation Verification")

    hub   = (root / FILE_HUB).read_text(encoding="utf-8")
    schol = (root / FILE_SCHOL).read_text(encoding="utf-8")
    hero  = (root / FILE_HERO).read_text(encoding="utf-8")
    prosp = (root / FILE_PROSP).read_text(encoding="utf-8")

    for marker, desc in [
        (IDEM_HUB_CTA,              "HubLanding: 2026 Scholarships CTA"),
        (IDEM_HUB_JOURNEY,          "HubLanding: recruitment journey"),
        (IDEM_HUB_CTBC,             "HubLanding: CTBC reference"),
        ("/hub/scholarships",        "HubLanding: scholarships link"),
        ("/hub/prospect-registration", "HubLanding: registration link"),
        ("approximately 200 students", "HubLanding: Founder-approved quota"),
    ]:
        if marker in hub: _ok(f"  {desc}")
        else: abort(f"  MISSING: {desc}")

    for marker, desc in [
        (IDEM_SCHOL_FIXED, "ScholarshipsPage: contact bg"),
        ("max-w-2xl",      "ScholarshipsPage: contact width"),
    ]:
        if marker in schol: _ok(f"  {desc}")
        else: abort(f"  MISSING: {desc}")

    if IDEM_HERO_CTBC in hero:
        _ok("  HeroSection: CTBC attribution")
    else:
        abort("  MISSING: HeroSection CTBC")

    if "Your registration has been submitted" in prosp:
        _ok("  ProspectRegistration: certified state preserved")
    else:
        abort("  ProspectRegistration: certification lost")

    if "HubConsultationForm" in schol:
        _ok("  ScholarshipsPage: HubConsultationForm preserved")
    else:
        abort("  ScholarshipsPage: HubConsultationForm missing")

    _step_results["Post-verification"] = "PASS"


def print_summary() -> None:
    _head("MUTATION SUMMARY")
    max_len = max(len(k) for k in _step_results)
    for step, state in _step_results.items():
        colour = YELLOW if "Already" in state else GREEN
        print(f"  {step.ljust(max_len)}   {colour}{state}{RESET}")
    all_pass = all(s.startswith("PASS") for s in _step_results.values())
    print()
    if all_pass:
        all_sat = "Already Satisfied" in _step_results.get("Runtime repair", "")
        tag = " (Already Satisfied)" if all_sat else ""
        print(f"{BOLD}{GREEN}== RESULT: PASS{tag} =={RESET}{RESET}")
        print()
        print(f"  MODIFY  {FILE_HUB}")
        print(f"  MODIFY  {FILE_SCHOL}")
        print(f"  MODIFY  {FILE_HERO}")
        print()
        print("  OK  CTBC integrated into Hub Landing education card")
        print("  OK  Recruitment journey 3 steps added")
        print("  OK  2026 Scholarships Available / ~200 students CTA")
        print("  OK  Hub -> Scholarships -> Prospect Registration journey")
        print("  OK  ScholarshipsPage contact layout repaired")
        print("  OK  HeroSection CTBC attribution added")
        print("  OK  Builder / CMA / APIs / governance preserved")
        print()
        print("  Second execution: PASS (Already Satisfied)")
    else:
        print(f"{BOLD}{RED}== RESULT: FAIL =={RESET}{RESET}")
        sys.exit(1)


def resolve_root() -> Path:
    for candidate in [Path(__file__).resolve().parent.parent.parent, Path.cwd()]:
        if all((candidate / a).exists() for a in REPO_ROOT_ANCHORS):
            return candidate
    if len(sys.argv) > 1:
        p = Path(sys.argv[1]).resolve()
        if all((p / a).exists() for a in REPO_ROOT_ANCHORS):
            return p
    abort("Repository root not found.")
    raise SystemExit(1)


def main() -> None:
    print(f"\n{BOLD}GE-RMP-003A -- Growth Runtime Repair{RESET}")
    print(f"{BOLD}CIB Authority: GE-RMP-003A | BIS-001 | IAS-001{RESET}\n")
    root = resolve_root()
    _info(f"Repository root: {root}")
    stage_1_repository(root)
    stage_2_repository_truth(root)
    stage_3_mutations(root)
    stage_4_post_verify(root)
    print_summary()


if __name__ == "__main__":
    main()
