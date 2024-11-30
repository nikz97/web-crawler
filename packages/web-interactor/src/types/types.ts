export interface RequestOptions {
  customStatus?: string[];
  pageNumber?: number;
  pageRows?: number;
  sentOnEnd?: string;
  sentOnRangeModifier?: string;
  type?: number;
}

// Define interfaces for our data structures
export interface NetworkCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  resourceType: string;
  postData: string | null;
  response?: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body?: string;
  };
}

export const apiPatterns = ['query', 'graphql', 'api', 'rest', 'data', '/v1/', '/v2/'];

// Common selectors for username/email fields
export const usernameSelectors = [
  'input[name="username"]',
  'input[name="email"]',
  'input[type="email"]',
  'input[placeholder*="email" i]',
  'input[placeholder*="username" i]',
  'input[id*="email" i]',
  'input[id*="username" i]',
  'input[class*="email" i]',
  'input[class*="username" i]'
];

// Common selectors for password fields
export const passwordSelectors = [
  'input[name="password"]',
  'input[type="password"]',
  'input[placeholder*="password" i]',
  'input[id*="password" i]',
  'input[class*="password" i]'
];

// Common selectors for login buttons
export const loginButtonSelectors = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button:has-text("Log in")',
  'button:has-text("Sign in")',
  'button:has-text("Login")',
  'button:has-text("Signin")',
  'a:has-text("Log in")',
  'a:has-text("Sign in")',
  '[role="button"]:has-text("Log in")',
  '[role="button"]:has-text("Sign in")'
];

export const successIndicators = [
  'Home',
  'Dashboard',
  'Profile',
  'Account',
  'Logout',
  'Sign out'
];