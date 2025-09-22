import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymtracker.app',
  appName: 'Gym Tracker',
  webDir: 'out',
  server: {
    url: 'https://delchan-nav-tracker.vercel.app',
    cleartext: true
  }
};

export default config;
