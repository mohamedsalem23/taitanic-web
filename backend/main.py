from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os

try:
    from model import preprocess_and_predict, get_model
except ImportError:
    from .model import preprocess_and_predict, get_model

app = FastAPI(
    title="RMS Titanic Survival Estimation API",
    description="Statistical predictive engine based on historical passenger records from the 1912 Titanic voyage.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PassengerRequest(BaseModel):
    pclass: int = Field(..., ge=1, le=3, description="Ticket Class: 1 = First, 2 = Second, 3 = Third")
    sex: str = Field(..., description="Gender: 'male' or 'female'")
    age: float = Field(..., ge=0.1, le=100.0, description="Passenger age in years")
    fare: float = Field(..., ge=0.0, le=1000.0, description="Ticket fare in British Pounds (£)")
    embarked: str = Field(..., description="Port of embarkation: 'Cherbourg', 'Queenstown', or 'Southampton'")
    sibsp: int = Field(0, ge=0, le=15, description="Number of siblings / spouses aboard")
    parch: int = Field(0, ge=0, le=15, description="Number of parents / children aboard")

class FactorAnalysis(BaseModel):
    factor: str
    impact: str
    description: str

class InputFeatureSummary(BaseModel):
    pclass: int
    pclass_name: str
    sex: str
    age: float
    fare: float
    embarked: str
    family_size: int
    is_alone: bool
    sibsp: int
    parch: int

class PredictionResponse(BaseModel):
    survived: bool
    prediction_label: str
    survival_probability: float
    non_survival_probability: float
    survival_percentage: float
    non_survival_percentage: float
    input_features: InputFeatureSummary
    factors: List[FactorAnalysis]

HISTORICAL_PRESETS = [
    {
        "id": "first-class-noble",
        "name": "Lady Duff-Gordon (1st Class)",
        "description": "Prominent British fashion designer traveling in a luxury stateroom with immediate lifeboat access.",
        "pclass": 1,
        "sex": "female",
        "age": 48.0,
        "fare": 86.50,
        "embarked": "Cherbourg",
        "sibsp": 1,
        "parch": 0
    },
    {
        "id": "first-class-gentleman",
        "name": "Col. Archibald Gracie (1st Class)",
        "description": "American historian and writer who assisted women into lifeboats before being washed into the freezing ocean.",
        "pclass": 1,
        "sex": "male",
        "age": 53.0,
        "fare": 52.00,
        "embarked": "Southampton",
        "sibsp": 0,
        "parch": 0
    },
    {
        "id": "second-class-teacher",
        "name": "Lawrence Beesley (2nd Class)",
        "description": "English science master traveling alone, boarded Lifeboat 13 on the starboard side.",
        "pclass": 2,
        "sex": "male",
        "age": 34.0,
        "fare": 13.00,
        "embarked": "Southampton",
        "sibsp": 0,
        "parch": 0
    },
    {
        "id": "second-class-mother",
        "name": "Eva Hart & Mother (2nd Class)",
        "description": "Seven-year-old child traveling with parents emigrating to Winnipeg, Canada.",
        "pclass": 2,
        "sex": "female",
        "age": 7.0,
        "fare": 26.25,
        "embarked": "Southampton",
        "sibsp": 0,
        "parch": 2
    },
    {
        "id": "third-class-laborer",
        "name": "Olaus Abelseth (3rd Class)",
        "description": "25-year-old Norwegian farmer traveling with cousins, faced barriers reaching the upper decks.",
        "pclass": 3,
        "sex": "male",
        "age": 25.0,
        "fare": 7.65,
        "embarked": "Southampton",
        "sibsp": 0,
        "parch": 0
    },
    {
        "id": "third-class-family",
        "name": "Sage Family Child (3rd Class)",
        "description": "Member of a large 11-person emigrant family berthed deep in steerage.",
        "pclass": 3,
        "sex": "female",
        "age": 14.0,
        "fare": 69.55,
        "embarked": "Southampton",
        "sibsp": 5,
        "parch": 2
    }
]

HISTORICAL_STATS = {
    "total_passengers_crew": 2224,
    "total_lost": 1514,
    "total_survived": 710,
    "overall_survival_rate": 31.6,
    "breakdowns": [
        {"category": "First Class Passengers", "survival_rate": 62.5, "note": "High proximity to boat deck and prioritized boarding"},
        {"category": "Second Class Passengers", "survival_rate": 41.5, "note": "Strong women/children priority; low male survival"},
        {"category": "Third Class Passengers", "survival_rate": 24.5, "note": "Difficult navigation from lower decks and language barriers"},
        {"category": "All Female Passengers", "survival_rate": 74.2, "note": "Strict enforcement of 'women & children first' protocol"},
        {"category": "All Male Passengers", "survival_rate": 18.9, "note": "Prevented from boarding port-side lifeboats by officers"}
    ]
}

@app.get("/")
def health_check():
    try:
        model = get_model()
        model_ready = model is not None
    except Exception:
        model_ready = False

    return {
        "status": "online",
        "service": "RMS Titanic Survival Estimation API",
        "engine": "Random Forest Ensemble Classifier",
        "model_loaded": model_ready,
        "version": "1.0.0"
    }

@app.get("/api/presets")
def get_presets():
    return HISTORICAL_PRESETS

@app.get("/api/stats")
def get_stats():
    return HISTORICAL_STATS

@app.post("/api/predict", response_model=PredictionResponse)
def predict(payload: PassengerRequest):
    try:
        result = preprocess_and_predict(
            pclass=payload.pclass,
            sex=payload.sex,
            age=payload.age,
            fare=payload.fare,
            embarked=payload.embarked,
            sibsp=payload.sibsp,
            parch=payload.parch
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction calculation failed: {str(e)}")
