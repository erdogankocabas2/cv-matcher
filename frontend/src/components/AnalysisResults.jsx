import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, HelpCircle, Copy, Check } from 'lucide-react';

export default function AnalysisResults({ results }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!results) return null;

  const {
    uygunluk_skoru,
    ozet,
    guclu_yonler,
    eksik_yonler,
    optimizasyon_onerileri,
    mulakat_sorulari
  } = results;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Skor ve Özet Kartı */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 pr-0 md:pr-6 shrink-0">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* SVG Dairesel Grafik */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                className={`transition-all duration-500 ${
                  uygunluk_skoru >= 80 ? 'text-emerald-500' : uygunluk_skoru >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * uygunluk_skoru) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-2xl font-extrabold text-slate-800">
              %{uygunluk_skoru}
            </span>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Uygunluk Skoru
          </span>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Genel Değerlendirme</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{ozet}</p>
        </div>
      </div>

      {/* Güçlü ve Eksik Yönler Kolonları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Güçlü Yönler */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Güçlü Yönler (Eşleşmeler)
          </h3>
          {guclu_yonler && guclu_yonler.length > 0 ? (
            <ul className="space-y-3">
              {guclu_yonler.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-600 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Eşleşen belirgin bir yetkinlik tespit edilemedi.</p>
          )}
        </div>

        {/* Eksik Yönler */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Eksik Yönler (Gereksinimler)
          </h3>
          {eksik_yonler && eksik_yonler.length > 0 ? (
            <ul className="space-y-3">
              {eksik_yonler.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-600 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">İlanda kritik bir eksik yön tespit edilmedi.</p>
          )}
        </div>
      </div>

      {/* CV Önerileri */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
          <Lightbulb className="w-5 h-5 text-indigo-500" />
          CV Optimizasyon Önerileri
        </h3>
        {optimizasyon_onerileri && optimizasyon_onerileri.length > 0 ? (
          <ul className="space-y-3">
            {optimizasyon_onerileri.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-slate-600 items-start">
                <div className="p-1 bg-indigo-50 rounded text-indigo-600 mt-0.5 shrink-0">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">CV'niz bu ilan için oldukça optimize görünüyor.</p>
        )}
      </div>

      {/* Mülakat Hazırlık Soruları */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Mülakat Hazırlık Soruları
        </h3>
        {mulakat_sorulari && mulakat_sorulari.length > 0 ? (
          <div className="space-y-3">
            {mulakat_sorulari.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group gap-3">
                <span className="text-sm text-slate-700 font-medium">{item}</span>
                <button
                  onClick={() => copyToClipboard(item, idx)}
                  className="p-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-400 hover:text-indigo-600 rounded-lg transition-all shadow-sm shrink-0"
                  title="Soruyu Kopyala"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Hazırlanan soru bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
