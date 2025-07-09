const express = require('express');
const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 5040;

app.get('/profile', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ success: false, message: "Missing username" });

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    });

    const page = await browser.newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
    });

    const data = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="profile picture"]');
      const name = document.querySelector('h1')?.innerText || null;
      const description = document.querySelector('meta[name="description"]')?.content || null;
      return {
        image: img ? img.src : null,
        name,
        description
      };
    });

    if (!data.image) {
      return res.json({ success: false, message: "Profile image not found" });
    }

    res.json({ success: true, username, ...data });
  } catch (err) {
    console.error("Scraper error:", err);
    res.status(500).json({ success: false, message: "Scraper error" });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));
