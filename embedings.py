from pathlib import Path
import re
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from gensim.models import Word2Vec
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def get_sentence_embedding(path):
    # ---------- 1. Load and lowercase ----------
    filename = Path(path)
    with open(filename, 'r', encoding='utf-8') as file:
        content = file.read()

    content = content.lower()

    # ---------- 2. Sentence tokenize, then clean ----------
    sentence_strings = sent_tokenize(content)          # original sentences (with punctuation)
    cleaned_sentences = [re.sub(r'[^\w\s]', "", s)     # remove punctuation per sentence
                        for s in sentence_strings]

    # instantiate stemmer once
    stemmer = PorterStemmer()

    # sentence-level tokens for Word2Vec + summarization
    sent_tokens = [word_tokenize(s) for s in cleaned_sentences]
    stem_sent_tokens = [
        [stemmer.stem(word) for word in sent]
        for sent in sent_tokens
    ]


    # maybe shit: full-text word-level tokens if you still need them
    tokens = word_tokenize(content)
    stem_word = [stemmer.stem(word) for word in tokens]


    # ---------- 3. Train Word2Vec ----------
    model = Word2Vec(
        stem_sent_tokens,
        vector_size=100,
        window=5,
        min_count=1,
        workers=2,
        sg=1
    )
    # ---------- 4. Create sentence embeddings ----------
    # For each stemmed sentence, average the Word2Vec vectors for words present in the model.
    sentence_embeddings = []
    for sent in stem_sent_tokens:
        vecs = [model.wv[word] for word in sent if word in model.wv]
        if vecs:
            sentence_embeddings.append(np.mean(vecs, axis=0))
        else:
            sentence_embeddings.append(np.zeros(model.vector_size))

    sentence_embeddings = np.vstack(sentence_embeddings)

    # Return a tuple: (sentence embeddings array, original cleaned sentences, trained model)
    return sentence_embeddings, cleaned_sentences, model   #





