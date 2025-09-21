import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";

let openRouterClient: ReturnType<typeof createOpenRouter> | null = null;

const getOpenRouterClient = () => {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY environment variable is required to use OpenRouter."
      );
    }

    openRouterClient = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
      },
    });
  }

  return openRouterClient;
};

const createLanguageModel = (modelId?: string) =>
  getOpenRouterClient().chat(modelId || DEFAULT_MODEL);

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": createLanguageModel(),
        "chat-model-reasoning": wrapLanguageModel({
          model: createLanguageModel(),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": createLanguageModel(),
        "artifact-model": createLanguageModel(),
      },
    });
