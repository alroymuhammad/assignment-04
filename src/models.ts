import { OpenAIClient } from "@anvia/openai";
import "dotenv/config";

const apiKey = process.env.OPENAI_API_KEY!;

if (!apiKey) {
  throw new Error("Set OPENAI_API_KEY in .env before running the agent!");
}

const client = new OpenAIClient({
  apiKey: apiKey,
  baseUrl: process.env.OPENAI_BASE_URL,
});

export function getModel(modelId?: string) {
  return client.completionModel({ modelId: modelId || "gpt-6-luna" });
}
