// src/utils/models.js
// All available free models on OpenRouter

export const MODELS = [
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    label: 'NVIDIA Nemotron 550B',
    shortLabel: 'Nemotron 550B',
    bestFor: 'Complex reasoning & long context (1M tokens)',
    badge: '1M ctx',
    color: 'emerald',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    label: 'Llama 3.3 70B',
    shortLabel: 'Llama 3.3 70B',
    bestFor: 'General tasks & daily assistant',
    badge: 'General',
    color: 'blue',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    label: 'Qwen 2.5 Coder 32B',
    shortLabel: 'Qwen Coder 32B',
    bestFor: 'Coding, debugging & code review',
    badge: 'Coding',
    color: 'violet',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    label: 'DeepSeek R1',
    shortLabel: 'DeepSeek R1',
    bestFor: 'Logic, math & step-by-step reasoning',
    badge: 'Reasoning',
    color: 'orange',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    label: 'Gemini 2.0 Flash',
    shortLabel: 'Gemini Flash',
    bestFor: 'Fast responses & quick questions',
    badge: 'Fast',
    color: 'sky',
  },
];

export const DEFAULT_MODEL = MODELS[1]; // Llama 3.3 70B

export function getModelById(id) {
  return MODELS.find((m) => m.id === id) || DEFAULT_MODEL;
}
