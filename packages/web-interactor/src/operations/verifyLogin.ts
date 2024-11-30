import { Page } from "playwright";

interface LoginCheck {
    name: string;
    check: (page: Page) => Promise<boolean>;
}
  
const loginChecks: LoginCheck[] = [

    // 1. Success Indicator
    {
        name: 'Login Page Absence Check',
        check: async (page: Page) => {
          // Elements that indicate we're still on login page
          const loginPageElements = [
            'Login',
            'Sign in',
            'Log in',
            'Signin',
            'SignIn',
            'Create an account',
            'Forgot password',
            'Remember me'
          ];
      
          // Check both text and button/link elements
          const isLoginVisible = await Promise.all([
            // Check for text content
            ...loginPageElements.map(async (text) => {
              const textElement = page.getByText(text, { exact: true });
              return await textElement.isVisible().catch(() => false);
            }),
            // Check for input fields
            page.getByLabel(/password/i).isVisible().catch(() => false),
            page.getByLabel(/email/i).isVisible().catch(() => false),
            page.getByLabel(/username/i).isVisible().catch(() => false),
            // Check for common login buttons
            page.getByRole('button', { name: /login|sign in|log in/i }).isVisible().catch(() => false)
          ]);
      
          // If any of these elements are visible, we're likely still on the login page
          return !isLoginVisible.some(visible => visible);
        }
    },

    // 2. Common Success Elements
    {
      name: 'Common UI Elements',
      check: async (page: Page) => {
        const successElements = [
          'Dashboard',
          'Profile',
          'Account',
          'Logout',
          'Sign out',
          'Welcome'
        ];
  
        // Check for elements that typically appear only after login
        return Promise.any(
          successElements.map(async (text) => {
            const element = page.getByText(text, { exact: true });
            const visible = await element.isVisible().catch(() => false);
            // Only count if element is both present and visible
            return visible;
          })
        ).catch(() => false);
      }
    },
  
    // 3. Authentication State Check
    {
      name: 'Auth Cookie Check',
      check: async (page: Page) => {
        const cookies = await page.context().cookies();
        return cookies.some(cookie => 
          cookie.name.toLowerCase().includes('auth') || 
          cookie.name.toLowerCase().includes('token') ||
          cookie.name.toLowerCase().includes('session')
        );
      }
    },
  
    // 4. Error Message Check (inverse)
    {
      name: 'Error Message Check',
      check: async (page: Page) => {
        const errorPatterns = [
          'invalid',
          'incorrect',
          'failed',
          'Authentication failed',
          'Please try again'
        ];
  
        return !(await Promise.any(
          errorPatterns.map(async (text) => {
            const element = page.getByText(text, { exact: true });
            return await element.isVisible().catch(() => false);
          })
        ).catch(() => false));
      }
    }
];
  
export async function verifyLoginSuccess(page: Page): Promise<boolean> {
    try {
      // Wait for any network activity to settle
      await page.waitForLoadState('networkidle', { timeout: 5000 })
        .catch(() => {}); // Ignore timeout
  
      // Run all checks
      const results = await Promise.all(
        loginChecks.map(async (check) => {
          try {
            const result = await check.check(page);
            console.log(`Check '${check.name}': ${result}`);
            return result;
          } catch (error) {
            console.error(`Check '${check.name}' failed:`, error);
            return false;
          }
        })
      );
  
      // Require at least 2 checks to pass for higher confidence
      const passedChecks = results.filter(Boolean).length;
      const isSuccess = passedChecks > 2;
  
      console.log(`Login verification: ${passedChecks}/${loginChecks.length} checks passed`);
      return isSuccess;
  
    } catch (error) {
      console.error('Login verification failed:', error);
      return false;
    }
}