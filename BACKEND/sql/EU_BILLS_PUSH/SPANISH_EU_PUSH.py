import pdfplumber
from gensim.models import Word2Vec
import json
from nltk.stem import SnowballStemmer
from nltk.tokenize import sent_tokenize, word_tokenize
import numpy as np
from BACKEND.sql.SQL_INTERFACE.connect_db import connect

# python -m BACKEND.sql.EU_BILLS_PUSH.SPANISH_EU_PUSH
def read_pdf(text:str,text2:str)->str:
    try:
        with pdfplumber.open(text) as pdf:
            for page in pdf.pages:
                t= page.extract_text()
                text+=t
        with pdfplumber.open(text2) as pdf:
            for page in pdf.pages:
                t= page.extract_text()
                text+=t
            
    except Exception as e:
        print("error ")
    return text
def embeddings(text: str):
    stemmer = SnowballStemmer("spanish")
    
    sent_tokens = sent_tokenize(text, language='spanish')
    
    stemmed_sent_tokens = []
    for sentence in sent_tokens:
        words = word_tokenize(sentence, language='spanish')
        stemmed_words = [stemmer.stem(word) for word in words]
        stemmed_sent_tokens.append(stemmed_words)

    model = Word2Vec(
        stemmed_sent_tokens,
        vector_size=200,
        window=5,
        min_count=1,
        workers=2,
        sg=1
    )

    sentence_embeddings = []
    for sent in stemmed_sent_tokens:  # ✅ fixed name
        vecs = [model.wv[word] for word in sent if word in model.wv]
        if vecs:
            sentence_embeddings.append(np.mean(vecs, axis=0))
        else:
            sentence_embeddings.append(np.zeros(model.vector_size))

    sentence_embeddings = np.vstack(sentence_embeddings)

    return sentence_embeddings, sent_tokens, model  # ✅ fixed cleaned_sentences

def push_embeddings(sentence_embeddings):
    try:
        con= connect()
        cursor=con.cursor()
        mean_embedding = np.mean(sentence_embeddings, axis=0)
        cursor.execute(
            "INSERT INTO section_embeddings(label, embedding) VALUES(%s, %s) "
            "ON DUPLICATE KEY UPDATE embedding = VALUES(embedding)",
            ("_SPANISH_EU_BILLS", json.dumps(mean_embedding.tolist()))
        )
        con.commit()
    except Exception as e:
        print("error ")

def main():
    path = r"C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\data\bills\bills_eu\GDPR_SPANISH_TXT.pdf"
    path2= r"C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\data\bills\bills_eu\SPANISH202401689_ES_TXT.pdf"
    text = read_pdf(path,path2)
    sentence_embeddings, cleaned_sentences, model = embeddings(text)
    push_embeddings(sentence_embeddings)

if __name__ == "__main__":
    main()