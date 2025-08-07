FROM python:3.9-slim

WORKDIR /app

# Pre-download models to reduce cold start time
RUN pip install deepface && \
    python -c "from deepface import DeepFace; DeepFace.build_model('Emotion')"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:$PORT", "--workers", "1", "--timeout", "120"]