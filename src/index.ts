import { Studio } from "@anvia/studio";
import { createAgent } from "./agents";

const agent = createAgent();

const studio = new Studio([agent]).start();
