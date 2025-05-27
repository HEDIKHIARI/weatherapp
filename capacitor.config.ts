import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherstationapp.app',
  appName: 'weather-station-app',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
     Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
