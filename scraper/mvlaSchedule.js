import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrape MVLA B10 schedule from Total Global Sports
 */
async function scrapeMVLASchedule() {
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

    console.log('🚀 Loading MVLA B10 Schedule...\n');

    const scheduleUrl = 'https://public.totalglobalsports.com/public/event/4046/schedules/34663';

    await page.goto(scheduleUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting for schedule to load...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../mvla_b10_schedule.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: mvla_b10_schedule.png\n');

    // Extract all schedule data
    const scheduleData = await page.evaluate(() => {
      const games = [];

      // Try to find all MVLA games
      const searchTerms = ['MVLA', 'Mountain View', 'Los Altos'];

      // Look for table rows, game containers, or schedule items
      const allRows = document.querySelectorAll('tr, .game, .match, [class*="schedule"], [class*="game"], [class*="row"]');

      allRows.forEach(row => {
        const text = row.textContent;

        // Check if this row contains MVLA
        const hasMVLA = searchTerms.some(term => text.includes(term));

        if (hasMVLA) {
          // Try to parse game details
          const game = {
            rawText: text.trim(),
            date: null,
            time: null,
            opponent: null,
            field: null,
            location: null
          };

          // Extract date (various formats)
          const dateMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)|(\w+ \d{1,2},? \d{4})|(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) game.date = dateMatch[0];

          // Extract time
          const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/);
          if (timeMatch) game.time = timeMatch[0];

          // Extract field/location
          const fieldMatch = text.match(/Field[:\s#]*(\d+|[A-Z])/i);
          if (fieldMatch) game.field = fieldMatch[0];

          // Try to extract opponent (text after vs, v., @, or against)
          const opponentMatch = text.match(/(?:vs\.?|v\.?|@|against)\s+([A-Za-z\s]+?)(?:\d|$|Field|Time)/i);
          if (opponentMatch) game.opponent = opponentMatch[1].trim();

          // Get all table cells if in a table
          const cells = row.querySelectorAll('td, th, [class*="cell"]');
          if (cells.length > 0) {
            game.cells = Array.from(cells).map(cell => cell.textContent.trim());
          }

          // Get HTML for debugging
          game.html = row.innerHTML.substring(0, 500);

          games.push(game);
        }
      });

      // Also get page title and any header info
      const pageInfo = {
        title: document.title,
        headers: []
      };

      const headers = document.querySelectorAll('h1, h2, h3, .title, .header, [class*="heading"]');
      headers.forEach(h => {
        const text = h.textContent.trim();
        if (text.length > 0 && text.length < 200) {
          pageInfo.headers.push(text);
        }
      });

      return {
        games,
        pageInfo
      };
    });

    console.log(`Page Title: ${scheduleData.pageInfo.title}\n`);

    if (scheduleData.pageInfo.headers.length > 0) {
      console.log('Page Headers:');
      scheduleData.pageInfo.headers.slice(0, 5).forEach(h => console.log(`  - ${h}`));
      console.log('');
    }

    console.log(`✅ Found ${scheduleData.games.length} MVLA games\n`);

    if (scheduleData.games.length > 0) {
      console.log('MVLA B10 SCHEDULE:\n');
      console.log('='.repeat(80) + '\n');

      scheduleData.games.forEach((game, idx) => {
        console.log(`Game ${idx + 1}:`);
        console.log(`  Date: ${game.date || 'TBD'}`);
        console.log(`  Time: ${game.time || 'TBD'}`);
        console.log(`  Opponent: ${game.opponent || 'See details'}`);
        console.log(`  Field: ${game.field || 'TBD'}`);

        if (game.cells && game.cells.length > 0) {
          console.log(`  Details: ${game.cells.join(' | ')}`);
        } else {
          console.log(`  Full text: ${game.rawText.substring(0, 150)}`);
        }
        console.log('');
      });

      // Save to file
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(dataDir, 'mvla_b10_schedule.json'),
        JSON.stringify(scheduleData.games, null, 2)
      );

      console.log('💾 Schedule saved to: data/mvla_b10_schedule.json\n');

      // Create a clean summary
      const summary = {
        eventName: scheduleData.pageInfo.title,
        team: 'MVLA B10 (2010 Boys)',
        totalGames: scheduleData.games.length,
        games: scheduleData.games.map((g, idx) => ({
          gameNumber: idx + 1,
          date: g.date,
          time: g.time,
          opponent: g.opponent,
          field: g.field,
          rawDetails: g.rawText.substring(0, 200)
        }))
      };

      fs.writeFileSync(
        path.join(dataDir, 'mvla_b10_schedule_summary.json'),
        JSON.stringify(summary, null, 2)
      );

      console.log('📋 Clean summary saved to: data/mvla_b10_schedule_summary.json\n');

    } else {
      console.log('⚠️  No MVLA games found on this page.');
      console.log('   The page might be for a different team or age group.\n');

      // Get all text to see what's on the page
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page preview (first 500 chars):');
      console.log(pageText.substring(0, 500));
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('👋 Browser closed\n');
  }
}

scrapeMVLASchedule();
