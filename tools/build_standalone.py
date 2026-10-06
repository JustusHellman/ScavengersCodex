#!/usr/bin/env python3
"""Rebuild codex-standalone.html: index.html with styles, scripts and all data files inlined.

  python3 tools/build_standalone.py            writes codex-standalone.html
  python3 tools/build_standalone.py --check    rebuilds in memory and says whether the file on disk is up to date
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def build():
    html = read("index.html")
    html = html.replace('<link rel="stylesheet" href="styles.css">', "<style>" + read("styles.css").rstrip("\n") + "\n</style>")
    man = json.loads(read("data/manifest.json"))
    parts = [json.loads(read("data/" + f)) for f in man["files"]]
    data = "<script>window.CODEX_DATA=" + json.dumps(parts, ensure_ascii=False, separators=(",", ":")) + ";window.CODEX_CONFIG=" + read("config.json").strip() + ";</script>\n"
    first = True

    def inline(m):
        nonlocal first
        src = m.group(1)
        out = ("<script>" + read(src).rstrip("\n") + "\n</script>")
        if first:
            first = False
            out = data + out
        return out
    return re.sub(r'<script src="([^"]+)"></script>', inline, html)


if __name__ == "__main__":
    out = build()
    path = os.path.join(ROOT, "codex-standalone.html")
    if "--check" in sys.argv:
        cur = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
        print("up to date" if cur == out else "OUT OF DATE: run python3 tools/build_standalone.py")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        print("wrote codex-standalone.html (%d bytes)" % len(out.encode("utf-8")))
