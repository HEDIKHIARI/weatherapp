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
