import type { AgentOutcome } from "@anvia/core";
import { faithfulness, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { faithfulnessCases } from "./faithfulness-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

// Konteks = hasil tool searchWeb saja. Kalau teks jawaban agen sendiri ikut masuk
// sebagai konteks, setiap klaim otomatis "didukung" dan skornya selalu 1.
// Kosong (agen tidak mencari sama sekali) -> faithfulness melaporkan invalid, bukan fail.
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
        // prompts.ts:16 — tidak ada angka dari ingatan: tiap klaim harus didukung hasil search.
        faithfulness({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            retrievalContext: (args) => searchEvidence(args.output.messages),
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
