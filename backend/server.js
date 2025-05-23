const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const tokens = new Map();

// Route racine
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend de Notifications Météo</h1>
    <p>Le serveur fonctionne correctement</p>
    <h2>Endpoints disponibles :</h2>
    <ul>
      <li><b>POST /register</b> - Enregistrer un token</li>
      <li><b>POST /send-alert</b> - Envoyer une notification</li>
    </ul>
  `);
});

app.post('/register', (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ error: 'UserId et Token requis' });
  }
  tokens.set(userId, token);
  res.status(200).json({ message: 'Token enregistré' });
});

app.post('/send-alert', async (req, res) => {
  const { userId, alert } = req.body;
  const token = tokens.get(userId);

  if (!token) {
    return res.status(404).json({ error: 'Token non trouvé' });
  }

  const message = {
    notification: {
      title: alert.title || 'Alerte Météo',
      body: alert.message
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur d\'envoi' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});