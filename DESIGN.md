# DESIGN.md - Arayüz ve Tasarım Kılavuzu

Bu belge, **CV ve İş İlanı Uygunluk Analizörü** projesinin arayüz tasarım kurallarını (Design Tokens) ve bileşen şablonlarını tanımlar. Google Stitch ve diğer AI kod üreteçlerinin bu tasarım diline sadık kalması beklenmektedir.

---

## 1. Tasarım Token'ları (Design Tokens)

### A. Renk Paleti (Color Palette)
Arayüzde Tailwind CSS renk paleti referans alınmıştır:

*   **Arka Plan (Background):**
    *   Sayfa Arka Planı: Slate-50 (`#f8fafc`)
    *   Kart Arka Planı: White (`#ffffff`)
    *   Dark Mode / Alternatif: Slate-900 (`#0f172a`)
*   **Ana Renkler (Brand Colors):**
    *   Primary (Ana): Indigo-600 (`#4f46e5`) -> Butonlar, aktif durumlar, vurgular.
    *   Primary Hover: Indigo-700 (`#4338ca`)
    *   Secondary: Blue-500 (`#3b82f6`) -> Bilgi kartları ve ikincil butonlar.
*   **Durum Renkleri (Status Colors):**
    *   Success (Başarı / Eşleşme): Emerald-600 (`#059669`) -> Yüksek uyumluluk skorları, güçlü yönler.
    *   Warning (Uyarı / Kısmi): Amber-500 (`#f59e0b`) -> Orta düzey uyumluluk.
    *   Danger (Hata / Uyuşmazlık): Rose-600 (`#e11d48`) -> Düşük uyumluluk, eksik yönler.
*   **Metin Renkleri (Typography Colors):**
    *   Başlıklar: Slate-900 (`#0f172a`)
    *   Gövde Metni: Slate-600 (`#475569`)
    *   Açıklamalar / Alt Başlıklar: Slate-400 (`#94a3b8`)

### B. Tipografi (Typography)
*   **Yazı Tipi Ailesi:** Sans-serif (Varsayılan sistem fontu veya Inter tercih edilir).
*   **Hiyerarşi:**
    *   `h1`: `text-3xl font-extrabold tracking-tight` (Ana başlıklar)
    *   `h2`: `text-xl font-bold` (Kart başlıkları)
    *   `h3`: `text-base font-semibold` (Bileşen içi başlıklar)
    *   `body`: `text-sm text-slate-600 leading-relaxed` (Genel metinler)

### C. Kenar Yumuşatma ve Gölgeler (Border Radius & Shadows)
*   Kartlar: `rounded-2xl shadow-sm border border-slate-100`
*   Giriş Alanları (Inputs): `rounded-lg border-slate-200 focus:ring-indigo-500`
*   Butonlar: `rounded-xl font-semibold shadow-sm transition-all duration-200`

---

## 2. Arayüz Yerleşimi (Layout Structure)

Ekran yan yana iki ana sütundan oluşur (Mobil ekranlarda üst üste dikey düzen):
*   **Kapsayıcı (Container):** `max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8`

### Sol Panel (Girdi Alanları - 5 Sütun / `lg:col-span-5`):
1.  **Header:** Logo ve uygulamanın adı ("CV ve İş İlanı Analizörü").
2.  **CV Upload Card:** Drag-and-drop özellikli, PDF simgesi barındıran, yüklenen dosya adını gösteren alan.
3.  **Job Input Card:**
    *   URL Giriş Kutusu.
    *   Yedek Plan: "İlan Metnini Manuel Yapıştır" butonu ile açılan/kapanan genişleyebilir Textarea kutusu.
4.  **Action Button:** "Analizi Başlat" butonu (Devre dışı/Loading durumları görselleştirilmiş).

### Sağ Panel (Sonuçlar ve Durumlar - 7 Sütun / `lg:col-span-7`):
*   **Boş Durum (Empty State):** "Henüz analiz başlatılmadı. Sol taraftan CV'nizi ve başvurmak istediğiniz ilanı girerek analizi başlatabilirsiniz." (İllüstrasyon veya ikon eşliğinde).
*   **Yükleme Durumu (Loading State):** Dönen bir animasyon halkası ve altında o anki backend adımını belirten metinler.
*   **Analiz Sonuçları Paneli (Results Panel):**
    *   *Kart 1: Uygunluk Skoru:* Büyük dairesel progress bar (Gauge) veya kalın yatay bar.
    *   *Kart 2: Güçlü ve Eksik Yönler:* İki sütun halinde eşleşenler (Emerald) ve eksik olanlar (Rose/Amber).
    *   *Kart 3: CV Optimizasyon Önerileri:* Madde işaretli ve eylem odakli öneriler listesi.
    *   *Kart 4: Mülakat Hazırlık Soruları:* Her sorunun yanında kolayca kopyalama sağlayan "Kopyala" butonu.

---

## 3. Tailwind CSS Konfigürasyon Referansı

Yapay zekanın üreteceği frontend bileşenlerinde kullanılacak Tailwind sınıf örnekleri:

```html
<!-- CV Upload Kutusu (Drag & Drop) -->
<div class="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50">
  <svg class="mx-auto h-12 w-12 text-slate-400" ...></svg>
  <p class="mt-2 text-sm font-medium text-slate-700">CV'nizi sürükleyin veya dosya seçin</p>
  <p class="mt-1 text-xs text-slate-400">Sadece PDF formatı desteklenir</p>
</div>

<!-- Uygunluk Skoru Kartı -->
<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
  <div>
    <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wider">Uygunluk Skoru</h3>
    <p class="text-3xl font-extrabold text-indigo-600 mt-1">%85</p>
  </div>
  <div class="relative h-16 w-16">
    <!-- Dairesel Grafik Çizimi (SVG) -->
  </div>
</div>
```
