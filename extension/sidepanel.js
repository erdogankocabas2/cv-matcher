// Chrome Extension Side Panel Script

// UI Elemanları
const badge = document.getElementById("auth-badge");
const viewNoAuth = document.getElementById("view-no-auth");
const viewActiveJob = document.getElementById("view-active-job");
const viewLoading = document.getElementById("view-loading");
const viewResults = document.getElementById("view-results");

const txtCvName = document.getElementById("active-cv-name");
const txtJobTitle = document.getElementById("job-title");
const txtJobCompany = document.getElementById("job-company");
const txtLoadingStatus = document.getElementById("loading-status");

const txtResultScore = document.getElementById("result-score");
const txtResultSummary = document.getElementById("result-summary");
const txtResultStrength = document.getElementById("result-strength");
const txtResultWeakness = document.getElementById("result-weakness");
const containerKeywords = document.getElementById("result-keywords");
const txtRewriteBefore = document.getElementById("rewrite-before");
const txtRewriteAfter = document.getElementById("rewrite-after");
const gaugeOffset = document.getElementById("gauge-offset");

const btnRunMatch = document.getElementById("btn-run-match");
const btnReScrape = document.getElementById("btn-re-scrape");
const btnResetAnalysis = document.getElementById("btn-reset-analysis");

// Global Durum
let authToken = null;
let userEmail = null;
let cvText = null;
let cvFilename = null;
let activeJob = null;

// Backend adresi (lokal veya canlı üretim domaini)
const BACKEND_URL = "http://localhost:8080";

// Panel açıldığında durumu yükle
document.addEventListener("DOMContentLoaded", () => {
  initPanel();
});

// Arayüz Görünüm Denetleyicisi
function showView(viewId) {
  viewNoAuth.classList.add("hidden");
  viewActiveJob.classList.add("hidden");
  viewLoading.classList.add("hidden");
  viewResults.classList.add("hidden");

  if (viewId === "no-auth") viewNoAuth.classList.remove("hidden");
  if (viewId === "active-job") viewActiveJob.classList.remove("hidden");
  if (viewId === "loading") viewLoading.classList.remove("hidden");
  if (viewId === "results") viewResults.classList.remove("hidden");
}

// Panel Başlatıcı
function initPanel() {
  chrome.storage.local.get(["authToken", "userEmail", "cvText", "cvFilename", "activeJobData"], (store) => {
    authToken = store.authToken || null;
    userEmail = store.userEmail || null;
    cvText = store.cvText || null;
    cvFilename = store.cvFilename || null;
    activeJob = store.activeJobData || null;

    if (!authToken) {
      badge.innerHTML = `<span class="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">Giriş Gerekli</span>`;
      showView("no-auth");
    } else {
      badge.innerHTML = `<span class="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold truncate max-w-[120px] inline-block">${userEmail}</span>`;
      showView("active-job");
      
      // CV bilgilerini güncelle
      if (cvFilename) {
        txtCvName.innerText = cvFilename;
      } else {
        txtCvName.innerText = "Lütfen web sitesinde bir analiz yapın.";
      }

      // İlan bilgilerini güncelle
      updateJobUI();
    }
  });
}

// İlan Arayüzünü Güncelleme
function updateJobUI() {
  if (activeJob) {
    txtJobTitle.innerText = activeJob.title;
    txtJobCompany.innerText = activeJob.company;
    btnRunMatch.disabled = false;
    btnRunMatch.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    txtJobTitle.innerText = "İlan algılanamadı";
    txtJobCompany.innerText = "Lütfen LinkedIn veya Kariyer.net ilan sayfasına geçin.";
    btnRunMatch.disabled = true;
    btnRunMatch.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// Content Script'ten anlık gelen ilan değişikliklerini dinleme
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "JOB_UPDATED") {
    activeJob = message.data;
    updateJobUI();
  }
});

// Yeniden Tara Butonu
btnReScrape.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "SCRAPE_NOW" }, (response) => {
        if (response && response.success) {
          activeJob = response.data;
          chrome.storage.local.set({ activeJobData: activeJob }, () => {
            updateJobUI();
          });
        }
      });
    }
  });
});

