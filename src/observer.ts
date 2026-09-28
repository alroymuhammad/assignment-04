import { LensClient } from "@anvia/lens";

// baseUrl/publicKey/secretKey/environment are read from ANVIA_LENS_* env vars by the client.
export const lens = new LensClient({
    serviceName: "support-agent",
});
