import { Agent } from "@anvia/core";
import { lens } from "./observer.js";
import { getModel } from "./models.js";
import { BASE_INSTRUCTION } from "./prompts.js";
import { sandboxTools } from "./sandbox.js";

export function createAgent(modelId?: string) {
    return new Agent({
        id: "assistant",
        model: getModel(modelId),
        instructions: BASE_INSTRUCTION,
        tools: sandboxTools,
        observability: {
            observers: {
                tracing: lens.observer({ captureMode: "full" }),
            },
        },
    });
}
