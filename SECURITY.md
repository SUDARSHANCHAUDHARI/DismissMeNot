# Security Policy

## Supported version

Security fixes are applied to the current `1.x` release line.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub’s private vulnerability-reporting feature for this repository. If that is unavailable, email `sudarshantechlabs@gmail.com` with:

- the affected file or behavior;
- clear reproduction steps;
- the potential impact; and
- any suggested mitigation.

Do not include real credentials, private keys, personal data, or destructive proof-of-concept payloads. Reports will be acknowledged as soon as practical, and a fix or status update will be shared before any public disclosure.

## Current security posture

DismissMeNot is a static client-only application. It has no authentication, backend, database, user-submitted HTML, remote dependencies, analytics, storage, or network API calls. Generated audio uses the browser’s local Web Audio API and transmits no data.
