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

//Status codes as per the Leading reach
export const NEW_REFERRAL_STATUSES = ["209915", "323721", "323722"];
export const LAST_ONE_DAY = "-1 days";
export const LAST_ONE_WEEK = "-7 days";