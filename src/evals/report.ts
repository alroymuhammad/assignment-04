import {
    EvalOutcome,
    defineMetric,
    llmScore,
    matches,
    runEvalCli,
} from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { reportCases } from "./report-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

const anySourceUrl = /https?:\/\/[^\s)\]}"']+/;

// Dibaca dari sandbox, jadi yang diperiksa efeknya, bukan niat agen.
// File hilang -> string kosong, supaya metric-nya `fail` dan bukan `invalid`.
async function reportText() {
    try {
        return await sandbox.runtime.readTextFile({ path: "report.md" }); // relatif ke workdir (/workspace)
    } catch {
        return "";
    }
}

// prompts.ts:29 — jawaban yang sama harus tersimpan di /workspace/report.md.
const reportFile = defineMetric({
    name: "report_file",
    dataType: "BOOLEAN",
    direction: "higher_is_better",
    threshold: 1,
    async evaluate() {
        const text = await reportText();
        if (text.trim().length === 0) {
            return EvalOutcome.fail(false, {
                comment: "report.md tidak ada atau kosong.",
            });
        }
        if (!text.includes("## Answer")) {
            return EvalOutcome.fail(false, {
                comment: `report.md tidak berisi bagian ## Answer: ${text.slice(0, 120)}`,
            });
        }
        return EvalOutcome.pass(true);
    },
});

await runEvalCli({
    name: "report-check",
    cases: reportCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        reportFile,
        // Deterministik: apakah file di dalam sandbox memuat URL sumber.
        matches({ expected: anySourceUrl, actual: () => reportText() }),
        // prompts.ts:21-27 — format dan isi file harus sama dengan jawaban ke user.
        // llmScore tidak punya `actual`, jadi isi file dikirim lewat `prompt`.
        llmScore({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            prompt: async () => `Report file:\n${await reportText()}`,
            criteria: [
                "The file has all three sections: ## Answer, ## Evidence, ## Gaps.",
                "Every figure in ## Answer has a matching ## Evidence line that names a source and gives its URL.",
                "The content is the answer the agent gave the user, not a summary or a different version of it.",
            ],
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
