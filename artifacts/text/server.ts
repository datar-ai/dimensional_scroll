import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { smoothStream, streamText } from "ai";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { createLanguageModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const textDocumentHandler = createDocumentHandler<"text">({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    const openRouterClient = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
      },
    });
    console.log("onCreateDocument (text): Starting streamText for title:", title);
    const startTime = Date.now();
    let draftContent = "";

    const { fullStream } = streamText({
      model: createLanguageModel(openRouterClient),
      system:
        "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: title,
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }
    console.log("onCreateDocument (text): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onCreateDocument (text): Total streamText duration:", Date.now() - startTime, "ms");

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    console.log("onUpdateDocument (text): Starting streamText for document ID:", document.id);
    const startTime = Date.now();
    let draftContent = "";

    const openRouterClient = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
      },
    });
    const { fullStream } = streamText({
      model: createLanguageModel(openRouterClient),
      system: updateDocumentPrompt(document.content, "text"),
      experimental_transform: smoothStream({ chunking: "word" }),
      prompt: description,
      providerOptions: {
        openai: {
          prediction: {
            type: "content",
            content: document.content,
          },
        },
      },
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "text-delta") {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: "data-textDelta",
          data: text,
          transient: true,
        });
      }
    }
    console.log("onUpdateDocument (text): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onUpdateDocument (text): Total streamText duration:", Date.now() - startTime, "ms");

    return draftContent;
  },
});
