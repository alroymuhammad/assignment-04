import { Studio } from "@anvia/studio";
import { createAgent } from "./agents.js";
import { lens } from "./observer.js";
import { sandbox } from "./sandbox.js";

const agent = createAgent();

export const studio = new Studio([agent]).serve({
    port: 3000,
    onShutdown: async () => {
        await Promise.all([sandbox.destroy(), lens.close()]);
    },
});
