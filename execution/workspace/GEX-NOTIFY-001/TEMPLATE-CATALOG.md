# Notification Template Catalog

Each template is uniquely identified by:

(current_stage, preferred_language, channel)

Examples

registered
  ├── en
  │     ├── resend
  │     └── zalo
  ├── vi
  │     ├── resend
  │     └── zalo
  └── zh-TW
        ├── resend
        └── zalo

The Template Resolver SHALL return a single versioned template
for every valid combination.

Notification Generator SHALL NOT contain template selection logic.
