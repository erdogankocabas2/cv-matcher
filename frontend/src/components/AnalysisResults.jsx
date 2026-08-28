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
    <div className="bg-slate-950/40 p-8 rounded-2xl border border-slate-800 border-dashed text-center flex flex-col items-center justify-center min-h-[280px] animate-fadeIn">
      <div className="p-4 bg-sky-500/10 text-sky-400 rounded-xl mb-4 shadow-inner">
        <Lock className="w-6 h-6 text-sky-400 animate-pulse" />
      </div>
      <h4 className="font-extrabold text-white text-md">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed font-medium">
        Bu gelişmiş analiz detayına, ATS kelime checklistine ve satır satır revize önerilerine erişmek için lütfen ücretsiz giriş yapın veya üye olun.
      </p>
      <button
        onClick={onOpenAuthModal}
        className="mt-5 py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/10 transition-all duration-200 active:scale-95"
      >
        Ücretsiz Giriş Yap / Üye Ol
      </button>
    </div>
  );

  const getSuitabilityMeta = (score) => {
    if (score >= 80) return { label: "GÜÇLÜ EŞLEŞME", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", desc: "Evet, güçlü aday görünüyorsunuz." };
    if (score >= 50) return { label: "ORTA EŞLEŞME", class: "text-amber-500 bg-amber-500/10 border-amber-500/25", desc: "Evet, ancak CV'nizi önce geliştirmenizi öneriyoruz." };
    return { label: "GELİŞTİRME GEREKLİ", class: "text-rose-455 bg-rose-500/10 border-rose-500/25", desc: "Rol beklentileriyle önemli farklar bulunuyor." };
  };

  const meta = getSuitabilityMeta(uygunluk_skoru);

  return (
    <div className="space-y-6">
      
      {/* İÇ SEKMELER (SUB-TABS) */}
      <div className="flex gap-2 bg-[#090D1A] p-1 rounded-2xl w-full border border-slate-800">
        <button
          onClick={() => setSubTab('general')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${subTab === 'general' ? 'bg-[#131B2E] text-sky-400 shadow-sm border border-slate-800/50' : 'text-slate-400 hover:text-white'}`}
        >
          Genel Rapor
        </button>
        <button
          onClick={() => setSubTab('suggestions')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${subTab === 'suggestions' ? 'bg-[#131B2E] text-sky-400 shadow-sm border border-slate-800/50' : 'text-slate-400 hover:text-white'}`}
        >
          Tavsiyeler & Sorular
        </button>
        <button
          onClick={() => setSubTab('ats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${subTab === 'ats' ? 'bg-[#131B2E] text-sky-400 shadow-sm border border-slate-800/50' : 'text-slate-400 hover:text-white'}`}
        >
          {isGuideLocked() && <Lock className="w-3 h-3 text-slate-500" />}
          ATS & CV İyileştirme
        </button>
      </div>

      {/* --- SEKME 1: GENEL RAPOR --- */}
      {subTab === 'general' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Skor ve Özet Kartı */}
          <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center justify-center md:border-r md:border-slate-800 pr-0 md:pr-6 shrink-0 text-center">
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className={`transition-all duration-700 ${uygunluk_skoru >= 80 ? 'text-emerald-500' : uygunluk_skoru >= 50 ? 'text-amber-500' : 'text-rose-500'}`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * uygunluk_skoru) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-white">%{uygunluk_skoru}</span>
              </div>
              <span className={`mt-2 py-0.5 px-2 text-[10px] font-bold rounded ${meta.class}`}>{meta.label}</span>
              <p className="text-[10px] text-slate-450 mt-2 font-medium">CV ile ilan arasındaki içerik ve yetkinlik uyumunu gösterir.</p>
            </div>

            <div className="md:col-span-8 flex flex-col justify-center text-left">
              <span className="text-[10px] font-bold text-slate-400 block tracking-widest uppercase">BAŞVURMALI MISIN?</span>
              <h4 className="text-lg font-extrabold text-white mt-0.5">{meta.desc}</h4>
              <h5 className="text-[10px] font-bold text-slate-455 tracking-wider uppercase border-b border-slate-800 pb-1 mt-4">Değerlendirme Özeti</h5>
              <p className="text-sm text-slate-300 leading-relaxed font-semibold mt-1.5">{ozet}</p>
            </div>
          </div>

          {/* Güçlü ve Eksik Yönler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Güçlü Yönler */}
            <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Güçlü Yönler (Eşleşmeler)
              </h3>
              {guclu_yonler && guclu_yonler.length > 0 ? (
                <ul className="space-y-3">
                  {guclu_yonler.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-300 items-start font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-500">Eşleşen belirgin bir yetkinlik tespit edilemedi.</p>}
            </div>

            {/* Eksik Yönler */}
            <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Eksik Yönler (Gereksinimler)
              </h3>
              {isLocked(eksik_yonler) ? (
                renderLockedState("Eksik Gereksinim Analizi")
              ) : (
                eksik_yonler && eksik_yonler.length > 0 ? (
                  <ul className="space-y-3">
                    {eksik_yonler.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-300 items-start font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-500">İlanda kritik bir eksik yön tespit edilmedi.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SEKME 2: TAVSİYELER & SORULAR --- */}
      {subTab === 'suggestions' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CV Optimizasyon Önerileri */}
          <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lightbulb className="w-5 h-5 text-sky-400" />
              CV Optimizasyon Önerileri
            </h3>
            {isLocked(optimizasyon_onerileri) ? (
              renderLockedState("CV İyileştirme Tavsiyeleri")
            ) : (
              optimizasyon_onerileri && optimizasyon_onerileri.length > 0 ? (
                <ul className="space-y-3">
                  {optimizasyon_onerileri.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-slate-300 items-start font-semibold leading-relaxed">
                      <div className="p-1 bg-sky-500/10 rounded text-sky-400 mt-0.5 shrink-0">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-500">CV'niz oldukça optimize görünüyor.</p>
            )}
          </div>

          {/* Mülakat Hazırlık Soruları */}
          <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              Mülakat Hazırlık Soruları
            </h3>
            {isLocked(mulakat_sorulari) ? (
              renderLockedState("Mülakat Soru Simülasyonu")
            ) : (
              mulakat_sorulari && mulakat_sorulari.length > 0 ? (
                <div className="space-y-3">
                  {mulakat_sorulari.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 gap-3">
                      <span className="text-xs text-slate-300 font-bold">{item}</span>
                      <button
                        onClick={() => copyToClipboard(item, idx)}
                        className="p-1.5 bg-[#131B2E] border border-slate-700 hover:border-sky-500 text-slate-400 hover:text-sky-400 rounded-lg transition-all shadow-sm shrink-0"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-500">Hazırlanan soru bulunmuyor.</p>
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
              <div className="bg-[#131B2E] p-6 rounded-2xl border border-slate-800/80 shadow-md">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                  Eksik ATS Anahtar Kelimeleri
                </h3>
                <p className="text-xs text-slate-450 mb-4 font-semibold">Aşağıdaki kelimeler ilanda kritik olup CV'nizde eksiktir. Bunları CV'nize ekledikçe işaretleyebilirsiniz:</p>
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
                              ? 'bg-emerald-550/15 text-emerald-400 border-emerald-500/30 shadow-sm'
                              : 'bg-slate-950/40 text-slate-300 hover:bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all text-white ${
                            isChecked ? 'bg-emerald-500 border-emerald-600' : 'bg-[#131B2E] border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-slate-500">İlanla eşleşen tüm kritik anahtar kelimeler CV'nizde yer alıyor!</p>}
              </div>

              {/* Satır Satır İyileştirme Kılavuzu */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                  CV Satır Satır Revize Önerileri (Before / After)
                </h3>
                {cv_optimizasyon_kilavuzu && cv_optimizasyon_kilavuzu.length > 0 ? (
                  cv_optimizasyon_kilavuzu.map((item, idx) => (
                    <div key={idx} className="bg-[#131B2E] rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
                      <div className="p-5 space-y-4">
                        {/* Before / After Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Before */}
                          <div className="md:col-span-5 bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                            <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-455 rounded text-[9px] font-black uppercase mb-2">CV'deki Mevcut Satır</span>
                            <p className="text-xs font-semibold text-slate-400 italic leading-relaxed">"{item.mevcut_cumle}"</p>
                          </div>

                          {/* Arrow */}
                          <div className="md:col-span-2 flex justify-center text-slate-600">
                            <ArrowRight className="w-6 h-6 hidden md:block" />
                            <div className="block md:hidden py-1">⬇️</div>
                          </div>

                          {/* After */}
                          <div className="md:col-span-5 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 relative">
                            <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-black uppercase mb-2">ATS Uyumlu Önerilen Satır</span>
                            <p className="text-xs font-bold text-white leading-relaxed">"{item.onerilen_cumle}"</p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-sky-500/5 p-4 rounded-xl border border-sky-500/20 flex gap-2.5 items-start">
                          <div className="p-1 bg-sky-500/15 rounded text-sky-400 mt-0.5 shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-sky-400 uppercase">İK Danışmanı Notu:</span>
                            <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">{item.aciklama}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <p className="text-xs text-slate-500">Yazım önerisi bulunamadı.</p>}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
