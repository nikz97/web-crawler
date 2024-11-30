export interface Config {
  browserbaseApiKey: string;
  browserbaseProjectId: string;
  weinfuseEnvironment: string;
  browserlessUrl: string;
  browserbaseSharedContextId: string;
}

export const config: Config = {
  browserbaseApiKey: process.env.BROWSERBASE_API_KEY || "",
  browserbaseProjectId: process.env.BROWSERBASE_PROJECT_ID || "",
  weinfuseEnvironment: process.env.WEINFUSE_ENVIRONMENT || "training",
  browserlessUrl: process.env.BROWSERLESS_URL || "",
  browserbaseSharedContextId:
  process.env.BROWSERBASE_SHARED_CONTEXT_ID ||
  "5006ae91-ada3-4552-bbbd-2d576309970a",
};

export function validateConfig() {
  const missingVars = Object.entries(config)
    .filter(([key, value]) => value === "")
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
}
