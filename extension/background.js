// Chrome Extension Background Service Worker

// Action kliklendiğinde Side Panel'ın yerleşik olarak açılmasını sağlar
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Side Panel behavior set failed:", error));
});

// Sayfa değişikliklerini veya sekmeler arası geçişleri takip eder
chrome.tabs.onActivated.addListener(activeInfo => {
  // Aktif sekme değiştiğinde content script'in yeni veriyi algılamasını tetikleyebiliriz
  chrome.tabs.sendMessage(activeInfo.tabId, { action: "PING" })
    .catch(() => {
      // Content script enjekte edilmemiş sekmelerde hata oluşabilir, güvenle yutuyoruz.
    });
});
