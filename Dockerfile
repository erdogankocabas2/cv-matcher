# --- Aşama 1: Frontend Derleme ---
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Bağımlılıkları kopyala ve yükle
COPY frontend/package*.json ./
RUN npm install

# Frontend kaynak kodlarını kopyala ve build et
COPY frontend/ ./
RUN npm run build

# --- Aşama 2: Python Backend ve Çalıştırma ---
FROM python:3.10-slim
WORKDIR /app

# Gerekli sistem paketlerini kur
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Backend bağımlılıklarını kopyala ve yükle
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Backend kaynak kodlarını kopyala
COPY backend/ ./backend/

# Frontend derleme çıktılarını backend altındaki static klasörüne kopyala
COPY --from=frontend-builder /frontend/dist ./backend/static

# Çalışma dizinini backend yap
WORKDIR /app/backend

# Port tanımlama ve çalıştırma
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
