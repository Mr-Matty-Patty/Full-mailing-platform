"""
D&M Mail — ML Microservice
Serves two models via FastAPI:
  - /predict           → phishing detection (binary)
  - /predict_category  → category classification (Personal / Promotional / Notification)

Run with: uvicorn main:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="D&M Mail ML API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
PHISHING_MODEL_PATH = os.environ.get("MODEL_PATH", "model.pkl")
CATEGORY_MODEL_PATH = os.environ.get(
    "CATEGORY_MODEL_PATH", "email_category_model.pkl"
)

try:
    phishing_model = joblib.load(PHISHING_MODEL_PATH)
    print(f"✅ Phishing model loaded from {PHISHING_MODEL_PATH}")
except Exception as e:
    print(f"❌ Failed to load phishing model: {e}")
    phishing_model = None

try:
    category_model = joblib.load(CATEGORY_MODEL_PATH)
    print(f"✅ Category model loaded from {CATEGORY_MODEL_PATH}")
except Exception as e:
    print(f"⚠️  Category model not loaded ({e}). /predict_category will 503.")
    category_model = None


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class EmailRequest(BaseModel):
    subject: str = ""
    body: str = ""
    sender: str = ""


class PhishingResponse(BaseModel):
    verdict: str          # "Phishing" or "Legitimate"
    confidence: float     # 0-100
    is_phishing: bool


class CategoryResponse(BaseModel):
    category: str         # "Personal" / "Promotional" / "Notification"
    confidence: float     # 0-100


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _build_text(email: EmailRequest) -> str:
    text = f"{email.subject} {email.body} {email.sender}".strip()
    if not text:
        raise HTTPException(status_code=400, detail="Email content is empty")
    return text


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "phishing_model_loaded": phishing_model is not None,
        "category_model_loaded": category_model is not None,
    }


@app.post("/predict", response_model=PhishingResponse)
def predict(email: EmailRequest):
    if phishing_model is None:
        raise HTTPException(status_code=503, detail="Phishing model not loaded")

    text = _build_text(email)
    probabilities = phishing_model.predict_proba([text])[0]

    # probabilities[1] is the model's confidence that the email IS phishing.
    # Require >=85% before flagging — the raw model is over-eager on
    # benign-but-urgent emails like university notices.
    PHISHING_THRESHOLD = 0.85
    phishing_prob = float(probabilities[1])
    is_phishing = phishing_prob >= PHISHING_THRESHOLD

    # Confidence shown to the user reflects the winning verdict's probability.
    confidence = round(
        (phishing_prob if is_phishing else (1.0 - phishing_prob)) * 100, 1
    )

    return PhishingResponse(
        verdict="Phishing" if is_phishing else "Legitimate",
        confidence=confidence,
        is_phishing=is_phishing,
    )


@app.post("/predict_category", response_model=CategoryResponse)
def predict_category(email: EmailRequest):
    if category_model is None:
        raise HTTPException(status_code=503, detail="Category model not loaded")

    text = _build_text(email)
    # The training script trained on `text` only (subject + body), so we can
    # pass the same combined string here. sklearn pipelines return the predicted
    # class label directly (e.g., 'Personal').
    prediction = category_model.predict([text])[0]
    probabilities = category_model.predict_proba([text])[0]

    # Find which probability corresponds to the predicted class
    classes = list(category_model.classes_)
    idx = classes.index(prediction)
    confidence = round(float(probabilities[idx]) * 100, 1)

    return CategoryResponse(category=str(prediction), confidence=confidence)
