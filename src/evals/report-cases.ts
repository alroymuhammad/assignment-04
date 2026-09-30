// Tiga kasus compensation search (title + years of experience + lokasi).
// Tiap prompt minta hasilnya berupa file report.md — bukan cuma jawaban chat —
// supaya kegagalan agen bikin file langsung kelihatan.
export const reportCases = [
    {
        id: "1-report-written",
        input: "What is the salary range for a Senior Software Engineer with 5 years of experience in San Francisco, United States? Save the answer as a file named report.md in the workspace — don't just reply in chat.",
        metadata: {
            title: "Senior Software Engineer",
            years: 5,
            location: "San Francisco, United States",
        },
    },
    {
        id: "2-report-written",
        input: "What is the salary range for a Data Scientist with 3 years of experience in London, United Kingdom? Save the answer as a file named report.md in the workspace — don't just reply in chat.",
        metadata: {
            title: "Data Scientist",
            years: 3,
            location: "London, United Kingdom",
        },
    },
    {
        id: "3-report-written",
        input: "What is the salary range for a Backend Engineer with 4 years of experience in Jakarta, Indonesia? Save the answer as a file named report.md in the workspace — don't just reply in chat.",
        metadata: {
            title: "Backend Engineer",
            years: 4,
            location: "Jakarta, Indonesia",
        },
    },
];
