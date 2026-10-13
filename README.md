# DismissMeNot

DismissMeNot is a complete, dependency-free web toy about a desktop notification that takes dismissal personally. Every close attempt triggers a randomly selected refusal until the tenth attempt, when the notification finally leaves and says:

> Thank you for your patience.

The project uses semantic HTML, hand-written CSS, and vanilla JavaScript. It has no runtime dependencies, tracking, cookies, network calls, image downloads, or audio files.

**Status:** production-ready static application. The source repository is intentionally private until SudarshanTechLabs chooses to publish it.

## Features

- A responsive fake desktop with a single persistent notification
- Ten possible refusal behaviors:
  1. Move to another corner
  2. Return with a new message
  3. Split into two notifications
  4. Hide behind the pointer
  5. Shrink and grow back
  6. Move the close button
  7. Ask “Why are you closing me?”
  8. Show a fake confirmation dialog
  9. Close and immediately return
  10. Dismiss the desktop instead
- A visible attempt counter and progress meter
- Peaceful dismissal on attempt 10
- Cascading notification stacks, capped at four cards so controls stay usable
- Locally generated Web Audio cues with an on/off control
- Complete reset without reloading the page
- Mouse, touch, keyboard, and screen-reader support
- Focus restoration after every prank and focus trapping inside the dialog
- Responsive layouts for narrow phones through large desktop screens
- `prefers-reduced-motion` and forced-colors support
- Small Node tests for the behavior contract and completion boundary

## Run locally

No installation or build is required. You can open `index.html` directly in a modern browser.

For a local HTTP server, run:

```bash
pnpm start
```

Then visit [http://localhost:4173](http://localhost:4173).

The `start` script uses Python's built-in HTTP server. If Python is unavailable, any static file server will work.

## Controls

| Input | Action |
| --- | --- |
| Click or tap the `×` | Attempt to dismiss that notification |
| `Tab` / `Shift + Tab` | Move between available controls |
| `Enter` or `Space` | Activate the focused control |
| `Escape` | Attempt to dismiss the active notification |
| `Escape` inside the dialog | Cancel the fake confirmation |
| Sound button | Toggle generated sound cues |
| Reset button | Restore the initial notification and zero attempts |

When a prank moves or replaces an element, focus is returned to a valid close button. When the fake confirmation opens, keyboard focus moves into it and remains trapped until the dialog is closed.

## Project structure

```text
DismissMeNot/
├── index.html                 Semantic app and fake desktop markup
├── styles.css                Visual system, layouts, motion, and media queries
├── script.js                 State, refusal behaviors, sound, and focus logic
├── tests/
│   ├── behavior.test.cjs     Refusal-engine contract tests
│   └── project.test.cjs      Metadata, asset, and accessibility checks
├── favicon.svg               Scalable notification icon
├── site.webmanifest          Installable-site metadata
├── package.json              Local server and verification scripts
├── AGENTS.md                 Repository instructions for coding agents
├── CHANGELOG.md              User-facing release history
├── SECURITY.md               Private vulnerability-reporting guidance
├── .gitignore
├── LICENSE
└── README.md
```

## How it works

`script.js` keeps one small state object containing the attempt count, current corner, sound preference, last behavior, and active notifications. A dismissal follows one consistent flow:

1. Clear unfinished visual timers and restore a stable layout.
2. Increment the attempt counter.
3. Finish immediately if the attempt is number 10.
4. Otherwise choose one of the ten behaviors, excluding the previous behavior.
5. Run the behavior, announce the result, and preserve or restore focus.

The behavior selector is random, so a single run may not show every prank. Immediate repeats are excluded to keep consecutive attempts distinct. Split notifications share the same global attempt count; closing any card advances the experience by one attempt.

### Generated sound

Sounds are synthesized at interaction time with the browser's Web Audio API. No media files are requested. Browsers that do not support Web Audio simply run silently, and the experience never depends on audio.

### Motion

Position changes use CSS transitions so moving between corners feels continuous. Transient behaviors use short animations. If the operating system requests reduced motion, animation and transition durations collapse to nearly zero, and JavaScript shortens any matching wait.

## Accessibility notes

- All actionable elements are native `<button>` controls with at least a 44 × 44 pixel target.
- Each notification has an accessible name tied to its current message.
- Status changes are sent through a polite live region without moving focus unnecessarily.
- The fake confirmation is a real accessible modal dialog even though its result is intentionally silly.
- Dialog focus is contained; dismissing the dialog restores focus to the notification that opened it.
- The final thank-you panel receives programmatic focus after the notification closes.
- Focus indicators remain visible, including in forced-color modes.
- Decorative desktop items are hidden from assistive technology.
- Sound is optional and never carries information that is missing from text.

## Development and verification

Run all dependency-free checks:

```bash
pnpm check
```

Or run the tests alone:

```bash
pnpm test
```

`pnpm check` validates JavaScript syntax and then runs the Node test suite. The tests verify that all ten requested behaviors are registered, random selection cannot immediately repeat a behavior, and the tenth attempt reaches the peaceful completion state.

Node.js 18 or newer is required for the built-in test runner. The project records the verified pnpm version in `package.json`; there are no packages to install.

For a manual quality pass, verify:

1. The notification can be attempted with pointer, touch, `Enter`, `Space`, and `Escape`.
2. Focus remains visible after moving, splitting, returning, or relocating the close button.
3. The dialog traps focus and can be canceled with `Escape`.
4. The sound control changes both its label and `aria-pressed` state.
5. Reset restores `0 / 10`, one card, the original message, and the desktop.
6. Attempt 10 removes every notification and displays the exact thank-you message.
7. A narrow viewport does not push the notification or dialog controls off-screen.
8. Reduced-motion mode removes the long movement and transformation effects.

## Customization

- Color, type, and spacing tokens live at the top of `styles.css`.
- Funny notification copy lives in `MESSAGE_POOL` in `script.js`.
- Refusal behavior names live in `BEHAVIOR_KEYS`; their screen-reader summaries live in `BEHAVIOR_LABELS`.
- Change `MAX_ATTEMPTS` to alter the completion boundary. Update the static `max` and labels in `index.html` as well if you do.

## Deployment

This is a static project. Upload the files as-is to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any standard web server. No environment variables or build step are required.

The document includes a restrictive baseline Content Security Policy and no-referrer policy. On the production host, also configure these response headers where supported:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), geolocation=(), microphone=()
```

Before changing repository visibility or deploying publicly:

1. Run `pnpm check`.
2. Complete the manual keyboard, touch, responsive, and reduced-motion checklist above.
3. Confirm the production host serves every asset over HTTPS.
4. Add the final canonical URL and social preview image once the deployment URL exists.
5. Review `CHANGELOG.md`, then create the release tag only after explicit approval.

No GitHub Actions workflow is included. Deployment and visibility changes remain explicit manual decisions.

## Browser support

DismissMeNot targets current versions of Chrome, Edge, Firefox, and Safari. Older browsers without Web Audio remain fully usable without sound.

## Author

**Sudarshan Chaudhari**

Solo indie developer and founder of **SudarshanTechLabs**, based in Bangkok, Thailand.

- GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
- Developer contact: [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
- Business and legal contact: [sudarshantechlabs@gmail.com](mailto:sudarshantechlabs@gmail.com)

DismissMeNot was designed and developed by Sudarshan Chaudhari under SudarshanTechLabs.

## License

MIT © 2026 SudarshanTechLabs. See [LICENSE](LICENSE).
