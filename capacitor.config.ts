import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherstationapp.app',
  appName: 'weather-station-app',
  webDir: 'www',
   plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};
 
export default config;
