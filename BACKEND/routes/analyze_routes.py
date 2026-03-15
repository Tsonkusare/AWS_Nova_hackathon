"""
Analyze endpoint.
- Uses analysis_service.py (Bedrock) when AWS credentials are available.
- Falls back to keyword-based domain analysis when Bedrock is unavailable.
- Uses translation/translation.py when torch is installed.
"""

import re
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from services.bill_loader import bill_store

router = APIRouter(prefix="/analyze", tags=["Analyze"])

# Try to load translation layer
_translation_layer = None
try:
    from translation.translation import LegalTranslationLayer
    _translation_layer = LegalTranslationLayer()
    print("[Analyze] Translation layer loaded")
except ImportError:
    print("[Analyze] Translation layer unavailable (torch/transformers not installed)")


class AnalyzeRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class AnalyzeResponse(BaseModel):
    riskLevel: str
    issues: list
    recommendations: list
    explanation: str
    relevantBills: list = []


def _translate_to_english(text: str, language: str) -> str:
    if language == "en":
        return text
    if _translation_layer:
        try:
            _translation_layer.set_language(language)
            return _translation_layer.to_english(text)
        except Exception:
            pass
    # Fallback to deep-translator
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source=language, target='en').translate(text)
    except Exception:
        return text


def _translate_from_english(text: str, language: str) -> str:
    if language == "en":
        return text
    if _translation_layer:
        try:
            _translation_layer.set_language(language)
            return _translation_layer.from_english(text)
        except Exception:
            pass
    # Fallback to deep-translator
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source='en', target=language).translate(text)
    except Exception:
        return text


def _try_bedrock_analysis(text: str) -> Optional[dict]:
    """Use the existing analysis_service.py to call Bedrock."""
    try:
        from services.analysis_service import build_analysis_prompt, bedrock_runtime, _extract_text, _clean_model_output, _try_extract_json_object
        from config import NOVA_MODEL_ID
        import json

        # Build a simple project-like object from the text
        class _FakeProject:
            def __init__(self, text):
                self.name = "User Analysis"
                self.industry = None
                self.region = None
                self.use_case = None
                self.description = text

        prompt = build_analysis_prompt(_FakeProject(text))

        response = bedrock_runtime.converse(
            modelId=NOVA_MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 1200, "temperature": 0.1, "topP": 0.9},
        )

        text_output = _extract_text(response)
        cleaned = _clean_model_output(text_output)
        cleaned = _try_extract_json_object(cleaned)
        parsed = json.loads(cleaned)

        # Map the analysis_service format to our response format
        return {
            "risk_level": parsed.get("risk_level", "medium"),
            "issues": [
                {"title": c, "description": c, "severity": "medium"}
                for c in parsed.get("concerns", [])
            ],
            "recommendations": [
                {"title": a, "description": a}
                for a in parsed.get("next_actions", [])
            ],
            "explanation": parsed.get("rationale", ""),
        }
    except Exception:
        return None


# ── Domain-specific rules for when Bedrock is unavailable ──

