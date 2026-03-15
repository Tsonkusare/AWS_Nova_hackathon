"""
Generate sample AI product descriptions for users to analyze.
Uses Bedrock if available, otherwise returns curated examples.
"""

import random
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/generate", tags=["Generate"])


class GenerateRequest(BaseModel):
    category: Optional[str] = None
    language: Optional[str] = "en"


class GenerateResponse(BaseModel):
    text: str
    category: str


SAMPLE_TEXTS = {
    "hiring": [
        "Our company has developed an AI-powered recruitment platform that automatically screens resumes, ranks job applicants based on their qualifications, and provides hiring recommendations. The system was trained on 5 years of successful hire data and evaluates candidates across all departments. We plan to deploy this tool across our offices in New York, California, and the European Union.",
        "We use machine learning to analyze video interviews and score candidates on communication skills, confidence, and cultural fit. The AI generates a shortlist of top candidates for each role. Our tool is used by over 200 companies across the United States for positions in finance, tech, and healthcare.",
        "Our AI hiring assistant automatically parses resumes, matches candidate skills to job requirements, and predicts employee retention likelihood. It integrates with major ATS platforms and is used by recruiters in 15 states to filter thousands of applications per week.",
    ],
    "healthcare": [
        "We are building an AI diagnostic tool that analyzes medical imaging (X-rays, MRIs, CT scans) to assist radiologists in detecting early signs of cancer. The system provides probability scores and highlights areas of concern. It is currently being piloted in three hospitals in Texas and Massachusetts, processing approximately 500 scans per day.",
        "Our AI platform monitors patient vitals in real-time in ICU settings and predicts deterioration events 6 hours before they occur. Nurses receive alerts on their devices with recommended interventions. The system processes protected health information including heart rate, blood pressure, and medication history.",
        "We developed a mental health chatbot that conducts initial screening assessments for depression and anxiety using validated clinical questionnaires. It collects patient responses, generates risk scores, and recommends whether a patient should see a specialist. Available in 10 states.",
    ],
    "finance": [
        "Our fintech startup uses AI to evaluate loan applications in real-time. The model analyzes credit history, income data, employment records, and spending patterns to generate a risk score and recommend approval or denial. We process over 10,000 applications monthly across all 50 states and provide instant decisions to applicants.",
        "We built an AI-powered insurance underwriting system that assesses risk profiles for auto and home insurance policies. The model uses demographic data, claims history, credit scores, and geographic risk factors to set premium rates. Deployed across 30 states with plans to expand to the EU market.",
        "Our robo-advisor platform uses machine learning to manage investment portfolios for retail investors. It automatically rebalances assets, executes trades, and provides personalized financial advice based on each client's risk tolerance, income, and financial goals.",
    ],
    "surveillance": [
        "We provide AI-powered video analytics for retail stores that uses facial recognition to identify known shoplifters and alert security staff in real-time. The system maintains a database of flagged individuals and tracks movement patterns throughout the store. Currently deployed in 50 locations across Illinois, Texas, and New York.",
        "Our smart city platform uses AI to analyze CCTV footage for traffic management, crowd density monitoring, and public safety threat detection. The system can identify individuals through gait analysis and facial recognition, and is integrated with local law enforcement databases in three municipalities.",
        "We developed an employee monitoring tool that uses AI to track productivity through keystroke logging, screen capture analysis, and webcam-based attention detection. The tool generates performance scores and flags employees who fall below productivity thresholds.",
    ],
    "education": [
        "Our AI tutoring platform adapts lesson content in real-time based on each student's learning pace, strengths, and weaknesses. It tracks student performance data, predicts test scores, and recommends personalized study plans. Used by 200 schools serving students ages 8-18 across California and New York.",
        "We built an AI-powered essay grading system for universities that evaluates writing quality, argumentation, grammar, and originality. The system assigns grades and provides detailed feedback. It processes 50,000 submissions per semester across 15 colleges.",
        "Our AI proctoring software monitors students during online exams using webcam video analysis, screen recording, and keystroke tracking. It flags suspicious behavior like looking away from the screen, detecting additional people in the room, or opening unauthorized applications.",
    ],
}


def _try_bedrock_generate(category: Optional[str]) -> Optional[str]:
    """Try to generate text using Bedrock."""
    try:
        import boto3
        import json
        from botocore.config import Config
        from config import AWS_REGION, NOVA_MODEL_ID

        client = boto3.client(
            "bedrock-runtime",
            region_name=AWS_REGION,
            config=Config(
                retries={"max_attempts": 2, "mode": "standard"},
                read_timeout=30,
                connect_timeout=10,
            ),
        )

        category_hint = f" in the {category} domain" if category else ""
        prompt = f"""Generate a realistic description of an AI product or system{category_hint} that a startup might build.
The description should be 3-4 sentences and include:
- What the AI does
- What data it processes
- Where it's deployed (mention specific US states or EU)
- Who it affects (customers, employees, patients, students, etc.)

Return ONLY the description text, no quotes or formatting."""

        response = client.converse(
            modelId=NOVA_MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 300, "temperature": 0.9, "topP": 0.95},
        )

        blocks = response["output"]["message"]["content"]
        return "\n".join(b["text"] for b in blocks if "text" in b).strip()
    except Exception:
        return None


def _translate_from_english(text: str, language: str) -> str:
    if language == "en":
        return text
    try:
        from translation.translation import LegalTranslationLayer
        layer = LegalTranslationLayer()
        layer.set_language(language)
        return layer.from_english(text)
    except Exception:
        pass
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source='en', target=language).translate(text)
    except Exception:
        return text


@router.post("/", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    """Generate a sample AI product description."""
    category = request.category
    language = request.language or "en"

    # Pick a random category if none specified
    if not category or category not in SAMPLE_TEXTS:
        category = random.choice(list(SAMPLE_TEXTS.keys()))

    # Try Bedrock first
    text = _try_bedrock_generate(category)

    # Fall back to curated samples
    if not text:
        text = random.choice(SAMPLE_TEXTS[category])

    # Translate if not English
    if language != "en":
        text = _translate_from_english(text, language)

    return GenerateResponse(text=text, category=category)


@router.get("/categories")
async def list_categories():
    """List available categories for text generation."""
    return list(SAMPLE_TEXTS.keys())
