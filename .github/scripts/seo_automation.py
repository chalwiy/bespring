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


def generate_sitemap(output_path="sitemap.xml"):
    urls = []
    skipped = []
    for path in tracked_html_files():
        url = public_url(path)
        include, reason = inspect_html(path, url, allow_deleted=False)
        if include:
            urls.append(url)
        else:
            skipped.append((path, reason))

    urls = sorted(set(urls))
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.extend([
            "  <url>",
            f"    <loc>{escape(url)}</loc>",
            "  </url>",
        ])
    lines.append("</urlset>")

    with open(output_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Generated {output_path} with {len(urls)} URL(s); skipped {len(skipped)} non-indexable page(s).")
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
