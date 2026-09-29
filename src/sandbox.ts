import { createDockerSandboxTools, DockerSandboxClient } from "@anvia/sandbox";

const client = new DockerSandboxClient();
await client.pullImage({ image: "ghcr.io/astral-sh/uv:alpine" });

const options = {
    image: "ghcr.io/astral-sh/uv:alpine",
    workspace: { type: "ephemeral" as const },
    network: { mode: "bridge" as const, ports: [3000] },
    resources: {
        memoryMb: 512,
        cpus: 1,
        pidsLimit: 128,
    },
    runtime: {
        commandTimeoutMs: 30_000,
        maxOutputBytes: 64_000,
    },
};

// @anvia/sandbox inspects the published port once, but Docker can still report the
// container as "Created" (ports not mapped yet) at that moment. ponytail: retry the
// race; drop if the library ever waits for the mapping.
async function createSandbox(attempts = 3) {
    try {
        return await client.createSandbox(options);
    } catch (error) {
        if (attempts > 1 && (error as { code?: string }).code === "port") {
            return createSandbox(attempts - 1);
        }
        throw error;
    }
}

export const sandbox = await createSandbox();

export const sandboxTools = createDockerSandboxTools({
    sandbox: sandbox.runtime,
    tools: [
        "read_file",
        "write_file",
        "list_files",
        "exec_command",
        "list_ports",
        "start_process",
        "list_processes",
        "read_process_logs",
        "stop_process",
        "wait_for_port",
    ],
});
