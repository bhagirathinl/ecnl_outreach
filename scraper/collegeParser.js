import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrapes and parses college/scout information from ECNL event pages
 */
class CollegeScoutScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
  }

  /**
   * Scrape and parse college list from Total Global Sports event page
   */
  async scrapeCollegeList(eventUrl) {
    try {
      console.log(`\n📄 Navigating to: ${eventUrl}`);

      await this.page.goto(eventUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('⏳ Waiting for content to load...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Extract college data using page evaluation
      console.log('🔍 Extracting college and coach data...\n');

      const colleges = await this.page.evaluate(() => {
        const collegeRows = document.querySelectorAll('.college-attendance-row');
        const results = [];

        collegeRows.forEach((row) => {
          try {
            const college = {};

            // Extract college name
            const nameEl = row.querySelector('.font-s18.font-w600 span');
            college.name = nameEl ? nameEl.textContent.trim() : '';

            // Extract division
            const divElements = row.querySelectorAll('div');
            for (const div of divElements) {
              const text = div.textContent;
              if (text.includes('Division:')) {
                college.division = text.replace('Division:', '').trim();
              }
              if (text.includes('Conference:')) {
                college.conference = text.replace('Conference:', '').trim();
              }
              if (text.includes('Location:')) {
                college.location = text.replace('Location:', '').trim();
              }
              if (text.includes('Type:')) {
                college.type = text.replace('Type:', '').trim();
              }
            }

            // Extract website
            const websiteEl = row.querySelector('a.no-decoration');
            college.website = websiteEl ? websiteEl.href : '';

            // Extract coaches
            college.coaches = [];
            const coachDivs = row.querySelectorAll('.col-lg-3');

            coachDivs.forEach((coachDiv) => {
              const coach = {};
              const centerDivs = coachDiv.querySelectorAll('.text-center.valign-middle');

              if (centerDivs.length >= 3) {
                // centerDivs[0] is the image div, skip it
                // centerDivs[1] has the coach name
                // centerDivs[2] has the title
                coach.name = centerDivs[1].textContent.trim();
                coach.title = centerDivs[2].textContent.trim();

                // Email link
                const emailLink = coachDiv.querySelector('a[href^="mailto:"]');
                if (emailLink) {
                  const email = emailLink.href.replace('mailto:', '');
                  // Only add email if it's not empty
                  if (email && email.length > 0) {
                    coach.email = email;
                  }
                }

                if (coach.name && coach.title) {
                  college.coaches.push(coach);
                }
              }
            });

            if (college.name) {
              results.push(college);
            }
          } catch (e) {
            console.error('Error parsing college row:', e);
          }
        });

        return results;
      });

      console.log(`✅ Found ${colleges.length} colleges\n`);

      // Display summary
      colleges.slice(0, 5).forEach(college => {
        console.log(`📚 ${college.name}`);
        console.log(`   Division: ${college.division || 'N/A'}`);
        console.log(`   Location: ${college.location || 'N/A'}`);
        console.log(`   Coaches: ${college.coaches.length}`);
        college.coaches.forEach(coach => {
          console.log(`      - ${coach.name} (${coach.title})${coach.email ? ' - ' + coach.email : ''}`);
        });
        console.log('');
      });

      if (colleges.length > 5) {
        console.log(`   ... and ${colleges.length - 5} more colleges\n`);
      }

      return colleges;

    } catch (error) {
      console.error('❌ Error scraping page:', error.message);
      throw error;
    }
  }

  /**
   * Scrape ECNL event schedule
   */
  async scrapeECNLSchedule(eventUrl, ageGroup = '2010', teamName = 'MVLA') {
    try {
      console.log(`\n📄 Navigating to ECNL event: ${eventUrl}`);

      await this.page.goto(eventUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('⏳ Waiting for schedule to load...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Take screenshot for debugging
      await this.page.screenshot({
        path: path.join(__dirname, '../ecnl_schedule_screenshot.png'),
        fullPage: true
      });
      console.log('📸 Screenshot saved to ecnl_schedule_screenshot.png');

      console.log(`🔍 Searching for ${ageGroup} Boys / ${teamName} games...\n`);

      const games = await this.page.evaluate((age, team) => {
        const results = [];
        const searchTerms = [age, 'B' + age, team, 'Mountain View', 'Los Altos'];

        // Search all text content
        const allElements = document.querySelectorAll('*');

        allElements.forEach((element) => {
          const text = element.textContent;

          // Check if element contains any search terms
          const hasMatch = searchTerms.some(term =>
            text && text.includes(term)
          );

          if (hasMatch && text.length < 1000 && text.length > 10) {
            // Try to find schedule-like patterns
            const hasTime = /\d{1,2}:\d{2}/.test(text);
            const hasDate = /\d{1,2}\/\d{1,2}/.test(text) || /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(text);
            const hasVs = /vs\.?|v\.?|@/.test(text);

            results.push({
              raw: text.trim(),
              hasTime,
              hasDate,
              hasVs,
              tagName: element.tagName,
              className: element.className,
              relevance: (hasTime ? 2 : 0) + (hasDate ? 2 : 0) + (hasVs ? 1 : 0)
            });
          }
        });

        // Sort by relevance
        return results
          .sort((a, b) => b.relevance - a.relevance)
          .filter((item, index, self) =>
            // Remove duplicates
            index === self.findIndex(t => t.raw === item.raw)
          );
      }, ageGroup, teamName);

      console.log(`✅ Found ${games.length} potential game references\n`);

      if (games.length > 0) {
        console.log('Most relevant results:\n');
        games.slice(0, 15).forEach((game, idx) => {
          console.log(`[${idx + 1}] Relevance: ${game.relevance} | Time: ${game.hasTime} | Date: ${game.hasDate}`);
          console.log(`    Tag: <${game.tagName}> Class: ${game.className}`);
          console.log(`    ${game.raw.substring(0, 150).replace(/\n/g, ' ')}`);
          console.log('');
        });
      } else {
        console.log('❌ No matches found. Checking page structure...\n');

        // Get page links to help navigate
        const links = await this.page.evaluate(() => {
          const allLinks = document.querySelectorAll('a');
          return Array.from(allLinks)
            .filter(a => a.textContent.includes('Schedule') || a.textContent.includes('schedule') ||
                        a.href.includes('schedule') || a.href.includes('bracket'))
            .map(a => ({
              text: a.textContent.trim(),
              href: a.href
            }));
        });

        if (links.length > 0) {
          console.log('Found schedule-related links:');
          links.slice(0, 10).forEach(link => {
            console.log(`  - ${link.text}: ${link.href}`);
          });
        }
      }

      return games;

    } catch (error) {
      console.error('❌ Error scraping ECNL schedule:', error.message);
      throw error;
    }
  }

  /**
   * Save results to JSON file
   */
  saveResults(data, filename) {
    const outputPath = path.join(__dirname, '..', 'data', filename);
    const dataDir = path.join(__dirname, '..', 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n👋 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const scraper = new CollegeScoutScraper();

  try {
    await scraper.init();

    console.log('\n🎯 ECNL Scout Outreach Data Scraper');
    console.log('=====================================\n');

    // 1. Scrape college/scout list
    console.log('STEP 1: Scraping College/Scout List');
    console.log('------------------------------------');
    const scoutListUrl = 'https://public.totalglobalsports.com/public/event/4046/college-list';
    const colleges = await scraper.scrapeCollegeList(scoutListUrl);
    scraper.saveResults(colleges, 'colleges_attending.json');

    // 2. Scrape ECNL event schedule for 2010 Boys
    console.log('\n\nSTEP 2: Scraping ECNL Event Schedule (2010 Boys)');
    console.log('--------------------------------------------------');
    const eventUrl = 'https://theecnl.com/sports/2025/7/31/25%20B%20PHX.aspx';
    const games = await scraper.scrapeECNLSchedule(eventUrl, '2010', 'MVLA');
    scraper.saveResults(games, 'mvla_2010_schedule.json');

    console.log('\n\n✨ Scraping complete!');
    console.log('\n📊 Summary:');
    console.log(`   - ${colleges.length} colleges identified`);
    console.log(`   - ${games.length} MVLA 2010 Boys game references found`);
    console.log('\n📁 Output files:');
    console.log('   - data/colleges_attending.json');
    console.log('   - data/mvla_2010_schedule.json');
    console.log('   - ecnl_schedule_screenshot.png (for debugging)\n');

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
  } finally {
    await scraper.close();
  }
}

main();
