import { containsAll, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { reportCases } from "./report-cases.js";
import { lens } from "../observer.js";

const agent = createAgent();

const REPORT_PATH = "report.md";

try {
    await runEvalCli({
        name: "report-check",
        cases: reportCases,
        target: async (input: string) => {
            await sandbox.runtime.exec({
                command: "rm",
                args: ["-f", REPORT_PATH],
            });
            const outcome = await agent.generate({ prompt: input });
            const report = await sandbox.runtime
                .readTextFile({ path: REPORT_PATH })
                .catch(() => "");
            return { output: report, trace: outcome.trace };
        },
        metrics: [
            containsAll({
                name: "report_file",
                expected: ({ case: testCase }) => [
                    "## Answer",
                    "## Evidence",
                    "## Gaps",
                    String(testCase.metadata?.title ?? ""),
                    String(testCase.metadata?.years ?? ""),
                    String(testCase.metadata?.location ?? ""),
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

    await lens.flush();
} finally {
    await sandbox.destroy();
    await lens.close();
}
