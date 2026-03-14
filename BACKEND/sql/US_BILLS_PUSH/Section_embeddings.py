import re
import numpy as np
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from gensim.models import Word2Vec
import json
#C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\sql\SQL_INTERFACE\connect_db.py
from BACKEND.sql.SQL_INTERFACE.connect_db import connect
from BACKEND.sql.SQL_INTERFACE.embeddings import get_sentence_embedding


# python -m BACKEND.sql.US_BILLS_PUSH.Section_embeddings




# connect to server and compacts all the sentences into one string for Word2Vec training
def all_sen() -> str:
    con = connect()
    if not con:
        print("Connection failed")
        return ""

    cursor = con.cursor()
    cursor.execute("SELECT text_id, text FROM section_text")
    result = cursor.fetchall()
    cursor.close()
    con.close()
    print("Fetched all the data")

    all_sentences = ""
    for text_id,content in result:
        content=content.lower()
        all_sentences += " " + content
    return all_sentences

def embeddings(text:str):
    sentence_embeddings, cleaned_sentences, model = get_sentence_embedding(text)
    return sentence_embeddings, cleaned_sentences, model


def push_embeddings():
    con = connect()
    if not con:
        print("Connection failed")
        return

    cursor = con.cursor()
    text = all_sen()
    if not text.strip():
        print("No text found")
        cursor.close()
        con.close()
        return

    sentence_embeddings, cleaned_sentences, model = embeddings(text)
    
   
    mean_embedding = np.mean(sentence_embeddings, axis=0)

    cursor.execute(
        "INSERT INTO section_embeddings(label, embedding) VALUES(%s, %s) "
        "ON DUPLICATE KEY UPDATE embedding = VALUES(embedding)",
        ("US_BILLS", json.dumps(mean_embedding.tolist()))
    )
    con.commit()
    cursor.close()
    con.close()
    print("Embeddings stored successfully")


if __name__ == "__main__":
    push_embeddings()