# PRCS Recruitment System

Arabic RTL recruitment platform prototype for Palestine Red Crescent Society.

## Implemented in source
- Next.js applicant-facing home, sample job detail, registration, login and profile pages
- PostgreSQL schema for accounts, qualifications, experience, jobs, applications and audit logs
- Session cookie authentication with server-side HMAC validation
- Server-side eligibility checking with overlapping-experience deduplication
- Applicant application API that rejects unmet mandatory rules
- Docker Compose and Coolify deployment scaffolding

## Not yet complete
- Production-grade account verification, recovery, MFA, rate limiting, CSRF protection
- Admin vacancy editor and document upload/review
- Public vacancy pages backed by database instead of illustrative jobs
- Migrations, integration tests, accessibility and production security review

**Do not accept real applicant data or publish real jobs yet.**

## Local development
1. Copy `.env.example` to `.env` and generate new strong values.
2. Run `docker compose up -d db` (or use an existing PostgreSQL instance).
3. Apply `db/schema.sql` then `db/seed.sql` to the database (manual first-install step).
4. Run `npm install && npm run dev`.
5. Run `npm test` for the initial eligibility unit tests.

For Docker Compose deployment: set `POSTGRES_PASSWORD`, `DATABASE_URL` (same password, host `db`) and `SESSION_SECRET` in Coolify. Schema initialization is **not** automated yet.

Keep repository private before adding deployment secrets or applicant data.
