const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

/**
 * Récupère les dernières données de votre station météo
 * @return {Promise<Object>} Données de la station
 */
async function getStationData() {
  const snapshot = await admin.database()
    .ref("stationData/latest")
    .once("value")

  if (!snapshot.exists()) {
    throw new Error("Aucune donnée de station disponible")
  }

  return snapshot.val()
}

/**
 * Calcule le numéro de semaine ISO
 * @param {Date} date Date à calculer
 * @return {number} Numéro de semaine
 */
function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

/**
 * Fonction principale pour la sauvegarde quotidienne
 */
async function performDailyBackup() {
  const stationData = await getStationData()

  // Formatage des données pour l'historique
  const weatherRecord = {
    date: new Date().toISOString().split("T")[0],
    metrics: {
      temperature: stationData.temperature,
      humidity: stationData.humidity,
      ...(stationData.pressure && { pressure: stationData.pressure }),
      ...(stationData.windSpeed && { windSpeed: stationData.windSpeed })
    },
    timestamp: admin.database.ServerValue.TIMESTAMP,
    source: "station_locale"
  }

  // Construction du chemin d'archivage
  const now = new Date()
  const archivePath = `historicalData/${
    now.getFullYear()}/${
    String(now.getMonth() + 1).padStart(2, "0")}/${
    `week${getWeekNumber(now)}`}/${
    weatherRecord.date}`

  // Sauvegarde dans la base de données
  await admin.database()
    .ref(archivePath)
    .set(weatherRecord)

  return { success: true, path: archivePath }
}

// Version pour Cloud Scheduler
exports.dailyWeatherBackup = functions.pubsub
  .schedule("every day 23:50")
  .timeZone("Europe/Paris")
  .onRun(async (_context) => { // Note: _context préfixé par _ pour indiquer qu'il est inutilisé
    try {
      const result = await performDailyBackup()
      functions.logger.log("Backup réussi:", result)
      return null
    } catch (error) {
      functions.logger.error("Erreur de backup:", error)
      throw new Error(`Échec du backup: ${error.message}`)
    }
  })

// Version HTTP pour déclenchement manuel
exports.manualWeatherBackup = functions.https.onRequest(async (req, res) => {
  try {
    const result = await performDailyBackup()
    res.status(200).json(result)
  } catch (error) {
    functions.logger.error("Erreur manuelle:", error)
    res.status(500).json({
      error: error.message
    })
  }
})

// ===================== NOUVELLES FONCTIONS POUR LES NOTIFICATIONS PUSH =====================

/**
 * Fonction helper pour obtenir le titre d'alerte
 */
function getAlertTitle(type) {
  const titles = {
    'HIGH_TEMPERATURE': '🌡️ Température élevée',
    'LOW_TEMPERATURE': '❄️ Température basse',
    'HIGH_WIND': '💨 Vents forts',
    'HEAVY_RAIN': '🌧️ Fortes pluies',
    'HIGH_HUMIDITY': '💧 Humidité élevée',
    'LOW_HUMIDITY': '🏜️ Humidité faible',
    'HIGH_PRESSURE': '📈 Pression élevée',
    'LOW_PRESSURE': '📉 Pression basse',
    'STORM_WARNING': '⚡ Alerte tempête',
    'FROST_ALERT': '🌨️ Alerte gel'
  }
  return titles[type] || '⚠️ Alerte météo'
}

/**
 * Fonction pour vérifier les seuils et envoyer des alertes
 */
