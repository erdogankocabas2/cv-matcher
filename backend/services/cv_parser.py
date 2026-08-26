import io
import asyncio
from pypdf import PdfReader
from core.exceptions import PDFParsingException

def _parse_pdf_sync(pdf_bytes: bytes) -> str:
    """PDF ayrıştırma işlemini senkron olarak gerçekleştiren iç yardımcı fonksiyon."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Fazlalık boşlukları temizle
        cleaned_text = "\n".join([line.strip() for line in text.split("\n") if line.strip()])
        
        if not cleaned_text.strip():
            raise ValueError("PDF dosyasından okunabilir metin çıkarılamadı.")
            
        return cleaned_text
    except Exception as e:
        raise ValueError(f"PDF metni ayrıştırılırken hata oluştu: {str(e)}")

async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    PDF dosyasının içeriğindeki ham metni asenkron olarak (Thread Pool içinde) okur ve temizler.
    Bu sayede CPU/IO yoğun PDF okuma işlemi FastAPI'nin event loop'unu kilitlemez.
    """
    try:
        # Senkron çalışması gereken I/O yoğun işlemi arka plan thread havuzuna gönder
        return await asyncio.to_thread(_parse_pdf_sync, pdf_bytes)
    except ValueError as ve:
        raise PDFParsingException(str(ve))
    except Exception as e:
        raise PDFParsingException(f"PDF okuma işlemi başarısız: {str(e)}")
