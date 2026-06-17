# Workflow: MLA 9 Citation Generator

## Objective

Turn a list of URLs into a properly formatted MLA 9 Works Cited `.docx` file. When opened in Google Docs, all formatting is preserved natively — italics, hanging indent, double spacing, Times New Roman 12pt. Copy-pasting from Google Docs into any other document carries all formatting with it.

---

## Inputs Required

- A list of URLs (one per line, provided by the user or read from `.tmp/input_urls.txt`)
- Active project `context.md` confirming citation format is MLA

## Outputs

- `.tmp/works_cited.json` — citation metadata (intermediate, disposable)
- `.tmp/works_cited_formatted.txt` — plain-text citations with `*italic markers*` for reviewer (intermediate, disposable)
- `.tmp/citation_issues.md` — reviewer findings (intermediate, disposable)
- `projects/<project>/references/works_cited.docx` — final deliverable

---

## Steps

### Step 1 — Load context

Read `projects/<project>/context.md`. Confirm citation format is MLA. Note the project name for the output path. If citation format is not MLA, ask the user before proceeding.

### Step 2 — Validate URLs

For each URL: confirm it is a well-formed URL before fetching. If a URL appears malformed (no scheme, broken domain), note it and skip — do not abort the whole run. Report skipped URLs to the user at the end.

### Step 3 — Fetch and extract metadata

For each URL, use the WebFetch tool to retrieve the page content. Extract the following fields:

**All source types:**

- `authors` — all authors in order listed (last name, first name). If an organization is the author, use the org name as `last` with `first: null`. If no author is listed, use an empty array `[]`.
- `title` — the title of the specific work (article title, chapter title, page title)
- `date` — publication date. Use full date (DD Mon. YYYY) when available; year-only when that is all that is shown; `"n.d."` when absent entirely
- `url` — the canonical URL of the page
- `doi` — search the page for any `doi.org` string; if found, store as full URL `https://doi.org/...`

**Additional fields by source type:**

