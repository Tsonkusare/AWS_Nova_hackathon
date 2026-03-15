import os
from dotenv import load_dotenv

load_dotenv()

# Database — uses SQLite by default, PostgreSQL if DB_PASSWORD is set
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ai_regulation_copilot")

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL_ID = os.getenv("NOVA_MODEL_ID", "us.amazon.nova-2-lite-v1:0")
UPLOAD_BUCKET = os.getenv("UPLOAD_BUCKET", "")

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if DB_PASSWORD:
    DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
else:
    DATABASE_URL = f"sqlite:///{os.path.join(_BASE_DIR, 'data', 'copilot.db')}"
