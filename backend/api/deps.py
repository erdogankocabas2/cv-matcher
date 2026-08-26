from typing import Optional
from fastapi import Header, HTTPException, Depends

from core.config import settings, Settings
from services.supabase_client import verify_user_token

def get_settings() -> Settings:
    """Uygulama ayarlarını enjekte eden bağımlılık"""
    return settings

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    HTTP İstek Başlığındaki (Authorization Header) JWT Token'ını doğrulayarak
    oturum açmış kullanıcı nesnesini döner. Doğrulama başarısız olursa 401 fırlatır.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Oturum doğrulaması başarısız. Lütfen giriş yapın."
        )
    
    token = authorization.split(" ")[1]
    user = verify_user_token(token)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın."
        )
    return user

async def get_optional_user(authorization: Optional[str] = Header(None)):
    """
    İstek başlığında token varsa doğrular ve kullanıcıyı döner.
    Yoksa veya hatalıysa çökmez, None döner (Misafir analizi için).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        return verify_user_token(token)
    except Exception:
        return None
