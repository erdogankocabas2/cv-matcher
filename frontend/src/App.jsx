import React, { useState } from 'react';
import { FileText, AlertCircle, Play, FileCheck2, Info, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';
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

      // Sonuçlara kaydır
      setTimeout(() => {
        const section = document.getElementById('analyzer-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "İşlem sırasında bilinmeyen bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      
      {/* NAV BAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/20 animate-pulse">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">CV Matcher</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">AI Engine</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Nasıl Çalışır?</a>
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Özellikler</a>
            <a href="#faq" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">S.S.S.</a>
          </div>
          <a href="#analyzer-section" className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all transform active:scale-95">
            Analizi Başlat
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-extrabold border border-indigo-100 uppercase tracking-wider">
            Yapay Zeka Destekli Kariyer Danışmanı
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mt-6 leading-tight max-w-4xl mx-auto">
            CV'nizi Hedef İlanla <span className="text-indigo-600">Saniyeler İçinde</span> Test Edin ve Optimize Edin.
          </h1>
          <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            CV Matcher, yapay zekanın gücünü kullanarak özgeçmişiniz ile iş ilanı arasındaki uyuşmazlıkları analiz eder, CV'nizi güçlendirmeniz için nokta atışı tavsiyeler verir.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#analyzer-section" className="w-full sm:w-auto py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-md font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-98">
              CV'nizi Test Edin (Ücretsiz)
            </a>
            <a href="#how-it-works" className="w-full sm:w-auto py-4 px-8 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl text-md font-semibold transition-all">
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </header>

      {/* MOCKUP PREVIEW */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl text-2xl font-black">
                %94
              </div>
              <div>
                <h4 className="font-bold text-lg">Yazılım Mühendisi İlanı Eşleşmesi</h4>
                <p className="text-xs text-slate-400">CV_Murat_Demir.pdf ile eşleşen güçlü yönler analiz edildi.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">#Python</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">#FastAPI</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">#SQL</span>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">3 Adımda Kolayca Analiz Edin</h2>
            <p className="text-sm text-slate-500 mt-2">Kariyerinizdeki bir sonraki adıma hazırlanmak işte bu kadar basit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
              <h3 className="font-bold text-slate-800">CV'nizi Yükleyin</h3>
              <p className="text-sm text-slate-500 mt-2">Güncel özgeçmişinizi PDF formatında sürükleyip bırakın.</p>
            </div>
            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
              <h3 className="font-bold text-slate-800">İlan Bilgilerini Girin</h3>
              <p className="text-sm text-slate-500 mt-2">Başvuracağınız ilanın linkini yapıştırın veya iş tanımını kopyalayın.</p>
            </div>
            <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
              <h3 className="font-bold text-slate-800">Raporunuzu Alın</h3>
              <p className="text-sm text-slate-500 mt-2">Uygunluk skoru, güçlü/zayıf yönler ve yapay zeka tavsiyelerini inceleyin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Akıllı Özellikler</h2>
            <p className="text-sm text-slate-500 mt-2">CV Matcher, standart bir anahtar kelime eşleştiriciden çok daha fazlasını sunar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-50 rounded-2xl w-fit text-indigo-600 mb-4"><Info className="w-5 h-5" /></div>
                <h4 className="font-bold text-slate-800">Doğru Skorlama</h4>
                <p className="text-xs text-slate-500 mt-2">Deneyim yılı, diller ve teknik bilgilerinize göre gerçekçi bir uyum oranı hesaplar.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600 mb-4"><CheckCircle className="w-5 h-5" /></div>
                <h4 className="font-bold text-slate-800">Güçlü & Zayıf Ayrımı</h4>
                <p className="text-xs text-slate-500 mt-2">İlanın gereksinimlerinden hangilerini karşıladığınızı ve hangilerini atladığınızı gösterir.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 bg-amber-50 rounded-2xl w-fit text-amber-500 mb-4"><Lightbulb className="w-5 h-5" /></div>
                <h4 className="font-bold text-slate-800">Geliştirme Önerileri</h4>
                <p className="text-xs text-slate-500 mt-2">İlana uygun kabul alma ihtimalinizi artıracak eyleme dökülebilir CV güncellemeleri önerir.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-3 bg-blue-50 rounded-2xl w-fit text-blue-600 mb-4"><HelpCircle className="w-5 h-5" /></div>
                <h4 className="font-bold text-slate-800">Mülakat Hazırlığı</h4>
                <p className="text-xs text-slate-500 mt-2">İlan ve özgeçmişiniz özelinde karşılaşabileceğiniz 3-4 kritik mülakat sorusunu hazırlar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYZER TOOL SECTION */}
      <section id="analyzer-section" className="py-20 bg-slate-100/50 border-t border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold border border-indigo-200">
              CV MATCH ENGINE
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 mt-4 tracking-tight">Eşleştiriciyi Hemen Kullanın</h2>
            <p className="text-sm text-slate-500 mt-2">CV'nizi ve iş ilanını yükleyin, analiz sonuçları saniyeler içinde hazırlansın.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side */}
            <div className="lg:col-span-5 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn shadow-sm">
                  <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                  <div>
                    <p className="font-bold">Analiz sırasında hata oluştu</p>
                    <p className="mt-0.5 text-xs font-semibold">{error}</p>
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
                className={`w-full py-4 px-6 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                Eşleşmeyi Analiz Et
              </button>
            </div>

            {/* Right side */}
            <div className="lg:col-span-7 self-stretch min-h-[450px]">
              {loading ? (
                <LoadingSpinner status={loadingStatus} />
              ) : results ? (
                <AnalysisResults results={results} />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-md h-full min-h-[450px]">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-4 shadow-inner">
                    <FileCheck2 className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-md font-bold text-slate-700">Analiz Raporu Hazır Değil</h3>
                  <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
                    Öncelikle sol taraftan PDF formatındaki CV dosyanızı yükleyin ve iş ilanı detaylarını ekleyin. Ardından "Eşleşmeyi Analiz Et" butonuna basın.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-white border-t border-slate-100 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sıkça Sorulan Sorular</h2>
            <p className="text-sm text-slate-500 mt-2">Uygulamamız ve yapay zeka entegrasyonumuzla ilgili aklınıza takılabilecek detaylar.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800">Verilerim ve CV'm güvende mi?</h4>
              <p className="text-sm text-slate-500 mt-2">Yüklediğiniz CV dosyaları ve girdiğiniz ilanlar hiçbir veritabanında saklanmaz. Dosyalar geçici hafızada işlenerek doğrudan Gemini API'ye analiz için gönderilir ve işlem sonrasında tamamen bellekten silinir.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800">Desteklenen dosya formatları nelerdir?</h4>
              <p className="text-sm text-slate-500 mt-2">Yapay zekanın özgeçmişinizi en hatasız şekilde okuyabilmesi adına şu an için yalnızca PDF (.pdf) formatını destekliyoruz. Word (.docx) dosyalarınızı PDF'e dönüştürerek yükleyebilirsiniz.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800">İlan linkinden veri çekilemezse ne yapmalıyım?</h4>
              <p className="text-sm text-slate-500 mt-2">LinkedIn gibi bazı büyük kariyer siteleri bot koruması (Cloudflare/CAPTCHA) kullanmaktadır. Bu sitelerin linkinden veri çekilemezse, ilan giriş alanındaki 'İlan Metnini Manuel Yapıştır' seçeneğini açıp ilan açıklamasını kopyalayıp yapıştırarak analizi anında tamamlayabilirsiniz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white py-12 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-md font-bold">CV Matcher</h4>
              <p className="text-[10px] text-slate-400">Yapay Zeka Destekli Kariyer Aracınız</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 CV Matcher. Analiz motoru Gemini 3.6 Flash tarafından desteklenmektedir.
          </p>
        </div>
      </footer>
    </div>
  );
}
