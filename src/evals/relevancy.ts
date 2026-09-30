import { answerRelevancy, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { relevancyCases } from "./relevancy-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

const evalResult = await runEvalCli({
    name: "relevancy-check",
    cases: relevancyCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        answerRelevancy({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            input: ({ case: testCase }) =>
                `${testCase.input}\n\nNote: this request is incomplete — a clarifying question about the missing detail is the relevant answer, a salary figure is not.`,
        }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

console.log(evalResult.results);
await sandbox.destroy();
lens.flush();
