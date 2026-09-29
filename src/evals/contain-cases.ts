// A source URL can be any http(s) link, so the expectation is a pattern, not a literal string.
const anySourceUrl = /https?:\/\/[^\s)\]}"']+/;

export const containCases = [
    {
        id: "1-has-url",
        input: "Verify this vacancy: Senior Backend Engineer at Cloudflare, remote in the EU.",
        expected: anySourceUrl,
    },
    {
        id: "2-has-url",
        input: "Verify this vacancy: Junior Data Analyst at Shopify, remote, apply via careers@shopify.com.",
        expected: anySourceUrl,
    },
];
