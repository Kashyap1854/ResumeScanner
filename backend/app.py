from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import os
import PyPDF2
import re

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)


model = joblib.load(os.path.join("models", "resume_model.pkl"))
vectorizer = joblib.load(os.path.join("models", "vectorizer.pkl"))

def extract_text_from_pdf(file_stream):
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()

def calculate_match_score(resume_text, job_desc):
    resume_words = set(re.findall(r"\w+", resume_text.lower()))
    job_words = set(re.findall(r"\w+", job_desc.lower()))
    if not job_words:
        return 0
    intersection = resume_words.intersection(job_words)
    return int(len(intersection) / len(job_words) * 100)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files or 'job_description' not in request.form:
        return jsonify({"error": "Resume file and job description are required"}), 400

    resume_file = request.files['resume']
    job_description = request.form['job_description']

    resume_text = extract_text_from_pdf(resume_file.stream)
    combined_text = resume_text + " " + job_description

    X = vectorizer.transform([combined_text])
    predicted_job_role = model.predict(X)[0]

    match_score = calculate_match_score(resume_text, job_description)

    if match_score < 60:
        suitability = "Not Suitable"
    elif predicted_job_role.lower() in job_description.lower():
        suitability = "Suitable"
    else:
        suitability = "Not Suitable"

    return jsonify({
        "binary_classification": suitability,
        "job_role": predicted_job_role,
        "match_score": match_score
    })


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
     
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == "__main__":
    app.run(debug=True)
