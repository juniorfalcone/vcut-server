// Obtém referências aos elementos do DOM
const fileInput = document.getElementById('video-file-input');
const cutButton = document.getElementById('cut-button');
const messagesDiv = document.getElementById('messages');
const videoOutputsDiv = document.getElementById('video-outputs');
const startTimeInput = document.getElementById('start-time');
const durationInput = document.getElementById('duration');
const initStatus = document.getElementById('init-status');

let videoFile = null;

// --- Configuração do FFmpeg ---
// IMPORTANTE: Assumimos que 'ffmpeg-core.js' e 'ffmpeg-core.wasm' foram COPIADOS
// para esta pasta 'public/'
const CORE_URL = './public/ffmpeg-core.js'; 

// Desestrutura a API global FFmpeg (disponível porque o script min.js foi carregado no HTML)
const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({ 
    log: true, 
    corePath: CORE_URL,
    
    progress: ({ ratio }) => {
        if (ratio < 1) {
            updateMessage(`Processando corte: ${(ratio * 100).toFixed(2)}%`);
        }
    }
});

// --- Funções Auxiliares ---

function updateMessage(text, isError = false) {
    const p = document.createElement('p');
    p.textContent = text;
    p.style.color = isError ? 'red' : '#555';
    p.style.fontWeight = isError ? 'bold' : 'normal';
    messagesDiv.prepend(p); 
}

function clearOutputs() {
    messagesDiv.innerHTML = '<h2>Processo</h2>';
    videoOutputsDiv.innerHTML = '<h2>Resultado</h2>';
}

function displayVideo(data, name) {
    const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = name;
    
    const video = document.createElement('video');
    video.controls = true;
    video.src = videoURL;
    video.style.maxWidth = '100%';

    const a = document.createElement('a');
    a.href = videoURL;
    a.download = name;
    a.textContent = 'Baixar Vídeo';
    a.style.display = 'block';
    a.style.marginTop = '10px';

    div.appendChild(h3);
    div.appendChild(video);
    div.appendChild(a);
    videoOutputsDiv.appendChild(div);
}

// --- Event Handlers ---

fileInput.addEventListener('change', (e) => {
    clearOutputs();
    videoFile = e.target.files[0];
    if (videoFile) {
        cutButton.disabled = false;
        updateMessage(`Arquivo selecionado: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB).`);
        initStatus.textContent = 'Aguardando clique no botão "Cortar Vídeo" para carregar o WebAssembly Core.';
    } else {
        cutButton.disabled = true;
        updateMessage('Nenhum arquivo selecionado.', true);
        initStatus.textContent = 'Aguardando seleção de vídeo para iniciar.';
    }
});

cutButton.addEventListener('click', async () => {
    if (!videoFile) return;

    cutButton.disabled = true;
    clearOutputs();

    const inputName = 'input.mp4';
    const outputName1 = 'parte1.mp4';
    const outputName2 = 'parte2.mp4';
    const startTime = startTimeInput.value.trim();
    const duration = durationInput.value.trim();
    
    // 1. TENTATIVA DE CARREGAMENTO DO FFmpeg CORE
    try {
        if (!ffmpeg.isLoaded()) {
            initStatus.style.color = 'orange';
            initStatus.textContent = 'Carregando o WebAssembly Core (pode demorar na primeira vez)...';
            
            await ffmpeg.load();
            
            // SUCESSO DE CARREGAMENTO
            initStatus.style.color = 'green';
            initStatus.textContent = '✅ FFmpeg WebAssembly carregado e pronto para uso.';

            updateMessage('FFmpeg WebAssembly carregado com sucesso!');
        } else {
             // Já carregado
             initStatus.style.color = 'green';
             initStatus.textContent = '✅ FFmpeg WebAssembly já carregado e pronto para uso.';
        }

        // 2. INÍCIO DO PROCESSAMENTO
        updateMessage(`Lendo arquivo "${videoFile.name}"...`);
        ffmpeg.FS('writeFile', inputName, await fetchFile(videoFile));

        // --- CORTE 1: Do início (0) até o ponto de corte (-t) ---
        updateMessage(`\n--- INICIANDO CORTE 1: Do início até o tempo: ${startTime} ---`);
        await ffmpeg.run(
            '-i', inputName,
            '-t', startTime,
            '-c', 'copy', // Cópia direta para velocidade, sem recodificar
            outputName1
        );
        updateMessage(`Corte 1 concluído. Arquivo: ${outputName1}`);
        const data1 = ffmpeg.FS('readFile', outputName1);
        displayVideo(data1, outputName1);
        
        // --- CORTE 2: Do ponto de corte (-ss) por uma duração (-t) ---
        updateMessage(`\n--- INICIANDO CORTE 2: De ${startTime} por ${duration} segundos ---`);
        await ffmpeg.run(
            '-ss', startTime,
            '-i', inputName,
            '-t', duration,
            '-c', 'copy', 
            outputName2
        );
        updateMessage(`Corte 2 concluído. Arquivo: ${outputName2}`);
        const data2 = ffmpeg.FS('readFile', outputName2);
        displayVideo(data2, outputName2);

        updateMessage('Processo de corte completo! 🎉', false);

    } catch (error) {
        // MENSAGEM DE ERRO GERAL
        initStatus.style.color = 'red';
        initStatus.textContent = `❌ ERRO FATAL: Verifique o console. ${error.message || ''}`;
        
        console.error("Erro no processamento:", error);
        updateMessage(`ERRO: ${error.message || error}`, true);
    } finally {
        // 3. LIMPEZA E FINALIZAÇÃO
        try {
            if (ffmpeg.isLoaded()) {
                ffmpeg.FS('unlink', inputName);
                ffmpeg.FS('unlink', outputName1);
                ffmpeg.FS('unlink', outputName2);
            }
        } catch (e) {} // Ignora erros de limpeza
        cutButton.disabled = false;
    }
});

// Mensagem inicial de prontidão (executada assim que o script.js é carregado)
if (initStatus) {
    initStatus.textContent = 'Aguardando seleção de vídeo para carregar o WebAssembly Core.';
    initStatus.style.color = 'black'; 
}