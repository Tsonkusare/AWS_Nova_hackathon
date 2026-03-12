import json
import re
from datetime import datetime, timezone


def parse_body(event):
    body = event.get("body")
    if not body:
        return {}

    if event.get("isBase64Encoded"):
        import base64
        body = base64.b64decode(body).decode("utf-8")

    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return {}


def get_method_and_path(event):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method")
        or event.get("httpMethod")
        or ""
    )
    path = event.get("rawPath") or event.get("path") or ""
    return method.upper(), path


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def extract_project_id(path: str):
    match = re.match(r"^/projects/([^/]+)", path)
    return match.group(1) if match else None


def sanitize_filename(filename: str):
    filename = filename.strip().replace(" ", "_")
    return re.sub(r"[^A-Za-z0-9._-]", "", filename)