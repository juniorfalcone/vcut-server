import http.server
import socketserver

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CABEÇALHOS ESSENCIAIS PARA ATIVAR SharedArrayBuffer (COOP/COEP)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    # Método para corrigir o path do index.html (se for acessado sem o nome do arquivo)
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor COOP/COEP iniciado. Acesse o IP do seu computador na porta: {PORT}")
    print(f"Exemplo no celular: http://192.168.x.x:{PORT}/index.html")
    httpd.serve_forever()