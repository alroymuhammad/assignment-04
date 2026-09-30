import type { AgentOutcome } from "@anvia/core";

export function searchEvidence(messages: AgentOutcome["messages"]): string[] {
    const evidence: string[] = [];
    for (const message of messages) {
        if (message.role !== "tool") continue;
        for (const part of message.content) {
            if (part.type !== "tool-result") continue;
            if (part.toolName !== "searchWeb") continue;
            if (part.output.type !== "text") continue;
            evidence.push(part.output.value);
        }
    }
    return evidence;
}
