const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

/**
 * Appel d'une API publique sans authentification
 * Requête vers /proxy/public
 */
app.get('/proxy/public', async (req, res) => {
  const { url, ...query } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message || 'Unknown error',
      details: error.response?.data || null
    });
  }
});

/**
 * Appel d'une API sécurisée avec clé API
 * Requête vers /proxy/secure
 */
app.get('/proxy/secure', async (req, res) => {
  const { url, auth_token, auth_field = 'apikey', ...query } = req.query;

  if (!url || !auth_token) {
    return res.status(400).json({ error: 'Missing URL or auth_token' });
  }

  // Injecte dynamiquement la clé dans la query string
  query[auth_field] = auth_token;

  try {
    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message || 'Unknown error',
      details: error.response?.data || null
    });
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
