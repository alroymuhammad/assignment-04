import { contains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { containCases } from "./contain-cases.js";
import { lens } from "../observer.js";

const agent = createAgent();

try {
    const evalResult = await runEvalCli({
        name: "correctness-check",
        cases: containCases,
        target: (input: string) => agent.generate({ prompt: input }),
        metrics: [contains({ name: "correctness" })],
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
