import "dotenv/config";

import { createServer } from "node:http";
import { env } from "./app/common/config/env.js";
import { createApplication } from "./app/app.js";

/**
 * Entry point — creates the Express app and starts listening.
 
 * createServer wraps the Express app for a clean shutdown path, if needed later.
 */
async function main() {
  try {
    const app = createApplication();
    const server = createServer(app);
    const PORT = env.PORT;

    server.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[server] Error starting http server:`, error);
    process.exit(1);
  }
}

main();
