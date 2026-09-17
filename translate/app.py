# Copyright (c) 2026 - Present, Bry Onyoni
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
# SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
# OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import MarianMTModel, MarianTokenizer
import torch
from typing import Optional

app = FastAPI()
_cache = {}
MAX_BATCH_SIZE = 16  # cap per generate() call — keeps memory predictable

def get_model(name: str):
    if name not in _cache:
        tok = MarianTokenizer.from_pretrained(name)
        model = MarianMTModel.from_pretrained(name)
        model.eval()
        _cache[name] = (tok, model)
    return _cache[name]

def run_batch(model_name: str, texts: list[str]) -> list[str]:
    tok, model = get_model(model_name)

    # sort by length to minimize padding waste, remember original order
    order = sorted(range(len(texts)), key=lambda i: len(texts[i]))
    sorted_texts = [texts[i] for i in order]

    results = []
    for start in range(0, len(sorted_texts), MAX_BATCH_SIZE):
        chunk = sorted_texts[start:start + MAX_BATCH_SIZE]
        batch = tok(chunk, return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            generated = model.generate(**batch, max_length=512)
        results.extend(tok.batch_decode(generated, skip_special_tokens=True))

    output = [None] * len(texts)
    for orig_idx, translated in zip(order, results):
        output[orig_idx] = translated
    return output

# --- single text (unchanged behavior, now backed by run_batch) ---

class TranslateRequest(BaseModel):
    text: str
    direction: str
    target_lang: Optional[str] = None

@app.post("/translate")
def translate(req: TranslateRequest):
    if req.direction == "to_en":
        model_name = "Helsinki-NLP/opus-mt-mul-en"
        text = req.text
    elif req.direction == "from_en":
        if not req.target_lang:
            return {"error": "target_lang is required for from_en"}
        model_name = "Helsinki-NLP/opus-mt-en-mul"
        text = f">>{req.target_lang}<< {req.text}"
    else:
        return {"error": "direction must be 'to_en' or 'from_en'"}
    return {"translation": run_batch(model_name, [text])[0]}

# --- new: batch endpoint ---

class BatchItem(BaseModel):
    text: str
    target_lang: Optional[str] = None  # per-item, only used for from_en

class BatchTranslateRequest(BaseModel):
    items: list[BatchItem]
    direction: str

@app.post("/translate_batch")
def translate_batch(req: BatchTranslateRequest):
    if not req.items:
        return {"translations": []}

    if req.direction == "to_en":
        model_name = "Helsinki-NLP/opus-mt-mul-en"
        texts = [item.text for item in req.items]
    elif req.direction == "from_en":
        model_name = "Helsinki-NLP/opus-mt-en-mul"
        texts = []
        for item in req.items:
            if not item.target_lang:
                return {"error": "target_lang is required for every item when direction is from_en"}
            texts.append(f">>{item.target_lang}<< {item.text}")
    else:
        return {"error": "direction must be 'to_en' or 'from_en'"}

    return {"translations": run_batch(model_name, texts)}