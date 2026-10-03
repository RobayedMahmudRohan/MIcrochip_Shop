import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Chat from "./chat";

const mockUseChat = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: () => mockUseChat(),
}));

vi.mock("../ui/async-button", () => ({
  AsyncButton: ({
    children,
    onAction,
    disabled,
  }: {
    children: React.ReactNode;
    onAction: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onAction} disabled={disabled}>
      {children}
    </button>
  ),
}));

function createChatState(
  overrides: Partial<{
    messages: unknown[];
    status: string;
    error: Error | undefined;
  }> = {},
) {
  return {
    messages: [],
    sendMessage: vi.fn(),
    status: "ready",
    stop: vi.fn(),
    error: undefined,
    ...overrides,
  };
}

beforeEach(() => {
  mockUseChat.mockReset();
});

describe("Chat", () => {
  it("shows the thinking indicator while a message is pending", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        status: "submitted",
      }),
    );

    render(<Chat />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("shows the stop button while a response is streaming", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        status: "streaming",
        messages: [
          {
            id: "assistant-1",
            role: "assistant",
            parts: [],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask a question..."),
    ).toBeDisabled();
  });

  it("shows the error state and retry button after a failed response", async () => {
    const sendMessage = vi.fn();

    mockUseChat.mockReturnValue(
      createChatState({
        status: "error",
        error: new Error("API request failed"),
        messages: [
          {
            id: "user-1",
            role: "user",
            parts: [{ type: "text", text: "Find Arduino components" }],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We could not finish that response. Please try again."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
  });
    it("renders assistant text messages", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "assistant-1",
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "Here are some Arduino components.",
              },
            ],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(
      screen.getByText("Here are some Arduino components."),
    ).toBeInTheDocument();
  });

  it("renders a product search tool result", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "tool-1",
            role: "assistant",
            parts: [
              {
                type: "tool-searchProducts",
                state: "output-available",
                input: {
                  query: "Arduino",
                },
                output: {
                  query: "Arduino",
                  count: 1,
                  products: [
                    {
                      name: "Arduino Uno R3",
                      category: "Arduino",
                      serialNumber: "ARD-UNO-R3",
                      description: "ATmega328P development board",
                      price: 1200,
                      availability: "Available",
                    },
                  ],
                },
              },
            ],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(screen.getByText("Product search completed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Arduino Uno R3" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
    it("renders a category summary tool result", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "category-1",
            role: "assistant",
            parts: [
              {
                type: "tool-getCategorySummary",
                state: "output-available",
                input: {},
                output: {
                  categories: [
                    {
                      category: "Arduino",
                      productCount: 12,
                    },
                    {
                      category: "Sensors",
                      productCount: 8,
                    },
                  ],
                },
              },
            ],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(
      screen.getByText("Category summary completed"),
    ).toBeInTheDocument();

    expect(screen.getByText("Products by category")).toBeInTheDocument();
    expect(screen.getByText("Arduino")).toBeInTheDocument();
    expect(screen.getByText("Sensors")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders a product comparison tool result", () => {
    mockUseChat.mockReturnValue(
      createChatState({
        messages: [
          {
            id: "comparison-1",
            role: "assistant",
            parts: [
              {
                type: "tool-compareProducts",
                state: "output-available",
                input: {
                  products: ["Arduino Uno R3", "Arduino Nano"],
                },
                output: {
                  count: 2,
                  products: [
                    {
                      name: "Arduino Uno R3",
                      category: "Arduino",
                      serialNumber: "ARD-UNO-R3",
                      description: "ATmega328P development board",
                      price: 1200,
                      availability: "Available",
                    },
                    {
                      name: "Arduino Nano",
                      category: "Arduino",
                      serialNumber: "ARD-NANO",
                      description: "Compact Arduino board",
                      price: 950,
                      availability: "Not available",
                    },
                  ],
                },
              },
            ],
          },
        ],
      }),
    );

    render(<Chat />);

    expect(
      screen.getByText("Product comparison completed"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /Arduino Uno R3/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /Arduino Nano/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });
});