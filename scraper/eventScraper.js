import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrapes college/scout information from ECNL event pages
 */
class ECNLEventScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser and page
   */
  async init() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to false to see what's happening
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();

    // Set user agent to avoid being blocked
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
  }

  /**
   * Scrape college list from event page
   * @param {string} eventUrl - The event college list URL
   */
  async scrapeCollegeList(eventUrl) {
    try {
      console.log(`📄 Navigating to: ${eventUrl}`);

      // Navigate to the page
      await this.page.goto(eventUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('⏳ Waiting for content to load...');

      // Wait a bit for JavaScript to load content
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try different selectors that might contain college data
      console.log('🔍 Searching for college data...');

      // Take screenshot for debugging
      await this.page.screenshot({
        path: path.join(__dirname, '../debug_screenshot.png'),
        fullPage: true
      });
      console.log('📸 Screenshot saved to debug_screenshot.png');

      // Get the page HTML to inspect
      const html = await this.page.content();

      // Save HTML for inspection
      fs.writeFileSync(
        path.join(__dirname, '../debug_page.html'),
        html
      );
      console.log('💾 Page HTML saved to debug_page.html');

      // Try to find college data - common selectors
      const possibleSelectors = [
        'table',
        '.college-list',
        '.college-item',
        '[class*="college"]',
        '[class*="College"]',
        '[class*="scout"]',
        '[class*="Scout"]',
        'tbody tr',
        '.data-table',
        '[role="table"]'
      ];

      let colleges = [];

      // Try each selector
      for (const selector of possibleSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);

            // Extract text from elements
            const data = await this.page.evaluate((sel) => {
              const elements = document.querySelectorAll(sel);
              return Array.from(elements).map(el => ({
                text: el.textContent?.trim(),
                html: el.innerHTML,
                className: el.className
              }));
            }, selector);

            console.log(`Sample data for ${selector}:`, data.slice(0, 2));
          }
        } catch (e) {
          // Selector didn't work, continue
        }
      }

      // Try to extract table data specifically
      const tableData = await this.page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        const results = [];

        tables.forEach((table, tableIndex) => {
          const rows = table.querySelectorAll('tr');
          const tableRows = [];

          rows.forEach((row) => {
            const cells = row.querySelectorAll('td, th');
            const rowData = Array.from(cells).map(cell => cell.textContent?.trim());
            if (rowData.length > 0) {
              tableRows.push(rowData);
            }
          });

          if (tableRows.length > 0) {
            results.push({
              tableIndex,
              rows: tableRows
            });
          }
        });

        return results;
      });

      console.log('\n📊 Table data found:', JSON.stringify(tableData, null, 2));

      // Try to find any list items
      const listData = await this.page.evaluate(() => {
        const items = document.querySelectorAll('li, .item, [class*="item"]');
        return Array.from(items)
          .map(item => item.textContent?.trim())
          .filter(text => text && text.length > 0 && text.length < 200);
      });

      if (listData.length > 0) {
        console.log('\n📝 List items found (first 10):', listData.slice(0, 10));
      }

      // Look for API calls that might contain the data
      console.log('\n🔍 Checking for API calls...');
      const apiCalls = await this.page.evaluate(() => {
        // Get all fetch/XHR requests from window.performance
        const resources = performance.getEntriesByType('resource');
        return resources
          .filter(r => r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest')
          .map(r => r.name);
      });

      console.log('📡 API calls detected:', apiCalls);

      return {
        colleges,
        tableData,
        listData,
        apiCalls,
        debug: {
          screenshot: 'debug_screenshot.png',
          html: 'debug_page.html'
        }
      };

    } catch (error) {
      console.error('❌ Error scraping page:', error.message);
      throw error;
    }
  }

  /**
   * Save results to JSON file
   */
  saveResults(data, filename = 'college_list.json') {
    const outputPath = path.join(__dirname, '..', 'data', filename);

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n✅ Results saved to: ${outputPath}`);
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('👋 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const scraper = new ECNLEventScraper();

  try {
    await scraper.init();

    // The target URL
    const eventUrl = 'https://public.totalglobalsports.com/public/event/4046/college-list';

    console.log('\n🎯 Starting ECNL Event Scraper');
    console.log('================================\n');

    const results = await scraper.scrapeCollegeList(eventUrl);

    scraper.saveResults(results);

    console.log('\n✨ Scraping complete!');
    console.log('\nNext steps:');
    console.log('1. Check debug_screenshot.png to see what the page looks like');
    console.log('2. Check debug_page.html to inspect the page source');
    console.log('3. Review data/college_list.json for extracted data');
    console.log('4. We may need to adjust the scraper based on the page structure\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await scraper.close();
  }
}

// Run the scraper
main();
