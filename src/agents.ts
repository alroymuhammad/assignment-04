import { Agent } from "@anvia/core";
import { compResearchPolicy } from "./context.js";
import { lens } from "./observer.js";
import { getModel } from "./models.js";
import { BASE_INSTRUCTION } from "./prompts.js";
import { sandboxTools } from "./sandbox.js";
import { searchWebTool } from "./tools/search-web.js";

export function createAgent(modelId?: string) {
    return new Agent({
        id: "assistant",
        model: getModel(modelId),
        instructions: BASE_INSTRUCTION,
        context: [compResearchPolicy],
        tools: [...sandboxTools, searchWebTool],
        retries: {},
        observability: {
            primaryTrace: "lens",
            observers: {
                lens: lens.observer({ captureMode: "full" }),
            },
        },
    });
}
