import mysql.connector
from mysql.connector import Error
from .embeddings import get_sentence_embedding
import json

# python -m BACKEND.sql.SQL_INTERFACE.connect_db

def connect():
    try:
        connection = mysql.connector.connect(
            host='35.238.27.224',
            database='Storage',
            user='root',
            password='Password123$'
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
        cursor.execute("SELECT text_id, text FROM section_text")
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        return result
    return None


def push_data(cursor, text_id, embedding):
    cursor.execute(
        "INSERT INTO section_embeddings (section_id, embedding) VALUES (%s, %s)",
        (text_id, json.dumps(list(embedding)))
    )


def translate(tuple_data: tuple):

    connection = connect()
    cursor = connection.cursor()

    for text_id, text in tuple_data:
        sentence_embeddings, cleaned_sentences, model = get_sentence_embedding(text)
        push_data(cursor, text_id, sentence_embeddings)

    connection.commit()
    cursor.close()
    connection.close()


if __name__ == "__main__":

    data = get_data()
    if data:
        translate(data)