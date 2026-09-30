import { llmScore, matches, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { citationCases } from "./citation-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

await runEvalCli({
    name: "citation-check",
    cases: citationCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        // Deterministik, 0 token: minimal satu URL sumber muncul di jawaban.
        matches({ expected: /https?:\/\/[^\s)\]}"']+/ }),
        // prompts.ts:16-17 — tiap angka harus berasal dari hasil search dan disebut sumbernya.
        llmScore({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            criteria: [
                "Every figure in the ## Answer section is backed by an ## Evidence line that names a source and gives its URL.",
                "No figure appears without a matching evidence line.",
                "Every URL is a plausible citation of the source it is attached to.",
            ],
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
