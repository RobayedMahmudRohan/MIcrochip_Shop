"use client";

import type { ToolUIPart } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { ProductResults } from "./product-results";
import { CategoryChart } from "./category-chart";
import { ProductComparison } from "./product-comparison";

type ChatToolPart = ToolUIPart<{
  searchProducts: {
    input: {
      query: string;
    };
    output: {
      query: string;
      products: {
        name: string;
        category: string;
        serialNumber: string;
        description: string;
        price: number;
        availability: "Available" | "Not available";
      }[];
      count: number;
    };
  };

  getCategorySummary: {
    input: Record<string, never>;
    output: {
      categories: {
        category: string;
        productCount: number;
      }[];
    };
  };

  compareProducts: {
    input: {
      products: string[];
    };
    output: {
      products: {
        name: string;
        category: string;
        serialNumber: string;
        description: string | null;
        price: number;
        availability: "Available" | "Not available";
      }[];
      count: number;
    };
  };
}>;

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export default function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat();

  const isStreaming = status === "streaming";
  const isSubmitting = status === "submitted";

  const lastMessage = messages[messages.length - 1];

  const hasVisibleAssistantText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) => part.type === "text" && part.text.length > 0,
    );

  const showThinkingIndicator =
    isSubmitting || (isStreaming && !hasVisibleAssistantText);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  function isNearBottom(element: HTMLDivElement) {
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    return distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX;
  }

  function handleMessagesScroll(event: React.UIEvent<HTMLDivElement>) {
    shouldAutoScrollRef.current = isNearBottom(event.currentTarget);
  }

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container || !shouldAutoScrollRef.current) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text || isSubmitting || isStreaming) {
      return;
    }

    setInput("");

    await sendMessage({
      text,
    });
  }

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-slate-300 bg-slate-100 shadow-sm">
      <div className="border-b border-slate-300 bg-slate-200 p-4">
        <h1 className="text-xl font-semibold text-slate-900">
          Microchip Shop AI Assistant
        </h1>

        <p className="mt-1 text-sm text-slate-700">
          Ask about electronic components, Arduino, or project ideas.
        </p>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="rounded-lg bg-white p-4 text-sm text-slate-700">
            Ask me something about electronics or the products in the shop.
          </div>
        )}

        {messages.map((message) => {
          const textParts = message.parts.filter(
            (part): part is Extract<typeof part, { type: "text" }> =>
              part.type === "text" && part.text.length > 0,
          );

          const toolParts = message.parts.filter(
            (part): part is ChatToolPart =>
              part.type === "tool-searchProducts" ||
              part.type === "tool-getCategorySummary" ||
              part.type === "tool-compareProducts",
          );

          if (textParts.length === 0 && toolParts.length === 0) {
            return null;
          }

          return (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-[85%] space-y-3">
                {textParts.length > 0 && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-slate-800 text-white"
                        : "border border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    {textParts.map((part, index) => (
                      <p
                        key={`${message.id}-${index}`}
                        className="whitespace-pre-wrap break-words"
                      >
                        {part.text}
                      </p>
                    ))}
                  </div>
                )}

                {toolParts.map((part, index) => {
                  if (part.type === "tool-compareProducts") {
                    if (
                      part.state === "input-streaming" ||
                      part.state === "input-available"
                    ) {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
                        >
                          <p className="font-semibold">
                            Comparing products
                          </p>

                          <p className="mt-1">
                            Comparing the selected products side by side...
                          </p>
                        </div>
                      );
                    }

                    if (part.state === "output-error") {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
                        >
                          <p className="font-semibold">
                            Comparison failed
                          </p>

                          <p className="mt-1">
                            The product comparison could not be completed.
                            Please try again.
                          </p>
                        </div>
                      );
                    }

                    if (part.state === "output-available") {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                        >
                          <p className="mb-3 text-sm font-semibold text-emerald-900">
                            Product comparison completed
                          </p>

                          <ProductComparison
                            products={part.output.products}
                          />
                        </div>
                      );
                    }

                    return null;
                  }

                  if (part.type === "tool-getCategorySummary") {
                    if (
                      part.state === "input-streaming" ||
                      part.state === "input-available"
                    ) {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
                        >
                          <p className="font-semibold">
                            Checking product categories
                          </p>

                          <p className="mt-1">
                            Checking the catalog to summarize products by
                            category...
                          </p>
                        </div>
                      );
                    }

                    if (part.state === "output-available") {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                        >
                          <p className="mb-3 text-sm font-semibold text-emerald-900">
                            Category summary completed
                          </p>

                          <CategoryChart
                            categories={part.output.categories}
                          />
                        </div>
                      );
                    }

                    if (part.state === "output-error") {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
                        >
                          <p className="font-semibold">
                            Category summary failed
                          </p>

                          <p className="mt-1">
                            The category information could not be retrieved.
                            Please try again.
                          </p>
                        </div>
                      );
                    }

                    return null;
                  }

                  if (part.state === "input-streaming") {
                    return (
                      <div
                        key={`${message.id}-tool-${index}`}
                        className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
                      >
                        <p className="font-semibold">
                          Searching products
                        </p>

                        <p className="mt-1">
                          Preparing the product search...
                        </p>
                      </div>
                    );
                  }

                  if (part.state === "input-available") {
                    return (
                      <div
                        key={`${message.id}-tool-${index}`}
                        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                      >
                        <p className="font-semibold">
                          Searching the catalog
                        </p>

                        <p className="mt-1">
                          Searching for:{" "}
                          <span className="font-medium">
                            {part.input.query}
                          </span>
                        </p>
                      </div>
                    );
                  }

                  if (part.state === "output-available") {
                    if (part.type === "tool-searchProducts") {
                      return (
                        <div
                          key={`${message.id}-tool-${index}`}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                        >
                          <p className="mb-3 text-sm font-semibold text-emerald-900">
                            Product search completed
                          </p>

                          <ProductResults
                            query={part.output.query}
                            products={part.output.products}
                            count={part.output.count}
                          />
                        </div>
                      );
                    }

                    return null;
                  }

                  if (part.state === "output-error") {
                    return (
                      <div
                        key={`${message.id}-tool-${index}`}
                        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
                      >
                        <p className="font-semibold">
                          Product search failed
                        </p>

                        <p className="mt-1">
                          The product catalog could not be searched. Please
                          try again.
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}

        {showThinkingIndicator && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-300 bg-slate-200 p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question..."
            disabled={isSubmitting || isStreaming}
            className="min-w-0 flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-700"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
