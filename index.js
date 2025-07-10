const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'No username provided' });

  try {
    const response = await fetch(`https://www.instagram.com/{username}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': `csrftoken=PpJ2Uqdy7qBG6YOQxw7ElrCbSbeN9kxa; datr=qvFKalqazUpdVUwfS0vfG6_y; ds_user_id=75690622525; fbm_124024574287414=base_domain=.instagram.com; ig_did=1366CE9C-BE40-4054-8D2B-7D7297660F77; mid=aD9DFgALAAFaPTRMz-EPc8Oen6t3; oo=v1; rur="LDC\\05475690622525\\0541783678315:01fe802b85a16ad818688fcc6e7f7f177958ab16346049911297d68c17472c5becfb1fa0"; sessionid=75690622525%3ABiN2tMUSO9Zf8Z%3A12%3AAYcOXaZaDL7jyUOrfFK2ynrqLYW7jw3eZzh5_4EBGw; wd=150x924;`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch data from Instagram', status: response.status });
    }

    const data = await response.json();
    const user = data?.graphql?.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      username: user.username,
      fullName: user.full_name,
      bio: user.biography,
      image: user.profile_pic_url_hd,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts: user.edge_owner_to_timeline_media.count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
