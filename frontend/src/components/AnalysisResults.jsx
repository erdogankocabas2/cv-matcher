import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, HelpCircle, Copy, Check, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function AnalysisResults({ results, onOpenAuthModal }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [checkedKeywords, setCheckedKeywords] = useState({});
  const [subTab, setSubTab] = useState('general'); // 'general', 'suggestions', 'ats'

  if (!results) return null;

  const {
    uygunluk_skoru,
    ozet,
    guclu_yonler,
    eksik_yonler,
    optimizasyon_onerileri,
    mulakat_sorulari,
    eksik_ats_anahtar_kelimeleri,
    cv_optimizasyon_kilavuzu
  } = results;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleKeyword = (kw) => {
    setCheckedKeywords(prev => ({
      ...prev,
      [kw]: !prev[kw]
    }));
  };

  const isLocked = (list) => {
    return list && list.length === 1 && list[0].includes("(Kilitli Özellik)");
  };

  const isGuideLocked = () => {
    return cv_optimizasyon_kilavuzu && cv_optimizasyon_kilavuzu.length === 1 && cv_optimizasyon_kilavuzu[0].mevcut_cumle.includes("(Kilitli Özellik)");
  };

  const renderLockedState = (title) => (
    <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed text-center flex flex-col items-center justify-center min-h-[280px] animate-fadeIn">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl mb-4 shadow-inner">
        <Lock className="w-6 h-6 text-indigo-600 animate-pulse" />
      </div>
      <h4 className="font-extrabold text-slate-800 text-md">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
        Bu gelişmiş analiz detayına, ATS kelime checklistine ve satır satır revize önerilerine erişmek için lütfen ücretsiz giriş yapın veya üye olun.
      </p>
      <button
        onClick={onOpenAuthModal}
        className="mt-5 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95"
      >
        Ücretsiz Giriş Yap / Üye Ol
      </button>
    </div>
  );

  const getSuitabilityMeta = (score) => {
    if (score >= 80) return { label: "GÜÇLÜ EŞLEŞME", class: "text-emerald-600 bg-emerald-50 border-emerald-100", desc: "Evet, güçlü aday görünüyorsunuz." };
    if (score >= 50) return { label: "ORTA EŞLEŞME", class: "text-amber-600 bg-amber-50 border-amber-100", desc: "Evet, ancak CV'nizi önce geliştirmenizi öneriyoruz." };
    return { label: "GELİŞTİRME GEREKLİ", class: "text-rose-600 bg-rose-50 border-rose-100", desc: "Rol beklentileriyle önemli farklar bulunuyor." };
  };

  const meta = getSuitabilityMeta(uygunluk_skoru);

  return (
    <div className="space-y-6">
      
      {/* İÇ SEKMELER (SUB-TABS) */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-full border border-slate-200/40">
        <button
          onClick={() => setSubTab('general')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${subTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
        >
          Genel Rapor
        </button>
        <button
          onClick={() => setSubTab('suggestions')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${subTab === 'suggestions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
        >
          Tavsiyeler & Sorular
        </button>
        <button
          onClick={() => setSubTab('ats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${subTab === 'ats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
        >
          {isGuideLocked() && <Lock className="w-3 h-3 text-slate-400" />}
          ATS & CV İyileştirme
        </button>
      </div>

      {/* --- SEKME 1: GENEL RAPOR --- */}
      {subTab === 'general' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Skor ve Özet Kartı */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center justify-center md:border-r md:border-slate-100 pr-0 md:pr-6 shrink-0 text-center">
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className={`transition-all duration-700 ${uygunluk_skoru >= 80 ? 'text-emerald-600' : uygunluk_skoru >= 50 ? 'text-amber-500' : 'text-rose-600'}`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * uygunluk_skoru) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-slate-900">%{uygunluk_skoru}</span>
              </div>
              <span className={`mt-2 py-0.5 px-2 text-[10px] font-bold rounded ${meta.class}`}>{meta.label}</span>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">CV ile ilan arasındaki içerik ve yetkinlik uyumunu gösterir.</p>
            </div>

            <div className="md:col-span-8 flex flex-col justify-center text-left">
              <span className="text-[10px] font-bold text-slate-400 block tracking-widest uppercase">BAŞVURMALI MISIN?</span>
              <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">{meta.desc}</h4>
              <h5 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-1 mt-4">Değerlendirme Özeti</h5>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold mt-1.5">{ozet}</p>
            </div>
          </div>

          {/* Güçlü ve Eksik Yönler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Güçlü Yönler */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Güçlü Yönler (Eşleşmeler)
              </h3>
              {guclu_yonler && guclu_yonler.length > 0 ? (
                <ul className="space-y-3">
                  {guclu_yonler.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-600 items-start font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-400">Eşleşen belirgin bir yetkinlik tespit edilemedi.</p>}
            </div>

            {/* Eksik Yönler */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Eksik Yönler (Gereksinimler)
              </h3>
              {isLocked(eksik_yonler) ? (
                renderLockedState("Eksik Gereksinim Analizi")
              ) : (
                eksik_yonler && eksik_yonler.length > 0 ? (
                  <ul className="space-y-3">
                    {eksik_yonler.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 items-start font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-400">İlanda kritik bir eksik yön tespit edilmedi.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SEKME 2: TAVSİYELER & SORULAR --- */}
      {subTab === 'suggestions' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CV Optimizasyon Önerileri */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              <Lightbulb className="w-5 h-5 text-indigo-650" />
              CV Optimizasyon Önerileri
            </h3>
            {isLocked(optimizasyon_onerileri) ? (
              renderLockedState("CV İyileştirme Tavsiyeleri")
            ) : (
              optimizasyon_onerileri && optimizasyon_onerileri.length > 0 ? (
                <ul className="space-y-3">
                  {optimizasyon_onerileri.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-600 items-start font-semibold leading-relaxed">
                      <div className="p-1 bg-indigo-50 rounded text-indigo-600 mt-0.5 shrink-0">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-400">CV'niz oldukça optimize görünüyor.</p>
            )}
          </div>

          {/* Mülakat Hazırlık Soruları */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Mülakat Hazırlık Soruları
            </h3>
            {isLocked(mulakat_sorulari) ? (
              renderLockedState("Mülakat Soru Simülasyonu")
            ) : (
              mulakat_sorulari && mulakat_sorulari.length > 0 ? (
                <div className="space-y-3">
                  {mulakat_sorulari.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-150 gap-3">
                      <span className="text-xs text-slate-700 font-bold">{item}</span>
                      <button
                        onClick={() => copyToClipboard(item, idx)}
                        className="p-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-400 hover:text-indigo-600 rounded-lg transition-all shadow-sm shrink-0"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-400">Hazırlanan soru bulunmuyor.</p>
            )}
          </div>
        </div>
      )}

      {/* --- SEKME 3: ATS & CV İYİLEŞTİRME REHBERİ --- */}
      {subTab === 'ats' && (
        <div className="space-y-6 animate-fadeIn">
          {isGuideLocked() ? (
            renderLockedState("ATS Kelime Listesi ve Satır Satır Revize Kılavuzu")
          ) : (
            <>
              {/* Eksik ATS Anahtar Kelimeleri */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2 border-b border-slate-50 pb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  Eksik ATS Anahtar Kelimeleri
                </h3>
                <p className="text-xs text-slate-500 mb-4">Aşağıdaki kelimeler ilanda kritik olup CV'nizde eksiktir. Bunları CV'nize ekledikçe işaretleyebilirsiniz:</p>
                {eksik_ats_anahtar_kelimeleri && eksik_ats_anahtar_kelimeleri.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {eksik_ats_anahtar_kelimeleri.map((kw, idx) => {
                      const isChecked = !!checkedKeywords[kw];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleKeyword(kw)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                            isChecked
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all text-white ${
                            isChecked ? 'bg-emerald-600 border-emerald-700' : 'bg-white border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-slate-400">İlanla eşleşen tüm kritik anahtar kelimeler CV'nizde yer alıyor!</p>}
              </div>

              {/* Satır Satır İyileştirme Kılavuzu */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  CV Satır Satır Revize Önerileri (Before / After)
                </h3>
                {cv_optimizasyon_kilavuzu && cv_optimizasyon_kilavuzu.length > 0 ? (
                  cv_optimizasyon_kilavuzu.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-5 space-y-4">
                        {/* Before / After Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Before */}
                          <div className="md:col-span-5 bg-rose-50/40 p-4 rounded-xl border border-rose-100/50">
                            <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-black uppercase mb-2">CV'deki Mevcut Satır</span>
                            <p className="text-xs font-semibold text-slate-500 italic leading-relaxed">"{item.mevcut_cumle}"</p>
                          </div>

                          {/* Arrow */}
                          <div className="md:col-span-2 flex justify-center text-slate-400">
                            <ArrowRight className="w-6 h-6 hidden md:block" />
                            <div className="block md:hidden py-1">⬇️</div>
                          </div>

                          {/* After */}
                          <div className="md:col-span-5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50 relative">
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase mb-2">ATS Uyumlu Önerilen Satır</span>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">"{item.onerilen_cumle}"</p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50 flex gap-2.5 items-start">
                          <div className="p-1 bg-indigo-100 rounded text-indigo-650 mt-0.5 shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-indigo-700 uppercase">İK Danışmanı Notu:</span>
                            <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">{item.aciklama}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <p className="text-xs text-slate-400">Yazım önerisi bulunamadı.</p>}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
