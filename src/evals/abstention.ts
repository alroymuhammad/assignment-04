import type { AgentOutcome } from "@anvia/core";
import { abstention, notContains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { abstentionCases } from "./abstention-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";
import { searchEvidence } from "./search-evidence.js";

const agent = createAgent();

const currencyFigure = /(?:IDR|Rp|EUR|GBP|USD|[$€£])\s?[\d.,]{3,}/;
const nothingForbidden = /(?!)/;

try {
    await runEvalCli<string, AgentOutcome>({
        name: "abstention-check",
        cases: abstentionCases,
        target: (input: string) => agent.generate({ prompt: input }),
        metrics: [
            notContains({
                name: "no_figure_when_abstaining",
                expected: ({ case: testCase }) =>
                    testCase.metadata?.shouldAbstain === true
                        ? currencyFigure
                        : nothingForbidden,
            }),
            abstention({
                model: getModel("glm-5.3-flash"),
                shouldAbstain: ({ case: testCase }) =>
                    testCase.metadata?.shouldAbstain === true,
                context: ({ output }) => searchEvidence(output.messages),
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
