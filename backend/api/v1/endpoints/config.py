from fastapi import APIRouter, Depends
from api.deps import get_settings, Settings

router = APIRouter()

@router.get("")
async def get_config(settings: Settings = Depends(get_settings)):
    """
    Frontend'in Supabase JS SDK'sını başlatması için gereken
    public (anon) bağlantı bilgilerini döner.
    """
    return {
        "supabase_url": settings.SUPABASE_URL,
        "supabase_anon_key": settings.SUPABASE_ANON_KEY
    }