exports.checkWeatherThresholds = functions.database
  .ref('/stationData')
  .onUpdate(async (change, context) => {
    const before = change.before.val()
    const after = change.after.val()
    
    // Seuils d'alerte
    const thresholds = {
      temperature: { high: 35, low: 0 },
      humidity: { high: 85, low: 20 },
      pressure: { high: 1018, low: 1008 },
      windSpeed: 30, // km/h
      precipitation: 50, // mm
      precipitationRate: 10 // mm/h
    }
    
    const alerts = []
    
    // Vérification température
    if (after.température && after.température >= thresholds.temperature.high) {
      alerts.push({
        type: 'HIGH_TEMPERATURE',
        severity: 'high',
        message: `Température élevée : ${after.température}°C`
      })
    } else if (after.température && after.température <= thresholds.temperature.low) {
      alerts.push({
        type: 'FROST_ALERT',
        severity: 'medium',
        message: `Risque de gel : ${after.température}°C`
      })
    }
    
    // Vérification humidité
    if (after.humidité && after.humidité >= thresholds.humidity.high) {
      alerts.push({
        type: 'HIGH_HUMIDITY',
        severity: 'medium',
        message: `Humidité élevée : ${after.humidité}%`
      })
    } else if (after.humidité && after.humidité <= thresholds.humidity.low) {
      alerts.push({
        type: 'LOW_HUMIDITY',
        severity: 'medium',
        message: `Humidité faible : ${after.humidité}%`
      })
    }
    
    // Vérification pression
    if (after.pressure && after.pressure >= thresholds.pressure.high) {
      alerts.push({
        type: 'HIGH_PRESSURE',
        severity: 'low',
        message: `Pression élevée : ${after.pressure} hPa`
      })
    } else if (after.pressure && after.pressure <= thresholds.pressure.low) {
      alerts.push({
        type: 'LOW_PRESSURE',
        severity: 'medium',
        message: `Pression basse : ${after.pressure} hPa`
      })
    }
    
    // Vérification vent
    if (after.wind && after.wind >= thresholds.windSpeed) {
      const severity = after.wind > 50 ? 'extreme' : 'high'
      alerts.push({
        type: after.wind > 50 ? 'STORM_WARNING' : 'HIGH_WIND',
        severity: severity,
        message: `Vents forts : ${after.wind} km/h`
      })
    }
    
    // Vérification pluie
    if (after.pluie_mm && after.pluie_mm >= thresholds.precipitation) {
      alerts.push({
        type: 'HEAVY_RAIN',
        severity: 'high',
        message: `Fortes précipitations : ${after.pluie_mm} mm`
      })
    }
    
    // Vérification taux de précipitation
    if (after.rainfall_rate && after.rainfall_rate >= thresholds.precipitationRate) {
      alerts.push({
        type: 'HEAVY_RAIN',
        severity: 'extreme',
        message: `Pluie intense : ${after.rainfall_rate} mm/h`
      })
    }
    
    // Envoyer les alertes si nécessaire
    if (alerts.length > 0) {
      try {
        // Récupérer tous les utilisateurs avec un token FCM
        const usersSnapshot = await admin.firestore()
          .collection('users')
          .where('fcmToken', '!=', null)
          .get()
        
        // Préparer les messages pour chaque utilisateur
        const messages = []
        usersSnapshot.forEach(doc => {
          const userData = doc.data()
          if (userData.fcmToken) {
            alerts.forEach(alert => {
              messages.push({
                notification: {
                  title: getAlertTitle(alert.type),
                  body: alert.message
                },
                data: {
                  type: alert.type,
                  severity: alert.severity,
                  timestamp: new Date().toISOString()
                },
                token: userData.fcmToken,
                android: {
                  priority: 'high',
                  notification: {
                    channelId: 'weather_alerts',
                    priority: 'high',
                    defaultSound: true,
                    defaultVibrateTimings: true
                  }
                },
                apns: {
                  payload: {
                    aps: {
                      alert: {
                        title: getAlertTitle(alert.type),
                        body: alert.message
                      },
                      sound: 'default',
                      badge: 1
                    }
                  }
                }
              })
            })
          }
        })
        
        // Envoyer toutes les notifications
        if (messages.length > 0) {
          const responses = await Promise.all(
            messages.map(message => admin.messaging().send(message))
          )
          functions.logger.log(`${responses.length} alertes envoyées avec succès`)
          
          // Sauvegarder dans l'historique des alertes
          const batch = admin.firestore().batch()
          alerts.forEach(alert => {
            const alertRef = admin.firestore().collection('alertHistory').doc()
            batch.set(alertRef, {
              ...alert,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              sentAt: new Date().toISOString(),
              recipientCount: usersSnapshot.size
            })
          })
          await batch.commit()
        }
        
      } catch (error) {
        functions.logger.error('Erreur envoi alertes:', error)
      }
    }
  })

/**
 * Fonction HTTP pour envoyer une alerte manuelle
 */
exports.sendManualAlert = functions.https.onRequest(async (req, res) => {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }
  
  const { type, severity, message } = req.body
  
  if (!type || !severity || !message) {
    return res.status(400).json({ 
      error: 'Paramètres manquants',
      required: ['type', 'severity', 'message']
    })
  }
  
  try {
    // Récupérer tous les utilisateurs
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('fcmToken', '!=', null)
      .get()
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'Aucun utilisateur avec token FCM' })
    }
    
    // Préparer les tokens
    const tokens = []
    usersSnapshot.forEach(doc => {
      const userData = doc.data()
      if (userData.fcmToken) {
        tokens.push(userData.fcmToken)
      }
    })
    
    // Créer le message multicast
    const multicastMessage = {
      notification: {
        title: getAlertTitle(type),
        body: message
      },
      data: {
        type,
        severity,
        timestamp: new Date().toISOString(),
        manual: 'true'
      },
      tokens: tokens,
      android: {
        priority: 'high',
        notification: {
          channelId: 'weather_alerts'
        }
      }
    }
    
    // Envoyer les notifications
    const response = await admin.messaging().sendMulticast(multicastMessage)
    
    // Sauvegarder dans l'historique
    await admin.firestore().collection('alertHistory').add({
      type,
      severity,
      message,
      manual: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      successCount: response.successCount,
      failureCount: response.failureCount
    })
    
    res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalRecipients: tokens.length
    })
    
  } catch (error) {
    functions.logger.error('Erreur envoi alerte manuelle:', error)
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    })
  }
})

/**
 * Cloud Function appelée lors de l'enregistrement d'un token FCM
 */
exports.onTokenRegistered = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const newData = change.after.data()
    const previousData = change.before.data()
    
    // Vérifier si un nouveau token a été ajouté
    if (newData.fcmToken && newData.fcmToken !== previousData.fcmToken) {
      functions.logger.log('Nouveau token FCM enregistré pour:', context.params.userId)
      
      // Optionnel : envoyer une notification de bienvenue
      return admin.messaging().send({
        notification: {
          title: '👋 Bienvenue !',
          body: 'Les notifications météo sont maintenant activées.'
        },
        token: newData.fcmToken
      })
    }
    
    return null
  })