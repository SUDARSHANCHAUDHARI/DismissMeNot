# DismissMeNot Repository Guide

## Project

DismissMeNot is a dependency-free static web application built with semantic HTML, CSS, and vanilla JavaScript. It deliberately has no framework, bundler, remote assets, runtime API, analytics, or persistence.

## Commands

```bash
pnpm start   # Serve the repository at http://localhost:4173
pnpm test    # Run the Node test suite
pnpm check   # Check JavaScript syntax and run every test
```

No installation or build step is required.

## Product contract

- Closing any active notification increments one shared attempt counter.
- Attempts 1–9 randomly select a refusal behavior without immediately repeating the previous behavior.
- Attempt 10 removes all notifications and displays exactly: “Thank you for your patience.”
- Every interaction must remain usable by mouse, touch, keyboard, and screen reader.
- Focus must remain valid after cards move, split, disappear, return, or open the confirmation dialog.
- Sounds must remain optional, locally generated, and non-essential.
- Reduced-motion and forced-color support must remain intact.

## Change rules

- Preserve the zero-dependency architecture unless a concrete requirement makes a dependency necessary.
- Prefer semantic elements and native controls over custom interaction primitives.
- Keep all user-facing behavior covered by focused tests where practical.
- Run `pnpm check` before committing.
- Do not commit environment files, local configuration, generated reports, credentials, keys, or signing material.
- Stage files by explicit path; do not use blanket staging commands.
- Do not create or expand GitHub Actions workflows without Sudarshan’s explicit approval.
- Do not change repository visibility, deploy, tag, or publish a release without explicit approval.
