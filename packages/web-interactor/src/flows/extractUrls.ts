import { Page } from "playwright";
import { processUrlsWithConcurrency } from "../operations/scrapeNetworkCalls";
import { get } from "http";


export async function processNetworkCallsExtraction(page: Page, url: string) {
    let networkCalls = null;
    try{
        const baseUrl = getBaseUrl(url);
        const domain = getDomainName(baseUrl);
        console.log("domain: ", domain);
        console.log("baseUrl: ", baseUrl);
        const scrapingUrls = await extractClickableUrls(page, domain);
        
        scrapingUrls.push(baseUrl);
        if(scrapingUrls.length > 0){
            const filteredUrls = scrapingUrls.filter(url => !url.includes('signup'));
            networkCalls = await processUrlsWithConcurrency(page, filteredUrls, 2, domain);
        }
    }catch(error){
        console.error("Error processing URL extraction:", error);
    }
    return networkCalls;
}

async function extractClickableUrls(page: Page, domain: string): Promise<string[]> {
    try {
        console.log("Extracting clickable URLs from the page...");
        const urls = await page.evaluate((targetDomain: string) => {
            // Helper function to validate URLs
            const isValidDomainUrl = (url: string): boolean => {
                try {
                    const urlObj = new URL(url);
                    return urlObj.hostname.includes(targetDomain) &&
                           !url.startsWith('javascript:') &&
                           !url.startsWith('mailto:') &&
                           !url.startsWith('tel:') &&
                           !url.startsWith('#');
                } catch {
                    return false;
                }
            };

            // Get URLs from anchor tags
            const anchorUrls = Array.from(document.querySelectorAll('a'))
                .map(anchor => anchor.href)
                .filter(href => href && isValidDomainUrl(href));

            // Get URLs from buttons
            const buttonUrls = Array.from(document.querySelectorAll('button'))
                .map(button => {
                    // Check various attributes that might contain URLs
                    const onclick = button.getAttribute('onclick');
                    const dataUrl = button.getAttribute('data-url');
                    const href = button.getAttribute('href');
                    
                    // Return the first valid URL found
                    if (href && isValidDomainUrl(href)) return href;
                    if (dataUrl && isValidDomainUrl(dataUrl)) return dataUrl;
                    
                    // Extract URL from onclick if it exists
                    if (onclick) {
                        const match = onclick.match(/['"]([^'"]${targetDomain.replace('.', '\\.')}[^'"]*)['"]/);
                        return match ? match[1] : null;
                    }
                    
                    return null;
                })
                .filter((url): url is string => url !== null && isValidDomainUrl(url));

            // Combine and return all URLs
            return [...anchorUrls, ...buttonUrls];
        }, domain);

        console.log(`Extracted ${urls.length} Website's URLs.`);
        
        // Remove duplicates and return
        const uniqueUrls = Array.from(new Set(urls));
        console.log('Unique Website URLs:', uniqueUrls);
        
        return uniqueUrls;
    } catch (error) {
        console.error(`Error extracting URLs: ${error}`);
        throw error;
    }
}

const getDomainName = (url: string): string => {
    try {
        const hostname = new URL(url).hostname;
        // Match patterns like instagram.com, linkedin.com, facebook.com
        const matches = hostname.match(/(?:www\.)?([^.]+\.(?:com|net|org))/i);
        return matches ? matches[1] : hostname;
    } catch (error) {
        console.error("Error extracting domain:", error);
        return "";
    }
};

const getBaseUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const comIndex = urlObj.href.indexOf('.com');
        return comIndex !== -1 ? urlObj.href.slice(0, comIndex + 4) : urlObj.href;
    } catch (error) {
        console.error("Error extracting base URL:", error);
        return "";
    }
};