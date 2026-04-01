# Career Companion

Career companion for frontier tech industries. Searches live job openings, tailors resumes, and runs mock interviews.

Powered by [Zero G Talent](https://zerogtalent.com) — live data from hundreds of companies via direct ATS integrations.

## What it does

- **Find jobs** — search 20,000+ live openings across space, AI, robotics, and defense via public API
- **Resume help** — review, critique, and tailor resumes to specific job descriptions
- **Interview prep** — mock interviews with company-specific questions and honest feedback

## Trigger phrases

Activates when you mention jobs, careers, hiring, resumes, interviews, salaries, or frontier tech companies (SpaceX, OpenAI, Anthropic, Blue Origin, NASA, Boston Dynamics, etc.).

## How it works

Uses `curl` to query the Zero G Talent public API — no API key required. Returns live job listings with salary data, company info, and direct apply links.

## Installation

```bash
claude --plugin-dir /path/to/career-companion
```

Or install from the claudus-maximus marketplace.

## Components

| Component     | File                                              | Purpose                                       |
| ------------- | ------------------------------------------------- | --------------------------------------------- |
| Skill         | `skills/career-companion/SKILL.md`                | Main skill with workflow, templates, and tips |
| API Reference | `skills/career-companion/references/api.md`       | Endpoint docs, params, response schemas       |
| Company Slugs | `skills/career-companion/references/companies.md` | Company lookup by industry with URL prefixes  |
