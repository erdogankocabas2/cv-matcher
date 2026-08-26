from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional

from api.deps import get_optional_user
from services.cv_parser import extract_text_from_pdf
from services.scraper import scrape_job_details
from services.analyzer import analyze_cv_suitability
from services.supabase_client import save_scan_history
from core.exceptions import AppException

router = APIRouter()

@router.post("")
async def analyze(
    cv_file: UploadFile = File(...),
    job_url: Optional[str] = Form(None),
    job_text_fallback: Optional[str] = Form(None),
    user = Depends(get_optional_user)
):
    # Dosya tipi kontrolü (PDF)
    if not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Yalnızca PDF formatındaki CV'ler desteklenmektedir."
        )

    # 1. CV Metnini Çıkar
    cv_bytes = await cv_file.read()
    cv_text = await extract_text_from_pdf(cv_bytes)

    # 2. İş İlanı Metnini Çıkar
    job_text = ""
    scrape_error = None

    if job_url and job_url.strip():
        try:
            job_text = await scrape_job_details(job_url)
        except Exception as e:
            scrape_error = str(e)

    # Eğer linkten veri çekilemediyse veya boşsa, yedek metin alanını kontrol et
    if not job_text.strip():
        if job_text_fallback and job_text_fallback.strip():
            job_text = job_text_fallback
        else:
            if scrape_error:
                raise HTTPException(status_code=400, detail=scrape_error)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Lütfen geçerli bir ilan linki girin veya ilan açıklamasını doğrudan yapıştırın."
                )

    # 3. Gemini API ile Karşılaştırmalı Analiz Yap
    analysis_result = analyze_cv_suitability(cv_text, job_text)

    # 4. Kayıt ve Yetki Sınırlandırması (Misafir vs. Üye Farkı)
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
