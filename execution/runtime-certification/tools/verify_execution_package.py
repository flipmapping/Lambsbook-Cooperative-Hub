from pathlib import Path
import hashlib
import sys

ROOT = Path.cwd()

EXPECTED = [
    'execution/runtime-certification/launcher.sh',
    'execution/runtime-certification/tools/inspect.py',
    'execution/runtime-certification/tools/mutate.py',
    'execution/runtime-certification/tools/build.py',
    'execution/runtime-certification/tools/certify.py',
]

print('=' * 72)
print('EXECUTION PACKAGE VERIFICATION')
print('=' * 72)
print(f'Repository: {ROOT}')
print()

missing = []

for rel in EXPECTED:
    p = ROOT / rel
    print(rel)
    print(f'  EXISTS : {p.exists()}')
    if p.exists():
        print(f'  SIZE   : {p.stat().st_size}')
        digest = hashlib.sha256(p.read_bytes()).hexdigest()
        print(f'  SHA256 : {digest[:16]}')
    else:
        missing.append(rel)
    print()

print('=' * 72)
print('EXECUTION DIRECTORY')
print('=' * 72)

base = ROOT / 'execution'
if base.exists():
    for item in sorted(base.rglob('*')):
        print(item.relative_to(ROOT))
else:
    print('execution/ directory not found')

print()

if missing:
    print('RESULT : FAIL')
    print('Missing files:')
    for item in missing:
        print(f' - {item}')
    sys.exit(1)

print('RESULT : PASS')
