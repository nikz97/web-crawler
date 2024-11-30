import { Page } from "playwright";

/**
 * Wait until all progress bars (elements with role="progressbar") are no longer visible on the page.
 * @param page - The Playwright page object
 * @param timeout - Optional timeout in milliseconds (default is 30 seconds)
 */
export async function waitForNoProgressBars(
  page: Page,
  timeout: number = 30000,
): Promise<void> {
  console.log("Waiting for all progress bars to disappear...");

  await page.waitForSelector('[role="progressbar"]', {
    state: "hidden",
    timeout,
  });

  console.log("All progress bars have disappeared.");
}
