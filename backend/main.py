from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from io import BytesIO
import re

app = FastAPI(title="AI Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOP_WORDS = {
    "the", "and", "for", "with", "you", "your", "are", "our",
    "this", "that", "from", "will", "have", "has", "was", "were",
    "can", "all", "who", "what", "when", "where", "how", "job",
    "work", "role", "skills", "skill", "experience", "required",
    "requirements", "ability", "good", "strong", "using"
}


@app.get("/")
def home():
    return {"message": "Resume Analyzer backend is running"}


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        return {"error": "Please upload a PDF resume."}

    if not job_description.strip():
        return {"error": "Please enter a job description."}

    try:
        pdf_bytes = await resume.read()
        reader = PdfReader(BytesIO(pdf_bytes))

        resume_text = " ".join(
            page.extract_text() or "" for page in reader.pages
        )

        if not resume_text.strip():
            return {
                "error": "Could not extract text from this PDF. "
                         "Please try a text-based PDF resume."
            }

        resume_words = set(
            re.findall(r"[a-zA-Z][a-zA-Z+#.]*", resume_text.lower())
        )

        job_words = set(
            re.findall(r"[a-zA-Z][a-zA-Z+#.]*", job_description.lower())
        )

        keywords = {
            word for word in job_words
            if len(word) >= 3 and word not in STOP_WORDS
        }

        matched_keywords = sorted(keywords.intersection(resume_words))

        match_score = round(
            len(matched_keywords) / len(keywords) * 100
        ) if keywords else 0

        return {
            "match_score": match_score,
            "filename": resume.filename,
            "matched_keywords": matched_keywords,
            "resume_text_preview": resume_text[:1000]
        }

    except Exception as error:
        return {"error": f"Resume analysis failed: {str(error)}"}