#!/usr/bin/env python3

from __future__ import annotations

import os
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

if sys.version_info[:2] != (3, 11):
    raise SystemExit("Python 3.11.x required.")

root = Path.cwd()

if not (root / ".git").exists():
    raise SystemExit("Repository root not found.")

target = root / "client/src/pages/HubAuth.tsx"

text = target.read_text(encoding="utf-8")

if text.count("onSuccess: async (result) => {") != 1:
    raise SystemExit("Unexpected onSuccess anchor.")

if "await postAuthenticationContinuation(" in text:
    raise SystemExit("Continuation already inserted.")

anchor = """localStorage.setItem(
"supabase.auth.token",
JSON.stringify(result.session),
);
setLocation("/hub/dashboard");"""

if text.count(anchor) != 2:
    raise SystemExit(
        f"Expected 2 success-path anchors, found {text.count(anchor)}."
    )

replacement = """localStorage.setItem(
"supabase.auth.token",
JSON.stringify(result.session),
);

const prepared =
_prepareContinuationValues({
accessToken: result.session.access_token,
refreshToken: result.session.refresh_token,
inviteToken:
localStorage.getItem(
"gateway.invite.token",
) ?? undefined,
});

const continuationContext =
_buildContinuationContext(
prepared,
mode,
);

await postAuthenticationContinuation(
continuationContext,
);

setLocation("/hub/dashboard");"""

text = text.replace(anchor, replacement, 2)

with NamedTemporaryFile(
    "w",
    encoding="utf-8",
    delete=False,
    dir=str(target.parent),
) as tmp:
    tmp.write(text)
    temp = tmp.name

os.replace(temp, target)

print("[OK] HubAuth continuation inserted into both success paths.")