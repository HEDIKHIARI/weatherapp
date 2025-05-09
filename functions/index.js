const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mqtt = require("mqtt");

admin.initializeApp();
const db = admin.firestore();

exports.listenMQTT = functions.pubsub.schedule("every 1 minutes").onRun(async () => {
  const client = mqtt.connect("mqtt://broker.hivemq.com");

  return new Promise((resolve, reject) => {
    client.on("connect", () => {
      console.log("Connecté au broker MQTT");
      client.subscribe("meteo/esp32");
    });

    client.on("message", async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Message MQTT :", data);

        await db.collection("meteo").doc("realtime").set({
          temperature: data.temperature,
          humidite: data.humidite,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        client.end();
        resolve();
      } catch (error) {
        console.error("Erreur MQTT", error);
        client.end();
        reject(error);
      }
    });

    // Sécurité : timeout si rien reçu
    setTimeout(() => {
      client.end();
      reject("MQTT timeout");
    }, 10000);
  });
});
