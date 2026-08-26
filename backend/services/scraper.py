import requests
from bs4 import BeautifulSoup
import re

def scrape_job_details(url: str) -> str:
    """
    Girilen iş ilanı linkindeki metni çekmeye çalışır ve temizler.
    Güvenlik ve bot engelleri sebebiyle başarısız olursa uygun bir hata döndürür.
    """
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Referer": "https://www.google.com/"
        }
        
        # Zaman aşımı ekleyerek isteği gönder
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code != 200:
            raise Exception(f"HTTP {response.status_code} hatası alındı.")
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        # İçeriğe dahil olmayan gereksiz etiketleri kaldır
        for element in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe", "button", "input"]):
            element.decompose()
            
        # Ham metni satır satır al ve temizle
        lines = [line.strip() for line in soup.get_text(separator="\n").splitlines()]
        
        # Boş satırları filtrele ve metni birleştir
        cleaned_lines = [line for line in lines if line]
        cleaned_text = "\n".join(cleaned_lines)
        
        # Çok uzun çıktıları sınırla (Yapay zeka bağlam limitleri için güvenlik)
        if len(cleaned_text) > 15000:
            cleaned_text = cleaned_text[:15000] + "\n... (Metin uzunluğu sınırı aştığı için kısaltıldı)"
            
        if len(cleaned_text.strip()) < 150:
            raise Exception("İlan sayfasından yeterli metin içeriği çekilemedi. Sayfa bot korumalı olabilir.")
            
        return cleaned_text
        
    except requests.exceptions.Timeout:
        raise ValueError("İlan linkine erişim zaman aşımına uğradı. Site bot isteklerini engelliyor olabilir.")
    except Exception as e:
        raise ValueError(f"Link kazınamadı: {str(e)} Lütfen ilan detaylarını manuel olarak yapıştırmayı deneyin.")
