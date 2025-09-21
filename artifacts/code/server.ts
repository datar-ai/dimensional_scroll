import { streamObject } from "ai";
import { z } from "zod";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream }) => {
    console.log("onCreateDocument (code): Starting streamObject for title:", title);
    const startTime = Date.now();
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: codePrompt,
      prompt: title,
      schema: z.object({
        code: z.string(),
      }),
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: "data-codeDelta",
            data: code ?? "",
            transient: true,
          });

          draftContent = code;
        }
      }
    }
    console.log("onCreateDocument (code): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onCreateDocument (code): Total streamObject duration:", Date.now() - startTime, "ms");

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    console.log("onUpdateDocument (code): Starting streamObject for document ID:", document.id);
    const startTime = Date.now();
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "code"),
      prompt: description,
      schema: z.object({
        code: z.string(),
      }),
    });

    let loopStartTime = Date.now();
    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: "data-codeDelta",
            data: code ?? "",
            transient: true,
          });

          draftContent = code;
        }
      }
    }
    console.log("onUpdateDocument (code): Stream loop finished in", Date.now() - loopStartTime, "ms");
    console.log("onUpdateDocument (code): Total streamObject duration:", Date.now() - startTime, "ms");

    return draftContent;
  },
});
