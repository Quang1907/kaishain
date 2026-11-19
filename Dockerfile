# ====================================================================
# DOCKERFILE FOR FACTORY APS BRAIN APPLICATION SERVER
# ====================================================================
FROM python:3.11-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cần thiết cho PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Sao chép và cài đặt requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Sao chép toàn bộ mã nguồn
COPY . /app

EXPOSE 8080

# Chạy seed database khi khởi động và mở server
CMD ["python", "backend/server.py"]
