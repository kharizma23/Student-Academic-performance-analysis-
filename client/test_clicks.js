const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const logs = [];
    page.on('console', msg => logs.push(`CONSOLE [${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => logs.push(`PAGE ERROR: ${err.message}`));
    page.on('requestfailed', request => logs.push(`FETCH FAILED: ${request.url()} - ${request.failure().errorText}`));
    page.on('response', response => {
        if (!response.ok()) {
            logs.push(`FETCH STATUS ${response.status()}: ${response.url()}`);
        }
    });

    try {
        // Navigate to local student page
        await page.goto('http://localhost:3001/student', { waitUntil: 'networkidle' });

        // Log in if needed
        if (page.url().includes('login') || await page.locator('input[type="email"]').count() > 0) {
            await page.fill('input[type="email"]', 'ananya.aiml25@gmail.com');
            await page.fill('input[type="password"]', 'Ananya#1019!');
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle' });
        }

        logs.push("Waiting for roadmap load...");
        await page.waitForTimeout(2000); // give it a sec to poll

        logs.push("Attempting to click Start Task...");
        const startButtons = page.locator('button:has-text("Start Task")');
        if (await startButtons.count() > 0) {
            await startButtons.first().click();
            await page.waitForTimeout(2000);
        } else {
            logs.push("No Start Task button found.");
        }

        logs.push("Attempting to click Reschedule...");
        const rescheduleButtons = page.locator('button:has-text("Reschedule")');
        if (await rescheduleButtons.count() > 0) {
            await rescheduleButtons.first().click();
            await page.waitForTimeout(2000);
        } else {
            logs.push("No Reschedule button found.");
        }

    } catch (err) {
        logs.push(`TEST SCRIPT ERROR: ${err.message}`);
    }

    fs.writeFileSync('browser_logs.txt', logs.join('\n'));
    await browser.close();
})();
