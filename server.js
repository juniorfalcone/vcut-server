// server.js

const express = require('express');
const path = require('path');
const app = express();
const port = 8000;

// =======================================================
// CRÍTICO PARA FFmpeg.wasm: HABILITAR SharedArrayBuffer
// =======================================================
// O FFmpeg.wasm (em versões mais novas) e o WebAssembly Threading
// exigem esses dois cabeçalhos de resposta HTTP para funcionar.
app.use((req, res, next) => {
    // Cross-Origin-Embedder-Policy: Permite que a página incorpore recursos
    // de outras origens apenas se eles também permitirem.
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Cross-Origin-Opener-Policy: Isolamento da página para prevenir
    // ataques de side-channel.
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

// =======================================================
// SERVIR ARQUIVOS ESTÁTICOS
// =======================================================
// Configura o Express para servir todos os arquivos estáticos 
// (index.html, ffmpeg-assets/, styles.css, etc.)
// a partir do diretório onde o server.js está sendo executado.
app.use(express.static(path.join(__dirname))); 

// =======================================================
// INICIALIZAÇÃO DO SERVIDOR
// =======================================================
app.listen(port, () => {
    console.log(`✅ Servidor Express iniciado com sucesso!`);
    console.log(`🌐 Acesse a aplicação em: http://localhost:${port}`);
    console.log(`   Ou na rede local: http://[SEU.IP.AQUI]:${port}`);
    console.log(`   (Lembre-se de usar o IP do seu computador no celular)`);
    console.log(`🛠️ Cabeçalhos COOP/COEP ativados para FFmpeg.wasm.`);
});