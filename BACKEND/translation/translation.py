import torch
from transformers import MarianMTModel, MarianTokenizer

# ─────────────────────────────────────────────
# Supported languages

SUPPORTED_LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "de": "German",
    "en": "English",
}

# ─────────────────────────────────────────────
# Translator — cached, reusable

class Translator:
    _cache: dict = {}

    def __init__(self, source_lang: str, target_lang: str):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.source_lang = source_lang
        self.target_lang = target_lang
        model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"

        if model_name not in Translator._cache:
            print(f"[Translator] Loading model: {model_name}")
            Translator._cache[model_name] = {
                "tokenizer": MarianTokenizer.from_pretrained(model_name),
                "model": MarianMTModel.from_pretrained(model_name).to(self.device),
            }

        self.tokenizer = Translator._cache[model_name]["tokenizer"]
        self.model = Translator._cache[model_name]["model"]

    def translate(self, texts: list) -> list:
        tokens = self.tokenizer(
            texts, return_tensors="pt", padding=True, truncation=True
        ).to(self.device)
        outputs = self.model.generate(
            **tokens,
            num_beams=5,
            early_stopping=True,
            max_length=512,
            no_repeat_ngram_size=3,
        )
        return [self.tokenizer.decode(o, skip_special_tokens=True) for o in outputs]


# ─────────────────────────────────────────────
# Translation layer for your legal chatbot
# ─────────────────────────────────────────────
class LegalTranslationLayer:
    """
    Drop-in translation wrapper for your existing legal chatbot.

    Usage:
        layer = LegalTranslationLayer()
        layer.set_language("es")  # user picks Spanish

        english_question = layer.to_english(user_message)
        legal_answer = your_existing_legal_bot.answer(english_question)
        response = layer.from_english(legal_answer)
    """
    #C:\Users\chait\OneDrive\Desktop\VS-CODE\Hackathon\BACKEND\translation\translation.py
# python -m BACKEND.translation.translation 
    def __init__(self):
        self.user_lang = "en"          # default — no translation needed
        self._translators: dict = {}   # lazy-loaded per language pair

    def set_language(self, lang_code: str):
        """Set the user's preferred language (e.g. 'es', 'fr', 'it', 'de')."""
        if lang_code not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{lang_code}'. "
                f"Choose from: {list(SUPPORTED_LANGUAGES.keys())}"
            )
        self.user_lang = lang_code
        print(f"[LegalTranslationLayer] Language set to: {SUPPORTED_LANGUAGES[lang_code]}")

    def _get_translator(self, source: str, target: str) -> Translator:
        key = f"{source}-{target}"
        if key not in self._translators:
            self._translators[key] = Translator(source, target)
        return self._translators[key]

    def to_english(self, text: str) -> str:
        """Translate user input to English before passing to your legal bot."""
        if self.user_lang == "en":
            return text
        translator = self._get_translator(self.user_lang, "en")
        return translator.translate([text])[0]

    def from_english(self, text: str) -> str:
        """Translate your legal bot's English response back to the user's language."""
        if self.user_lang == "en":
            return text
        translator = self._get_translator("en", self.user_lang)
        return translator.translate([text])[0]

    @staticmethod
    def available_languages() -> dict:
        """Returns the supported language options (useful for building a UI dropdown)."""
        return {k: v for k, v in SUPPORTED_LANGUAGES.items() if k != "en"}


# ─────────────────────────────────────────────
# Example: plug into your existing legal bot
# ─────────────────────────────────────────────
def your_existing_legal_bot(english_question: str) -> str:
    """
    Replace this stub with your actual legal reasoning system.
    It receives English text and should return an English answer.
    """
    return f"[Legal bot answer to: '{english_question}'] — replace this with your system."


if __name__ == "__main__":
    layer = LegalTranslationLayer()

    print("Available languages:", layer.available_languages())
    print()

    # Simulate a Spanish-speaking user
    layer.set_language("es")

    user_message = "¿Cuáles son mis derechos si soy despedido injustamente?"
    print(f"User ({SUPPORTED_LANGUAGES[layer.user_lang]}): {user_message}")

    english_q = layer.to_english(user_message)
    print(f"Translated to English: {english_q}")

    legal_response = your_existing_legal_bot(english_q)
    print(f"Legal bot (English): {legal_response}")

    final_response = layer.from_english(legal_response)
    print(f"Response to user (Spanish): {final_response}")

    print()

    # Simulate a French-speaking user
    layer.set_language("fr")
    user_message_fr = "Quels sont mes droits en cas de licenciement abusif?"
    english_q_fr = layer.to_english(user_message_fr)
    legal_response_fr = your_existing_legal_bot(english_q_fr)
    final_fr = layer.from_english(legal_response_fr)
    print(f"User (French): {user_message_fr}")
    print(f"Response to user (French): {final_fr}")
