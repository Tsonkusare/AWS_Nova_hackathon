import json
from app import lambda_handler


def pretty_print(title, result):
    print(f"\n===== {title} =====")
    print("statusCode:", result["statusCode"])
    try:
        print(json.dumps(json.loads(result["body"]), indent=2))
    except Exception:
        print(result["body"])


def make_event(method, path, body=None):
    return {
        "version": "2.0",
        "routeKey": f"{method} {path}",
        "rawPath": path,
        "rawQueryString": "",
        "headers": {
            "content-type": "application/json"
        },
        "requestContext": {
            "http": {
                "method": method,
                "path": path
            }
        },
        "body": json.dumps(body) if body is not None else None,
        "isBase64Encoded": False
    }


def main():
    # 1. Create project
    create_event = make_event(
        "POST",
        "/projects",
        {
            "name": "HireScreen AI",
            "industry": "HR Tech",
            "region": "EU",
            "useCase": "AI tool that ranks job candidates",
            "description": "An AI assistant that scores resumes and recommends top candidates."
        }
    )
    create_result = lambda_handler(create_event, None)
    pretty_print("CREATE PROJECT", create_result)

    create_body = json.loads(create_result["body"])
    project_id = create_body["projectId"]

    # 2. Get project
    get_event = make_event("GET", f"/projects/{project_id}")
    get_result = lambda_handler(get_event, None)
    pretty_print("GET PROJECT", get_result)

    # 3. Generate upload URL
    upload_event = make_event(
        "POST",
        f"/projects/{project_id}/upload-url",
        {
            "filename": "policy.pdf",
            "contentType": "application/pdf"
        }
    )
    upload_result = lambda_handler(upload_event, None)
    pretty_print("GENERATE UPLOAD URL", upload_result)

    # 4. Analyze project
    analyze_event = make_event("POST", f"/projects/{project_id}/analyze")
    analyze_result = lambda_handler(analyze_event, None)
    pretty_print("ANALYZE PROJECT", analyze_result)


if __name__ == "__main__":
    main()