| Field | Relevant for |
| --- | --- |
| `container_title` | All types — the journal name, book title, website name, newspaper name |
| `container_title_italic` | Always `true` for journals, books, websites, newspapers, standalone reports |
| `volume`, `issue` | Journal articles |
| `pages` | Journal articles, book chapters (use en-dash: `–`, not hyphen `-`) |
| `publisher` | Books, institutional reports |
| `institution` | Working papers (NBER, SSRN) |
| `series_title`, `report_number` | Working papers (e.g., `"NBER Working Paper"`, `"29247"`) |
| `book_title` | Book excerpts (the containing book's title) |
| `editors` | Edited books — array of `{"last": ..., "first": ...}` |
| `preprint_id` | arXiv, SSRN — the ID number (e.g., `"2309.02338"`) |
| `access_date` | Webpages with no publication date only. Format: `"2 Apr. 2026"` |

**Source type classification rules:**

- `journal_article` — has a journal name, volume/issue, and usually a DOI
- `webpage` — no volume/issue; primary container is a website
- `news_article` — container is a newspaper or news site; no volume/issue
- `book_excerpt` — article or excerpt published in a magazine but excerpted from a book; populate both `container_title` (magazine) and `book_title`
- `institutional_report` — standalone OECD/government-style report (title italicized, no quotes) OR working paper in a numbered series (title in quotes, series is the container)
- `preprint` — arXiv, SSRN, or similar preprint server

**Key extraction rules:**

- Always prefer DOI over URL as the final element when a DOI is present
- For NBER working papers: `title` = paper title (goes in quotes), `series_title` = "NBER Working Paper No.", `report_number` = the number
- For standalone OECD-style reports: `title` = full report title (will be italicized), no `series_title`
- For webpages: `container_title` = the name of the website (not the domain), `container_title_italic: true`
- For arXiv preprints: `container_title` = "arXiv", `container_title_italic: true`, `preprint_id` = the arXiv ID

### Step 4 — Build citation JSON

Assemble all extracted metadata into an array of objects matching the JSON schema (one object per source). Write to `.tmp/works_cited.json`.

**JSON schema:**

```json
[
  {
    "source_type": "journal_article",
    "authors": [{"last": "Acemoglu", "first": "Daron"}, {"last": "Restrepo", "first": "Pascual"}],
    "title": "Tasks, Automation, and the Rise in U.S. Wage Inequality",
    "container_title": "Econometrica",
    "container_title_italic": true,
    "volume": "90",
    "issue": "5",
    "date": "Sept. 2022",
    "pages": "1973–2016",
    "url": "https://onlinelibrary.wiley.com/doi/full/10.3982/ECTA19815",
    "doi": "https://doi.org/10.3982/ECTA19815",
    "publisher": null,
    "institution": null,
    "series_title": null,
    "report_number": null,
    "book_title": null,
    "editors": [],
    "preprint_id": null,
    "access_date": null
  }
]
```

### Step 5 — Run cite.py (draft pass)

```bash
python tools/folio/cite.py \
  --input .tmp/works_cited.json \
  --output .tmp/works_cited_draft.docx \
  --txt-output .tmp/works_cited_formatted.txt
```

If cite.py throws an error, read the error message, fix the JSON (malformed field, wrong type), and rerun before proceeding.

### Step 6 — Invoke citation reviewer sub-agent

Spin up the `.assistants/folio/sub-agents/citation-reviewer.md` sub-agent. Provide it with:

- The content of `.tmp/works_cited_formatted.txt` (includes `*italic markers*`)
- The content of `.tmp/works_cited.json`
- The path to `.tmp/works_cited_draft.docx` for DOCX formatting checks

The reviewer writes its findings to `.tmp/citation_issues.md`.

### Step 7 — Fix issues

Read `.tmp/citation_issues.md`.

- If `Status: APPROVED` — proceed to Step 8.
- If `Status: ISSUES_FOUND` — fix each `ERROR`-severity issue in `.tmp/works_cited.json`, then return to Step 5. Repeat until `APPROVED` or only `WARNING`-severity issues remain.
- Report any remaining `WARNING` items to the user before generating the final file.

Do not loop more than 3 times. If the reviewer still returns errors after 3 rounds, report the remaining issues to the user and ask whether to proceed or abort.

### Step 8 — Generate final DOCX

```bash
python tools/folio/cite.py \
  --input .tmp/works_cited.json \
  --output projects/<project>/references/works_cited.docx
```

### Step 9 — Update context.md

Add a note to `projects/<project>/context.md` that the Works Cited DOCX has been generated, the number of entries, and today's date.

### Step 10 — Improve this workflow

After every run, assess before closing:

- Did any step fail or require a workaround? Update the relevant step or edge case section.
- Did a source type appear that isn't covered in the MLA 9 rules section? Add it.
- Did `cite.py` produce unexpected output? If it was a script bug, fix the script and note the fix here. If it was a data issue, add it to edge cases.
- Did the reviewer loop more than once on the same type of error? That's a systemic issue — update the JSON-building step to prevent it upstream.

This workflow improves through use. Don't skip this step.

---

## Edge Cases

**Paywalled source.** WebFetch returns an abstract page or login wall rather than the full article. Extract what is visible (title, authors, journal name, volume, issue, year, DOI). The DOI is usually present on the landing page and is all that is needed for a valid citation. Note in `context.md` that this source is paywalled.

**No author listed.** Set `authors: []`. The title becomes the leading element in the citation and the sort key. Strip leading "A", "An", or "The" for alphabetical sorting only — the title is displayed as-is.

**Corporate or institutional author.** Use `{"last": "OECD", "first": null}`. `cite.py` renders this as `OECD.` without name inversion.

**No date available.** Set `date: "n.d."`. For a webpage with no date, also set `access_date` to today's date formatted as `"DD Mon. YYYY"` (e.g., `"2 Apr. 2026"`).

**Both URL and DOI present.** Use the DOI as the single trailing link; omit the URL. MLA 9 prefers the DOI when one exists, and `cite.py` emits exactly one link per entry (DOI if present, otherwise the URL). Populate both fields in the JSON if you have them — `cite.py` will pick the DOI automatically.

**Multiple works by the same first author.** After alphabetical sorting, `cite.py` detects adjacent entries with the same first author (last + first match) and substitutes three em-dashes `———` for the author name in the second and subsequent entries. This is automatic — no JSON change needed.

**Source has no URL (print-only or library database).** Omit the URL field (`url: null`). If a DOI exists, use that. If neither exists, the citation ends at the date or page range.

**arXiv preprint.** Set `source_type: "preprint"`, `container_title: "arXiv"`, `container_title_italic: true`, `preprint_id` = the arXiv ID. URL = full arXiv URL. Date = year only.

---

## MLA 9 Rules by Source Type

Use these rules when extracting metadata and populating the JSON. The reviewer sub-agent will check the output against its 30-rule checklist.

**Journal article pattern:**
`Last, First, and First2 Last2. "Title." Container, vol. X, no. X, Date, pp. X–Y, https://doi.org/....`

**Webpage pattern:**
`Last, First. "Page Title." Site Name, Publisher (if different from site), Date, URL.`

- If no date: add `Accessed DD Mon. YYYY.` at end
- Site name is italicized

**News article pattern:**
`Last, First. "Article Title." Newspaper Name, Full Date, URL.`

- Full date (day month year): `25 July 2025`
- Newspaper name is italicized

**Book excerpt / magazine excerpt pattern:**
`Last, First. "Article Title." Magazine Name, Date, URL. Excerpted from Book Title, Publisher, Year.`

- Magazine name italic; book title italic

**Institutional report — working paper pattern:**
`Last, First. "Paper Title." Series Name No. X, Institution, Date, URL.`

- Series name + number is the italicized container (e.g., *NBER Working Paper No. 29247*)

**Institutional report — standalone pattern:**
`Institution. Report Title. Publisher, Date, DOI (or URL if no DOI).`

- Report title is italicized (book-level work)

**Preprint pattern:**
`Last, First, et al. "Title." arXiv, Year, URL.`

- arXiv is italicized as the container

**Date abbreviations (MLA 9):**
Jan. Feb. Mar. Apr. May June July Aug. Sept. Oct. Nov. Dec.
(May, June, July are never abbreviated)

---

## Troubleshooting

**cite.py fails with `ModuleNotFoundError: No module named 'docx'`**
Run `pip3 install -r tools/folio/requirements.txt` from the project root. If using a virtual environment, activate it before running cite.py.

**WebFetch returns a 403 or login page**
The source is paywalled. Extract what is visible from the landing page. If only the DOI is available, that is sufficient for a complete citation.

**Reviewer loops more than 3 times**
Stop. Report the remaining issues to the user with the exact text from `citation_issues.md`. Ask whether to proceed with warnings or abort.

**cite.py produces a DOCX that doesn't show italics in Google Docs**
Verify that `container_title_italic` is set to `true` (not the string `"true"`) in the JSON for that entry. `cite.py` checks the boolean value.
