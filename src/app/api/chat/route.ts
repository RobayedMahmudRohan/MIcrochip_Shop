import {
  searchProducts,
  getCategorySummary,
} from "@/lib/ai/tools";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { chatModel, chatSystemPrompt } from "@/lib/ai/config";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = streamText({
      model: chatModel,
      system: chatSystemPrompt,
      messages: await convertToModelMessages(messages),
      
      tools: {
        searchProducts,
        getCategorySummary,
      },
      
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);

    return Response.json(
      { error: "AI request failed" },
      { status: 500 },
    );
  }
}