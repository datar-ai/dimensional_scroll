import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject } from "ai";
import { z } from "zod";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createLanguageModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream }) => {
    const openRouterClient = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
      },
    });
    console.log("onCreateDocument (sheet): Starting streamObject for title:", title);
    const startTime = Date.now();
    let draftContent = "";

    const { fullStream } = streamObject({
      model: createLanguageModel(openRouterClient),
      system: sheetPrompt,
      prompt: title,
      schema: z.object({
        csv: z.string().describe("CSV data"),
      }),
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }
    console.log("onCreateDocument (sheet): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onCreateDocument (sheet): Total streamObject duration:", Date.now() - startTime, "ms");

    dataStream.write({
      type: "data-sheetDelta",
      data: draftContent,
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    console.log("onUpdateDocument (sheet): Starting streamObject for document ID:", document.id);
    const startTime = Date.now();
    let draftContent = "";

    const openRouterClient = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
      },
    });
    const { fullStream } = streamObject({
      model: createLanguageModel(openRouterClient),
      system: updateDocumentPrompt(document.content, "sheet"),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }
    console.log("onUpdateDocument (sheet): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onUpdateDocument (sheet): Total streamObject duration:", Date.now() - startTime, "ms");

    return draftContent;
  },
});
