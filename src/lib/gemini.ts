const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ VITE_GEMINI_API_KEY is not set. AI features will be disabled.');
}

export const GEMINI_API_URL = apiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
  : '';

export const GEMINI_TTS_URL = apiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
  : '';

export const isGeminiConfigured = () => !!apiKey;

export const validateGeminiConfig = () => {
  if (!apiKey) {
    throw new Error('Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasına VITE_GEMINI_API_KEY ekleyin.');
  }
};

// Helper: PCM to WAV Converter for Gemini TTS
export const pcmToWav = (value: string): ArrayBuffer => {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = value.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const binaryString = window.atob(value);
  let offset = 44;
  for (let i = 0; i < binaryString.length; i += 2) {
    const byte1 = binaryString.charCodeAt(i);
    const byte2 = binaryString.charCodeAt(i + 1);
    const sample = (byte2 << 8) | byte1;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return buffer;
};
