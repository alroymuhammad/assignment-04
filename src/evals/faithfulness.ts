import type { AgentOutcome } from "@anvia/core";
import { faithfulness, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { faithfulnessCases } from "./faithfulness-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

function searchEvidence(messages: AgentOutcome["messages"]): string[] {
    const evidence: string[] = [];
    for (const message of messages) {
        if (message.role !== "tool") continue;
        for (const part of message.content) {
            if (part.type !== "tool-result") continue;
            if (part.toolName !== "searchWeb") continue;
            if (part.output.type !== "text") continue;
            evidence.push(part.output.value);
        }
    }
    return evidence;
}

await runEvalCli<string, AgentOutcome>({
    name: "faithfulness-check",
    cases: faithfulnessCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        faithfulness({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            actual: ({ output }) => {
                if (output.type !== "response") {
                    throw new Error(
                        `agent run ended as "${output.type}", no answer to judge`,
                    );
                }
                return output.output;
            },
            retrievalContext: (args) => searchEvidence(args.output.messages),
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
