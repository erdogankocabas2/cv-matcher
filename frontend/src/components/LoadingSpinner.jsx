import React from 'react';

export default function LoadingSpinner({ status }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm h-full min-h-[400px]">
      <div className="relative flex items-center justify-center">
        {/* Dış Halka */}
        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
        {/* Dönen Halkak */}
        <div className="absolute w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-800 animate-pulse">Analiz Devam Ediyor</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        {status || "Lütfen bekleyin, CV'niz ve iş ilanı karşılaştırılıyor..."}
      </p>
      <div className="mt-8 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
        Bu işlem ortalama 10-15 saniye sürebilir.
      </div>
    </div>
  );
}
