import type { AgentOutcome } from "@anvia/core";
import { exactMatch, faithfulness, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { faithfulnessCases } from "./faithfulness-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";
import { searchEvidence } from "./search-evidence.js";

const agent = createAgent();

try {
    await runEvalCli<string, AgentOutcome>({
        name: "faithfulness-check",
        cases: faithfulnessCases,
        target: (input: string) => agent.generate({ prompt: input }),
        metrics: [
            exactMatch({
                name: "nonempty_answer",
                actual: ({ output }) =>
                    output.type === "response" &&
                    output.output.trim().length > 0,
                expected: true,
            }),
            faithfulness({
                model: getModel("glm-5.3-flash"),
                threshold: 0.8,
                penalizeAmbiguousClaims: true,
                actual: ({ output }) => {
                    if (output.type !== "response") {
                        throw new Error(
                            `agent run ended as "${output.type}", no answer to judge`,
                        );
                    }
                    return output.output;
                },
                retrievalContext: ({ output }) =>
                    searchEvidence(output.messages),
            }),
        ],
        reporters: [
            lens.evalReporter({
                includePayloads: true,
                includeMetadata: true,
                onMissingTrace: "throw",
            }),
        ],
        exitCode: true,
        reporterErrorPolicy: "throw",
    });

    await lens.flush();
} finally {
    await sandbox.destroy();
    await lens.close();
}
