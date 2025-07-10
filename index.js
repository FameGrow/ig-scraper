const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'No username provided' });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });


    await page.waitForSelector('script[type="application/ld+json"]');
    const jsonLD = await page.$eval('script[type="application/ld+json"]', el => el.innerText);
    const profileData = JSON.parse(jsonLD);

    await browser.close();

    res.json({
      username: profileData.alternateName.replace('@', ''),
      fullName: profileData.name,
      bio: profileData.description,
      image: profileData.image,
      followers: extractFromText(profileData.description, /([\d,.]+)\sFollowers/),
      following: extractFromText(profileData.description, /([\d,.]+)\sFollowing/),
      posts: extractFromText(profileData.description, /([\d,.]+)\sPosts/)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

function extractFromText(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : null;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
