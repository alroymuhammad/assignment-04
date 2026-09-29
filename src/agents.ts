import { Agent } from "@anvia/core";
import { jobVacancyVerificationPolicy } from "./context.js";
import { lens } from "./observer.js";
import { getModel } from "./models.js";
import { BASE_INSTRUCTION } from "./prompts.js";
import { sandboxTools } from "./sandbox.js";
import { searchWebTool, verifyJobTool } from "./tools/search-web.js";

export function createAgent(modelId?: string) {
    return new Agent({
        id: "assistant",
        model: getModel(modelId),
        instructions: BASE_INSTRUCTION,
        context: [jobVacancyVerificationPolicy],
        tools: [...sandboxTools, searchWebTool, verifyJobTool],
        // Core defaults: 3 attempts, 100ms-1s jittered backoff. Retries 5xx (e.g. gateway 502).
        retries: {},
        observability: {
            observers: {
                tracing: lens.observer({ captureMode: "full" }),
            },
        },
    });
}
