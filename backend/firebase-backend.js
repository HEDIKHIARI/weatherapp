require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialiser l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialiser Firebase Admin
try {
  // Option 1: Utiliser le fichier serviceAccountKey.json
  const serviceAccount = require('./serviceAccountKey.json');
  

  
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://weatherapp-a4506-default-rtdb.europe-west1.firebasedatabase.app/"
  });

  
}
module.exports = admin;
  
  console.log('✅ Firebase Admin initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur initialisation Firebase Admin:', error);
  console.error('Assurez-vous que serviceAccountKey.json existe dans le dossier backend');
  
  // Option 2: Essayer avec les variables d'environnement
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log('✅ Firebase Admin initialisé avec variables d\'environnement');
    } else {
      throw new Error('Variables d\'environnement Firebase manquantes');
    }
  } catch (envError) {
    console.error('❌ Impossible d\'initialiser Firebase Admin');
    process.exit(1);
  }
}

// Écouter les changements dans Firebase Realtime Database
const database = admin.database();
database.ref('stationData').on('value', async (snapshot) => {
  const data = snapshot.val();
  if (data) {
    console.log('📊 Nouvelles données depuis Firebase Realtime:', data);
    
    // Sauvegarder dans Firestore pour l'historique
    const db = admin.firestore();
    await db.collection('weatherData').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Vérifier les alertes
    await checkWeatherAlerts();
  }
});

