import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";

const modelIdMapping: Record<string, string> = {
  "chat-model": "x-ai/grok-4-vision",
  "chat-model-reasoning": "x-ai/grok-4",
  "grok-fast": "x-ai/grok-4-fast:free",
};

export const createLanguageModel = (
  openRouterClient: ReturnType<typeof createOpenRouter>,
  modelId?: string
) => {
  const mappedModelId = modelId ? modelIdMapping[modelId] : undefined;
  return openRouterClient.chat(mappedModelId || DEFAULT_MODEL);
};

if (isTestEnvironment) {
  const {
    artifactModel,
    chatModel,
    reasoningModel,
    titleModel,
  } = require("./models.mock");
  customProvider({
    languageModels: {
      "chat-model": chatModel,
      "chat-model-reasoning": reasoningModel,
      "title-model": titleModel,
      "artifact-model": artifactModel,
    },
  });
}
