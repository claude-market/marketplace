# Source Research Workflow

**Owner:** folio
**Trigger:** Any time the user needs sources for a research or writing project
**Output:** Source files in `projects/<project>/sources/`, formatted to template

---

## Objective

Find the best available sources for a given research question or claim, create a standardized source file for each, and present a summary list the user can use to fill in assignment templates.

---

## Inputs

- `project_context.md` — research question, claim direction, assignment constraints (format, source type requirements, number needed)
- Number of sources required
- Any source type constraints (scholarly only, news allowed, editorials allowed, etc.)

---

## Step 1 — Search Strategy

Before running any searches, identify the argument structure:
- What does the "yes" side need? (supporting the claim)
- What does the "no" side need? (building a credible counterclaim)
- What structural/analytical source would explain WHY the argument is what it is?

Run parallel web searches covering each angle. Aim for 1.5–2x the number of sources needed — some won't pan out.

**Search principles:**
- Include publication type terms to surface the right source tier (e.g., "peer-reviewed," "study," "news," "editorial")
- Search for specific data points, not just topics (e.g., "SpaceX NASA contract cost savings" not just "SpaceX NASA")
- Run separate searches for the "it works" and "it doesn't work" sides if the argument is nuanced
- Fetch promising articles to confirm author names and publication dates before writing source files

---

## Step 2 — Source Selection

From search results, shortlist based on:
- **Relevance:** Does this directly address the research question or claim?
- **Credibility:** Is the source from a verifiable publication with editorial standards?
- **Balance:** Does the set cover both sides of the argument (or at minimum, acknowledge the counterclaim)?
- **Freshness:** Prefer recent sources unless an older one is uniquely authoritative
- **Diversity:** Avoid 3 sources from the same outlet or the same argument angle

Match the source tier to the assignment's requirements (read from the project `context.md`):
- **General / journalistic assignments:** news, editorial, and credible web sources are acceptable. Not all sources need to be peer-reviewed.
- **Academic / scholarly assignments:** prefer peer-reviewed; use news/editorial for contextualization only.

---

## Step 3 — Source File Creation

For each selected source, create a file at:
```
projects/<project>/sources/source_<lastname_year>.md
```

Use the template at `.claude/templates/folio/source_template.md`.

Fields to complete:
- **Citation** — MLA 9 format. Check: author last name, first name. Publication in italics. Year. URL.
- **Core Argument** — 2–4 sentences: what does the author actually claim? Not what the article is "about."
- **Key Quotes** — 1–2 direct quotes with location (paragraph, timestamp, or page if available)
- **Relevance to Research Question** — how does this source help answer the question?
- **Perspective / Lens** — what angle does this source come from?
- **Potential Counterarguments** — what would a critic of this source say?
- **Source Usage** — argument / counterargument / rebuttal / contextualization
- **Credibility** — why trust this source?
- **Notes** — connections to other sources, limitations, how it fits the argument structure

---

## Step 4 — Present Summary to the user

After all source files are created, output a numbered list with:

```
Title:
Author:
Brief Description:
Link:
```

This format matches the assignment template the user will fill in.

---

## Step 5 — Generate or Refine Claim

If the project's claim is still TBD or was provisional, generate a final claim that:
- Is debatable (a reasonable person could argue the other side)
- Reflects what the sources can actually support
- Is specific enough to argue, not just assert

Present the claim separately so the user can approve before the essay drafting stage.

---

## Step 6 — Update context.md

After sources are approved and claim is set, update `projects/<project>/context.md` with:
- Final debatable question
- Final claim
- Sources table (file | author | year | function in argument)

---

## Edge Cases

- **Can't find author:** Use organization name or outlet name. Flag in source file notes.
- **Paywall source:** Note in source file; check if abstract or summary is publicly available. If not, find an equivalent open-access source.
- **Source contradicts claim:** Keep it — it's the counterclaim. The essay needs it.
- **Too many sources:** Keep all files. Mark lower-priority ones in notes so the user knows what's optional.
