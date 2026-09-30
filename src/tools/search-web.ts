import { createTool } from "@anvia/core";
import z from "zod";
import { tavilyClient } from "./tavily-client.js";

async function search(query: string) {
    const response = await tavilyClient.search(query, {
        searchDepth: "basic",
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
        "Search the public web and return the top results with source URLs. Use it to look up salary ranges, pay-transparency reports, and hiring-market data.",
    inputSchema: z.object({
        query: z.string().trim().min(1, "Cannot be empty"),
    }),
    execute: async ({ query }) => search(query),
});
