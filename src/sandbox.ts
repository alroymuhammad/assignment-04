import { createDockerSandboxTools, DockerSandboxClient } from "@anvia/sandbox";

const client = new DockerSandboxClient();
await client.pullImage({ image: "ghcr.io/astral-sh/uv:alpine" });

export const sandbox = await client.createSandbox({
    image: "ghcr.io/astral-sh/uv:alpine",
    workspace: { type: "ephemeral" },
    network: { mode: "bridge", ports: [3000] },
    resources: {
        memoryMb: 512,
        cpus: 1,
        pidsLimit: 128,
    },
    runtime: {
        commandTimeoutMs: 30_000,
        maxOutputBytes: 64_000,
    },
});

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
