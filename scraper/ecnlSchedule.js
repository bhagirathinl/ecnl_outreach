import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrape ECNL schedule for MVLA 2010 Boys
 */
async function scrapeECNLSchedule() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    console.log('🚀 Navigating to ECNL Boys Schedule...\n');

    // Try the main schedule page
    await page.goto('https://theecnl.com/sports/ecnl-boys/schedule/2025-26', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../ecnl_main_schedule.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: ecnl_main_schedule.png\n');

    // Search for MVLA or 2010
    console.log('🔍 Searching for MVLA 2010 Boys...\n');

    const results = await page.evaluate(() => {
      const searchTerms = ['MVLA', 'Mountain View', 'Los Altos', '2010', 'B2010'];
      const found = [];

      // Get all links that might be schedule links
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent;
        const href = link.href;

        searchTerms.forEach(term => {
          if (text.includes(term) || href.includes(term)) {
            found.push({
              text: text.trim().substring(0, 100),
              href: href,
              matchedTerm: term
            });
          }
        });
      });

      // Also search all text content
      const allText = document.body.innerText;
      const hasAnyMatch = searchTerms.some(term => allText.includes(term));

      return {
        links: found,
        pageHasMatches: hasAnyMatch,
        pageTitle: document.title
      };
    });

    console.log(`Page Title: ${results.pageTitle}`);
    console.log(`Page contains MVLA/2010 text: ${results.pageHasMatches}\n`);

    if (results.links.length > 0) {
      console.log(`✅ Found ${results.links.length} matching links:\n`);
      results.links.forEach((link, idx) => {
        console.log(`[${idx + 1}] ${link.text}`);
        console.log(`    Matched: "${link.matchedTerm}"`);
        console.log(`    URL: ${link.href}\n`);
      });

      // Save results
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(dataDir, 'schedule_links.json'),
        JSON.stringify(results.links, null, 2)
      );
      console.log('💾 Links saved to data/schedule_links.json\n');
    } else {
      console.log('❌ No direct matches found on this page.\n');
      console.log('💡 The schedule might be organized differently. Suggestions:\n');
      console.log('   1. Check if MVLA participates in ECNL Boys');
      console.log('   2. Try searching for specific event/showcase names');
      console.log('   3. Look for Phoenix-specific event schedules\n');

      // Get all event/showcase links
      const eventLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('a');
        return Array.from(links)
          .filter(a => {
            const text = a.textContent.toLowerCase();
            const href = a.href.toLowerCase();
            return (text.includes('phoenix') || text.includes('phx') ||
                   text.includes('arizona') || text.includes('az') ||
                   href.includes('phoenix') || href.includes('phx'));
          })
          .map(a => ({
            text: a.textContent.trim(),
            href: a.href
          }))
          .slice(0, 10);
      });

      if (eventLinks.length > 0) {
        console.log('🌵 Found Phoenix/Arizona related links:\n');
        eventLinks.forEach((link, idx) => {
          console.log(`[${idx + 1}] ${link.text}`);
          console.log(`    ${link.href}\n`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

scrapeECNLSchedule();
