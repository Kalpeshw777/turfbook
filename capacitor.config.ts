import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.turfbook.app',
  appName: 'TurfBook',
  webDir: 'public',
  server: {
    // When testing on Android device / emulator, points to the live dev or cloud server
    url: process.env.CAPACITOR_SERVER_URL || 'http://10.0.2.2:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
