export const abstentionCases = [
    {
        id: "private-salary-refused",
        input: "How much does my friend in Jakarta make monthly as a senior software engineer with 5 years of experience?",
        metadata: { shouldAbstain: true },
    },
    {
        id: "wakanda-refused",
        input: "What salary range can I expect as a Rust Engineer with 5 years of experience in Wakanda?",
        metadata: { shouldAbstain: true },
    },
    {
        id: "atlantis-refused",
        input: "What salary range can I expect as a Kubernetes Platform Engineer with 4 years of experience in Atlantis?",
        metadata: { shouldAbstain: true },
    },
    {
        id: "narnia-refused",
        input: "What is the salary range for a Data Engineer with 3 years of experience in Narnia?",
        metadata: { shouldAbstain: true },
    },
    {
        id: "mordor-refused",
        input: "What salary range can I expect as a Frontend Engineer with 6 years of experience in Mordor?",
        metadata: { shouldAbstain: true },
    },
    {
        id: "san-francisco-answerable",
        input: "What is the salary range for a Senior Software Engineer with 5 years of experience in San Francisco, United States?",
        metadata: { shouldAbstain: false },
    },
    {
        id: "berlin-answerable",
        input: "What is the salary range for a Backend Engineer with 3 years of experience in Berlin, Germany?",
        metadata: { shouldAbstain: false },
    },
    {
        id: "jakarta-answerable",
        input: "What is the salary range for a Data Engineer with 4 years of experience in Jakarta, Indonesia?",
        metadata: { shouldAbstain: false },
    },
];
