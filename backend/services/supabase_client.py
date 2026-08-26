import os
from supabase import create_client, Client

# Supabase Çevre Değişkenleri
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Supabase bağlantı bilgileri (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) .env dosyasında eksik.")

# Admin işlemleri için Supabase Client (Service Role yetkili)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def verify_user_token(token: str):
    """
    Frontend'den gelen JWT token'ı doğrular ve kullanıcı nesnesini döner.
    Başarısız olursa None döner.
    """
    try:
        # Supabase API'si üzerinden token'ı doğrula ve kullanıcıyı al
        response = supabase.auth.get_user(token)
        if response and response.user:
            return response.user
        return None
    except Exception as e:
        print(f"Supabase token doğrulama hatası: {str(e)}")
        return None

def save_scan_history(user_id: str, cv_filename: str, job_url: str, job_text: str, score: int, results: dict):
    """
    Kullanıcının yaptığı başarılı analizi scans tablosuna kaydeder.
    """
    try:
        data = {
            "user_id": user_id,
            "cv_filename": cv_filename,
            "job_url": job_url,
            "job_text": job_text,
            "score": score,
            "results": results
        }
        response = supabase.table("scans").insert(data).execute()
        return response.data
    except Exception as e:
        print(f"Analiz geçmişi kaydedilirken hata oluştu: {str(e)}")
        return None

def get_user_scan_history(user_id: str):
    """
    Kullanıcının geçmiş analiz raporlarını en yeniden en eskiye doğru listeler.
    """
    try:
        response = supabase.table("scans")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Analiz geçmişi çekilirken hata oluştu: {str(e)}")
        return []
