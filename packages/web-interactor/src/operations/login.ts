import { Page } from "playwright";
import { retryOperation } from "../utils/retryOperation.js";
import { usernameSelectors, passwordSelectors, loginButtonSelectors, successIndicators } from "../types/types.js";
import { verifyLoginSuccess } from "./verifyLogin.js";

export async function login(
  username: string,
  password: string,
  url: string,
  page: Page,
) {
  return retryOperation(async () => {
    try{
      await page.goto(url, { waitUntil: "networkidle" });

      // Wait for any login form elements to be present
      await Promise.race([
        page.waitForSelector(usernameSelectors.join(', '), { timeout: 10000 }),
        page.waitForSelector('form', { timeout: 10000 })
      ]);

      // Try to find and fill username field
      const usernameField = await page.locator(usernameSelectors.join(', ')).first();
      if (await usernameField.count() === 0) {
        throw new Error('Username field not found');
      }

      await retryOperation(async () => {
        await usernameField.click({ timeout: 5000 });
        await usernameField.fill(username);
        await page.waitForTimeout(1000);
        const fieldValue = await usernameField.inputValue();
        if (fieldValue !== username) {
          throw new Error('Username not filled correctly');
        }
      }, 3);
      console.log("Filled username");

      // Try to find and fill password field
      const passwordField = await page.locator(passwordSelectors.join(', ')).first();
      if (await passwordField.count() === 0) {
        throw new Error('Password field not found');
      }

      // Fill password with retry logic
      await retryOperation(async () => {
        await passwordField.click({ timeout: 5000 });
        await passwordField.fill(password);
        await page.waitForTimeout(1000);
        const fieldValue = await passwordField.inputValue();
        if (fieldValue !== password) {
          throw new Error('Password not filled correctly');
        }
      }, 3);
      
      console.log("Filled password");
      await page.waitForTimeout(1000);
  
      const loginButton = await page.locator(loginButtonSelectors.join(', ')).first();
      if (await loginButton.count() === 0) {
        throw new Error('Login button not found');
      }

      await loginButton.click();

      await page.waitForTimeout(4000);

      const isSuccess = await verifyLoginSuccess(page);
      if (!isSuccess) {
        throw new Error('Login verification failed');
      }
      const foundSuccessIndicator = await Promise.any(
        successIndicators.map(async (text) => {
          const element = page.getByText(text, { exact: true });
          return (await element.count()) > 0;
        })
      ).catch(() => false);

      if (!foundSuccessIndicator) {
        // Additional checks for login success
        const urlAfterLogin = page.url();
        if (urlAfterLogin.includes('login') || urlAfterLogin.includes('signin')) {
          throw new Error('Success indicator not found');
        }
      }
      console.log("Found success indicator!");

      await page.waitForTimeout(2000);
    }catch(error){
      console.log("Error in login function: ", error);
      throw error;
    }
    
  });
}
