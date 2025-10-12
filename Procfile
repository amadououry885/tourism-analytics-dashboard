web: sh -lc 'python3 - <<PY
import http.server, socketserver
PORT=8000
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.end_headers(); self.wfile.write(b"OK from http.server\\n")
with socketserver.TCPServer(("127.0.0.1", PORT), H) as httpd:
    print(f"Listening at: http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
PY'
