import json
import google.generativeai as genai
from pydantic import BaseModel, Field, ValidationError
from typing import List

from core.config import settings
from core.exceptions import AIException

class CVAnalysisResult(BaseModel):
    uygunluk_skoru: int = Field(..., description="0-100 arası uygunluk skoru")
    ozet: str = Field(..., description="Adayın ilanla genel uyumunu özetleyen 2-3 cümlelik paragraf")
    guclu_yonler: List[str] = Field(..., description="Adayın ilan gereksinimlerini karşılayan güçlü yönleri")
    eksik_yonler: List[str] = Field(..., description="Adayın CV'sinde eksik olan gereksinimler ve zayıf yönler")
    optimizasyon_onerileri: List[str] = Field(..., description="CV'yi bu ilan için daha çekici kılacak somut tavsiyeler")
    mulakat_sorulari: List[str] = Field(..., description="Bu CV ve ilan özelinde hazırlanmış mülakat soruları")

def analyze_cv_suitability(cv_text: str, job_text: str) -> dict:
    """
    CV ve iş ilanı metinlerini karşılaştırıp Gemini API ile analiz eder.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise AIException("GEMINI_API_KEY çevre değişkeni yapılandırmada bulunamadı.")

    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        raise AIException(f"Gemini API yapılandırma hatası: {str(e)}")

    system_instruction = """
    Sen profesyonel bir İnsan Kaynakları (İK) Uzmanı ve Teknik İşe Alım Yöneticisisin.
    Sana bir adayın CV metni ile başvurmak istediği iş ilanı metni verilecek.
    Görevin, adayın bu ilan için uygunluğunu derinlemesine analiz etmektir.

    Tüm çıktıları Türkçe olarak ve şu JSON şemasına uygun şekilde üretmelisin:
    {
      "uygunluk_skoru": integer (0-100 arası),
      "ozet": string (2-3 cümlelik özet),
      "guclu_yonler": array of strings (adayın ilanla doğrudan örtüşen nitelikleri ve deneyimleri),
      "eksik_yonler": array of strings (ilandaki gereksinimlerden adayda eksik olanlar),
      "optimizasyon_onerileri": array of strings (CV'yi bu ilan için özelleştirme tavsiyeleri),
      "mulakat_sorulari": array of strings (bu CV ve ilan özelinde teknik/davranışsal 3-4 adet mülakat sorusu)
    }
    """

    prompt = f"""
    Adayın CV Metni:
    ---
    {cv_text}
    ---

    İş İlanı Metni:
    ---
    {job_text}
    ---

    Yukarıdaki girdileri karşılaştır ve talep edilen JSON formatında analiz raporu oluştur.
    """

    # Model tercihi olarak gemini-3.6-flash ve gemini-3.5-flash'ı dene, eğer hata alınırsa gemini-2.5-flash'a düş.
    models_to_try = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"]
    last_error = None

    for model_name in models_to_try:
        try:
            generation_config = {
                "response_mime_type": "application/json"
            }
            
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=generation_config,
                system_instruction=system_instruction
            )
            
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # JSON'ı parse et
            data = json.loads(response_text)
            
            # Pydantic ile doğrula
            validated_data = CVAnalysisResult(**data)
            return validated_data.model_dump()
            
        except Exception as e:
            last_error = e
            continue
            
    # Eğer tüm modeller başarısız olduysa hata fırlat
    raise AIException(f"Gemini API analizi gerçekleştirilemedi. Son hata: {str(last_error)}")
