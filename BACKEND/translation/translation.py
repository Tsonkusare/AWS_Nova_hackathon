import torch
from transformers import MarianMTModel, MarianTokenizer

class Translator:
    def __init__(self, source_lang: str, target_lang: str):
        model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name).to(self.device)

    def translate(self, texts: list) -> list:
        tokens = self.tokenizer(
            texts, return_tensors="pt", padding=True, truncation=True
        ).to(self.device)
        outputs = self.model.generate(
            **tokens,
            num_beams=5,
            early_stopping=True,
            max_length=512,
            no_repeat_ngram_size=3
        )
        return [self.tokenizer.decode(o, skip_special_tokens=True) for o in outputs]


# Usage — model loads once, reuse the object as many times as you want
en_es = Translator("en", "es")
print(en_es.translate(["Hello!", "The weather is nice today."]))

en_fr = Translator("en", "fr")
print(en_fr.translate(["Good morning!"]))
