# CV & İş İlanı Uygunluk Analizörü (CV & Job Analyzer)

Bu proje, adayın PDF formatındaki CV'sini yükleyip, başvuru yapacağı iş ilanı linkini (veya metnini) girdiğinde aradaki uygunluğu Gemini API kullanarak analiz eden ve raporlayan tek servislik (Single Service) bir web uygulamasıdır.

---

## Proje Mimarisi

*   **Backend:** FastAPI (Python)
*   **Frontend:** React (Vite) + Tailwind CSS
*   **AI Engine:** Google Gemini API (`gemini-2.5-flash` veya `gemini-2.5-pro`)
*   **Dağıtım (Deployment):** Docker veya Render/Railway üzerinde FastAPI ile Frontend statik dosyalarının tek servis olarak sunulması.

---

## Dosya Yapısı

*   `DESIGN.md`: Tasarım token'ları ve arayüz yönergeleri.
*   `PRODUCT.md`: İş mantığı, veri modelleri ve prompt tasarımı.
*   `backend/`: FastAPI projesi.
*   `frontend/`: React + Tailwind CSS projesi.
*   `Dockerfile`: Çok aşamalı (multi-stage) deploy yapılandırması.

---

## Yerel Geliştirme (Local Development)

### Ön Koşullar
*   Python 3.9 veya üzeri
*   Node.js 18 veya üzeri
*   [Gemini API Anahtarı](https://aistudio.google.com/)

### 1. API Anahtarını Tanımlama
`backend/.env` dosyası oluşturun ve Gemini API anahtarınızı ekleyin:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Backend Çalıştırma
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API şu adreste çalışacaktır: `http://localhost:8000`

### 3. Frontend Çalıştırma
```bash
cd frontend
npm install
npm run dev
```
Frontend şu adreste çalışacaktır: `http://localhost:5173`

---

## Dağıtım ve Canlıya Alma (Deployment)

Uygulama, üretim (production) modunda tek bir port üzerinden çalışacak şekilde tasarlanmıştır.

### Derleme (Build) Adımları
Canlıya almadan önce frontend derlenerek backend'in statik dosyaları sunacağı klasöre taşınır:
```bash
# Frontend'i build et
cd frontend
npm run build

# Bu işlem sonrasında frontend/dist klasörü oluşur.
# FastAPI backend, bu klasörü statik dosya olarak '/' rotasından serve eder.
```

### Docker ile Çalıştırma
Proje kök dizininde Docker imajını oluşturup ayağa kaldırabilirsiniz:
```bash
docker build -t cv-analyzer .
docker run -p 8000:8000 --env GEMINI_API_KEY=your_key_here cv-analyzer
```
Uygulama `http://localhost:8000` adresinde hem arayüzü hem de API'yi sunacaktır.
