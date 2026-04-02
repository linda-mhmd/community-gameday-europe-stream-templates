# Security Policy

## Scope

This is a static frontend project (Remotion compositions + Vite web player). It contains no backend services, no authentication, no databases, and no secrets. It is deployed as a read-only GitHub Pages site.

**In scope:**
- Dependency vulnerabilities in `package.json`
- Supply chain issues (compromised npm packages)
- Sensitive data accidentally committed (API keys, tokens)

**Out of scope:**
- The deployed GitHub Pages site itself (static HTML/JS, no server-side logic)
- Social engineering attacks

## Supported Versions

Only the latest version on `main` is maintained.

## Reporting a Vulnerability

Please do **not** open a public issue for security vulnerabilities.

Report via [GitHub private security advisories](https://github.com/linda-mhmd/community-gameday-europe-stream-templates/security/advisories/new).

We will acknowledge within 48 hours and aim to resolve confirmed vulnerabilities within 5 days.
