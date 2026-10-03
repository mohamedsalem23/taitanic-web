import os
import joblib
import pandas as pd
from typing import Dict, Any, Tuple, List

# Locate the model file relative to this script
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(CURRENT_DIR, "titanic_pipeline.pkl")

# Fallback paths for local or vercel serverless execution
if not os.path.exists(MODEL_FILE):
    alt_path = os.path.join(os.getcwd(), "titanic_pipeline.pkl")
    if os.path.exists(alt_path):
        MODEL_FILE = alt_path
    else:
        alt_backend = os.path.join(os.getcwd(), "backend", "titanic_pipeline.pkl")
        if os.path.exists(alt_backend):
            MODEL_FILE = alt_backend

_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_FILE):
            raise FileNotFoundError(f"Model file not found at: {MODEL_FILE}")
        _model = joblib.load(MODEL_FILE)
    return _model

def preprocess_and_predict(
    pclass: int,
    sex: str,
    age: float,
    fare: float,
    embarked: str,
    sibsp: int,
    parch: int
) -> Dict[str, Any]:
    """
    Transforms raw inputs into the feature space expected by the trained Random Forest model:
    ['Pclass', 'Age', 'Fare', 'Sex_Encoded', 'Embarked_Encoded', 'FamilySize', 'IsAlone']
    """
    model = get_model()

    # 1. Pclass normalization
    pclass_val = int(pclass)
    if pclass_val not in [1, 2, 3]:
        pclass_val = 3

    # 2. Sex encoding: female=0, male=1
    sex_clean = str(sex).strip().lower()
    sex_encoded = 1 if sex_clean in ["male", "m", "1"] else 0

    # 3. Port of Embarkation: Cherbourg=0, Queenstown=1, Southampton=2
    emb_clean = str(embarked).strip().lower()
    if "cherbourg" in emb_clean or emb_clean == "c":
        embarked_encoded = 0
        port_name = "Cherbourg"
    elif "queenstown" in emb_clean or emb_clean == "q":
        embarked_encoded = 1
        port_name = "Queenstown"
    else:
        embarked_encoded = 2
        port_name = "Southampton"

    # 4. Family engineered features
    sibsp_val = max(0, int(sibsp))
    parch_val = max(0, int(parch))
    family_size = sibsp_val + parch_val + 1
    is_alone = 1 if family_size == 1 else 0

    # 5. Build input DataFrame
    feature_columns = [
        "Pclass",
        "Age",
        "Fare",
        "Sex_Encoded",
        "Embarked_Encoded",
        "FamilySize",
        "IsAlone"
    ]

    input_df = pd.DataFrame([[
        pclass_val,
        float(age),
        float(fare),
        sex_encoded,
        embarked_encoded,
        family_size,
        is_alone
    ]], columns=feature_columns)

    # 6. Predict and calculate probabilities
    prediction = int(model.predict(input_df)[0])
    probabilities = model.predict_proba(input_df)[0]

    prob_perished = float(probabilities[0])
    prob_survived = float(probabilities[1])

    survived = bool(prediction == 1)

    # 7. Risk / Survival factor analysis
    factors = []
    if sex_encoded == 0:
        factors.append({
            "factor": "Gender (Female)",
            "impact": "positive",
            "description": "Historical 'women and children first' evacuation protocol significantly favored female passengers."
        })
    else:
        factors.append({
            "factor": "Gender (Male)",
            "impact": "negative",
            "description": "Adult male passengers faced strict boarding restrictions on port and starboard lifeboats."
        })

    if pclass_val == 1:
        factors.append({
            "factor": "First Class Ticket",
            "impact": "positive",
            "description": "Cabins closer to the boat deck allowed swifter access to lifeboats during the early stages."
        })
    elif pclass_val == 3:
        factors.append({
            "factor": "Third Class Ticket",
            "impact": "negative",
            "description": "Lower deck berths, gate partitions, and unfamiliarity with boat deck paths severely restricted egress."
        })

    if age < 16:
        factors.append({
            "factor": "Child / Youth Passenger",
            "impact": "positive",
            "description": "Children were prioritized alongside women during lifeboat loading operations."
        })
    elif age >= 60:
        factors.append({
            "factor": "Elderly Passenger",
            "impact": "negative",
            "description": "Mobility challenges and extreme sub-zero seawater temperatures posed severe survival hurdles."
        })

    if is_alone:
        factors.append({
            "factor": "Traveling Solo",
            "impact": "neutral",
            "description": "Solo travelers avoided delays searching for family members, but had no support system during evacuation."
        })
    else:
        if family_size > 4:
            factors.append({
                "factor": "Large Family Group",
                "impact": "negative",
                "description": "Large families frequently delayed boarding to stay together, leading to lower collective survival rates."
            })
        else:
            factors.append({
                "factor": "Small Family Unit",
                "impact": "positive",
                "description": "Small family units could coordinate rapidly while boarding lifeboats together."
            })

    return {
        "survived": survived,
        "prediction_label": "Survived" if survived else "Did Not Survive",
        "survival_probability": round(prob_survived, 4),
        "non_survival_probability": round(prob_perished, 4),
        "survival_percentage": round(prob_survived * 100, 1),
        "non_survival_percentage": round(prob_perished * 100, 1),
        "input_features": {
            "pclass": pclass_val,
            "pclass_name": f"{pclass_val}st Class" if pclass_val == 1 else (f"{pclass_val}nd Class" if pclass_val == 2 else f"{pclass_val}rd Class"),
            "sex": "Female" if sex_encoded == 0 else "Male",
            "age": float(age),
            "fare": float(fare),
            "embarked": port_name,
            "family_size": family_size,
            "is_alone": bool(is_alone == 1),
            "sibsp": sibsp_val,
            "parch": parch_val
        },
        "factors": factors
    }
