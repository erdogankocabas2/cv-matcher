import React, { useState } from 'react';
import { Briefcase, Link2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function JobInput({ url, setUrl, textFallback, setTextFallback }) {
  const [showFallback, setShowFallback] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-600" />
        2. İş İlanı Bilgileri
      </h2>

      {/* URL Girişi */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          İlan Linki (URL)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Örn: https://www.linkedin.com/jobs/view/..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Manuel Giriş Geçiş Butonu */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowFallback(!showFallback)}
          className="flex items-center justify-between w-full py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {showFallback ? "Manuel İlan Metnini Kapat" : "İlan Metnini Manuel Yapıştır (Önerilen Yedek Yöntem)"}
          </span>
          {showFallback ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Manuel Metin Giriş Alanı */}
        {showFallback && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              İlan Metni (Kopyala & Yapıştır)
            </label>
            <textarea
              value={textFallback}
              onChange={(e) => setTextFallback(e.target.value)}
              rows={6}
              placeholder="Şirketin aradığı nitelikler, iş tanımı ve diğer detayları buraya yapıştırın..."
              className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              LinkedIn veya Kariyer.net gibi sitelerin bot korumasını aşmak için ilan metnini buraya yapıştırabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
