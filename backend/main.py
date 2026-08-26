import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Core ve Rotaları içe aktar
from core.exceptions import register_exception_handlers
from api.v1.router import api_router

app = FastAPI(
    title="CV & Job Analyzer API",
    description="SaaS ölçeğinde asenkron, modüler ve güvenli CV uygunluk analizi API'si.",
    version="2.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Global Hata Yakalayıcıları (Exception Handlers) Kaydet
register_exception_handlers(app)

# 2. Modüler API Rotalarını Bağla
app.include_router(api_router, prefix="/api")


# --- Üretim Ortamında Tek Servis Olarak React Sunumu ---
# React derleme çıktıları (build) backend/static klasörüne kopyalanmışsa serve et
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Varlıklar (assets) klasörünü bağla
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    # HTML5 History Mode için tüm istekleri index.html'e yönlendir (API rotaları hariç)
    @app.get("/{catchall:path}")
    async def serve_react(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API rotası bulunamadı.")
            
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Arayüz dosyası bulunamadı.")
