import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional

# Yerel geliştirme için .env dosyasını yükle
from dotenv import load_dotenv
load_dotenv()

from services.cv_parser import extract_text_from_pdf
from services.scraper import scrape_job_details
from services.analyzer import analyze_cv_suitability
from services.supabase_client import verify_user_token, save_scan_history, get_user_scan_history

app = FastAPI(title="CV & Job Analyzer API")

# CORS ayarları (Geliştirme aşamasında frontend'in bağlanabilmesi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/config")
async def get_config():
    """
    Frontend'in Supabase JS SDK'sını başlatması için gereken
    public (anon) bağlantı bilgilerini döner.
    """
    return {
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_anon_key": os.getenv("SUPABASE_ANON_KEY")
    }

@app.get("/api/history")
async def get_history(authorization: Optional[str] = Header(None)):
    """
    Giriş yapmış kullanıcının geçmiş analiz raporlarını listeler.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Oturum doğrulaması başarısız. Lütfen tekrar giriş yapın.")

    token = authorization.split(" ")[1]
    user = verify_user_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş oturum.")

    history = get_user_scan_history(user.id)
    return history

@app.post("/api/analyze")
async def analyze(
    cv_file: UploadFile = File(...),
    job_url: Optional[str] = Form(None),
    job_text_fallback: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    # Dosya tipi kontrolü (PDF)
    if not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Yalnızca PDF formatındaki CV'ler desteklenmektedir."
        )

    # 1. Oturum ve Kullanıcı Doğrulaması
    user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user = verify_user_token(token)

    # 2. CV Metnini Çıkar
    try:
        cv_bytes = await cv_file.read()
        cv_text = extract_text_from_pdf(cv_bytes)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV dosyası okunurken bir hata oluştu: {str(e)}")

    # 3. İş İlanı Metnini Çıkar
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

    # 4. Gemini API ile Karşılaştırmalı Analiz Yap
    try:
        analysis_result = analyze_cv_suitability(cv_text, job_text)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz sırasında yapay zeka hatası oluştu: {str(e)}")

    # 5. Kayıt ve Yetki Sınırlandırması (Misafir vs. Üye Farkı)
    if user:
        # Üye kullanıcı ise: Tam raporu veritabanına kaydet ve tam raporu dön
        save_scan_history(
            user_id=user.id,
            cv_filename=cv_file.filename,
            job_url=job_url or "",
            job_text=job_text[:1000] + ("..." if len(job_text) > 1000 else ""),
            score=analysis_result["uygunluk_skoru"],
            results=analysis_result
        )
        return analysis_result
    else:
        # Misafir kullanıcı ise: Raporun gelişmiş kısımlarını filtrele ve kısıtlı rapor dön
        filtered_result = {
            "uygunluk_skoru": analysis_result["uygunluk_skoru"],
            "ozet": analysis_result["ozet"],
            "guclu_yonler": analysis_result["guclu_yonler"],
            "eksik_yonler": ["(Kilitli Özellik) Eksik gereksinimler ve analiz detaylarını görmek için lütfen giriş yapın veya ücretsiz üye olun."],
            "optimizasyon_onerileri": ["(Kilitli Özellik) CV'nizi bu ilana göre optimize edecek kişiselleştirilmiş önerileri görmek için lütfen giriş yapın veya ücretsiz üye olun."],
            "mulakat_sorulari": ["(Kilitli Özellik) Bu ilan için özel hazırlanan mülakat sorularını görmek için lütfen giriş yapın veya ücretsiz üye olun."]
        }
        return filtered_result


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
