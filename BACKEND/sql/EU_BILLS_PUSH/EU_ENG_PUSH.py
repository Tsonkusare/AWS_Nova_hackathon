import pdfplumber
import traceback
from BACKEND.sql.SQL_INTERFACE.embeddings import get_sentence_embedding
from BACKEND.sql.SQL_INTERFACE.connect_db import connect 
import numpy as np
import json

#python -m BACKEND.sql.EU_BILLS_PUSH.file
def read_pdf(path: str, path2:str) -> str:
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t
        with pdfplumber.open(path2) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t
    except Exception as e:
        traceback.print_exc()  #  shows the REAL error
    return text

def embeddings(text: str):
    sentence_embeddings, cleaned_sentences, model = get_sentence_embedding(text)  # ✅ call directly
    return sentence_embeddings, cleaned_sentences, model
def push_embeddings(sentence_embeddings):

    try:
        con= connect()
        cursor=con.cursor()
        mean_embedding = np.mean(sentence_embeddings, axis=0)
        cursor.execute(
            "INSERT INTO section_embeddings(label, embedding) VALUES(%s, %s) "
            "ON DUPLICATE KEY UPDATE embedding = VALUES(embedding)",
            ("EU_BILLS", json.dumps(mean_embedding.tolist()))
        )
        con.commit()
    except Exception as e:
        traceback.print_exc()


def main():
    path = r"C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\data\bills\bills_eu\OJ_L_202401689_EN_TXT.pdf"
    path2= r"C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\data\bills\bills_eu\GDPR_ENG_txt.pdf"
    text = read_pdf(path,path2)
    sentence_embeddings, cleaned_sentences, model = embeddings(text)
    push_embeddings(sentence_embeddings)


if __name__ == "__main__":
    main()
    