import httpx
from bs4 import BeautifulSoup
from core.exceptions import ScraperException

async def scrape_job_details(url: str) -> str:
    """
    Girilen iş ilanı linkindeki metni asenkron HTTPX istemcisi kullanarak çeker ve temizler.
    Asenkron yapısı sayesinde, istek atılırken FastAPI event loop'u bloklanmaz.
    """
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Referer": "https://www.google.com/"
    }

    try:
        # Asenkron HTTP istemcisi oluştur
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                raise ScraperException(f"HTTP {response.status_code} hatası alındı. Sayfa yüklenemedi.")
                
            soup = BeautifulSoup(response.text, "html.parser")
            
            # İçeriğe dahil olmayan gereksiz etiketleri temizle
            for element in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe", "button", "input"]):
                element.decompose()
                
            # Ham metni temizleyip birleştir
            lines = [line.strip() for line in soup.get_text(separator="\n").splitlines()]
            cleaned_lines = [line for line in lines if line]
            cleaned_text = "\n".join(cleaned_lines)
            
            # Çok uzun ilanları yapay zeka limitleri için kırp
            if len(cleaned_text) > 15000:
                cleaned_text = cleaned_text[:15000] + "\n... (Metin uzunluğu sınırı aştığı için kısaltıldı)"
                
            if len(cleaned_text.strip()) < 150:
                raise ScraperException("İlan sayfasından yeterli metin içeriği çekilemedi. Site bot korumalı (Captcha/Cloudflare) olabilir.")
                
            return cleaned_text
            
    except httpx.TimeoutException:
        raise ScraperException("İlan linkine erişim zaman aşımına uğradı. Site bot isteklerini engelliyor olabilir. Lütfen ilanı manuel yapıştırın.")
    except ScraperException as se:
        raise se
    except Exception as e:
        raise ScraperException(f"Link kazınamadı: {str(e)}. Lütfen ilan detaylarını manuel yapıştırmayı deneyin.")
