from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # .env dosyasını otomatik olarak oku, ekstra env'leri yok say
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Gemini Konfigürasyonu
    GEMINI_API_KEY: str

    # Supabase Konfigürasyonu (Opsiyonel)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

settings = Settings()
