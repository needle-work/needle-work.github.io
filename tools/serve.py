#!/usr/bin/env python3
"""Serve the website locally with HTTP Range support for video seeking."""
import argparse, os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path) or "Range" not in self.headers:
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found"); return None
        size = os.fstat(f.fileno()).st_size
        m = re.match(r"bytes=(\d*)-(\d*)", self.headers["Range"])
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end or start >= size:
            self.send_response(416); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); f.close(); return None
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        f.seek(start); self._range = (start, end)
        return f
    def copyfile(self, source, outputfile):
        rng = getattr(self, "_range", None)
        if rng is None:
            return super().copyfile(source, outputfile)
        remaining = rng[1] - rng[0] + 1
        while remaining > 0:
            chunk = source.read(min(1 << 16, remaining))
            if not chunk: break
            outputfile.write(chunk); remaining -= len(chunk)
        self._range = None
    def end_headers(self):
        if "Range" not in self.headers: self.send_header("Accept-Ranges", "bytes"); self.send_header("Cache-Control", "no-cache")
        super().end_headers()
    def log_message(self, *a): pass

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--bind", default="127.0.0.1"); ap.add_argument("--port", type=int, default=8765)
    a = ap.parse_args()
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    ThreadingHTTPServer((a.bind, a.port), RangeHandler).serve_forever()
