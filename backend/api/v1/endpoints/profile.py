from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from api.deps import get_current_user
from services.supabase_client import update_user_profile

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    current_status: str
    target_roles: List[str]
    preferred_location: str
    job_search_status: str

@router.patch("")
async def update_profile(data: ProfileUpdateRequest, user = Depends(get_current_user)):
    """
    Onboarding adımında kullanıcının verdiği kişiselleştirme bilgilerini kaydeder.
    """
    res = update_user_profile(
        user_id=user.id,
        status=data.current_status,
        roles=data.target_roles,
        location=data.preferred_location,
        search_status=data.job_search_status
    )
    if res is None:
        raise HTTPException(status_code=500, detail="Profil güncellenirken sunucu hatası oluştu.")
    return {"message": "Profil başarıyla güncellendi."}
