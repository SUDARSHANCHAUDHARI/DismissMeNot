# DismissMeNot

DismissMeNot is a playful, dependency-free web experience about a desktop notification that takes dismissal personally. Every close attempt triggers a random refusal until attempt 10, when the notification finally leaves with one last message:

> Thank you for your patience.

The project is built with semantic HTML, hand-written CSS, and vanilla JavaScript. It has no framework, runtime dependencies, analytics, cookies, backend, database, remote assets, or network API calls.

## Table of Contents

- [Project status](#project-status)
- [Features](#features)
- [Refusal behaviors](#refusal-behaviors)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Controls](#controls)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Accessibility](#accessibility)
- [Privacy and security](#privacy-and-security)
- [Testing and verification](#testing-and-verification)
- [Customization](#customization)
- [Deployment](#deployment)
- [Browser support](#browser-support)
- [Versioning and releases](#versioning-and-releases)
- [Support and contributions](#support-and-contributions)
- [License](#license)
- [About](#about)

## Project status

| Item | Status |
| --- | --- |
| Current version | `1.0.0` |
| Source readiness | Production-ready static application |
| Repository visibility | Private |
| Public deployment | Not deployed |
| Runtime dependencies | None |
| License | MIT |

The source remains private until SudarshanTechLabs explicitly approves a public deployment or repository visibility change.

## Features

- A responsive fake desktop containing a deliberately persistent notification
- A global dismissal counter and visible progress meter
- Ten randomized refusal behaviors with immediate-repeat protection
- Peaceful dismissal on the tenth attempt
- Cascading notification stacks capped at four reachable cards
- Short, funny messages that change with the notification state
- Generated Web Audio sound cues with an accessible sound control
- Complete reset without reloading the page
- Mouse, touch, keyboard, and screen-reader support
- Focus restoration after cards move, split, disappear, or return
- A keyboard-contained, accessible confirmation dialog
- Responsive layouts for narrow phones through large desktop screens
- Reduced-motion and forced-color support
- A restrictive baseline Content Security Policy and no-referrer policy
- Dependency-free Node tests for behavior and repository contracts

## Refusal behaviors

Attempts 1–9 randomly select one of these behaviors. Attempt 10 always completes the experience instead.

| # | Behavior |
| --- | --- |
| 1 | Move to another corner |
| 2 | Return with a new message |
| 3 | Split into two notifications |
| 4 | Hide behind the pointer |
| 5 | Shrink and grow back |
| 6 | Move the close button |
| 7 | Ask “Why are you closing me?” |
| 8 | Show a fake confirmation dialog |
| 9 | Close and immediately return |
| 10 | Dismiss the desktop instead |

The selector excludes the immediately previous behavior so consecutive attempts remain distinct. Because selection is random, one playthrough may not show every refusal.

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Styling | CSS custom properties, responsive media queries, transitions, and keyframes |
| Interaction | Vanilla JavaScript and native DOM APIs |
| Sound | Browser Web Audio API with locally generated oscillators |
| Accessibility | Native controls, ARIA relationships, live status updates, and focus management |
| App metadata | SVG favicon and web app manifest |
| Tests | Node.js built-in test runner |
| Local server | Python built-in HTTP server |

No package installation or build step is required.

## Getting started

### Prerequisites

- A current version of Chrome, Edge, Firefox, or Safari
- Node.js 18 or newer for verification
- pnpm 10.28.2 for the documented project commands
- Python 3 for the optional local HTTP server
- An authenticated GitHub account with repository access while the project remains private

### Clone the repository

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/DismissMeNot.git
cd DismissMeNot
```

### Run locally

Start the included static server:

```bash
pnpm start
```

Then visit [http://localhost:4173](http://localhost:4173).

You can also open `index.html` directly in a browser. The HTTP server is recommended because it more closely matches production hosting behavior.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Serve the project at `http://localhost:4173` |
| `pnpm test` | Run all dependency-free Node tests |
| `pnpm check` | Validate JavaScript syntax and run every test |

## Controls

| Input | Action |
| --- | --- |
| Click or tap the `×` | Attempt to dismiss that notification |
| `Tab` / `Shift + Tab` | Move between available controls |
| `Enter` or `Space` | Activate the focused control |
| `Escape` | Attempt to dismiss the active notification |
| `Escape` inside the dialog | Cancel the fake confirmation |
| Sound button | Toggle generated sound cues |
| Reset button | Restore the original notification and zero attempts |

When a behavior moves or replaces an element, focus returns to a valid close button. When the fake confirmation opens, keyboard focus moves into the dialog and remains contained until the dialog closes.

## How it works

`script.js` keeps one small state object containing:

- the global attempt count;
- completion and sound preferences;
- the active corner and previous behavior;
- the notification stack; and
- the current message and close-button position for each card.

A dismissal follows one consistent state transition:

1. Clear unfinished visual timers and restore a stable layout.
2. Increment the shared attempt counter.
3. Complete immediately if the new attempt is number 10.
4. Otherwise select a random refusal that differs from the previous one.
5. Run the behavior, announce the result, and preserve or restore focus.

Split notifications share the same attempt count. Closing any card advances the experience by exactly one attempt.

### Generated sound

Sounds are synthesized at interaction time with the Web Audio API. No audio files are downloaded or stored. Browsers without Web Audio support run silently, and every sound has a visible textual equivalent.

### Motion

Corner changes use CSS transitions, while temporary refusals use short animations. When the operating system requests reduced motion, CSS removes meaningful animation duration and JavaScript shortens related waits.

## Project structure

```text
DismissMeNot/
├── index.html                 Semantic application and fake desktop markup
├── styles.css                Design system, layouts, motion, and media queries
├── script.js                 State, refusal behaviors, sound, and focus logic
├── tests/
│   ├── behavior.test.cjs     Refusal-engine contract tests
│   └── project.test.cjs      Metadata, asset, security, and documentation checks
├── favicon.svg               Scalable notification icon
├── site.webmanifest          Installable-site metadata
├── package.json              Runtime metadata and verification commands
├── AGENTS.md                 Repository instructions for coding agents
├── CHANGELOG.md              User-facing release history
├── SECURITY.md               Private vulnerability-reporting guidance
├── .gitignore                Local, generated, secret, and signing exclusions
├── LICENSE                   MIT license text
└── README.md                 Project documentation
```

## Accessibility

- All actions use native `<button>` elements with at least a 44 × 44 pixel target.
- Every notification has an accessible name tied to its current message.
- Status changes are announced through a polite live region.
- The fake confirmation uses a real `role="dialog"` with `aria-modal="true"`.
- Dialog focus is contained, and closing it restores focus to the originating notification.
- The final thank-you panel receives programmatic focus after successful dismissal.
- Visible keyboard focus remains available, including in forced-color modes.
- Decorative desktop elements are hidden from assistive technology.
- Sound is optional and never carries information that is missing from text.
- `prefers-reduced-motion` collapses movement and transformation effects.

## Privacy and security

DismissMeNot processes everything locally in the browser. It does not collect, store, or transmit personal information.

- No authentication or user accounts
- No backend, database, analytics, cookies, or browser storage
- No third-party scripts, fonts, images, or media
- No runtime network requests
- No user-submitted HTML or dynamic code evaluation
- Locally generated audio only
- Baseline Content Security Policy and no-referrer policy in `index.html`
- Sensitive files, credentials, private keys, and signing material excluded by `.gitignore`

See [SECURITY.md](SECURITY.md) for private vulnerability-reporting instructions.

## Testing and verification

Run the complete dependency-free check:

```bash
pnpm check
```

This command checks JavaScript syntax and runs the Node test suite. The tests verify:

- registration of all ten requested refusal behaviors;
- immediate-repeat protection in random selection;
- peaceful completion at attempt 10;
- valid project and manifest metadata;
- existence of every locally referenced asset;
- accessibility and reduced-motion contracts;
- production security metadata; and
- required repository and author documentation.

### Manual quality checklist

Before public deployment, verify:

1. Pointer, touch, `Enter`, `Space`, and `Escape` can attempt dismissal.
2. Focus remains visible after moving, splitting, returning, or relocating the close button.
3. The dialog contains focus and can be canceled with `Escape`.
4. The sound control updates its label and `aria-pressed` state.
5. Reset restores `0 / 10`, one card, the original message, and the desktop.
6. Attempt 10 removes every notification and shows the exact thank-you message.
7. Narrow and wide viewports keep notification and dialog controls on-screen.
8. Reduced-motion mode removes long movement and transformation effects.
9. Every production asset is served over HTTPS with the expected MIME type.

## Customization

- Edit the design tokens at the top of `styles.css` to change color, type, spacing, or shadows.
- Edit `MESSAGE_POOL` in `script.js` to change the notification copy.
- Edit `BEHAVIOR_KEYS` and `BEHAVIOR_LABELS` together when adding or renaming behavior.
- Change `MAX_ATTEMPTS` to alter the completion boundary, then update the matching HTML progress labels and tests.

## Deployment

DismissMeNot is a static project. Upload the tracked files as-is to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any standard HTTPS web server. No environment variables, dependency installation, or compilation step is required.

The document includes a restrictive baseline Content Security Policy and no-referrer policy. Configure these response headers on the chosen production host where supported:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), geolocation=(), microphone=()
```

Before changing repository visibility or deploying publicly:

1. Run `pnpm check`.
2. Complete the manual quality checklist above.
3. Confirm every asset is served over HTTPS.
4. Add the final canonical URL and social preview image after the deployment URL exists.
5. Review [CHANGELOG.md](CHANGELOG.md).
6. Create a release tag only after explicit approval.

No GitHub Actions workflow is included. Deployment, tagging, and visibility changes remain explicit manual decisions.

## Browser support

DismissMeNot targets current versions of Chrome, Edge, Firefox, and Safari. Older browsers without Web Audio remain fully usable without sound.

## Versioning and releases

User-facing changes are recorded in [CHANGELOG.md](CHANGELOG.md). Versions follow [Semantic Versioning](https://semver.org/), and the changelog follows [Keep a Changelog](https://keepachangelog.com/).

## Support and contributions

DismissMeNot is currently maintained as a private SudarshanTechLabs project. Please discuss substantial changes before opening a pull request. Report suspected security problems privately using [SECURITY.md](SECURITY.md), not through a public issue.

## License

DismissMeNot is available under the [MIT License](LICENSE).

Copyright © 2026 SudarshanTechLabs. Authored and maintained by Sudarshan Chaudhari.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
