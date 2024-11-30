import { Browser, Page } from "playwright";
import { ns } from "../services/session.js";
import { setupBrowser } from "../utils/browserSetup.js";
import { login } from "../operations/login.js";
import { processNetworkCallsExtraction } from "../flows/extractUrls.js";

const DEFAULT_TIMEOUT = 90000;

/**
 * Temp runner to test out things for login
 *
 * @param username - The username to use for logging in to the  webiste.
 * @param password - The password to use for logging in to the  webiste.
 * @returns The details of the processed patients.
 */
export function extractionRunner(
  username: string,
  password: string,
  url: string,
  authRequired: boolean = true
): Promise<any> {
  return new Promise((resolve, reject) => {
    ns.run(async () => {
      try {
        const result = await runExtractionRunner(username, password, url, authRequired);
        resolve(result);
      } catch (error) {
        console.error(`Error in runLoginRunner: ${error}`);
        reject(error);
      }
    });
  });
}

export async function runExtractionRunner(
  username: string,
  password: string,
  url: string,
  authRequired: boolean
): Promise<any> {
  console.log(`Starting login runner...`);

  let browser: Browser | null = null;
  let page: Page | null = null;
  try {
    ({ browser, page } = await setupBrowser());
    page.setDefaultTimeout(DEFAULT_TIMEOUT);

    if (authRequired) {
      console.log(`Logging in...`);
      try{
        await login(username, password, url, page);
        console.log("Successfully logged in!");
      } catch (error) {
        if(error instanceof Error) {
          if(error.message === `Success indicator not found`){
            console.error(`Login Failed : ${error.message}`);
          }
        }
      }
      
    } else {
      console.log(`No login required`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
    }
    // implement the rest of your code here
    // Call the API to get the list of URLs present in the website home page.
    // Wait for the page to load completely
    await page.waitForTimeout(2000); 
    console.log("Page loaded, extracting URLs...");

    // Extract all clickable URLs from the page
    const networkCalls = await processNetworkCallsExtraction(page, url);
    console.log(`networkCalls:  ${networkCalls}`);

    return networkCalls;
  } catch (error) {
    console.error(`Error in runLoginRunner: ${error}`);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log("Browser closed successfully.");
      } catch (closeError) {
        console.error(`Error closing browser: ${closeError}`);
      }
    }
  }
}
