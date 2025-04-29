const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

/**
 * Route : /proxy/public
 * Appel une API publique sans clé d'authentification
 */
app.get('/proxy/public', async (req, res) => {
  let rawUrl = req.query.url;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const url = decodeURIComponent(rawUrl);
    const query = { ...req.query };
    delete query.url;

    console.log(`[PUBLIC] → ${url} with params`, query);

    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (error) {
    console.error('[ERROR /proxy/public]', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message || 'Unknown error',
      data: error.response?.data || null
    });
  }
});

/**
 * Route : /proxy/secure
 * Appel une API sécurisée avec une clé API injectée dans la query
 */
app.get('/proxy/secure', async (req, res) => {
  let rawUrl = req.query.url;
  const authToken = req.query.auth_token;
  const authField = req.query.auth_field || 'apikey';

  if (!rawUrl || !authToken) {
    return res.status(400).json({ error: 'Missing url or auth_token' });
  }

  try {
    const url = decodeURIComponent(rawUrl);
    const query = { ...req.query };
    delete query.url;
    delete query.auth_token;
    delete query.auth_field;

    // Inject the token dynamically
    query[authField] = authToken;

    console.log(`[SECURE] → ${url} using ${authField}=**** with params`, query);

    const response = await axios.get(url, { params: query });
    res.json(response.data);
  } catch (error) {
    console.error('[ERROR /proxy/secure]', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message || 'Unknown error',
      data: error.response?.data || null
    });
  }
});
// ✅ Route de test de vie du serveur
app.get('/test', (req, res) => {
  res.json({ status: '🟢 Proxy Hishako actif', time: new Date().toISOString() });
});

// 🚀 Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});

