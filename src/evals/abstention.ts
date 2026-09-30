import { abstention, notContains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { abstentionCases } from "./abstention-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

await runEvalCli({
    name: "abstention-check",
    cases: abstentionCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        notContains({ expected: /(?:[Rr]p|[A-Z]{3}|[$€£])\s?[\d.,]{3,}/ }),
        abstention({ model: getModel("glm-5.3-flash"), shouldAbstain: true }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

await sandbox.destroy();
lens.flush();
