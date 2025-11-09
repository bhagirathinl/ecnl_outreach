import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrape Total Global Sports event schedule for MVLA B10
 */
async function scrapeTGSSchedule() {
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

    console.log('🚀 Exploring Total Global Sports Event 4046...\n');

    // Event base URL
    const eventBaseUrl = 'https://public.totalglobalsports.com/public/event/4046';

    // Try different endpoints
    const endpoints = [
      '/schedules',
      '/schedule',
      '/games',
      '/bracket',
      '/brackets',
      '/standings',
      '/teams'
    ];

    const validPages = [];

    for (const endpoint of endpoints) {
      const url = eventBaseUrl + endpoint;
      console.log(`📄 Trying: ${url}`);

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 15000
        });

        if (response.status() === 200) {
          console.log(`   ✅ Page loaded successfully\n`);
          validPages.push(url);

          // Take screenshot
          await page.screenshot({
            path: path.join(__dirname, `../tgs_${endpoint.replace('/', '')}.png`)
          });

          // Wait a bit
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check for MVLA or B10 content
          const hasMatch = await page.evaluate(() => {
            const text = document.body.innerText;
            return text.includes('MVLA') || text.includes('B10') ||
                   text.includes('Mountain View') || text.includes('Los Altos') ||
                   text.includes('2010');
          });

          if (hasMatch) {
            console.log(`   🎯 Found MVLA/B10 references!\n`);

            // Extract schedule data
            const scheduleData = await page.evaluate(() => {
              const results = [];
              const searchTerms = ['MVLA', 'B10', 'Mountain View', 'Los Altos', '2010'];

              // Look for schedule/game elements
              const rows = document.querySelectorAll('tr, .game, .match, [class*="schedule"], [class*="game"]');

              rows.forEach(row => {
                const text = row.textContent;
                const hasMatch = searchTerms.some(term => text.includes(term));

                if (hasMatch && text.length < 2000) {
                  // Try to parse game info
                  const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/);
                  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);

                  results.push({
                    text: text.trim(),
                    time: timeMatch ? timeMatch[0] : null,
                    date: dateMatch ? dateMatch[0] : null,
                    html: row.outerHTML.substring(0, 500)
                  });
                }
              });

              return results;
            });

            console.log(`   Found ${scheduleData.length} matching schedule items\n`);

            if (scheduleData.length > 0) {
              console.log('Sample matches:\n');
              scheduleData.slice(0, 5).forEach((item, idx) => {
                console.log(`[${idx + 1}] Date: ${item.date || 'N/A'} | Time: ${item.time || 'N/A'}`);
                console.log(`    ${item.text.substring(0, 100).replace(/\n/g, ' ')}\n`);
              });

              // Save to file
              const dataDir = path.join(__dirname, '..', 'data');
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              fs.writeFileSync(
                path.join(dataDir, `mvla_b10_schedule_${endpoint.replace('/', '')}.json`),
                JSON.stringify(scheduleData, null, 2)
              );
              console.log(`   💾 Saved to: data/mvla_b10_schedule_${endpoint.replace('/', '')}.json\n`);
            }
          }
        } else {
          console.log(`   ❌ Page returned status ${response.status()}\n`);
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }

    // Also check main event page for navigation links
    console.log('📄 Checking main event page for navigation...\n');
    await page.goto(eventBaseUrl + '/college-list', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a, button, [class*="menu"], [class*="nav"], [class*="tab"]');
      return Array.from(links)
        .filter(el => {
          const text = el.textContent.toLowerCase();
          return text.includes('schedule') || text.includes('game') ||
                 text.includes('bracket') || text.includes('standing') ||
                 text.includes('team');
        })
        .map(el => ({
          text: el.textContent.trim(),
          href: el.href || el.onclick?.toString() || '',
          tag: el.tagName
        }))
        .slice(0, 20);
    });

    if (navLinks.length > 0) {
      console.log('🔗 Found navigation elements:\n');
      navLinks.forEach((link, idx) => {
        console.log(`[${idx + 1}] ${link.text}`);
        if (link.href) console.log(`    ${link.href}`);
        console.log('');
      });
    }

    console.log('\n✅ Valid pages found:');
    validPages.forEach(url => console.log(`   - ${url}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

scrapeTGSSchedule();
