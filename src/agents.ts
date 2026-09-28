import { Agent } from "@anvia/core";
import { getModel } from "./models";
import { BASE_INSTRUCTION } from "./prompts";

export function createAgent(modelId?: string) {
  return new Agent({
    id: "assistant",
    model: getModel(modelId),
    instructions: BASE_INSTRUCTION,
  });
}
