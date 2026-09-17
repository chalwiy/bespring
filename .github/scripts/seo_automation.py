#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from xml.sax.saxutils import escape

SITE_HOST = os.environ.get("SITE_HOST", "www.bespringchem.com")
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "https://www.bespringchem.com").rstrip("/")


class SeoHeadParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.noindex = False
        self.refresh = False
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        a = {str(k).lower(): (v or "") for k, v in attrs if k}
        if tag == "meta":
            name = a.get("name", "").lower()
            content = a.get("content", "").lower()
            if name in {"robots", "googlebot", "bingbot"} and "noindex" in content:
                self.noindex = True
            if a.get("http-equiv", "").lower() == "refresh":
                self.refresh = True
        elif tag == "link":
            rel = a.get("rel", "").lower().split()
            if "canonical" in rel and a.get("href"):
                self.canonical = a["href"].strip()


def public_url(path):
    path = path.replace("\\", "/").lstrip("./")
    public_path = "/" + path
    if public_path == "/index.html":
        public_path = "/"
    elif public_path.endswith("/index.html"):
        public_path = public_path[:-len("index.html")]
    public_path = urllib.parse.quote(public_path, safe="/%-._~")
    return SITE_ORIGIN + public_path


def inspect_html(path, url, allow_deleted=False):
    if path == "404.html" or path.endswith("/404.html"):
        return False, "404 page"

    if not os.path.isfile(path):
        if allow_deleted:
            return True, "deleted URL"
        return False, "missing file"

    parser = SeoHeadParser()
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            parser.feed(f.read())
    except OSError as exc:
        if allow_deleted:
            return True, f"inspection failed: {exc}"
        return False, f"inspection failed: {exc}"

    if parser.noindex:
        return False, "meta robots noindex"
    if parser.refresh:
        return False, "meta refresh redirect"
    if parser.canonical:
        canonical = urllib.parse.urljoin(SITE_ORIGIN + "/", parser.canonical)
        if canonical.rstrip("/") != url.rstrip("/"):
            return False, f"canonical points to {canonical}"

    return True, "indexable"


def tracked_html_files():
    output = subprocess.check_output(["git", "ls-files", "*.html"], text=True)
    return sorted(set(line.strip() for line in output.splitlines() if line.strip()))


def html_lastmod_dates(paths):
    """Return the latest Git commit date (YYYY-MM-DD) for each current HTML file."""
    wanted = set(paths)
    dates = {}
    marker = "@@BESPRING_DATE@@"

    # One Git history traversal is much faster than running `git log -1`
    # separately for thousands of HTML files. --no-renames makes a rename
    # expose the new path at the rename commit, which is the right lastmod for
    # the current URL.
    output = subprocess.check_output(
        [
            "git",
            "log",
            "--no-renames",
            f"--format={marker}%cs",
            "--name-only",
            "--diff-filter=ACMR",
            "--",
            "*.html",
        ],
        text=True,
        errors="replace",
    )

    current_date = None
    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith(marker):
            current_date = line[len(marker):].strip()
            continue
        path = line.replace("\\", "/")
        if current_date and path in wanted and path not in dates:
            dates[path] = current_date
            if len(dates) == len(wanted):
                break

    missing = wanted - dates.keys()
    if missing:
        # This should be rare (for example, unusual shallow history). Fall back
        # per file so sitemap generation still succeeds with accurate dates.
        for path in sorted(missing):
            try:
                date = subprocess.check_output(
                    ["git", "log", "-1", "--format=%cs", "--", path],
                    text=True,
                    errors="replace",
                ).strip()
            except subprocess.CalledProcessError:
                date = ""
            if date:
                dates[path] = date
            else:
                print(f"Warning: no Git lastmod date found for {path}; omitting <lastmod>.")

    return dates


def generate_sitemap(output_path="sitemap.xml"):
    paths = tracked_html_files()
    lastmods = html_lastmod_dates(paths)
    entries = {}
    skipped = []

    for path in paths:
        url = public_url(path)
        include, reason = inspect_html(path, url, allow_deleted=False)
        if include:
            date = lastmods.get(path)
            # If two tracked files somehow map to the same public URL, keep the
            # newest real modification date for that URL.
            previous = entries.get(url)
            if previous is None or (date and (not previous or date > previous)):
                entries[url] = date
        else:
            skipped.append((path, reason))

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in sorted(entries):
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(url)}</loc>")
        if entries[url]:
            lines.append(f"    <lastmod>{entries[url]}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")

    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")

    with_lastmod = sum(1 for date in entries.values() if date)
    print(
        f"Generated {output_path} with {len(entries)} URL(s), "
        f"{with_lastmod} lastmod date(s); skipped {len(skipped)} non-indexable page(s)."
    )
    for path, reason in skipped:
        print(f"Skipping sitemap entry {path}: {reason}")


def submit_indexnow(file_list):
    key = os.environ["INDEXNOW_KEY"]
    key_location = os.environ["INDEXNOW_KEY_LOCATION"]

    try:
        with open(file_list, "r", encoding="utf-8") as f:
            paths = [line.strip().lstrip("./") for line in f if line.strip()]
    except FileNotFoundError:
        paths = []

    urls = []
    seen = set()
    for path in paths:
        url = public_url(path)
        include, reason = inspect_html(path, url, allow_deleted=True)
        if not include:
            print(f"Skipping {url}: {reason}")
            continue
        if url not in seen:
            seen.add(url)
            urls.append(url)
            print(f"Queueing {url}: {reason}")

    if not urls:
        print("No eligible HTML URLs changed; nothing to submit.")
        return

    print(f"Submitting {len(urls)} URL(s) to IndexNow")
    for start in range(0, len(urls), 10000):
        batch = urls[start:start + 10000]
        payload = {
            "host": SITE_HOST,
            "key": key,
            "keyLocation": key_location,
            "urlList": batch,
        }
        request = urllib.request.Request(
            "https://api.indexnow.org/indexnow",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                status = response.status
                text = response.read().decode("utf-8", errors="replace")
                print(f"IndexNow HTTP {status}: {text or 'OK'}")
                if status not in (200, 202):
                    raise RuntimeError(f"Unexpected IndexNow status: {status}")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            print(f"IndexNow HTTP {exc.code}: {detail}", file=sys.stderr)
            raise

    print("IndexNow submission completed successfully.")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sitemap = sub.add_parser("sitemap")
    sitemap.add_argument("--output", default="sitemap.xml")
    indexnow = sub.add_parser("indexnow")
    indexnow.add_argument("file_list")
    args = parser.parse_args()

    if args.command == "sitemap":
        generate_sitemap(args.output)
    elif args.command == "indexnow":
        submit_indexnow(args.file_list)


if __name__ == "__main__":
    main()
