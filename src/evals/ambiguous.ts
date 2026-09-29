import { answerRelevancy, contains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { lens } from "../observer.js";
import { ambiguousCases } from "./ambiguous-cases.js";
import { getModel } from "../models.js";
import { sandbox } from "../sandbox.js";

const agent = createAgent();

const evalResult = await runEvalCli({
  name: "relevancy-check",
  cases: ambiguousCases,
  target: (input: string) => agent.generate({ prompt: input }),
  metrics: [
    answerRelevancy({ model: getModel("glm-5.3-flash"), threshold: 0.8 }),
  ],
  reporters: [lens.evalReporter({ includePayloads: true })],
});

console.log(evalResult.results);
await sandbox.destroy();
lens.flush();
