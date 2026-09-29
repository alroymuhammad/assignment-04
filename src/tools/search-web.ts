import { createTool } from "@anvia/core";
import z from "zod";
import { tavilyClient } from "./tavily-client.js";

async function search(query: string) {
    const response = await tavilyClient.search(query, {
        searchDepth: "advanced",
        maxResults: 5,
        includeAnswer: true,
    });
    const results = response.results.map(
        (result) => `- ${result.title} — ${result.url}\n  ${result.content}`,
    );
    return [`Answer: ${response.answer ?? "none"}`, ...results].join("\n");
}

export const searchWebTool = createTool({
    name: "searchWeb",
    description:
        "Search the public web and return the top results with source URLs. Use it to look up a company, careers page, domain, or scam reports.",
    inputSchema: z.object({
        query: z.string().trim().min(1, "Cannot be empty"),
    }),
    execute: async ({ query }) => search(query),
});

export const verifyJobTool = createTool({
    name: "verifyJob",
    description:
        "Verify a job vacancy against the verification policy: official careers page, contact email domain, and scam red flags. Call this first whenever the user shares a vacancy.",
    inputSchema: z.object({
        jobVacancy: z.string().trim().min(1, "Cannot be empty"),
    }),
    execute: async ({ jobVacancy }) => {
        const [careers, reputation] = await Promise.all([
            search(`"${jobVacancy}" official careers page job posting`),
            search(`${jobVacancy} job scam reports fees equipment purchase interview`),
        ]);
        return [
            "=== Careers page / official posting evidence ===",
            careers,
            "=== Reputation and scam-report evidence ===",
            reputation,
        ].join("\n\n");
    },
});
