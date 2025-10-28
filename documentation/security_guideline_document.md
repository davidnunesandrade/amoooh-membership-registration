# Security Guidelines for amoooh-membership-registration

This document provides actionable security best practices tailored to the `amoooh-membership-registration` codebase. It integrates core security principles—security by design, least privilege, defense in depth, and secure defaults—into your existing Next.js + Drizzle ORM + Better Auth stack.

---

## 1. Authentication & Access Control

• **Strong Password Hashing**
  - Use bcrypt or Argon2 (with unique per-user salt) for storing passwords. Ensure the Better Auth configuration enforces these algorithms.
  - Mandate a minimum password length (e.g., 12 characters) and complexity (upper/lowercase, digits, symbols).

• **JWT Configuration**
  - Sign tokens with a strong secret or asymmetric key (e.g., RS256). Avoid the “none” algorithm.
  - Enforce short-lived tokens (e.g., 15 min) and rotate refresh tokens. Validate `exp` and `iat` on every request.

• **Session & Cookie Security**
  - Set cookies with `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` attributes.
  - Implement idle and absolute session timeouts (e.g., 30 min idle, 8 hrs absolute).
  - Provide a logout endpoint that invalidates the session server-side.

• **Role-Based Access Control (RBAC)**
  - Extend the `members` (formerly `users`) table with a `role` field (e.g., `admin`, `member`).
  - In every API route, verify the user’s role before performing protected operations. Centralize checks in a shared middleware or `lib/auth.ts` helper.

• **Multi-Factor Authentication (MFA)**
  - Consider integrating TOTP (e.g., Google Authenticator) or SMS/email OTP for high-privilege accounts.

---

## 2. Input Handling & Validation

• **Server-Side Validation**
  - Use a schema validation library (e.g., Zod) in each Next.js API route (`route.ts`) to enforce required fields, types, and value ranges.
  - Return generic error messages (e.g., “Invalid input”) without leaking implementation details.

• **Prevent Injection**
  - Drizzle ORM uses parameterized queries; avoid raw SQL wherever possible.
  - Sanitize any user-supplied strings used in dynamic queries or shell commands.

• **File Uploads (if applicable)**
  - Validate file types by MIME and extension. Limit file size.
  - Store uploads outside the webroot or in an S3 bucket with restrictive ACLs.
  - Scan uploaded files for malware.

---

## 3. Output Encoding & XSS Mitigation

• **Context-Aware Encoding**
  - Let React automatically escape all dynamic data; avoid `dangerouslySetInnerHTML`.
  - If rendering user-provided HTML, sanitize with a library like DOMPurify.

• **Content Security Policy (CSP)**
  - In `next.config.js`, add a strict CSP header to only allow trusted scripts, styles, and images.

---

## 4. API & Service Security

• **Enforce HTTPS & HSTS**
  - Redirect all HTTP traffic to HTTPS. In production, configure an HSTS header with a long `max-age` and `includeSubDomains`.

• **Rate Limiting & Throttling**
  - Use a middleware (e.g., `express-rate-limit` or custom Next.js middleware) to throttle requests per IP or user to prevent brute-force and DoS.

• **CORS Configuration**
  - In Next.js API routes, explicitly allow only trusted origins (e.g., your frontend domain). Deny all others.

• **API Versioning**
  - Prefix endpoints with `/api/v1/…` to allow safe evolution and deprecation without breaking clients.

---

## 5. Web Application Security Hygiene

• **CSRF Protection**
  - For state-changing routes, implement anti-CSRF tokens. If using JWT in cookies, ensure each form or AJAX request includes a synchronizer token.

• **Security Headers**
  - In `next.config.js` or a custom server, configure the following headers:
    - X-Frame-Options: `DENY`
    - X-Content-Type-Options: `nosniff`
    - Referrer-Policy: `strict-origin-when-cross-origin`
    - Permissions-Policy: restrict features (camera, microphone, geolocation, etc.)

---

## 6. Data Protection & Secrets

• **Encryption in Transit & At Rest**
  - Ensure TLS 1.2+ for all connections (API, database). In PostgreSQL connection string, enforce `sslmode=require`.
  - If storing PII, consider field-level encryption.

• **Secret Management**
  - Do not commit `.env` with secrets. Use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) to inject environment variables at build or runtime.

• **Logging & Error Handling**
  - Avoid exposing stack traces or sensitive data in error responses. Log detailed errors server-side at INFO or DEBUG level, but sanitize logs sent to external systems.

---

## 7. Infrastructure & Deployment

• **Docker Hardening**
  - Run as non-root user inside the container. Use minimal base images (e.g., `node:18-alpine`).
  - Scan container images with a vulnerability scanner (e.g., Trivy).

• **CI/CD Security**
  - Store pipeline secrets in your CI system’s secret vault.
  - Integrate Snyk or Dependabot for automated dependency vulnerability checks.
  - Include linting, type-checks, and security scans (SAST) as part of your build.

• **Keep Dependencies Updated**
  - Use `yarn.lock` or `package-lock.json` to pin versions.
  - Subscribe to security advisories for your primary dependencies (Next.js, Drizzle ORM, Tailwind, Shadcn UI).

---

## 8. Monitoring & Incident Response

• **Runtime Monitoring**
  - Instrument your app with a monitoring service (e.g., Datadog, Sentry) to capture errors, slow requests, and security events.

• **Alerts & Logging**
  - Set up alerts for repeated authentication failures, unexpected 5xx errors, and rate-limit triggers.
  - Retain logs for forensic analysis while complying with data privacy standards.


---

By embedding these controls into your development lifecycle—design, implementation, testing, and deployment—you will ensure the `amoooh-membership-registration` platform is secure, resilient, and trustworthy by design.