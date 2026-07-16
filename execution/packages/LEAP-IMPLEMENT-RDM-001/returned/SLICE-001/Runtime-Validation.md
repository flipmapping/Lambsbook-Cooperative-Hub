# Runtime Validation

## Verification Steps

1. Place `CooperativePrinciplesSection.tsx` at:
   `web/src/growth/components/Sections/CooperativePrinciplesSection.tsx`

2. Build:
   ```
   npm run build
   ```

3. Run dev server:
   ```
   npm run dev
   ```

4. Navigate to the growth landing page.

## Expected Rendering

| Element | Expected |
|---|---|
| Section visible on page | ✓ dark background, centred content |
| Header | "Seven Principles. / One continuous path." with eyebrow and sub-copy |
| Cards | 7 cards in responsive grid (1→2→3→4 columns) |
| Step numbers | 01–07 in monospace, per-principle accent colour |
| Principle tags | "Open Doors", "Equal Voice", etc. as pill badges |
| Reveal animation | Cards fade-in from below on scroll into view (staggered 80ms) |
| Card expand | Click or Enter/Space expands full body text + journeyNote |
| Card collapse | Click again collapses |
| Mobile | Single column, all cards readable |
| Keyboard | Tab to each card, Enter/Space to expand, focus ring visible |
| Footer note | ICA attribution line |

## Accessibility
- `role="button"` + `tabIndex={0}` on each card
- `aria-expanded` reflects expand state
- `aria-label` on section
- `focus-visible:ring-2` for keyboard users
- No motion-only state changes (text also reflects state)
