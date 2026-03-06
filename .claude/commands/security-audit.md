Scan the project for security vulnerabilities — missing headers, XSS risks, unprotected routes, exposed secrets, and dependency CVEs. Generates a prioritized report with specific fixes.

**Pipeline position:** 24/32 — depends on: `/strip-external` (recommended) | feeds into: `/build-admin`

**Usage:** `/security-audit` — runs all security checks

Optionally: `/security-audit <check>` where `$ARGUMENTS` is a specific check: `headers`, `xss`, `auth`, `deps`, `secrets`, `validation`. Omit to run all.

---

## Golden Rule

**No exploitable vulnerabilities. Defense in depth.** Even though this is a clone/demo site, security must be production-grade. An unprotected admin page, an XSS vector in search, or a leaked API key in source code are all real risks.

---

## Prerequisites

- Project source code in `src/`
- `package.json` and `node_modules/` present (for dependency scanning)
- Dev server running at the dev server URL (from `package.json`) for header verification

**Related skills:** The auth gaps found by this audit are fixed by `/build-admin auth` (Section 1: Authentication). Run this audit first, then `/build-admin auth` to implement the fixes.

---

## Checks to Run

### Check 1: Security Headers

Start the dev server and verify HTTP response headers on the homepage:

**Required headers:**
- `Content-Security-Policy` — should restrict script/style/image sources
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-XSS-Protection: 1; mode=block` — legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` — controls referrer info
- `Permissions-Policy` — disables unused browser APIs
- `Strict-Transport-Security` — enforces HTTPS

