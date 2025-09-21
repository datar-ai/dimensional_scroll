import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject, tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getDocumentById, saveSuggestions } from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { createLanguageModel } from "../providers";

type RequestSuggestionsProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions for a document",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe("The ID of the document to request edits"),
    }),
    execute: async ({ documentId }) => {
      console.log("requestSuggestions: Starting for document ID:", documentId);
      const startTime = Date.now();
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        console.log("requestSuggestions: Document not found or empty content for ID:", documentId);
        return {
          error: "Document not found",
        };
      }

      const suggestions: Omit<
        Suggestion,
        "userId" | "createdAt" | "documentCreatedAt"
      >[] = [];

      const openRouterClient = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": process.env.APP_BASE_URL || "http://localhost:3000",
          "X-Title": process.env.APP_TITLE || "Interactive Novel Web App",
        },
      });
      const streamObjectStartTime = Date.now();
      const { elementStream } = streamObject({
        model: createLanguageModel(openRouterClient),
        system:
          "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
        prompt: document.content,
        output: "array",
        schema: z.object({
          originalSentence: z.string().describe("The original sentence"),
          suggestedSentence: z.string().describe("The suggested sentence"),
          description: z.string().describe("The description of the suggestion"),
        }),
      });
      console.log("requestSuggestions: streamObject initialization duration:", Date.now() - streamObjectStartTime, "ms");

      let loopStartTime = Date.now();
      for await (const element of elementStream) {
        // @ts-expect-error todo: fix type
        const suggestion: Suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId,
          isResolved: false,
        };

        dataStream.write({
          type: "data-suggestion",
          data: suggestion,
          transient: true,
        });

        suggestions.push(suggestion);
      }
      console.log("requestSuggestions: Stream loop finished in", Date.now() - loopStartTime, "ms");

      if (session.user?.id) {
        const userId = session.user.id;
        const saveSuggestionsStartTime = Date.now();
        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
        console.log("requestSuggestions: saveSuggestions duration:", Date.now() - saveSuggestionsStartTime, "ms");
      }
      console.log("requestSuggestions: Total execute duration:", Date.now() - startTime, "ms");

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
