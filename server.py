# Exemplo em server.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/') # Esta é a rota principal (a URL raiz)
def index():
    return render_template('index.html')
# ... outras rotas