DOMAIN_RULES = {
    "hiring": {
        "keywords": ["hiring", "recruit", "resume", "candidate", "applicant", "employment", "interview", "screening", "job"],
        "risk": "high",
        "issues": [
            {"title": "Automated Employment Decision Tool (AEDT)", "description": "Systems that screen or score job candidates may be classified as AEDTs under NYC Local Law 144 and similar state laws, requiring annual bias audits.", "severity": "high"},
            {"title": "EU AI Act — High-Risk Classification", "description": "AI systems used in employment, worker management, and recruitment are classified as high-risk under EU AI Act Annex III, requiring conformity assessments.", "severity": "high"},
            {"title": "Historical Data Bias Risk", "description": "Training on past hiring decisions may encode discriminatory patterns, violating Title VII of the Civil Rights Act and EEOC guidelines.", "severity": "medium"},
        ],
        "recommendations": [
            {"title": "Conduct Annual Bias Audit", "description": "Engage a third-party auditor to evaluate the tool for disparate impact across protected categories as required by NYC LL144 and Illinois AIPA."},
            {"title": "Publish Transparency Notice", "description": "Notify candidates that AI is being used in the hiring process and provide opt-out mechanisms where legally required."},
            {"title": "Register Under EU AI Act", "description": "If deploying in the EU, register the system in the EU database and complete a conformity assessment per Article 6."},
        ],
    },
    "healthcare": {
        "keywords": ["health", "medical", "patient", "diagnosis", "clinical", "hospital", "treatment", "drug", "pharmaceutical"],
        "risk": "high",
        "issues": [
            {"title": "Medical Device Classification", "description": "AI systems that assist in diagnosis or treatment recommendations may be classified as medical devices under FDA regulations and EU MDR.", "severity": "high"},
            {"title": "HIPAA Compliance", "description": "Processing patient health information requires compliance with HIPAA Privacy and Security Rules.", "severity": "high"},
            {"title": "Clinical Validation Required", "description": "Healthcare AI must demonstrate clinical efficacy through validated studies before deployment.", "severity": "medium"},
        ],
        "recommendations": [
            {"title": "FDA Pre-Submission Review", "description": "Consult FDA's Digital Health Center of Excellence for classification and pre-submission guidance."},
            {"title": "HIPAA Impact Assessment", "description": "Conduct a thorough privacy impact assessment for all patient data flows."},
            {"title": "Clinical Validation Study", "description": "Design and execute a clinical validation study appropriate to the risk level of the AI application."},
        ],
    },
    "finance": {
        "keywords": ["loan", "credit", "finance", "banking", "insurance", "fintech", "payment", "mortgage", "underwriting", "interest"],
        "risk": "high",
        "issues": [
            {"title": "Fair Lending Compliance (ECOA)", "description": "AI-driven credit decisions must comply with the Equal Credit Opportunity Act — automated rejections must provide specific adverse action reasons.", "severity": "high"},
            {"title": "Algorithmic Accountability", "description": "Financial regulators (CFPB, OCC) increasingly require explainability for AI-driven financial decisions.", "severity": "high"},
            {"title": "Consumer Financial Data Privacy", "description": "Processing financial data triggers GLBA (Gramm-Leach-Bliley Act) safeguards and state-level financial privacy laws.", "severity": "medium"},
        ],
        "recommendations": [
            {"title": "Adverse Action Notice System", "description": "Implement a system to generate specific, individualized reasons for any AI-driven credit denial or adverse action."},
            {"title": "Model Risk Management", "description": "Follow OCC SR 11-7 / Fed SR 15-18 guidance on model risk management for AI systems."},
            {"title": "Fair Lending Testing", "description": "Conduct regular disparate impact analysis across protected classes."},
        ],
    },
    "surveillance": {
        "keywords": ["surveillance", "facial", "recognition", "biometric", "camera", "tracking", "monitoring", "cctv"],
        "risk": "high",
        "issues": [
            {"title": "Biometric Data Regulation", "description": "Facial recognition and biometric data collection is banned or restricted in multiple US cities and states (Illinois BIPA, Portland, San Francisco).", "severity": "high"},
            {"title": "EU AI Act — Prohibited Practice", "description": "Real-time remote biometric identification in public spaces is generally prohibited under EU AI Act Article 5.", "severity": "high"},
            {"title": "Fourth Amendment Concerns", "description": "Government use of AI surveillance may implicate constitutional privacy protections.", "severity": "medium"},
        ],
        "recommendations": [
            {"title": "Jurisdiction-Specific Review", "description": "Map all deployment jurisdictions and verify biometric data laws in each location."},
            {"title": "Consent Mechanism", "description": "Implement explicit opt-in consent for any biometric data collection where legally permissible."},
            {"title": "Data Retention Policy", "description": "Establish strict retention and deletion schedules for biometric data."},
        ],
    },
    "education": {
        "keywords": ["education", "student", "school", "learning", "teacher", "classroom", "academic", "grade", "university"],
        "risk": "medium",
        "issues": [
            {"title": "FERPA Compliance", "description": "AI systems processing student records must comply with the Family Educational Rights and Privacy Act.", "severity": "high"},
            {"title": "COPPA Requirements", "description": "If the system processes data from children under 13, the Children's Online Privacy Protection Act applies.", "severity": "high"},
            {"title": "Algorithmic Fairness in Education", "description": "AI grading or assessment tools must not discriminate based on protected characteristics.", "severity": "medium"},
        ],
        "recommendations": [
            {"title": "FERPA Compliance Review", "description": "Ensure all student data handling complies with FERPA, including directory information policies."},
            {"title": "Age Verification", "description": "Implement age verification and COPPA-compliant consent workflows for minor users."},
            {"title": "Equity Audit", "description": "Test AI assessment tools for fairness across demographic groups."},
        ],
    },
    "general": {
        "keywords": [],
        "risk": "medium",
        "issues": [
            {"title": "AI Transparency Requirements", "description": "Multiple jurisdictions now require disclosure when content is AI-generated or when AI is used in decision-making.", "severity": "medium"},
            {"title": "Data Privacy Compliance", "description": "Processing personal data through AI systems triggers obligations under GDPR, CCPA/CPRA, and state privacy laws.", "severity": "medium"},
            {"title": "EU AI Act General-Purpose AI", "description": "General-purpose AI systems have transparency and documentation obligations under the EU AI Act.", "severity": "low"},
        ],
        "recommendations": [
            {"title": "AI Use Disclosure", "description": "Add clear disclosures wherever AI-generated content is used in customer-facing contexts."},
            {"title": "Privacy Impact Assessment", "description": "Conduct a data protection impact assessment (DPIA) for any personal data processing."},
            {"title": "Documentation", "description": "Maintain technical documentation of the AI system's purpose, capabilities, and limitations."},
        ],
    },
}


