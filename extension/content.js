// Chrome Extension Content Script

// Web uygulamasından token senkronizasyonu
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  const syncToken = () => {
    const tokenStr = localStorage.getItem("sb-ixojlxnszfggtaegrnva-auth-token");
    if (tokenStr) {
      try {
        const session = JSON.parse(tokenStr);
        if (session && session.access_token) {
          chrome.storage.local.set({ 
            supabaseSession: session,
            authToken: session.access_token,
            userEmail: session.user?.email || ""
          });
        }
      } catch (e) {
        console.error("Supabase session parse error:", e);
      }
    } else {
      chrome.storage.local.remove(["supabaseSession", "authToken", "userEmail"]);
    }
  };

  syncToken();
  // Kullanıcı giriş veya çıkış yaptığında tetiklenir
  window.addEventListener("storage", syncToken);
  // Periyodik kontrol
  setInterval(syncToken, 2000);
}

// Sitelere özel DOM seçicileri
const SELECTORS = {
  linkedin: {
    title: [
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      ".jobs-details-top-card__job-title",
      "h1"
    ],
    company: [
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      ".jobs-details-top-card__company-name",
      ".jobs-unified-top-card__company-name a"
    ],
    description: [
      "#job-details",
      ".jobs-description__content",
      ".jobs-box__html-content",
      ".jobs-description"
    ]
  },
  kariyernet: {
    title: [
      "h1.job-title",
      ".job-detail-title",
      "h1"
    ],
    company: [
      ".company-name",
      ".job-detail-company",
      "a.company"
    ],
    description: [
      "#job-description-text",
      ".job-description",
      ".job-detail-body"
    ]
  }
};

// Yardımcı: İlk eşleşen elementin metnini döndürür
function getElementText(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim().length > 0) {
      return el.innerText.trim();
    }
  }
  return "";
}

// Sayfadaki ilan verilerini ayıklar
function scrapeJobData() {
  const url = window.location.href;
  let siteKey = "";

  if (url.includes("linkedin.com")) {
    siteKey = "linkedin";
  } else if (url.includes("kariyer.net")) {
    siteKey = "kariyernet";
  } else {
    return null;
  }

  const spec = SELECTORS[siteKey];
  const title = getElementText(spec.title);
  const company = getElementText(spec.company);
  const description = getElementText(spec.description);

  if (!description) return null;

  return {
    title: title || "Belirtilmemiş Rol",
    company: company || "Belirtilmemiş Şirket",
    description: description,
    sourceUrl: url,
    scrapedAt: new Date().toISOString()
  };
}

// Otomatik algılama ve Side Panel'a bildirme fonksiyonu
function processAndSync() {
  const jobData = scrapeJobData();
  if (jobData) {
    chrome.storage.local.set({ activeJobData: jobData }, () => {
      // Side Panel açıksa veriyi anlık göndermek için mesaj yolluyoruz
      chrome.runtime.sendMessage({ action: "JOB_UPDATED", data: jobData }).catch(() => {
        // Alıcı yoksa (Side Panel kapalıysa) hata vermemesi için sessizce geçiyoruz
      });
    });
  }
}

// Sayfadaki dinamik içerik yüklenmelerini dinle (LinkedIn AJAX geçişleri için)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // URL değiştiğinde 1.5 saniye sonra ilanı kazı (içeriğin render olması için)
    setTimeout(processAndSync, 1500);
  }
});
observer.observe(document.body, { subtree: true, childList: true });

// İlk sayfa yüklenişinde çalıştır
setTimeout(processAndSync, 2000);

// Side Panel'dan gelen PING veya SCRAPE isteklerini yanıtlar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_NOW") {
    const data = scrapeJobData();
    sendResponse({ success: !!data, data: data });
  }
  return true;
});

// Web sayfasından gönderilen aktif CV verisini alıp chrome storage'a kaydeder
window.addEventListener("CV_MATCHER_SYNC", (e) => {
  if (e.detail && e.detail.cv_text) {
    chrome.storage.local.set({ 
      cvText: e.detail.cv_text,
      cvFilename: e.detail.cv_filename || "CV.pdf"
    });
  }
});
