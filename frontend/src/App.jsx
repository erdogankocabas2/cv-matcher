import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertCircle, Play, FileCheck2, Info, 
  CheckCircle, Lightbulb, HelpCircle, X, Check, 
  Lock, Plus, ChevronRight, ArrowRight, Sparkles, History 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

import AnalysisResults from './components/AnalysisResults';

export default function App() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  // Onboarding & Flow States
  const [flowState, setFlowState] = useState('landing'); // 'landing', 'cv_upload', 'job_input', 'loading', 'preview', 'full_result', 'dashboard'
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [textFallback, setTextFallback] = useState('');
  const [jobMethod, setJobMethod] = useState('url'); 
  const [dragActive, setDragActive] = useState(false);

  // Loading & Analysis State
  const [loadingStatus, setLoadingStatus] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Auth UI State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Onboarding Fields
  const [obStatus, setObStatus] = useState('');
  const [obRoles, setObRoles] = useState('');
  const [obLocation, setObLocation] = useState('Remote');
  const [obSearch, setObSearch] = useState('');
  const [obLoading, setObLoading] = useState(false);

  // Privacy Tooltip State
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.supabase_url && cfg.supabase_anon_key) {
          const client = createClient(cfg.supabase_url, cfg.supabase_anon_key);
          setSupabaseClient(client);

          client.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
              loadHistory(session.access_token);
              setFlowState('dashboard');
            }
          });

          client.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
              loadHistory(session.access_token);
            } else {
              setHistory([]);
              setFlowState('landing');
            }
          });
        }
      })
      .catch((err) => console.error("Supabase config yükleme hatası:", err));
  }, []);

  const loadHistory = async (token) => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Geçmiş yükleme hatası:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");
      
      setTimeout(() => {
        setShowAuthModal(false);
        resetAuthForm();
        if (file && (url || textFallback)) {
          runAnalysis(data.session.access_token);
        } else {
          setFlowState('dashboard');
        }
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Giriş yapılamadı.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      setAuthSuccess("Kayıt başarılı! Hesabınız açıldı.");
      
      setTimeout(() => {
        setShowAuthModal(false);
        resetAuthForm();
        setShowOnboarding(true);
        if (file && (url || textFallback)) {
          runAnalysis(data.session.access_token);
        } else {
          setFlowState('dashboard');
        }
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Kayıt işlemi başarısız.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setFile(null);
    setUrl('');
    setTextFallback('');
    setResults(null);
    setFlowState('landing');
  };

  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!session?.access_token) {
      setShowOnboarding(false);
      return;
    }
    setObLoading(true);

    try {
      const rolesArray = obRoles.split(',').map(r => r.trim()).filter(r => r.length > 0);
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          current_status: obStatus,
          target_roles: rolesArray,
          preferred_location: obLocation,
          job_search_status: obSearch
        })
      });
      setShowOnboarding(false);
    } catch (err) {
      console.error("Onboarding kaydetme hatası:", err);
    } finally {
      setObLoading(false);
    }
  };

  const triggerAnalysis = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Lütfen önce bir CV yükleyin.");
      return;
    }
    if (jobMethod === 'url' && !url.trim()) {
      setError("Lütfen geçerli bir ilan linki girin.");
      return;
    }
    if (jobMethod === 'text' && !textFallback.trim()) {
      setError("Lütfen ilan metnini yapıştırın.");
      return;
    }

    setError(null);
    runAnalysis(session?.access_token || null);
  };

  const runAnalysis = async (token) => {
    setFlowState('loading');
    setResults(null);

    const steps = [
      "CV'nizdeki deneyimleri inceliyoruz...",
      "İlanın beklentilerini çıkarıyoruz...",
      "Yetkinliklerinizi karşılaştırıyoruz...",
      "Eksik anahtar kelimeleri kontrol ediyoruz...",
      "Sana özel önerileri hazırlıyoruz..."
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
      if (url && jobMethod === 'url') formData.append("job_url", url);
      if (textFallback && jobMethod === 'text') formData.append("job_text_fallback", textFallback);

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: headers,
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Sunucuyla iletişim kurulurken bir hata oluştu.");
      }

      const data = await response.json();
      setResults(data);

      if (token) {
        loadHistory(token);
        setFlowState('full_result');
      } else {
        setFlowState('preview');
      }
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "İşlem sırasında bilinmeyen bir hata meydana geldi.");
      setFlowState(file ? 'job_input' : 'cv_upload');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setFlowState('job_input');
      } else {
        alert("Lütfen yalnızca PDF formatında bir dosya yükleyin.");
      }
    }
  };

  const loadSavedResult = (scan) => {
    setResults(scan.results);
    setFlowState('full_result');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-650">
      
      {/* NAV BAR */}
      <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => user ? setFlowState('dashboard') : setFlowState('landing')}>
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">CV Matcher</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5 font-mono">Autofit AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setFile(null); setUrl(''); setTextFallback(''); setFlowState('cv_upload'); }}
                  className="hidden sm:flex py-2 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
                >
                  Yeni Analiz Yap
                </button>
                <button
                  onClick={() => setFlowState('dashboard')}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${flowState === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Analizlerim
                </button>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <button
                onClick={() => { resetAuthForm(); setIsSignUp(false); setShowAuthModal(true); }}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">

        {error && (
          <div className="max-w-xl mx-auto w-full mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-extrabold text-slate-900">Bir Sorun Oluştu</p>
              <p className="mt-0.5 text-xs text-slate-605">{error}</p>
            </div>
          </div>
        )}

        {/* 1. LANDING PAGE */}
        {flowState === 'landing' && (
          <div className="py-12 space-y-12 max-w-5xl mx-auto w-full text-center animate-fadeIn">
            <div className="space-y-6">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold border border-indigo-100 uppercase tracking-wider">
                Özgeçmiş Eşleştirme Motoru
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
                Bu işe ne kadar uygunsun?
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                CV'ni ve iş ilanını ekle. Uygunluk skorunu, güçlü yönlerini, eksiklerini ve CV'ni nasıl geliştirebileceğini saniyeler içinde gör.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setFlowState('cv_upload')}
                  className="py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                  CV'mi Analiz Et
                </button>
                <a
                  href="#how-it-works"
                  className="py-4 px-8 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                  Nasıl Çalışıyor?
                </a>
              </div>
            </div>

            <div id="how-it-works" className="pt-12 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4">1</div>
                  <h4 className="font-bold text-slate-900 text-sm">CV'ni Yükle</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">PDF formatındaki güncel CV'ni yükle.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4">2</div>
                  <h4 className="font-bold text-slate-900 text-sm">İş İlanını Ekle</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">İlan linkini yapıştır veya metnini doğrudan ekle.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4">3</div>
                  <h4 className="font-bold text-slate-900 text-sm">Analizini Gör</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">Eksiklerini giderip işe kabul şansını katla.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CV UPLOAD STEP */}
        {flowState === 'cv_upload' && (
          <div className="max-w-xl mx-auto w-full animate-fadeIn space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Önce CV'ni ekleyelim</h2>
              <p className="text-xs text-slate-400 mt-1">Lütfen analiz edilecek PDF formatındaki özgeçmişinizi yükleyin.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => { if(e.target.files[0]) { setFile(e.target.files[0]); setFlowState('job_input'); } }}
                className="hidden"
                id="cv-wizard-upload-app"
              />
              <label
                htmlFor="cv-wizard-upload-app"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-10 text-center cursor-pointer transition-all duration-200 bg-slate-50/50 ${
                  dragActive ? "border-indigo-600 bg-indigo-50/30 scale-[1.01]" : ""
                }`}
              >
                <div className="p-4 bg-indigo-50 text-indigo-650 rounded-xl mb-3 shadow-inner">
                  <FileText className="w-10 h-10" />
                </div>
                <p className="text-sm font-semibold text-slate-700">CV dosyasını sürükleyin veya dosya seçin</p>
                <p className="text-xs text-slate-400 mt-1">Sadece PDF formatı desteklenir (Maks. 10MB)</p>
              </label>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-between text-center gap-2">
                <p className="text-[11px] text-slate-400 font-medium">
                  🔒 CV'n yalnızca analiz için kullanılır.
                </p>
                <button
                  onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Verilerim nasıl kullanılıyor?
                </button>
                {showPrivacyTooltip && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-100 text-[10px] text-slate-650 rounded-lg leading-relaxed text-left animate-fadeIn">
                    Yüklediğiniz CV dosyaları hiçbir veritabanında doğrudan saklanmaz. Dosyadaki metin çıkarılarak analiz amacıyla sadece Gemini API'ye gönderilir ve analiz sonunda bellekten kalıcı olarak silinir.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. JOB INPUT STEP */}
        {flowState === 'job_input' && (
          <div className="max-w-xl mx-auto w-full animate-fadeIn space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Şimdi hedeflediğin işi ekle</h2>
              <p className="text-xs text-slate-400 mt-1">Link veya iş tanımı metniyle ilanı ekleyin.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              {file && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-650 flex items-center gap-1.5 truncate">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> CV Eklendi: {file.name}
                  </span>
                  <button onClick={() => { setFile(null); setFlowState('cv_upload'); }} className="text-slate-400 hover:text-rose-600 font-bold underline">Değiştir</button>
                </div>
              )}

              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setJobMethod('url')}
                  className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all ${jobMethod === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  İlan Linki (URL)
                </button>
                <button
                  onClick={() => setJobMethod('text')}
                  className={`flex-grow py-2 rounded-lg text-xs font-bold transition-all ${jobMethod === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  İlan Metni
                </button>
              </div>

              {jobMethod === 'url' ? (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">İlan linki</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="LinkedIn, Kariyer.net veya iş ilanı linkini yapıştır"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">İlan açıklaması</label>
                  <textarea
                    value={textFallback}
                    onChange={(e) => setTextFallback(e.target.value)}
                    rows={6}
                    placeholder="İş ilanındaki açıklamayı buraya yapıştırın..."
                    className="block w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white resize-none"
                  />
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-semibold text-center">İkisinden biri yeterli.</p>

              <button
                onClick={triggerAnalysis}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                Uygunluğumu Analiz Et
              </button>
            </div>
          </div>
        )}

        {/* 4. LOADING EXPERIENCE */}
        {flowState === 'loading' && (
          <div className="max-w-xl mx-auto w-full text-center py-16 animate-fadeIn">
            <LoadingSpinner status={loadingStatus} />
          </div>
        )}

        {/* 5. PREVIEW RESULTS */}
        {flowState === 'preview' && results && (
          <div className="space-y-6 max-w-4xl mx-auto w-full animate-fadeIn relative pb-32">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold uppercase">İlk Değerlendirme Hazır</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Önizleme Raporu</h2>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 pr-0 md:pr-6 shrink-0">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="text-amber-500 transition-all duration-700"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * results.uygunluk_skoru) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-2xl font-extrabold text-slate-905">%{results.uygunluk_skoru}</span>
                </div>
                <span className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Uyum Oranı</span>
              </div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Önizleme Özeti</h3>
                <p className="text-sm text-slate-655 leading-relaxed font-semibold">{results.ozet}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
                <h4 className="font-bold text-slate-900 text-sm">Güçlü Eşleşme</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {results.guclu_yonler && results.guclu_yonler[0] ? results.guclu_yonler[0] : "Temel yetkinlikleriniz ilan gereksinimleriyle uyumlu görünüyor."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl w-fit mb-3"><AlertCircle className="w-5 h-5 text-rose-600" /></div>
                <h4 className="font-bold text-slate-900 text-sm">Geliştirme Alanı</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  İlanda geçen kritik yetkinliklerin bir kısmı CV'nizde yeterince belirgin yazılmamış.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl w-fit mb-3"><Sparkles className="w-5 h-5 text-indigo-600" /></div>
                <h4 className="font-bold text-slate-900 text-sm">ATS Uyumluluğu</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Sektörel bazı anahtar kelimelerin eksikliği sebebiyle ATS filtrelerini geçme şansınız düşebilir.
                </p>
              </div>
            </div>

            <div className="relative pointer-events-none opacity-40 filter blur-[2px]">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>

            {/* Glassmorphism Blur Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-64 flex flex-col items-center justify-end p-8 text-center bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
              <div className="max-w-md space-y-4">
                <h3 className="text-xl font-extrabold text-slate-900">Tam Raporunuz Hazır! 🎯</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Detaylı eksik analizi, interaktif ATS anahtar kelime listesi, satır satır Before/After CV revize önerileri ve mülakat hazırlık sorularının tamamını görmek için ücretsiz üye olun.
                </p>
                <button
                  onClick={() => { resetAuthForm(); setIsSignUp(true); setShowAuthModal(true); }}
                  className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-white" />
                  Tam Analizi Gör (Ücretsiz)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. FULL RESULTS */}
        {flowState === 'full_result' && results && (
          <div className="space-y-6 animate-fadeIn">
            <AnalysisResults
              results={results}
              onOpenAuthModal={() => { resetAuthForm(); setIsSignUp(false); setShowAuthModal(true); }}
            />
          </div>
        )}

        {/* 7. DASHBOARD */}
        {flowState === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Yönetim Paneli</h2>
                <p className="text-xs text-slate-450 mt-0.5">Analizlerinizi yönetin ve yeni karşılaştırmalar başlatın.</p>
              </div>
              <button
                onClick={() => { setFile(null); setUrl(''); setTextFallback(''); setFlowState('cv_upload'); }}
                className="py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" /> Yeni İş Analizi
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" /> Analiz Geçmişiniz
                  </h3>
                  {history.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => loadSavedResult(item)}
                          className="p-4 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200 hover:border-indigo-200/50 rounded-xl transition-all duration-200 cursor-pointer flex justify-between items-center group"
                        >
                          <div className="overflow-hidden pr-4">
                            <p className="text-sm font-bold text-slate-700 truncate">{item.cv_filename || "Bilinmeyen CV"}</p>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              {item.job_url ? item.job_url : "Manuel İlan Girişi"} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`py-1.5 px-3 rounded-full text-xs font-black shrink-0 ${
                              item.score >= 80 ? 'bg-emerald-50 text-emerald-600' :
                              item.score >= 50 ? 'bg-amber-50 text-amber-600' :
                              'bg-rose-50 text-rose-600'
                            }`}>
                              %{item.score}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-8">
                      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 mb-3 shadow-inner">
                        <FileText className="w-10 h-10 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">İlk iş eşleşmeni bulalım</h4>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                        CV'nizi bir iş ilanıyla karşılaştırın ve nerede güçlü olduğunuzu anında görün.
                      </p>
                      <button
                        onClick={() => { setFile(null); setUrl(''); setTextFallback(''); setFlowState('cv_upload'); }}
                        className="mt-4 py-2 px-5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
                      >
                        İlk Analizimi Yap
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Aktif CV Bilgisi</h3>
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <FileText className="w-8 h-8 text-indigo-650" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-750 truncate">{history[0].cv_filename}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Son güncelleme: {new Date(history[0].created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setFile(null); setUrl(''); setTextFallback(''); setFlowState('cv_upload'); }}
                        className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-600 text-xs font-bold rounded-xl transition-all"
                      >
                        CV'yi Değiştir / Güncelle
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Kayıtlı CV bulunmuyor.</p>
                  )}
                </div>

                {history.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Genel Analitik Çıktı</h3>
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-xl">
                      <p className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">Hızlı Tavsiye</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1.5 leading-relaxed">
                        Son yaptığınız analizlere göre en sık eksik çıkan yetkinlik: **İletişim ve Süreç Optimizasyonu**. CV'nizde bu alandaki projelerinizi ön plana çıkarabilirsiniz.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 shrink-0 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-650 rounded-xl text-white">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-md font-bold text-white">CV Matcher</h4>
              <p className="text-[10px] text-slate-400">Yapay Zeka Destekli Kariyer Aracınız</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p>© 2026 CV Matcher. Analiz motoru Gemini 3.6 Flash tarafından desteklenmektedir.</p>
            <div className="flex gap-4 text-slate-500">
              <a href="#privacy" className="hover:underline">Kullanım Şartları</a>
              <a href="#privacy" className="hover:underline">Gizlilik Politikası</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-6 relative overflow-hidden">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-6">
              {isSignUp ? "Analizin hazır 🎯" : "Tekrar hoş geldin"}
            </h3>
            <p className="text-xs text-slate-400 text-center -mt-4 mb-6 leading-relaxed font-medium">
              {isSignUp ? "Tam sonucu görmek ve analizlerini kaydetmek için ücretsiz hesabını oluştur." : "Kayıtlı analizlerinizi görmek için giriş yapın."}
            </p>

            {authError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-750 rounded-xl text-xs font-semibold flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">E-posta Adresi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adsoyad@sirket.com"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">Şifre</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isSignUp ? "Hesap Oluştur" : "Giriş Yap"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); resetAuthForm(); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-850 transition-colors"
              >
                {isSignUp ? "Zaten hesabın var mı? Giriş yap" : "Hesabınız yok mu? Hesap Oluşturun"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE ONBOARDING */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-6 relative overflow-hidden space-y-6">
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Sana daha iyi öneriler verelim 🎯</h3>
              <p className="text-xs text-slate-400 leading-relaxed">30 saniyede birkaç bilgiyle deneyimini kişiselleştirebiliriz.</p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Mevcut Durum</label>
                <select
                  value={obStatus}
                  onChange={(e) => setObStatus(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seçiniz...</option>
                  <option value="student">Öğrenciyim</option>
                  <option value="graduate">Yeni Mezunum</option>
                  <option value="early_career">1-3 Yıl Deneyim</option>
                  <option value="professional">3+ Yıl Deneyim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-1.5">Hedeflediğin Roller</label>
                <input
                  type="text"
                  value={obRoles}
                  onChange={(e) => setObRoles(e.target.value)}
                  placeholder="Örn: Product, Growth, Finance, Data..."
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Lokasyon Tercihi</label>
                <select
                  value={obLocation}
                  onChange={(e) => setObLocation(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Istanbul">İstanbul</option>
                  <option value="Turkiye">Türkiye geneli</option>
                  <option value="Remote">Remote (Uzaktan)</option>
                  <option value="Other">Diğer (Yurt dışı)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">İş Arama Durumu</label>
                <select
                  value={obSearch}
                  onChange={(e) => setObSearch(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seçiniz...</option>
                  <option value="active">Aktif olarak iş arıyorum</option>
                  <option value="open">Fırsatlara açığım</option>
                  <option value="just_improving">Şimdilik sadece CV'mi geliştiriyorum</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={obLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center"
              >
                {obLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Kişiselleştirmeyi Tamamla"}
              </button>
              
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-655 transition-colors"
              >
                Şimdilik geç
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// --- LoadingSpinner Component ---
function LoadingSpinner({ status }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[450px]">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-indigo-50 rounded-full"></div>
        <div className="absolute w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="mt-8 text-xl font-bold text-slate-900 animate-pulse">Analiz Devam Ediyor</h3>
      <p className="mt-2 text-sm text-slate-600 max-w-xs">{status}</p>
    </div>
  );
}
