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
      resize: 'body'as any , // ou 'ionic' ou 'none'
      resizeOnFullScreen: true,
    },
    
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
      LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    
    // NOUVEAUX PLUGINS POUR MOBILE
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F4B942',
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#F4B942',
    },
  },
  
  // NOUVELLES CONFIGURATIONS ANDROID
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;