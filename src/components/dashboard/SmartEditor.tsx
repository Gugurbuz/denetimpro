import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  AlignLeft,
  Sparkles,
  FileDown,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { GEMINI_API_URL, isGeminiConfigured } from '../../lib/gemini';

interface SmartEditorProps {
  auditName: string;
  auditData?: any;
}

export const SmartEditor: React.FC<SmartEditorProps> = ({ auditName, auditData }) => {
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<string | null>(null);

  const generateContent = async (type: 'summary' | 'email' | 'action-plan') => {
    if (!isGeminiConfigured()) {
      alert('Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasına VITE_GEMINI_API_KEY ekleyin.');
      return;
    }

    setGenerating(true);
    setGenerationType(type);

    try {
      let prompt = '';
      switch (type) {
        case 'summary':
          prompt = `Denetim adı: ${auditName}\n\nYönetici özeti formatında profesyonel bir denetim raporu özeti yaz. Türkçe olmalı. Maksimum 300 kelime.`;
          break;
        case 'email':
          prompt = `Denetim adı: ${auditName}\n\nDenetim sonuçlarını bildiren profesyonel bir e-posta taslağı hazırla. Türkçe, resmi dil kullan.`;
          break;
        case 'action-plan':
          prompt = `Denetim adı: ${auditName}\n\nDenetim bulgularına dayalı detaylı bir eylem planı oluştur. Türkçe, madde madde liste formatında.`;
          break;
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || 'İçerik oluşturulamadı.';

      setContent((prev) => (prev ? prev + '\n\n' + generatedText : generatedText));
    } catch (err) {
      console.error('Generation error:', err);
      alert('İçerik oluşturulurken bir hata oluştu.');
    } finally {
      setGenerating(false);
      setGenerationType(null);
    }
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'list') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = selectedText
          .split('\n')
          .map((line) => `• ${line}`)
          .join('\n');
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const exportAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${auditName.replace(/\s+/g, '_')}_rapor.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">Akıllı Rapor Editörü</h3>
          <button
            onClick={exportAsText}
            disabled={!content}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium disabled:opacity-50"
          >
            <FileDown size={18} />
            <span>Dışa Aktar</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyFormatting('bold')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Kalın"
          >
            <Bold size={18} className="text-slate-700" />
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="İtalik"
          >
            <Italic size={18} className="text-slate-700" />
          </button>
          <button
            onClick={() => applyFormatting('list')}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Liste"
          >
            <List size={18} className="text-slate-700" />
          </button>
          <div className="w-px bg-slate-300 mx-2" />
          <button
            onClick={() => generateContent('summary')}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {generating && generationType === 'summary' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>Yönetici Özeti</span>
          </button>
          <button
            onClick={() => generateContent('email')}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {generating && generationType === 'email' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <AlignLeft size={16} />
            )}
            <span>E-posta Taslağı</span>
          </button>
          <button
            onClick={() => generateContent('action-plan')}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {generating && generationType === 'action-plan' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            <span>Eylem Planı</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white min-h-full shadow-lg border border-slate-200 rounded-xl p-12">
          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Rapor içeriğini buraya yazın veya AI ile otomatik oluşturun..."
            className="w-full h-full min-h-[600px] resize-none focus:outline-none text-slate-800 leading-relaxed"
            style={{ fontFamily: 'Georgia, serif', fontSize: '16px' }}
          />
        </div>
      </div>

      {generating && (
        <div className="border-t border-slate-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Loader2 size={20} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              AI içerik oluşturuyor, lütfen bekleyin...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
