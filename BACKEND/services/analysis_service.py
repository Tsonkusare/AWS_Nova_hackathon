import json
import re
import boto3
from botocore.config import Config

from models.analysis import Analysis
from config import AWS_REGION, NOVA_MODEL_ID

bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION,
    config=Config(
        retries={"max_attempts": 3, "mode": "standard"},
        read_timeout=120,
        connect_timeout=30,
    ),
)


def build_analysis_prompt(project) -> str:
    return f"""
You are an AI governance assistant for startups.

Analyze the following AI product and return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in triple backticks.
Keep the rationale under 120 words.

Project:
- Name: {project.name}
- Industry: {project.industry or ""}
- Region: {project.region or ""}
- Use Case: {project.use_case or ""}
- Description: {project.description or ""}

Tasks:
1. Identify likely applicable frameworks from:
   - EU AI Act
   - NIST AI RMF
   - U.S. state-level AI hiring / consumer protection concerns
2. Classify likely risk level as one of:
   - low
   - limited
   - high
3. List top 5 compliance concerns
4. List top 5 recommended next actions
5. Give a short rationale

Return JSON with exactly this shape:
{{
  "frameworks": ["..."],
  "risk_level": "low|limited|high",
  "concerns": ["...", "..."],
  "next_actions": ["...", "..."],
  "rationale": "..."
}}
""".strip()


def _extract_text(response: dict) -> str:
    try:
        blocks = response["output"]["message"]["content"]
        text_parts = [block["text"] for block in blocks if "text" in block]
        return "\n".join(text_parts).strip()
    except Exception:
        return json.dumps(response)


def _clean_model_output(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _try_extract_json_object(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    return text


def analyze_project_with_nova(project) -> dict:
    prompt = build_analysis_prompt(project)

    response = bedrock_runtime.converse(
        modelId=NOVA_MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
        inferenceConfig={
            "maxTokens": 1200,
            "temperature": 0.1,
            "topP": 0.9,
        },
    )

    text_output = _extract_text(response)
    cleaned = _clean_model_output(text_output)
    cleaned = _try_extract_json_object(cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        parsed = {
            "frameworks": [],
            "risk_level": "limited",
            "concerns": ["Model returned invalid JSON"],
            "next_actions": ["Inspect raw model response"],
            "rationale": cleaned[:1500],
        }

    parsed.setdefault("frameworks", [])
    parsed.setdefault("risk_level", "limited")
    parsed.setdefault("concerns", [])
    parsed.setdefault("next_actions", [])
    parsed.setdefault("rationale", "")

    return parsed


def save_analysis(db, project_id: int, analysis_data: dict) -> Analysis:
    analysis = Analysis(
        project_id=project_id,
        risk_level=analysis_data["risk_level"],
        frameworks_json=analysis_data["frameworks"],
        concerns_json=analysis_data["concerns"],
        actions_json=analysis_data["next_actions"],
        rationale=analysis_data["rationale"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis