// packages/leadingreach-interactor/src/utils/browserSetup.ts

import { chromium, Browser, Page, BrowserContext } from "playwright";
import { Browserbase } from "@browserbasehq/sdk";
import { ns, keys } from "../services/session.js";
import { config } from "../config/index.js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Ensure fetch is available

export async function setupBrowser(): Promise<{ browser: Browser; page: Page; }> {
  const { browser, context } = await getLocalChromiumBrowser();
  // const context = await browser.newContext({ recordVideo: { dir: "videos/" } });
  const page = await context.newPage();
  console.log("New page created in shared context.");

  // Set context values
  const appSubdomain = "app";
  const apiSubdomain = "api";
  ns.set(keys.APP_SUBDOMAIN, appSubdomain);
  ns.set(keys.API_SUBDOMAIN, apiSubdomain);
  console.log(`Context values set. App: ${appSubdomain}, API: ${apiSubdomain}`);

  return { browser, page };
}

async function getBrowserbaseChromiumBrowser(): Promise<{
  browser: Browser;
  sessionId: string;
  context: BrowserContext;
}> {
  console.log("Initializing Browserbase...");
  const browserbase = new Browserbase({
    apiKey: config.browserbaseApiKey,
    projectId: config.browserbaseProjectId,
  });
  console.log("Browserbase initialized.");

  // Use the shared context if available from environment variable, otherwise create a new one
  let sharedContextId = config.browserbaseSharedContextId;
  if (!sharedContextId) {
    console.log("No shared context found. Creating a new one...");
    const { id } = await createSharedContext(browserbase);
    sharedContextId = id;
    console.log(`New shared context created with ID: ${sharedContextId}`);
    // Set the environment variable for future use
    config.browserbaseSharedContextId = sharedContextId;
  } else {
    console.log(`Using existing shared context with ID: ${sharedContextId}`);
  }

  console.log("Creating new session with shared context...");
  const { id: sessionId } = await browserbase.createSession({
    browserSettings: {
      context: {
        id: sharedContextId,
        persist: true,
      },
    },
  });
  console.log(`New session created with ID: ${sessionId}`);

  console.log("Connecting to Browserbase...");
  const browser = await chromium.connectOverCDP(
    browserbase.getConnectURL({ sessionId }),
  );
  console.log("Connected to Browserbase with shared context.");

  // Get the default context, which should be our shared context
  const context = browser.contexts()[0];
  console.log("Retrieved shared context from browser.");

  return { browser, sessionId: sessionId as string, context };
}

async function createSharedContext(
  browserbase: Browserbase,
): Promise<{ id: string }> {
  console.log("Creating new shared context...");
  const response = await browserbase.createContext();
  console.log(`Created shared context with ID: ${response.id}`);
  return response;
}

async function getLocalChromiumBrowser() {
  console.log("Launching local Chromium browser...");
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();
  console.log("Local Chromium browser launched.");

  return { browser, context };
}


