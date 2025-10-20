import os
from flask import Flask, send_from_directory

# O nome da pasta onde está seu index.html.
# Por convenção do Flask, templates e arquivos estáticos
# vão em pastas separadas.
# Vamos colocar os arquivos front-end em uma pasta chamada 'public'.
PUBLIC_DIR = 'public' 

app = Flask(__name__)

# Rota principal: serve o index.html (ou o arquivo principal)
@app.route('/')
def serve_index():
    # Isso assume que seu arquivo index.html está na pasta 'public'
    return send_from_directory(PUBLIC_DIR, 'index.html')

# Rota para servir todos os outros arquivos (CSS, JS, WASM, etc.)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(PUBLIC_DIR, path)

if __name__ == '__main__':
    # Você não precisa disso no Render, mas é bom para testes locais.
    app.run(debug=True)
