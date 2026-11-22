# PRCS Recruitment System

Recruitment management platform for Palestine Red Crescent Society (PRCS).

## Project status
Initial repository scaffold. Application modules and database migrations have not been implemented yet.

## Planned modules
- Job vacancies and publishing
- Applicant profiles and applications
- Document attachments
- Screening and evaluation
- Interview scheduling and scoring
- Recruitment decisions and approvals
- Role-based access and audit logging
- Reports and dashboards

## Deployment target
Docker Compose / Coolify, with PostgreSQL as the planned database.

## Security
Never commit credentials, applicant records, identity documents, or production exports. Configure secrets in Coolify environment variables. Review permissions before storing personal data.
