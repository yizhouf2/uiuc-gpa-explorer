# UIUC GPA Explorer

**[Live demo](https://yizhouf2.github.io/uiuc-gpa-explorer/)** · A project by Yizhou Fang

An interactive exploration of UIUC course grade distributions, originally developed for STAT 385 using R Shiny and tidyverse. This repository also includes a browser implementation adapted with AI assistance for GitHub Pages, which cannot run an R server.

## What you can explore

- Filter 76,991 section records across 175 subjects by course and instructor.
- Compare aggregated letter-grade distributions and enrollment-weighted GPA.
- Search, sort and paginate section-level records with calculated GPA.
- Explore a bundled 2010–2025 dataset without a backend service.

## Project structure

- `original/app.R`, `original/R/`: original Shiny application and GPA calculation/data preparation code.
- `docs/`: responsive HTML, CSS and JavaScript implementation for GitHub Pages.
- `docs/data/`: one dataset snapshot, partitioned by the subject’s first letter; records load on demand.
- `restore-data.py`: reconstructs the original CSV locally from the bundled data, avoiding a duplicate copy in the repository.

## Methodology

GPA follows `original/R/gpa.R`: A+/A = 4.00; A− = 3.67; B+ = 3.33; B = 3.00; B− = 2.67; C+ = 2.33; C = 2.00; C− = 1.67; D+ = 1.33; D = 1.00; D− = 0.67; F = 0.00. Withdrawals appear in the distribution but do not enter the GPA denominator. Sections without graded enrollments or with missing counts have no calculated GPA. Chart GPA is weighted by graded enrollments; table GPA is calculated per section.

## Run locally

Web version (Python 3, no additional dependencies):

```sh
python3 -m http.server 8000 --directory docs
```

Open http://localhost:8000 . Fetching data requires HTTP rather than opening the HTML as a local file.

Original R version:

```sh
python3 restore-data.py
```

Then, in R with `shiny` and `tidyverse` installed:

```r
shiny::runApp("original")
```

## Deployment

GitHub repository Settings → Pages → Deploy from a branch → `main` → `/docs`. No build step or R server is needed. Relative paths support hosting at a repository subpath.

## Data & attribution

Source: [UIUC GPA Dataset](https://github.com/wadefagen/datasets/tree/master/gpa) by Wade Fagen-Ulmschneider. This repository preserves the provided project’s 76,991-record snapshot; data does not update automatically. Records are aggregated course-section grades rather than individual student records. The original UI’s date range was corrected from 2010–2021 to the actual 2010–2025 coverage.

The original Shiny project and its GPA logic are retained for review. The HTML/CSS/JavaScript adaptation and deployment preparation were created with AI assistance. Personal email, editor settings, local history and redundant CSV copies are excluded.
