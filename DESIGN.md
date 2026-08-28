# DESIGN.md - Koyu Tema Arayüz ve Tasarım Kılavuzu

Bu belge, **CV ve İş İlanı Uygunluk Analizörü** projesinin yenilenen koyu mod (Dark Mode) arayüz tasarım kurallarını (Design Tokens) ve bileşen şablonlarını tanımlar.

---

## 1. Tasarım Token'ları (Design Tokens)

### A. Renk Paleti (Color Palette)
Arayüzde koyu zemin ve neon mavi/sky tonları temel alınmıştır:

*   **Arka Plan (Background):**
    *   Sayfa Arka Planı: Koyu Gece Mavisi (`bg-[#090D1A]`)
    *   Kart Arka Planı: Koyu Lacivert/Gri (`bg-[#131B2E]`)
*   **Ana Renkler (Brand Colors):**
    *   Primary (Ana): Sky-500 (`#0ea5e9`) -> Butonlar, aktif durumlar, vurgular.
    *   Primary Gradient: `bg-gradient-to-r from-sky-500 to-blue-600`
    *   Secondary: Slate-800 (`#1e293b`) -> İkincil butonlar ve alternatif kartlar.
*   **Durum Renkleri (Status Colors):**
    *   Success (Başarı / Eşleşme): Emerald-500 (`#10b981`) -> Güçlü yönler, yüksek skorlar.
    *   Warning (Uyarı / Kısmi): Amber-500 (`#f59e0b`) -> Orta düzey uyumluluk.
    *   Danger (Hata / Uyuşmazlık): Rose-500 (`#f43f5e`) -> Eksik yönler.
*   **Metin Renkleri (Typography Colors):**
    *   Başlıklar: Beyaz (`#ffffff`)
    *   Gövde Metni: Slate-300 (`#cbd5e1`)
    *   Açıklamalar / Alt Başlıklar: Slate-400 (`#94a3b8`)

### B. Tipografi (Typography)
*   **Yazı Tipi Ailesi:** Sans-serif (Inter / System Sans).
*   **Hiyerarşi:**
    *   `h1`: `text-3xl font-extrabold tracking-tight` (Ana başlıklar)
    *   `h2`: `text-xl font-bold` (Kart başlıkları)
    *   `h3`: `text-base font-semibold` (Bileşen içi başlıklar)
    *   `body`: `text-sm text-slate-350 leading-relaxed`

### C. Kenar Yumuşatma ve Gölgeler (Border Radius & Shadows)
*   Kartlar: `rounded-2xl border border-slate-800/80 shadow-md`
*   Giriş Alanları (Inputs): `rounded-lg border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-sky-500`
*   Butonlar: `rounded-xl font-semibold shadow-md transition-all duration-200`

---

## 2. Arayüz Yerleşimi (Layout Structure)

### Sol Panel (Girdi Alanları - `lg:col-span-5`):
1.  **Header:** Logo ve uygulamanın adı.
2.  **CV Upload Card:** Koyu tema, drag-and-drop özellikli, kesikli kenarlıklı alan.
3.  **Job Input Card:** URL Giriş Kutusu ve İlan Metni giriş sekmeleri.

### Sağ Panel (Sonuçlar ve Durumlar - `lg:col-span-7`):
*   **Analiz Sonuçları Paneli (Results Panel):**
    *   *Kart 1: Uygunluk Skoru:* SVG bazlı dairesel progress bar, neon sky halkası.
    *   *Kart 2: Güçlü ve Eksik Yönler:* Koyu kartlar içinde yeşil/kırmızı göstergeler.
    *   *Kart 3: CV Optimizasyon Önerileri:* Işık simgeli, listelenmiş maddeler.
    *   *Kart 4: Mülakat Hazırlık Soruları:* Kopyalama butonlu koyu kartlar.
