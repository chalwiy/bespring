# Sitemap and IndexNow maintenance

The site uses Python's standard library and the existing GitHub Pages deployment.
No pip packages, crawler service, or database are needed.

## Automatic behavior

- A push to `main` generates `sitemap.xml` from tracked HTML pages, stages it,
  checks the staged difference, and commits it only when the contents changed.
- Missing or deleted sitemap files are recreated. A daily recovery run is
  scheduled at 02:23 UTC (10:23 Asia/Shanghai); GitHub may delay scheduled runs.
- Sitemap writes are serialized. Checkout uses the current `main` branch and
  full history. A concurrent human push can reject the bot's push safely; inspect
  the failed run and rerun it rather than force-pushing.
- After the bot changes the sitemap, the workflow explicitly requests a Pages
  rebuild, since commits made using `GITHUB_TOKEN` do not trigger normal builds.
- Changed HTML URLs, including deletions and rename source paths, are submitted
  to IndexNow in batches of at most 10,000. Manual runs submit all eligible pages;
  daily recovery runs do not resubmit the entire site.
- Temporary network, rate-limit, and server failures receive bounded retries.
  Invalid keys and other permanent errors fail visibly in Actions.

## Inclusion rules

Homepages use `/` and language homepages use `/language/`. The sitemap excludes
404 pages, `noindex`/`none` robots directives, meta-refresh redirects, and pages
whose canonical URL points elsewhere. Relative canonicals resolve against the
page URL. `lastmod` comes from each HTML file's Git commit date; unchanged pages
keep their dates. Uncertain dates are omitted rather than fabricated.

Generation is deterministic and replaces the file atomically. Empty output or
the protocol limits (50,000 URLs / 50 MB) cause a visible failure while preserving
the old file. If the site grows beyond these limits, introduce sitemap shards
and a sitemap index before increasing the limits.

## Local verification

From the repository root, with Python 3 and Git installed:

```sh
python3 -m unittest discover -s .github/tests -v
python3 .github/scripts/seo_automation.py sitemap
git add -- sitemap.xml
git diff --cached -- sitemap.xml
```

`SEO regression checks` runs on relevant pull requests with read-only repository
permissions. It tests missing/deleted sitemap recovery, page updates/deletions,
Git dates, deterministic output, filtering, atomic-write failure, and IndexNow
retry behavior. It also generates a sitemap from the full site and reports its
SHA-256 fingerprint for comparison.

## Operational checks

Keep Actions enabled and the bot's `contents: write` / `pages: write` permissions
available. If branch rules block the bot, use a permitted update process instead
of weakening branch protection. Review failed Actions notifications. GitHub can
disable scheduled workflows in inactive public repositories; push/manual runs
remain the primary update paths.

When uploading site content, retain `.github/`, `robots.txt`, the public IndexNow
key file, and `sitemap.xml`. The root cause fixed here was a deleted sitemap plus
an unstaged `git diff` check that ignored its regenerated, untracked replacement.

After merging, check `SEO sitemap and IndexNow`, the Pages deployment, and the
public `/sitemap.xml`. The sitemap URL is already declared in `robots.txt`.
IndexNow acceptance informs search engines; indexing itself is their decision.
