import React, { useState } from 'react';
import { AlertCircle, Play, FileCheck2 } from 'lucide-react';
import CVUpload from './components/CVUpload';
import JobInput from './components/JobInput';
import AnalysisResults from './components/AnalysisResults';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [textFallback, setTextFallback] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Lütfen öncelikle PDF formatında bir CV dosyası yükleyin.");
      return;
    }
    if (!url.trim() && !textFallback.trim()) {
      setError("Lütfen bir iş ilanı linki girin veya ilan detaylarını manuel yapıştırın.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    // Kullanıcıya aşamaları gösteren motive edici durum mesajları
    const steps = [
      "CV dosyası okunuyor...",
      "İlan kaynağı taranıyor...",
      "İlan detayları çıkarılıyor...",
      "Gemini ile karşılaştırmalı analiz başlatılıyor...",
      "Uygunluk skoru hesaplanıyor...",
      "Rapor oluşturuluyor..."
    ];
    
    let currentStep = 0;
    setLoadingStatus(steps[currentStep]);
    
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingStatus(steps[currentStep]);
      }
    }, 2000);

    try {
      const formData = new FormData();
      formData.append("cv_file", file);
      if (url) formData.append("job_url", url);
      if (textFallback) formData.append("job_text_fallback", textFallback);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Sunucuyla iletişim kurulurken bir hata oluştu.");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "İşlem sırasında bilinmeyen bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header / Üst Menü */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">CV Matcher</h1>
              <p className="text-xs text-slate-400">AI Destekli CV Uygunluk Analizörü</p>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
            Gemini API Entegreli
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sol Panel: Giriş Alanları (5 Sütun) */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3 text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Hata oluştu</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <CVUpload file={file} setFile={setFile} />
          
          <JobInput
            url={url}
            setUrl={setUrl}
            textFallback={textFallback}
            setTextFallback={setTextFallback}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-3.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-4 h-4 fill-white shrink-0" />
            Analizi Başlat
          </button>
        </div>

        {/* Sağ Panel: Analiz Sonuçları (7 Sütun) */}
        <div className="lg:col-span-7 self-stretch min-h-[400px]">
          {loading ? (
            <LoadingSpinner status={loadingStatus} />
          ) : results ? (
            <AnalysisResults results={results} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm h-full min-h-[450px]">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                <FileCheck2 className="w-12 h-12" />
              </div>
              <h3 className="mt-4 text-md font-semibold text-slate-700">Analiz Başlatılmadı</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
                Soldaki alanlardan CV'nizi yükleyin ve başvuru yapacağınız iş ilanını ekleyin. Ardından "Analizi Başlat" butonuna basın.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Alt Bilgi */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 shrink-0">
        © 2026 CV Matcher. Yapay zeka analizleri Gemini modeli tarafından sağlanmaktadır.
      </footer>
    </div>
  );
}
