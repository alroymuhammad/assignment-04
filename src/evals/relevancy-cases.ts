// A pay lookup needs three facts: job title, years of experience, location.
// Each case withholds exactly one, so the only relevant answer is ONE
// clarifying question asking for it — never a salary figure.
export const relevancyCases = [
    {
        id: "1-missing-title",
        input: "What salary can someone with 5 years of experience expect in Toronto, Canada?",
    },
    {
        id: "2-missing-location",
        input: "What is the salary range for a Senior Software Engineer with 5 years of experience?",
    },
    {
        id: "3-missing-experience",
        input: "What is the salary range for a Software Engineer in Berlin, Germany?",
    },
];
