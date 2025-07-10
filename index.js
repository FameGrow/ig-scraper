const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/scrape', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const sessionid = process.env.SESSIONID || '';
  if (!sessionid) {
    return res.status(500).json({ error: 'SESSIONID not set in env' });
  }

  await page.setExtraHTTPHeaders({
    'Cookie': `sessionid=${sessionid};`
  });

  try {
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article', { timeout: 15000 });

    const data = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('article a').forEach(a => {
        const img = a.querySelector('img');
        if (img) images.push({ url: location.origin + a.getAttribute('href'), thumb: img.src });
      });
      return images;
    });

    await browser.close();
    res.json({ username, posts: data });
  } catch (error) {
    await browser.close();
    res.status(500).json({ error: 'Failed to fetch posts', detail: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});