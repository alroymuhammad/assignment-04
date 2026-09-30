import { contains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { containCases } from "./contain-cases.js";
import { lens } from "../observer.js";

const agent = createAgent();

const evalResult = await runEvalCli({
    name: "correctness-check",
    cases: containCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [contains({ name: "correctness" })],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

console.log(evalResult.results);
await sandbox.destroy();
lens.flush();
