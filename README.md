## CI/CD Baseline

This repository now includes GitHub Actions workflows that implement:

- CI on every PR and push to `staging`/`main`
- Rust quality gates: `cargo fmt`, `cargo clippy -D warnings`, tests
- Coverage enforcement via `cargo llvm-cov` (`MIN_LINE_COVERAGE=100`)
- Optional SonarCloud scan + quality gate
- PR approval gate (minimum 1 approving review)
- CD only after successful CI
- Push to `staging` -> deploy to staging environment
- Push to `main` -> deploy to production environment

## Workflow Files

- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`

## Required GitHub Secrets / Variables

Deployment secrets:

- `STAGING_DEPLOY_WEBHOOK_URL`
- `PRODUCTION_DEPLOY_WEBHOOK_URL`

Optional SonarCloud integration:

- Secret: `SONAR_TOKEN`
- Variable: `SONAR_PROJECT_KEY`
- Variable: `SONAR_ORGANIZATION`

## Branch Protection Setup (GitHub Settings)

For `main` and `staging`, enable branch protection and require:

- At least 1 approving review
- Required status check: `Rust checks`
- Required status check: `PR approval gate`

This makes CI the merge gatekeeper and prevents deployment when quality gates fail.
