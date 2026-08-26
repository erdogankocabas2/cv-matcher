import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional

from services.cv_parser import extract_text_from_pdf
from services.scraper import scrape_job_details
from services.analyzer import analyze_cv_suitability

# Yerel geliştirme için .env dosyasını yükle
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="CV & Job Analyzer API")

# CORS ayarları (Geliştirme aşamasında frontend'in bağlanabilmesi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze(
    cv_file: UploadFile = File(...),
    job_url: Optional[str] = Form(None),
    job_text_fallback: Optional[str] = Form(None)
):
    # Dosya tipi kontrolü (PDF)
    if not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Yalnızca PDF formatındaki CV'ler desteklenmektedir."
        )

    # 1. CV Metnini Çıkar
    try:
        cv_bytes = await cv_file.read()
        cv_text = extract_text_from_pdf(cv_bytes)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV dosyası okunurken bir hata oluştu: {str(e)}")

    # 2. İş İlanı Metnini Çıkar
    job_text = ""
    scrape_error = None

    if job_url and job_url.strip():
        try:
            job_text = scrape_job_details(job_url)
        except Exception as e:
            scrape_error = str(e)

    # Eğer linkten veri çekilemediyse veya boşsa, yedek metin alanını kontrol et
    if not job_text.strip():
        if job_text_fallback and job_text_fallback.strip():
            job_text = job_text_fallback
        else:
            if scrape_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"İlan linki kazınamadı ve manuel ilan metni girilmedi. Hata: {scrape_error}"
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Lütfen geçerli bir ilan linki girin veya ilan açıklamasını doğrudan yapıştırın."
                )

    # 3. Gemini API ile Karşılaştırmalı Analiz Yap
    try:
        analysis_result = analyze_cv_suitability(cv_text, job_text)
        return analysis_result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz sırasında yapay zeka hatası oluştu: {str(e)}")


# --- Üretim Ortamında Tek Servis Olarak React Sunumu ---
# React derleme çıktıları (build) backend/static klasörüne kopyalanmışsa serve et
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Varlıklar (assets) klasörünü bağla
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    # HTML5 History Mode için tüm istekleri index.html'e yönlendir (API rotaları hariç)
    @app.get("/{catchall:path}")
    async def serve_react(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API rotası bulunamadı.")
            
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Arayüz dosyası bulunamadı.")
