// src\web-scraper.js
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function webScraper(url) {

    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--ignore-certificate-errors');

    // Initialize the Chrome driver
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the specified URL
        await driver.get(url);

        // Wait for content to load
        await driver.wait(until.elementLocated(By.css('body')), 10000);

        console.log('Extracting content...');
        const content = await driver.executeScript(`
            function extractText(element) {
                if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                    return '';
                }
                
                let text = '';
                for (let child of element.childNodes) {
                    if (child.nodeType === 3) { // Text node
                        text += child.textContent.trim() + ' ';
                    } else if (child.nodeType === 1) { // Element node
                        if (window.getComputedStyle(child).display !== 'none') {
                            text += extractText(child) + ' ';
                        }
                    }
                }
                return text.trim();
            }
            return extractText(document.body);
        `);

        if (!content) {
            throw new Error('No content extracted');
        }

        console.log('Content length:', content.length);
        return content;

    } catch (error) {
        console.error('Error during scraping:', error);
        throw error; // Rethrow the error to handle it in the calling function
    } finally {
        // Quit the driver
        await driver.quit();
    }
}

// Export the function
module.exports = webScraper;