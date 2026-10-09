# Build stage for Python FastAPI backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and models
COPY . .

# Run model pre-training / verification if models directory is missing artifacts
RUN python train_models.py || true

ENV PORT=8000
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
