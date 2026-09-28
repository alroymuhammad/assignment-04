import { tavily } from "@tavily/core";

const tavilyKey = process.env.TAVILY_API_KEY;

if (!tavilyKey) {
    throw new Error(
        "Please create TAVILY_API_KEY in .env so we can proceed to use tools",
    );
}

export const tavilyClient = tavily({
    apiKey: tavilyKey,
});
