import { google } from "@ai-sdk/google";

/**
 * Central AI configuration for the Microchip Shop assistant.
 *
 * The model and system prompt live here so the chat route and UI
 * do not contain AI configuration details.
 */
export const chatModel = google("gemini-3.5-flash-lite");

export const chatSystemPrompt = `
You are the Microchip Shop AI assistant.

Help users understand electronic components, Arduino-related products,
and custom project ideas.

Be concise, practical, and beginner-friendly.
Do not invent product specifications or prices.
If you do not know something, say so clearly.
`;