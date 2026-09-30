export const containCases = [
    {
        id: "1-jakarta",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in Jakarta, Indonesia?",
        expected: /\b(?:IDR|Rp)\s?[\d.,]+\s?[-–]\s?[\d.,]+/,
    },
    {
        id: "2-germany",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in Germany?",
        expected: /(?:\bEUR|€)\s?[\d.,]+\s?[-–]\s?[\d.,]+/,
    },
    {
        id: "3-uk",
        input: "What salary range can I expect as a Senior Backend Engineer with 5 years of experience in the UK?",
        expected: /(?:\bGBP|£)\s?[\d.,]+\s?[-–]\s?[\d.,]+/,
    },
];
