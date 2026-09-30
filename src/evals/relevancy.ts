import { answerRelevancy, notContains, runEvalCli } from "@anvia/core/evals";
import { createAgent } from "../agents.js";
import { sandbox } from "../sandbox.js";
import { relevancyCases } from "./relevancy-cases.js";
import { lens } from "../observer.js";
import { getModel } from "../models.js";

const agent = createAgent();

// answerRelevancy splits the answer into statements and asks a judge whether each one is
// relevant to the user input. For a request that leaves out title/experience/location the
// relevant answer is a clarifying question — which looks irrelevant against the bare input.
// So the judged input carries the missing fact and what the only relevant answer is.
const MISSING_FACT_NOTES: Record<string, string> = {
    title: "This request does not name the job title. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the job title. A salary figure here is not relevant.",
    location: "This request does not name the location. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the location. A salary figure here is not relevant.",
    experience: "This request does not state the years of experience. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the years of experience. A salary figure here is not relevant.",
};

// Deterministic guard for the same rule, so a stray salary number fails without the judge.
// Same shape as abstention.ts: /\b(?:IDR|USD|...)\b/ in front of a figure.
const anyPayFigure = /(?:\b(?:IDR|USD|EUR|GBP|CAD|AUD|SGD|Rp)\b|[$€£])\s?[\d.,]{3,}/i;

const evalResult = await runEvalCli({
    name: "relevancy-check",
    cases: relevancyCases,
    target: (input: string) => agent.generate({ prompt: input }),
    metrics: [
        answerRelevancy({
            model: getModel("glm-5.3-flash"),
            threshold: 0.8,
            input: ({ case: testCase }) => {
                const missingField = testCase.metadata?.missingField;
                const note =
                    typeof missingField === "string"
                        ? MISSING_FACT_NOTES[missingField]
                        : undefined;
                return note
                    ? `${testCase.input}\n\nEval context: ${note}`
                    : String(testCase.input);
            },
        }),
        notContains({ expected: anyPayFigure, name: "no_pay_for_ambiguous_request" }),
    ],
    reporters: [lens.evalReporter({ includePayloads: true })],
});

console.log(evalResult.results);
await sandbox.destroy();
lens.flush();