// Analiz Adımları Simulasyonu
function simulateLoading(callback) {
  const steps = [
    "CV'nizdeki deneyimleri inceliyoruz...",
    "İlanın beklentilerini çıkarıyoruz...",
    "Yetkinliklerinizi karşılaştırıyoruz...",
    "Eksik anahtar kelimeleri kontrol ediyoruz...",
    "Sana özel önerileri hazırlıyoruz..."
  ];
  let stepIdx = 0;
  txtLoadingStatus.innerText = steps[stepIdx];

  const interval = setInterval(() => {
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      txtLoadingStatus.innerText = steps[stepIdx];
    }
  }, 1500);

  return () => {
    clearInterval(interval);
  };
}

// Analizi Başlatma
btnRunMatch.addEventListener("click", () => {
  if (!authToken || !activeJob) return;

  if (!cvText) {
    alert("Analiz yapabilmek için önce web arayüzünde en az 1 kez özgeçmişinizi analiz etmiş olmalısınız.");
    return;
  }

  showView("loading");
  const stopLoadingSimulation = simulateLoading();

  const formData = new FormData();
  formData.append("cv_text", cvText);
  formData.append("cv_filename", cvFilename || "CV.pdf");
  if (activeJob.sourceUrl) formData.append("job_url", activeJob.sourceUrl);
  formData.append("job_text_fallback", activeJob.description);

  fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`
    },
    body: formData
  })
    .then((res) => {
      if (!res.ok) throw new Error("Analiz sunucu hatası.");
      return res.json();
    })
    .then((data) => {
      stopLoadingSimulation();
      renderResults(data);
    })
    .catch((err) => {
      stopLoadingSimulation();
      alert("Bir hata oluştu: " + err.message);
      showView("active-job");
    });
});

// Sonuçları Ekrana Yazdırma
function renderResults(results) {
  showView("results");

  // Skor & Çember Grafiği
  const score = results.uygunluk_skoru || 0;
  txtResultScore.innerText = `%${score}`;
  const totalOffset = 163.3; // 2 * PI * r (r = 26)
  const offset = totalOffset - (totalOffset * score) / 100;
  gaugeOffset.setAttribute("stroke-dashoffset", offset);

  // Özet metin
  txtResultSummary.innerText = results.ozet || "Eşleşme analizi tamamlandı.";

  // Güçlü / Zayıf Yönler
  txtResultStrength.innerText = results.guclu_yonler && results.guclu_yonler.length > 0
    ? results.guclu_yonler[0]
    : "İlan nitelikleri ile CV uyumlu.";
  
  txtResultWeakness.innerText = results.eksik_yonler && results.eksik_yonler.length > 0
    ? results.eksik_yonler[0]
    : "Belirgin bir eksiklik bulunamadı.";

  // Anahtar Kelimeler
  containerKeywords.innerHTML = "";
  if (results.eksik_ats_anahtar_kelimeleri && results.eksik_ats_anahtar_kelimeleri.length > 0) {
    results.eksik_ats_anahtar_kelimeleri.forEach(kw => {
      if (kw.includes("Kilitli Özellik")) return;
      const pill = document.createElement("span");
      pill.className = "text-[9px] bg-slate-800 text-sky-400 border border-slate-700 px-2 py-1 rounded-md font-semibold";
      pill.innerText = kw;
      containerKeywords.appendChild(pill);
    });
  }

  // Cümle Revizyonu (Before/After)
  if (results.cv_optimizasyon_kilavuzu && results.cv_optimizasyon_kilavuzu.length > 0) {
    const rewrite = results.cv_optimizasyon_kilavuzu[0];
    txtRewriteBefore.innerText = rewrite.mevcut_cumle || "CV'nizdeki cümle...";
    txtRewriteAfter.innerText = rewrite.onerilen_cumle || "ATS uyumlu önerilen cümle...";
  } else {
    txtRewriteBefore.innerText = "Belirli bir revizyon bulunamadı.";
    txtRewriteAfter.innerText = "CV'niz bu ilan için oldukça optimize görünüyor.";
  }
}

// Sonuçlardan Geri Dönme
btnResetAnalysis.addEventListener("click", () => {
  showView("active-job");
});

// Storage değişikliklerini dinle (Kullanıcı web'den giriş yaparsa anında güncellemek için)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.authToken || changes.userEmail || changes.cvText) {
    initPanel();
  }
});
