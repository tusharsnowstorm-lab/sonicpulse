import http.server
import socketserver
import os
import sys

PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8791
ROOT = sys.argv[1] if len(sys.argv) > 1 else "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split('?')[0]
        fs_path = os.path.join(ROOT, path.lstrip('/'))
        if path != '/' and not os.path.splitext(path)[1]:
            if os.path.exists(fs_path + '.html'):
                # Expo's static export emits flat top-level routes as
                # "route.html" rather than "route/index.html" — serve that
                # directly instead of falling through to the SPA fallback,
                # which would otherwise serve the wrong page's HTML and
                # guarantee a client hydration mismatch.
                self.path = path + '.html'
            elif not os.path.exists(fs_path):
                # SPA fallback for client-side routes without a static HTML file
                self.path = '/index.html'
        return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
