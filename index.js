const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/proxy/public', async (req, res) => {
  const { url, ...query } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing URL param' });

  try {
    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

app.get('/proxy/secure', async (req, res) => {
  const { url, auth_token, auth_field = 'apikey', ...query } = req.query;
  if (!url || !auth_token) return res.status(400).json({ error: 'Missing URL or token' });

  // Inject key into query
  query[auth_field] = auth_token;

  try {
    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
