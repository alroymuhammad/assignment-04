import { containsAll, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { reportCases } from "./report-cases.js";
import { lens } from "../observer.js";

const agent = createAgent();

const REPORT_PATH = "report.md";

await runEvalCli({
    name: "report-check",
    cases: reportCases,
    target: async (input: string) => {
        await agent.generate({ prompt: input });
        return sandbox.runtime
            .readTextFile({ path: REPORT_PATH })
            .catch(() => "");
    },
    metrics: [
        containsAll({
            name: "report_file",
            expected: ["## Answer", "## Evidence", "## Gaps"],
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
