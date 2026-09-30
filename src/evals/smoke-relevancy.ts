// Transient smoke check for the relevancy metric's ambiguity handling. Delete after use.
import { answerRelevancy } from "@anvia/core/evals";
import { relevancyCases } from "./relevancy-cases.js";
import { getModel } from "../models.js";

const MISSING_FACT_NOTES: Record<string, string> = {
    title: "This request does not name the job title. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the job title. A salary figure here is not relevant.",
    location: "This request does not name the location. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the location. A salary figure here is not relevant.",
    experience: "This request does not state the years of experience. A pay lookup needs title, experience and location, so the only relevant answer is a single clarifying question asking for the years of experience. A salary figure here is not relevant.",
};

const metric = answerRelevancy({
    model: getModel("glm-5.3-flash"),
    threshold: 0.8,
    input: ({ case: testCase }) => {
        const missingField = testCase.metadata?.missingField;
        const note =
            typeof missingField === "string" ? MISSING_FACT_NOTES[missingField] : undefined;
        return note ? `${testCase.input}\n\nEval context: ${note}` : String(testCase.input);
    },
});

const clarifying: Record<string, string> = {
    "1-missing-title":
        "Which job title should I look up? Pay for 5 years of experience in Toronto depends a lot on the role.",
    "2-missing-location":
        "Which location are you in? I need the city to look up pay for a Senior Software Engineer with 5 years of experience.",
    "3-missing-experience":
        "How many years of experience do you have? Salary for a Software Engineer in Berlin depends on the level.",
};

const wrong = {
    id: "1-missing-title",
    input: relevancyCases[0]!.input,
    metadata: { missingField: "title" },
};
const wrongAnswer =
    "## Answer\nCAD 95,000 - 130,000 per year — Software Engineer, 5 years, Toronto, 2024\n## Evidence\n- Levels.fyi — https://example.com";

const checks: Array<[string, string, unknown]> = [
    ...relevancyCases.map((testCase) => [testCase.id, clarifying[testCase.id]!, testCase]),
    ["wrong-pay-answer", wrongAnswer, wrong],
];

for (const [label, answer, testCase] of checks) {
    const outcome = await metric.evaluate({
        suiteName: "smoke",
        case: testCase as never,
        output: { output: answer } as never,
        signal: AbortSignal.timeout(120_000),
    });
    const note = outcome.outcome === "fail" ? outcome.comment : outcome.score;
    console.log(`${label}: ${outcome.outcome} (${JSON.stringify(note).slice(0, 160)})`);
}
