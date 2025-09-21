import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";

export const createLanguageModel = (
  openRouterClient: ReturnType<typeof createOpenRouter>,
  modelId?: string
) => openRouterClient.chat(modelId || DEFAULT_MODEL);

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
