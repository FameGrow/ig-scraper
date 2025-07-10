import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setCookie({
      name: 'sessionid',
      value: '75690622525%3ABiN2tMUSO9Zf8Z%3A12%3AAYcOXaZaDL7jyUOrfFK2ynrqLYW7jw3eZzh5_4EBGw',
      domain: '.instagram.com',
      path: '/',
      httpOnly: true,
      secure: true
    });

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('article img', { timeout: 15000 });

    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article img')).map(img => img.src);
    });

    await browser.close();

    res.json({ username, posts: images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data from Instagram', status: 500 });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