**Also check:**
- Are headers configured in `next.config.mjs`? Read the `headers()` function.
- Are headers actually sent in responses? (configuration doesn't always mean delivery)
- Is CSP present? If not, generate a recommended CSP based on current asset sources.

### Check 2: XSS Vulnerabilities

Scan source code for potential cross-site scripting vectors:

**Search for:**
- `dangerouslySetInnerHTML` — every usage is a potential XSS vector. Read the context of each and assess risk.
- Search page query rendering — does the search query appear in the page without escaping?
- User input that renders on screen — checkout form fields, search input, any URL parameters
- Template literals in JSX that include external data — `{product.description}` is safe (React escapes), but `{product.htmlDescription}` in dangerouslySetInnerHTML is not

**Test (if dev server running):**
- Navigate to search with XSS payload: `/search?q=<script>alert(1)</script>`
- Check if the script tag appears in rendered HTML (it shouldn't — React escapes by default)

### Check 3: Authentication & Access Control

**Check admin routes:**
- Navigate to `/admin` — does it load without login? (currently yes = CRITICAL)
- `/admin/orders` and `/admin/products` are future routes from `/build-admin` — they do not exist yet. Note their absence rather than testing them. When they are added, they must be protected by auth middleware.
- Check if `src/middleware.ts` exists. **It currently does NOT exist** — there is no auth middleware at all. This is a CRITICAL finding. If the file is found in future, verify it protects `/admin/*` routes (except `/admin/login`).
- Check for any auth context or session management

**Check API routes:**
- List all files in `src/app/api/` — any unprotected endpoints?
- Check if API routes validate authentication tokens
- Check for rate limiting on any POST endpoints

**Check checkout:**
- Is checkout form data sent to any external endpoint?
- Is payment data (card numbers) stored anywhere? (should NEVER be persisted)
- Is order data in localStorage accessible from any page?

### Check 4: Dependency Vulnerabilities

Run npm audit and analyze results:

```bash
npm audit --json
```

**Report:**
- Critical severity: X (must fix)
- High severity: X (should fix)
- Moderate severity: X (review)
- Low severity: X (informational)

For each critical/high:
- Package name and version
- CVE number
- Description of vulnerability
- Fix available? (`npm audit fix` or manual update)

### Check 5: Secrets & Environment

**Check for exposed secrets:**
- Grep `src/` for patterns: API keys, tokens, passwords, connection strings
- Common patterns: `sk-`, `pk_`, `api_key`, `secret`, `password`, `token`, `bearer`
- Check `.env`, `.env.local`, `.env.production` for actual secret values
- Verify `.gitignore` includes `.env.local` and any files containing secrets

**Check git history:**
- Were any secrets ever committed? (`git log --all -p -- .env*`)
- Are there any credentials in the git history that should be rotated?

**Check client-side exposure:**
- Only `NEXT_PUBLIC_*` env vars should be in client bundles
- Non-public env vars must not be in any client component

### Check 6: Input Validation

**Review `src/lib/validation.ts`:**
- Are all form fields validated?
- Is validation applied on the client AND server side?
- Are there any bypass vectors (disabled JS, direct API calls)?

**Check dynamic routes:**
- `src/app/products/[slug]/page.tsx` — is the slug parameter validated?
- `src/app/{section-slug}/[...category]/page.tsx` — is the category parameter validated?
- Can path traversal attacks reach unexpected files? (e.g., `../../../etc/passwd`)

**Check search:**
- Is search input sanitized before use?
- Can the search query cause a regex denial-of-service (ReDoS)?
- Is search output properly escaped?

---

## Output

```
## Security Audit Report

Scan date: [timestamp]
Project: [project name]

### Vulnerability Summary

| Severity | Count | Examples |
|----------|-------|---------|
| CRITICAL | X | Admin pages unprotected, secret in source code |
| HIGH | X | No CSP header, dangerouslySetInnerHTML with user data |
| MEDIUM | X | npm audit findings, missing rate limiting |
| LOW | X | Verbose error messages, outdated deps |
| INFO | X | Recommendations, best practices |

### Check 1: Security Headers

| Header | Status | Value |
|--------|--------|-------|
| Content-Security-Policy | MISSING (HIGH) | — |
| X-Content-Type-Options | OK | nosniff |
| X-Frame-Options | OK | DENY |
| X-XSS-Protection | OK | 1; mode=block |
| Referrer-Policy | OK | strict-origin-when-cross-origin |
| Permissions-Policy | OK | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security | OK | max-age=63072000 |

Recommended CSP (Next.js compatible):
```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';
```
Note: `'unsafe-inline'` is needed for styles only because Tailwind and Next.js inject inline styles. Never use `'unsafe-eval'` — it allows arbitrary code execution. If Next.js dev mode requires it, restrict to development only.

### Check 2: XSS Scan

dangerouslySetInnerHTML usages: X
- [file:line] — [risk assessment: LOW/MEDIUM/HIGH] — [context]

Search XSS test: [PASS: input escaped / FAIL: script rendered]

### Check 3: Auth & Access Control

| Route | Protected | Method |
|-------|-----------|--------|
| /admin | NO (CRITICAL) | No middleware |
| /admin/orders | NOT YET BUILT | Future route from `/build-admin` |
| /admin/products | NOT YET BUILT | Future route from `/build-admin` |
| /checkout | N/A | Client-side only |

API routes: X total, Y unprotected

### Check 4: Dependencies

npm audit results:
- Critical: X
- High: X
- Moderate: X
- Low: X

Critical packages:
- [package@version] — [CVE] — [description] — [fix: npm update package]

### Check 5: Secrets

Exposed secrets in code: X
- [file:line] — [pattern matched] — [severity]

.env files:
- .env: [exists/missing] — [contains secrets: yes/no]
- .env.local: [exists/missing] — [in .gitignore: yes/no]

Client-side env vars: X
- [var name] — [appropriate: yes/no]

### Check 6: Input Validation

| Input | Validated | Server-Side | Sanitized |
|-------|-----------|-------------|-----------|
| Search query | [yes/no] | [yes/no] | [yes/no] |
| Product slug | [yes/no] | [yes/no] | [yes/no] |
| Category path | [yes/no] | [yes/no] | [yes/no] |
| Checkout name | [yes/no] | [yes/no] | [yes/no] |
| Card number | [yes/no] | [yes/no] | [yes/no] |

---

## Priority Fixes

1. [CRITICAL] [description] — [file to modify] — [fix approach]
2. [CRITICAL] [description] — [file to modify] — [fix approach]
3. [HIGH] [description] — [file to modify] — [fix approach]
4. ...

Verdict: [PASS: no critical/high issues / FAIL: X critical, Y high issues need fixing]
```

---

## Critical Rules

- **Admin protection is non-negotiable.** An unprotected admin dashboard is always CRITICAL severity, even on a demo site.
- **Never log or display secrets.** If you find a secret in source code, report its location but don't include the actual value in the audit output.
- **Test XSS, don't just grep.** Finding `dangerouslySetInnerHTML` is a lead, not a verdict. Check whether the data passed to it comes from user input or from controlled data files.
- **npm audit is a minimum.** It catches known CVEs but not logic bugs, misconfigurations, or zero-days. Don't treat a clean npm audit as "security is fine."
- **CSP is the most impactful missing header.** Generate a recommended Content-Security-Policy based on what sources the site actually uses (self, inline styles from Tailwind, data URIs for images, etc.).
- **Client-side "security" is not security.** Client-side form validation is UX, not security. Real protection requires server-side validation on API routes.
- **Payment data must never persist.** Even in a mock checkout, card numbers should exist only in component state, never in localStorage, cookies, or server logs.
- **Never delete `.next/` while dev server is running.** This causes `__webpack_modules__` errors that look like security issues but are cache corruption. Always: kill server first, then clear `.next/`, then restart. If this pattern is detected during the audit, flag it as an operational note, not a vulnerability.
- **Rate limiting prevents abuse.** Without rate limiting, search and basket APIs can be hammered. Flag as MEDIUM even if there's no real backend.
