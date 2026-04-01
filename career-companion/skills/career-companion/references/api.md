# Zero G Talent API Reference

All endpoints are public — no authentication required.

## Search Jobs

```
GET https://zerogtalent.com/api/jobs/search
```

### Parameters

| Param            | Type   | Default | Description                                                       |
| ---------------- | ------ | ------- | ----------------------------------------------------------------- |
| `q`              | string | —       | Full-text + fuzzy keyword search                                  |
| `company`        | string | —       | Company slug filter (see `references/companies.md`)               |
| `location`       | string | —       | Location slug (e.g., `california`, `remote`, `texas`, `new-york`) |
| `employmentType` | string | —       | `full-time`, `internship`, `part-time`, `contract`                |
| `remote`         | string | —       | `true` for remote-only jobs                                       |
| `filters`        | string | —       | SEO-style combined slug (e.g., `python-and-internship`)           |
| `limit`          | number | 20      | Results per page (max 50)                                         |
| `offset`         | number | 0       | Pagination offset                                                 |
| `format`         | string | —       | Optional: `md` for markdown output instead of JSON                |

### JSON Response

```json
{
  "jobs": [
    {
      "id": "clx1abc...",
      "title": "GNC Engineer",
      "slug": "gnc-engineer",
      "externalId": "abc-123-def",
      "location": "Hawthorne, CA",
      "remote": false,
      "employmentType": "Full-time",
      "category": "Engineering",
      "isActive": true,
      "sourceCreatedAt": "2026-03-15T00:00:00.000Z",
      "sourceUpdatedAt": "2026-03-20T00:00:00.000Z",
      "companyId": "clx2def...",
      "salaryMin": 120000,
      "salaryMax": 180000,
      "salaryCurrency": "USD",
      "salaryInterval": "YEAR",
      "company": {
        "name": "SpaceX",
        "slug": "spacex",
        "logoUrl": "https://zerogtalent.com/logos/spacex.png",
        "industry": "space"
      }
    }
  ],
  "total": 42,
  "hasMore": true,
  "nextOffset": 20,
  "nextCursor": "clx1abc...",
  "pagination": { "offset": 0, "limit": 20, "total": 42 }
}
```

Salary fields (`salaryMin`, `salaryMax`, `salaryCurrency`, `salaryInterval`) are null when not available. For salary research, search multiple roles at a company to compare ranges.

Use `nextOffset` for pagination: pass it as `offset` in the next request.

## Get Job Description

```
GET https://zerogtalent.com/api/job?company={company-slug}&jobId={externalId}
```

Returns the full job details including HTML description and related roles.

**Important:** Use `externalId` from search results, never `slug`. The `slug` is for URL display only.

### Parameters

| Param     | Type   | Default  | Description                                        |
| --------- | ------ | -------- | -------------------------------------------------- |
| `company` | string | required | Company slug                                       |
| `jobId`   | string | required | Job `externalId` from search results               |
| `format`  | string | —        | Optional: `md` for markdown output instead of JSON |

### JSON Response

```json
{
  "job": {
    "title": "GNC Engineer",
    "location": "Hawthorne, CA",
    "remote": false,
    "employmentType": "Full-time",
    "description": "<p>HTML job description...</p>",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "salaryCurrency": "USD",
    "salaryInterval": "YEAR",
    "company": {
      "name": "SpaceX",
      "slug": "spacex",
      "logoUrl": "https://zerogtalent.com/logos/spacex.png"
    }
  },
  "relatedJobs": [
    {
      "title": "Propulsion Engineer",
      "location": "Hawthorne, CA",
      "company": { "name": "SpaceX", "slug": "spacex" }
    }
  ]
}
```

`relatedJobs` contains up to 5 other active roles at the same company.