console.log('👂 Écoute active sur stationData dans Realtime Database');

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend FCM opérationnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route pour enregistrer un token FCM
app.post('/register', async (req, res) => {
  try {
    const { userId, token, email, platform } = req.body;
    
    console.log('📱 Enregistrement token:', {
      userId,
      email,
      platform,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    });

    if (!userId || !token) {
      return res.status(400).json({ 
        error: 'userId et token sont requis' 
      });
    }

    // Sauvegarder dans Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userId).set({
      fcmToken: token,
      email: email || '',
      platform: platform || 'unknown',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✅ Token enregistré pour:', userId);
    
    res.json({ 
      success: true, 
      message: 'Token enregistré avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur enregistrement token:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Route pour envoyer une notification de test directe
app.post('/test-direct', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Token FCM requis' 
      });
    }

    console.log('🧪 Test notification directe vers token:', token.substring(0, 20) + '...');

    const message = {
      token: token,
      notification: {
        title: '🧪 Test Notification',
        body: 'Ceci est une notification de test envoyée directement à votre appareil'
      },
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'weather-alerts',
          sound: 'default',
          priority: 'high',
          vibrateTimingsMillis: [200, 500, 200]
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification envoyée:', response);

    res.json({ 
      success: true, 
      messageId: response,
      message: 'Notification de test envoyée' 
    });

  } catch (error) {
    console.error('❌ Erreur envoi notification:', error);
    res.status(500).json({ 
      error: 'Erreur envoi notification',
      details: error.message 
    });
  }
});

// Route pour envoyer une notification de test à un utilisateur
app.get('/test-notification/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🧪 Test notification pour utilisateur:', userId);

    // Récupérer le token de l'utilisateur
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    const userData = userDoc.data();
    const token = userData.fcmToken;

    if (!token) {
      return res.status(400).json({ 
        error: 'Aucun token FCM pour cet utilisateur' 
      });
    }

    // Envoyer la notification
    const message = {
      token: token,
      notification: {
        title: '🧪 Test Weather Station',
        body: 'Les notifications fonctionnent correctement!'
      },
      data: {
        type: 'TEST',
        userId: userId
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'weather-alerts'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification test envoyée:', response);

    res.json({ 
      success: true, 
      messageId: response 
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

app.get('/debug-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    res.json({
      userId: userId,
      tokenLength: userData.fcmToken ? userData.fcmToken.length : 0,
      tokenPreview: userData.fcmToken ? userData.fcmToken.substring(0, 50) + '...' : 'null',
      tokenFull: userData.fcmToken,
      lastUpdated: userData.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour lister tous les utilisateurs (DEBUG)
app.get('/debug-users', async (req, res) => {
  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        hasToken: !!data.fcmToken,
        tokenLength: data.fcmToken ? data.fcmToken.length : 0,
        email: data.email,
        platform: data.platform,
        lastUpdated: data.lastUpdated
      });
    });
    
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour envoyer une alerte météo
app.post('/send-alert', async (req, res) => {
  try {
    const { userId, alert } = req.body;
    
    if (!userId || !alert) {
      return res.status(400).json({ 
        error: 'userId et alert sont requis' 
      });
    }

    console.log('🌦️ Envoi alerte météo:', alert.title);

    // Récupérer le token
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé' 
      });
    }

    const token = userDoc.data().fcmToken;
    if (!token) {
      return res.status(400).json({ 
        error: 'Aucun token FCM' 
      });
    }

    // Créer le message
    const message = {
      token: token,
      notification: {
        title: alert.title,
        body: alert.message
      },
      data: alert.data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'weather-alerts',
          sound: 'default',
          color: '#FF5722',
          icon: 'ic_stat_icon_config_sample'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Alerte envoyée:', response);

    res.json({ 
      success: true, 
      messageId: response 
    });

  } catch (error) {
    console.error('❌ Erreur envoi alerte:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Route pour envoyer une notification à tous les utilisateurs
app.post('/broadcast', async (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ 
        error: 'title et body sont requis' 
      });
    }

    console.log('📢 Broadcast:', title);

    // Récupérer tous les tokens
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get();

    const tokens = [];
    usersSnapshot.forEach(doc => {
      const token = doc.data().fcmToken;
      if (token) tokens.push(token);
    });

    if (tokens.length === 0) {
      return res.status(404).json({ 
        error: 'Aucun utilisateur avec token FCM' 
      });
    }

    console.log(`📤 Envoi à ${tokens.length} appareils`);

    // Envoyer à tous les tokens
    const message = {
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'weather-alerts'
        }
      }
    };

    const response = await admin.messaging().sendMulticast({
      ...message,
      tokens: tokens
    });

    console.log('✅ Broadcast terminé:', {
      success: response.successCount,
      failure: response.failureCount
    });

    res.json({ 
      success: true,
      stats: {
        total: tokens.length,
        success: response.successCount,
        failure: response.failureCount
      }
    });

  } catch (error) {
    console.error('❌ Erreur broadcast:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Fonction pour vérifier les conditions météo et envoyer des alertes
async function checkWeatherAlerts() {
  console.log('🔍 Vérification des conditions météo...');
  
  try {
    const db = admin.firestore();
    
    // Récupérer les dernières données météo
    const weatherSnapshot = await db.collection('weatherData')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (weatherSnapshot.empty) {
      console.log('❌ Aucune donnée météo disponible');
      return;
    }
    
    const weatherData = weatherSnapshot.docs[0].data();
    console.log('📊 Données météo actuelles:', weatherData);
    
    // Récupérer tous les utilisateurs avec un token FCM
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get();
    
    // Vérifier chaque condition d'alerte
    const alerts = [];
    
    // Alerte température élevée
    if (weatherData.temperature > 35) {
      alerts.push({
        type: 'HIGH_TEMPERATURE',
        title: '🌡️ Alerte Température Élevée',
        body: `La température a atteint ${weatherData.temperature}°C`,
        severity: 'high',
        data: {
          temperature: weatherData.temperature.toString(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Alerte gel
    if (weatherData.temperature < 0) {
      alerts.push({
        type: 'FROST_ALERT',
        title: '❄️ Alerte Gel',
        body: `Température de ${weatherData.temperature}°C - Risque de gel`,
        severity: 'extreme',
        data: {
          temperature: weatherData.temperature.toString(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Alerte pluie
    if (weatherData.rainfall > 20) {
      alerts.push({
        type: 'EXTREME_RAIN',
        title: '🌧️ Alerte Pluie Intense',
        body: `Précipitations de ${weatherData.rainfall} mm/h détectées`,
        severity: 'high',
        data: {
          rainfall: weatherData.rainfall.toString(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Alerte vent
    if (weatherData.windSpeed > 50) {
      alerts.push({
        type: 'HIGH_WIND',
        title: '💨 Alerte Vents Violents',
        body: `Vents de ${weatherData.windSpeed} km/h détectés`,
        severity: 'extreme',
        data: {
          windSpeed: weatherData.windSpeed.toString(),
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Envoyer les alertes
    if (alerts.length > 0) {
      console.log(`📢 ${alerts.length} alerte(s) à envoyer`);
      
      const tokens = [];
      usersSnapshot.forEach(doc => {
        const token = doc.data().fcmToken;
        if (token) tokens.push(token);
      });

      // Vérification si des tokens existent
      if (tokens.length === 0) {
        console.log('⚠️ Aucun utilisateur avec token FCM trouvé');
        return;
      }
      
      for (const alert of alerts) {
        const message = {
          notification: {
            title: alert.title,
            body: alert.body
          },
          data: {
            ...alert.data,
            type: alert.type,
            severity: alert.severity
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'weather-alerts',
              sound: 'default',
              priority: 'high',
              vibrateTimingsMillis: [200, 500, 200]
            }
          }
        };
        
        // Envoyer individuellement car sendMulticast peut causer des erreurs 404
        let successCount = 0;
        let failureCount = 0;

        for (const token of tokens) {
          try {
            const individualMessage = { ...message, token };
            await admin.messaging().send(individualMessage);
            successCount++;
            console.log(`✅ Notification envoyée à ${token.substring(0, 20)}...`);
          } catch (error) {
            console.error(`❌ Erreur envoi à ${token.substring(0, 20)}...`, error.message);
            failureCount++;
          }
        }
        
        console.log(`✅ Alerte ${alert.type} envoyée:`, {
          success: successCount,
          failure: failureCount
        });
        
        // Sauvegarder l'alerte dans Firestore
        for (const userDoc of usersSnapshot.docs) {
          await db.collection('alerts').add({
            userId: userDoc.id,
            ...alert,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          });
        }
      }
    } else {
      console.log('✅ Aucune condition d\'alerte détectée');
    }
    
  } catch (error) {
    console.error('❌ Erreur vérification alertes:', error);
  }
}

// Route pour recevoir les données de la station météo
app.post('/weather-data', async (req, res) => {
  try {
    const data = {
      ...req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Sauvegarder les données
    const db = admin.firestore();
    await db.collection('weatherData').add(data);
    console.log('📊 Nouvelles données météo reçues:', data);
    
    // Vérifier immédiatement les alertes
    await checkWeatherAlerts();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erreur sauvegarde données:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour simuler des conditions météo (pour les tests)
app.get('/simulate/:condition', async (req, res) => {
  const { condition } = req.params;
  
  const simulations = {
    hot: { temperature: 38, humidity: 45, windSpeed: 15, rainfall: 0 },
    cold: { temperature: -2, humidity: 80, windSpeed: 10, rainfall: 0 },
    rain: { temperature: 20, humidity: 90, windSpeed: 20, rainfall: 25 },
    wind: { temperature: 22, humidity: 60, windSpeed: 65, rainfall: 5 },
    normal: { temperature: 22, humidity: 60, windSpeed: 10, rainfall: 0 }
  };
  
  const data = simulations[condition];
  if (!data) {
    return res.status(400).json({ error: 'Condition invalide. Utilisez: hot, cold, rain, wind, normal' });
  }
  
  try {
    const db = admin.firestore();
    await db.collection('weatherData').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'simulation'
    });
    
    console.log(`🎮 Simulation "${condition}" créée:`, data);
    
    // Vérifier les alertes
    await checkWeatherAlerts();
    
    res.json({ 
      success: true, 
      message: `Simulation "${condition}" envoyée`,
      data: data
    });
  } catch (error) {
    console.error('❌ Erreur simulation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// Vérification périodique toutes les 5 minutes
setInterval(checkWeatherAlerts, 5 * 60 * 1000);

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 Backend FCM démarré !            ║
║                                       ║
║   Port: ${PORT}                          ║
║   URL: http://localhost:${PORT}          ║
║                                       ║
║   Routes disponibles:                 ║
║   - GET  /health                      ║
║   - POST /register                    ║
║   - POST /test-direct                 ║
║   - GET  /test-notification/:userId   ║
║   - GET  /debug-user/:userId          ║
║   - GET  /debug-users                 ║
║   - POST /send-alert                  ║
║   - POST /broadcast                   ║
║   - POST /weather-data                ║
║   - GET  /simulate/:condition         ║
╚═══════════════════════════════════════╝
  `);
  
  console.log('\n🌦️ Système d\'alertes météo activé');
  console.log('   - Vérification automatique toutes les 5 minutes');
  console.log('   - Routes de simulation disponibles:');
  console.log('     GET /simulate/hot    (température > 35°C)');
  console.log('     GET /simulate/cold   (température < 0°C)');
  console.log('     GET /simulate/rain   (pluie > 20mm/h)');
  console.log('     GET /simulate/wind   (vent > 50km/h)');
  console.log('     GET /simulate/normal (conditions normales)');
  
  // Afficher l'IP locale pour les tests mobiles
  const os = require('os');
  const interfaces = os.networkInterfaces();
  console.log('\n📱 Pour tester depuis un mobile, utilisez :');
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(interface => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`   http://${interface.address}:${PORT}`);
      }
    });
  });
  
  // Vérification initiale après 5 secondes
  setTimeout(checkWeatherAlerts, 5000);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});