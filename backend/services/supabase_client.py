import os
from supabase import create_client, Client

# Supabase Çevre Değişkenleri
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Admin işlemleri için Supabase Client (Service Role yetkili)
supabase = None

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"Supabase Client başlatma hatası: {str(e)}")
else:
    print("UYARI: Supabase bağlantı bilgileri eksik. Supabase entegrasyonu devre dışı bırakıldı.")

def verify_user_token(token: str):
    """
    Frontend'den gelen JWT token'ı doğrular ve kullanıcı nesnesini döner.
    """
    if not supabase:
        print("Hata: Supabase başlatılmadığı için token doğrulanamıyor.")
        return None
    try:
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
    if not supabase:
        print("Hata: Supabase başlatılmadığı için analiz kaydedilemiyor.")
        return None
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
    if not supabase:
        print("Hata: Supabase başlatılmadığı için geçmiş analizler çekilemiyor.")
        return []
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
