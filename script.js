const form = document.querySelector('form');
const generateBtn = form.querySelector('button');
const qrInput = form.querySelector('input');
const qrCodeBox = document.querySelector('.qr-code');
const qrImage = qrCodeBox.querySelector('img');
const statusMessage = document.querySelector('.status');
const downloadBtn = document.querySelector('.download');
let requestId = 0;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = qrInput.value.trim();
    if (!value) {
        statusMessage.textContent = 'Gib bitte einen Text oder Link ein.';
        qrInput.focus();
        return;
    }
    const currentRequest = ++requestId;
    const image = new Image();
    qrCodeBox.classList.add('hidden');
    generateBtn.disabled = true;
    generateBtn.textContent = 'QR Code wird erstellt...';
    statusMessage.textContent = '';
    image.onload = () => {
        if (currentRequest !== requestId) return;
        qrImage.src = image.src;
        qrCodeBox.classList.remove('hidden');
        generateBtn.disabled = false;
        generateBtn.textContent = 'QR Code erstellen';
        statusMessage.textContent = 'QR Code wurde erstellt.';
    };
    image.onerror = () => {
        if (currentRequest !== requestId) return;
        generateBtn.disabled = false;
        generateBtn.textContent = 'QR Code erstellen';
        statusMessage.textContent = 'QR Code konnte nicht geladen werden. Bitte erneut versuchen.';
    };
    image.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}`;
});

qrInput.addEventListener('input', () => {
    requestId++;
    qrCodeBox.classList.add('hidden');
    statusMessage.textContent = '';
    generateBtn.disabled = false;
    generateBtn.textContent = 'QR Code erstellen';
});

downloadBtn.addEventListener('click', async () => {
    const currentRequest = requestId;
    downloadBtn.disabled = true;
    try {
        const response = await fetch(qrImage.src);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        if (currentRequest !== requestId) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr-code.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        statusMessage.textContent = 'PNG-Download wurde gestartet.';
    } catch {
        if (currentRequest === requestId) {
            statusMessage.textContent = 'Download fehlgeschlagen. Bitte erneut versuchen.';
        }
    } finally {
        downloadBtn.disabled = false;
    }
});
