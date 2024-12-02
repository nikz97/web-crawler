import { Page, Route, Request } from 'playwright';
import { apiPatterns, NetworkCall } from '../types/types';

export async function processUrlsWithConcurrency(
    page: Page, 
    urls: string[], 
    maxConcurrent: number = 3,
    domain: string
): Promise<NetworkCall[]> {
    const results: NetworkCall[] = [];
    const chunks: string[][] = [];
    console.log("urls: ", urls);
    for (let i = 0; i < urls.length; i += maxConcurrent) {
        chunks.push(urls.slice(i, i + maxConcurrent));
        if(i/maxConcurrent === 3){
            break;
        }
    }

    for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (url: string) => {
            
            const context = page.context();
            await page.waitForTimeout(1000);
            const newPage = await context.newPage();
            await page.waitForTimeout(1000);
            try {
                await newPage.setExtraHTTPHeaders({
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                });
                console.log("created new page");
            
                // Set up response listener before navigation
                newPage.on('response', async (response) => {
                    const responseUrl = response.url().toLowerCase();
                    if (apiPatterns.some(pattern => responseUrl.includes(pattern))) {
                        try {
                            const contentType = response.headers()['content-type'] || '';
                            let responseBody;
                            
                            try {
                                if (contentType.includes('application/json')) {
                                    responseBody = await response.json();
                                } else {
                                    responseBody = await response.text();
                                    console.log(`Unknown content type: ${contentType}`);
                                }
                            } catch (error) {
                                console.error(`Error parsing response: ${error}`);
                                responseBody = await response.text();
                            }
    
                            const request = response.request();
                            const networkCall: NetworkCall = {
                                url: request.url(),
                                method: request.method(),
                                headers: request.headers(),
                                resourceType: request.resourceType(),
                                postData: request.postData(),
                                response: {
                                    status: response.status(),
                                    statusText: response.statusText(),
                                    headers: response.headers(),
                                    body: responseBody
                                }
                            };
    
                            results.push(networkCall);
                        } catch (error) {
                            console.error(`Error processing response: ${error}`);
                        }
                    }
                });
    
                // Navigate and wait for page load
                await newPage.goto(url);
                await page.waitForTimeout(5000);
                await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
                console.log("Navigated to URL ", url);
                
                await newPage.waitForTimeout(3000);
            } catch (error) {
                console.error(`Error processing ${url}:`, error instanceof Error ? error.message : 'Unknown error');
            } finally {
                await newPage.close();
            }
        });

        await Promise.all(chunkPromises);
    }

    return results;
}