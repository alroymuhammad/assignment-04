export const containCases = [
    {
        id: "jakarta-range",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in Jakarta, Indonesia?",
        expected: /\bIDR [\d.,]+ - [\d.,]+ per (?:month|year)/,
    },
    {
        id: "germany-range",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in Germany?",
        expected: /\bEUR [\d.,]+ - [\d.,]+ per (?:month|year)/,
    },
    {
        id: "uk-range",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in the UK?",
        expected: /\bGBP [\d.,]+ - [\d.,]+ per (?:month|year)/,
    },
];
