import type { AgentOutcome } from "@anvia/core";
import {
    exactMatch,
    notContains,
    promptAlignment,
    runEvalCli,
} from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { relevancyCases } from "./relevancy-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

const currencyFigure = /(?:IDR|Rp|EUR|GBP|USD|[$€£])\s?[\d.,]{3,}/;

try {
    const evalResult = await runEvalCli<string, AgentOutcome>({
        name: "relevancy-check",
        cases: relevancyCases,
        target: (input: string) => agent.generate({ prompt: input }),
        metrics: [
            notContains({
                name: "no_figure_for_incomplete_request",
                expected: currencyFigure,
            }),
            exactMatch({
                name: "nonempty_answer",
                actual: ({ output }) =>
                    output.type === "response" &&
                    output.output.trim().length > 0,
                expected: true,
            }),
            promptAlignment({
                model: getModel("glm-5.3-flash"),
                threshold: 0.8,
                promptInstructions: [
                    "Ask exactly one clarifying question for the one missing detail (job title, years of experience, or location).",
                    "Do not include a salary figure or range.",
                ],
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

    console.log(evalResult.results);
    await lens.flush();
} finally {
    await sandbox.destroy();
    await lens.close();
}
