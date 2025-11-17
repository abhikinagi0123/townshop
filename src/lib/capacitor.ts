import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativePlatform = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initializeApp() {
  if (isNativePlatform) {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#00C6A7' });
    
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }
}
