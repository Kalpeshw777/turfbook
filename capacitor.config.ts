import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.turfbook.app',
  appName: 'TurfBook',
  webDir: 'public',
  server: {
    cleartext: true,
    ...(process.env.CAPACITOR_SERVER_URL ? { url: process.env.CAPACITOR_SERVER_URL } : {}),
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
