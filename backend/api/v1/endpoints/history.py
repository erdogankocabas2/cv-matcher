from fastapi import APIRouter, Depends
from api.deps import get_current_user
from services.supabase_client import get_user_scan_history

router = APIRouter()

@router.get("")
async def get_history(user = Depends(get_current_user)):
    """
    Giriş yapmış kullanıcının geçmiş analiz raporlarını listeler.
    """
    history = get_user_scan_history(user.id)
    return history
