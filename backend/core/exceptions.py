from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse

class AppException(Exception):
    """Tüm özel uygulama hatalarının temel sınıfı"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class PDFParsingException(AppException):
    """PDF okuma hataları"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class ScraperException(AppException):
    """İlan kazıma hataları"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class AIException(AppException):
    """Gemini veya Yapay Zeka analiz hataları"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

def register_exception_handlers(app: FastAPI):
    """FastAPI uygulamasına global hata yakalayıcıları kaydeder"""
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message}
        )
