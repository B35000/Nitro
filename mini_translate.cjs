const Pipe = require('@huggingface/transformers');

const BROWSER_MODELS = {
  ko: { toEn: "Xenova/opus-mt-ko-en", fromEn: "your-org/opus-mt-en-ko-onnx" }, // see conversion below
  sk: { toEn: "your-org/opus-mt-sk-en-onnx", fromEn: "your-org/opus-mt-en-sk-onnx" },
};

const MAX_BROWSER_BATCH = 8;
const pipelineCache = new Map();

async function getPipeline(modelId) {
  if (!pipelineCache.has(modelId)) {
    pipelineCache.set(modelId, Pipe.pipeline("translation", modelId, { dtype: "q8" }));
  }
  return pipelineCache.get(modelId);
}

function resolveModelId(langCode, direction) {
  const entry = BROWSER_MODELS[langCode];
  if (!entry) throw new Error(`No browser model configured for "${langCode}"`);
  const modelId = direction === "to_en" ? entry.toEn : entry.fromEn;
  if (!modelId) throw new Error(`No "${direction}" model configured for "${langCode}"`);
  return modelId;
}

export async function translateInBrowser(text, langCode, direction) {
  const [result] = await translateBatchInBrowser([{ text, langCode, direction }]);
  return result;
}

/**
 * Translate many strings at once, batched per underlying model.
 * items: [{ text, langCode, direction }, ...]
 * returns: string[] in the same order as items
 */
export async function translateBatchInBrowser(items) {
  if (!items.length) return [];

  // group by the actual model each item needs -- ko and sk are separate
  // bilingual models, not one shared multi-target model like the server side
  const groups = new Map(); // modelId -> { indices: [], texts: [] }
  items.forEach((item, i) => {
    const modelId = resolveModelId(item.langCode, item.direction);
    if (!groups.has(modelId)) groups.set(modelId, { indices: [], texts: [] });
    const g = groups.get(modelId);
    g.indices.push(i);
    g.texts.push(item.text);
  });

  const output = new Array(items.length);

  for (const [modelId, { indices, texts }] of groups) {
    const translator = await getPipeline(modelId);

    // sort shorter-first within this group to cut down on padding waste,
    // same idea as the server-side batching
    const order = indices.map((_, k) => k).sort((a, b) => texts[a].length - texts[b].length);

    for (let start = 0; start < order.length; start += MAX_BROWSER_BATCH) {
      const chunkOrder = order.slice(start, start + MAX_BROWSER_BATCH);
      const chunkTexts = chunkOrder.map((k) => texts[k]);
      const results = await translator(chunkTexts);
      chunkOrder.forEach((k, j) => {
        output[indices[k]] = results[j].translation_text;
      });
    }
  }

  return output;
}