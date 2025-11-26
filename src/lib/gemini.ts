const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ VITE_GEMINI_API_KEY is not set. AI features will be disabled.');
}

// DÜZELTME: API URL'leri güncellendi (2.5-flash-preview-09-2025'i kullanıyoruz)
export const GEMINI_API_URL = apiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`
  : '';

// DÜZELTME: TTS URL'si doğru model ve endpoint ile güncellendi
export const GEMINI_TTS_URL = apiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`
  : '';

export const isGeminiConfigured = () => !!apiKey;

export const validateGeminiConfig = () => {
  if (!apiKey) {
    throw new Error('Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasına VITE_GEMINI_API_KEY ekleyin.');
  }
};

// HELPER: PCM to WAV Converter for Gemini TTS
export const pcmToWav = (value: string): ArrayBuffer => {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  // ArrayBuffer boyutunu hesapla (44 byte RIFF başlığı + veri boyutu)
  // Base64 string'i 16-bit PCM olduğu için her karakter 2 byte'a denk gelir (genel kural)
  const dataSize = (value.length * 3) / 4; // Tahmini Base64 decode boyutu

  // Kesin boyut için Base64'ten ArrayBuffer'a dönüştürme yapmalıyız
  const binaryString = window.atob(value);
  const dataLength = binaryString.length;

  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Veriyi kopyala (Doğrudan base64'ten ArrayBuffer'a)
  let offset = 44;
  for (let i = 0; i < dataLength; i++) {
    view.setUint8(offset + i, binaryString.charCodeAt(i));
  }

  return buffer;
};