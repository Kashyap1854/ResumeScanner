import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Base directory (directory of this script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths relative to BASE_DIR
DATA_PATH = os.path.join(BASE_DIR, "data", "Resume.csv")  # Path to your dataset
MODEL_PATH = os.path.join(BASE_DIR, "models", "resume_model.pkl")  # Path to save model
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "vectorizer.pkl")  # Path to save vectorizer

# Ensure model directory exists
os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

# 1. Load Dataset
df = pd.read_csv(DATA_PATH)

# 2. Features & Labels
X_text = df['skills']    # Use 'skills' column as input text
y = df['job_role']

# 3. Vectorize text data
vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(X_text)

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 5. Train Model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# 6. Evaluate Model
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# 7. Save Model + Vectorizer
joblib.dump(model, MODEL_PATH)
joblib.dump(vectorizer, VECTORIZER_PATH)

print(f"✅ Model and vectorizer saved inside {MODEL_PATH} and {VECTORIZER_PATH}")
