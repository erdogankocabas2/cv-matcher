from fastapi import APIRouter
from api.v1.endpoints import analyze, history, config

api_router = APIRouter()

# Alt rotaları ekle
api_router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(config.router, prefix="/config", tags=["Config"])
