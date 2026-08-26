from pypdf import PdfReader
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    PDF dosyasının içeriğindeki ham metni okur ve temizler.
    """
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
