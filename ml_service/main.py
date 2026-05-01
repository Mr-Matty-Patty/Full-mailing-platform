"""
Phishing Detection ML Microservice
FastAPI wrapper around the trained model.pkl
Run with: uvicorn main:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Phishing Detector API", version="1.0.0")

# Allow requests from React frontend and Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
MODEL_PATH = os.environ.get("MODEL_PATH", "model.pkl")
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None


class EmailRequest(BaseModel):
    subject: str = ""
    body: str = ""
    sender: str = ""


class PredictionResponse(BaseModel):
    verdict: str          # "Phishing" or "Legitimate"
    confidence: float     # 0-100
    is_phishing: bool


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionResponse)
def predict(email: EmailRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Combine fields the same way we trained
    text = f"{email.subject} {email.body} {email.sender}".strip()
    if not text:
        raise HTTPException(status_code=400, detail="Email content is empty")

    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = round(float(probabilities[prediction]) * 100, 1)

    return PredictionResponse(
        verdict="Phishing" if prediction == 1 else "Legitimate",
        confidence=confidence,
        is_phishing=bool(prediction == 1),
    )
