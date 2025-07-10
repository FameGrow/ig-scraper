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

  await page.setExtraHTTPHeaders({
    'Cookie': 'sessionid=75690622525%3ABiN2tMUSO9Zf8Z%3A12%3AAYcOXaZaDL7jyUOrfFK2ynrqLYW7jw3eZzh5_4EBGw;'
  });

  try {
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article', { timeout: 15000 });

    const data = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('article img'));
      return imgs.map(img => img.src);
    });

    await browser.close();
    res.json({ username, posts: data });
  } catch (error) {
    await browser.close();
    res.status(404).json({ error: 'Failed to fetch data from Instagram', status: 404 });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});