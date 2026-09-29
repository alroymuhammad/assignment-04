export const jobVacancyVerificationPolicy = {
    id: "job-vacancy-verification-policy",
    text: `
# Job vacancy verification policy

Apply this policy to the evidence returned by the verifyJob tool before answering.

## Required checks
- Official posting: the vacancy appears on the company's official careers page.
- Contact email: uses the company's own domain, not a free email provider.
- Specificity: role, salary range, and requirements are concrete and internally consistent.

## Red flags
- Any request for payment, upfront fees, or equipment purchases.
- Interviews conducted only through chat apps.
- An offer made without an interview or skills check.

## Verdicts
- verified: every required check passes and no red flags are present.
- needs-review: any required check fails or any red flag is present.
`,
    additionalProps: {
        version: "v1",
    },
};
