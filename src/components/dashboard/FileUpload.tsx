import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (data: ParsedData) => void;
  onLoadDemo: () => void;
}

export interface ParsedData {
  fileName: string;
  recordCount: number;
  totalDebit: number;
  totalCredit: number;
  dateRange: { start: string; end: string };
  accounts: Array<{ code: string; name: string; balance: number }>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, onLoadDemo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.xml')) {
      setError('Lütfen geçerli bir XML dosyası seçin.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Dosya boyutu 50MB\'dan küçük olmalıdır.');
      return;
    }
    setSelectedFile(file);
  };

  const parseXMLFile = async () => {
    if (!selectedFile) return;

    setParsing(true);
    setError(null);

    try {
      const text = await selectedFile.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML dosyası ayrıştırılamadı.');
      }

      const entries = xmlDoc.querySelectorAll('JournalEntry');
      const accounts = new Map<string, { name: string; balance: number }>();
      let totalDebit = 0;
      let totalCredit = 0;
      let minDate = '';
      let maxDate = '';

      entries.forEach((entry) => {
        const date = entry.querySelector('Date')?.textContent || '';
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;

        const lines = entry.querySelectorAll('Line');
        lines.forEach((line) => {
          const accountCode = line.querySelector('AccountID')?.textContent || '';
          const accountName = line.querySelector('AccountName')?.textContent || accountCode;
          const debit = parseFloat(line.querySelector('DebitAmount')?.textContent || '0');
          const credit = parseFloat(line.querySelector('CreditAmount')?.textContent || '0');

          totalDebit += debit;
          totalCredit += credit;

          const current = accounts.get(accountCode) || { name: accountName, balance: 0 };
          current.balance += debit - credit;
          accounts.set(accountCode, current);
        });
      });

      const parsedData: ParsedData = {
        fileName: selectedFile.name,
        recordCount: entries.length,
        totalDebit,
        totalCredit,
        dateRange: { start: minDate, end: maxDate },
        accounts: Array.from(accounts.entries()).map(([code, data]) => ({
          code,
          name: data.name,
          balance: data.balance,
        })),
      };

      onFileLoaded(parsedData);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Dosya işlenirken bir hata oluştu. Lütfen geçerli bir e-Defter XML dosyası kullanın.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-2xl w-full">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-[2.5rem]" />

        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Veri Yükleme</h2>
          <p className="text-slate-500">Yevmiye defteri XML dosyanızı yükleyin veya demo veriyi kullanın</p>
        </div>

        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
          >
            <FileText size={48} className={`mx-auto mb-4 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
            <p className="text-slate-700 font-medium mb-2">
              Dosyayı buraya sürükleyin veya tıklayarak seçin
            </p>
            <p className="text-sm text-slate-500 mb-4">XML formatında e-Defter dosyası (Maks. 50MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition font-medium"
            >
              Dosya Seç
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setError(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-lg transition"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <button
              onClick={parseXMLFile}
              disabled={parsing}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {parsing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Dosyayı Analiz Et
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-slate-500 font-medium">veya</span>
          </div>
        </div>

        <button
          onClick={onLoadDemo}
          disabled={parsing}
          className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition font-bold disabled:opacity-50"
        >
          Demo Veriyi Kullan
        </button>
      </div>
    </div>
  );
};