def _keyword_analysis(text: str) -> dict:
    """Domain-specific analysis based on keywords in the input."""
    text_lower = text.lower()

    best_domain = "general"
    best_score = 0
    for domain, rules in DOMAIN_RULES.items():
        if domain == "general":
            continue
        score = sum(1 for kw in rules["keywords"] if kw in text_lower)
        if score > best_score:
            best_score = score
            best_domain = domain

    rules = DOMAIN_RULES[best_domain]
    word_count = len(text.split())

    explanation = (
        f"Analysis of your {word_count}-word submission identified this as a "
        f"{best_domain} AI application with {rules['risk']} compliance risk. "
        f"We recommend addressing high-severity issues first and consulting "
        f"legal counsel for jurisdiction-specific requirements."
    )

    return {
        "risk_level": rules["risk"],
        "issues": rules["issues"],
        "recommendations": rules["recommendations"],
        "explanation": explanation,
    }


def _do_analysis(text: str, language: str) -> dict:
    """Translate → search bills → analyze (Bedrock or keyword) → translate back."""
    english_text = _translate_to_english(text, language)

    # Search real bills from cache
    relevant_bills = []
    if bill_store._loaded and bill_store.bills:
        found = bill_store.search(english_text, limit=5)
        relevant_bills = [
            {"jurisdiction": b["jurisdiction"], "bill_number": b["bill_number"],
             "year": b["year"], "snippet": b["snippet"]}
            for b in found
        ]

    result = _try_bedrock_analysis(english_text)
    if result is None:
        result = _keyword_analysis(english_text)

    if language != "en":
        result["explanation"] = _translate_from_english(result["explanation"], language)
        for issue in result.get("issues", []):
            issue["title"] = _translate_from_english(issue["title"], language)
            issue["description"] = _translate_from_english(issue["description"], language)
        for rec in result.get("recommendations", []):
            rec["title"] = _translate_from_english(rec["title"], language)
            rec["description"] = _translate_from_english(rec["description"], language)

    result["relevant_bills"] = relevant_bills
    return result


class TranslateRequest(BaseModel):
    text: str
    from_lang: str = "en"
    to_lang: str = "en"


def _bedrock_translate(text: str, from_lang: str, to_lang: str) -> Optional[str]:
    """Use Bedrock to translate text."""
    try:
        import boto3
        import json
        from botocore.config import Config
        from config import AWS_REGION, NOVA_MODEL_ID

        lang_names = {"en": "English", "es": "Spanish", "fr": "French", "de": "German", "it": "Italian"}
        client = boto3.client(
            "bedrock-runtime",
            region_name=AWS_REGION,
            config=Config(retries={"max_attempts": 2, "mode": "standard"}, read_timeout=30, connect_timeout=10),
        )
        prompt = f"Translate the following text from {lang_names.get(from_lang, from_lang)} to {lang_names.get(to_lang, to_lang)}. Return ONLY the translation, nothing else.\n\n{text}"
        response = client.converse(
            modelId=NOVA_MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 1500, "temperature": 0.1},
        )
        blocks = response["output"]["message"]["content"]
        return "\n".join(b["text"] for b in blocks if "text" in b).strip()
    except Exception:
        return None


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """Translate text between supported languages."""
    text = request.text
    if request.from_lang == request.to_lang or not text.strip():
        return {"text": text}

    # Try translation layer first
    translated = text
    if request.from_lang != "en":
        translated = _translate_to_english(translated, request.from_lang)
    if request.to_lang != "en":
        translated = _translate_from_english(translated, request.to_lang)

    # If translation layer didn't change anything, try Bedrock
    if translated == text:
        bedrock_result = _bedrock_translate(text, request.from_lang, request.to_lang)
        if bedrock_result:
            translated = bedrock_result

    # Last resort: use deep-translator (Google Translate, free)
    if translated == text:
        try:
            from deep_translator import GoogleTranslator
            translated = GoogleTranslator(source=request.from_lang, target=request.to_lang).translate(text)
        except Exception:
            pass

    return {"text": translated}


@router.post("/", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """Analyze text for compliance risks."""
    result = _do_analysis(request.text, request.language or "en")
    return AnalyzeResponse(
        riskLevel=result.get("risk_level", "medium"),
        issues=result.get("issues", []),
        recommendations=result.get("recommendations", []),
        explanation=result.get("explanation", ""),
        relevantBills=result.get("relevant_bills", []),
    )


@router.post("/file", response_model=AnalyzeResponse)
async def analyze_file(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """Analyze an uploaded file for compliance risks."""
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    result = _do_analysis(text, language)
    return AnalyzeResponse(
        riskLevel=result.get("risk_level", "medium"),
        issues=result.get("issues", []),
        recommendations=result.get("recommendations", []),
        explanation=result.get("explanation", ""),
        relevantBills=result.get("relevant_bills", []),
    )
