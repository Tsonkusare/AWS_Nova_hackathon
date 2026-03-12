import mysql.connector
from mysql.connector import Error
from BACKEND.embeddings import get_sentence_embedding
import json
# run it like python -m BACKEND.sql.connect_dbgit 

def connect():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='testdb',
            user='testuser',
            password='test123'
        )
        if connection.is_connected():
            print("Connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None


def get_data() -> tuple:
    connection = connect()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT section_id, text FROM section_text")
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        return result
    return None


def push_data(cursor, section_id, embedding):
    cursor.execute(
        "INSERT INTO section_embeddings (section_id, embedding) VALUES (%s, %s)",
        (section_id, json.dumps(list(embedding)))
    )


def translate(tuple_data: tuple):

    connection = connect()
    cursor = connection.cursor()

    for section_id, text in tuple_data:
        sentence_embeddings, cleaned_sentences, model = get_sentence_embedding(text)
        push_data(cursor, section_id, sentence_embeddings)

    connection.commit()
    cursor.close()
    connection.close()


if __name__ == "__main__":
    data = get_data()
    if data:
        translate(data)