import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

/**
 * Returns true if running inside a native mobile wrapper (iOS or Android).
 */
export const isNative = (): boolean => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

/**
 * Returns the current platform name: 'ios', 'android', or 'web'.
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Resolves an API path.
 * On web: returns relative '/api/...'
 * On native mobile: points to configured NEXT_PUBLIC_API_URL or local dev bridge if relative.
 */
export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const base = process.env.NEXT_PUBLIC_API_URL || '';
  if (isNative() && base) {
    const cleanBase = base.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
  }

  return endpoint;
};

/**
 * Initialize native mobile app shell (Status bar, splash screen, listeners).
 */
export const initNativeApp = async (): Promise<void> => {
  try {
    await SplashScreen.hide();
  } catch (err) {
    // Ignore if not native
  }

  if (!isNative()) return;

  try {
    // Configure dark status bar matching brand color (#0b0f19)
    await StatusBar.setStyle({ style: Style.Dark });
    if (getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0b0f19' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn('[Native] StatusBar init error:', err);
  }
};

/**
 * Register Android hardware back button handler.
 * Returns an unregister function.
 */
export const registerBackButtonHandler = (
  onBack: () => boolean | void
): (() => void) => {
  if (!isNative()) return () => {};

  try {
    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      try {
        const handled = onBack();
        if (!handled) {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        }
      } catch (e) {
        console.warn('[Native] backButton handler error:', e);
      }
    });

    return () => {
      try {
        listenerPromise.then((handle) => handle.remove()).catch(() => {});
      } catch {}
    };
  } catch (err) {
    console.warn('[Native] registerBackButtonHandler failed:', err);
    return () => {};
  }
};

/**
 * Trigger native haptic feedback with safe web vibration fallback.
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> => {
  try {
    if (isNative()) {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(type === 'heavy' || type === 'error' ? 40 : 15);
    }
  } catch {
    // Haptics not supported or permission denied
  }
};

/**
 * Get device GPS coordinates with Capacitor native API and browser fallback.
 */
export const getCurrentPosition = async (): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
}> => {
  if (isNative()) {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
    } catch (err) {
      console.warn('[Native Geolocation] Native fetch failed, falling back to browser:', err);
    }
  }

  // Browser / web fallback
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your device'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

/**
 * Capture photo via native device camera or select from photo library.
 * Returns a base64 Data URL string ready for preview and upload.
 */
export const takePhoto = async (
  source: 'camera' | 'photos' = 'camera'
): Promise<string> => {
  if (isNative()) {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
      });
      if (image.dataUrl) {
        return image.dataUrl;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('cancelled')) {
        throw new Error('User cancelled photo selection');
      }
      console.warn('[Native Camera] Native capture failed, attempting file picker fallback:', err);
    }
  }

  // Web input file fallback
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document not defined'));
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') {
      input.capture = 'environment';
    }
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read photo'));
      reader.readAsDataURL(file);
    };
    input.click();
  });
};
