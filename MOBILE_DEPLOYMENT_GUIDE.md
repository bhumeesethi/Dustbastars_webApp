# DustBustars Mobile Application: Android & iOS Deployment Guide

DustBustars has been converted into a production-grade native mobile application for **iOS** and **Android** using **Capacitor**, fully preserving the React 19 / Next.js web application, Google Maps integrations, cleaner workflow checklists, Stripe payments, and live tracking without breaking the web app.

---

## 1. Project Architecture Overview

```
DustBustars_App/
├── android/                         # Complete Native Android Studio Project
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml   # Camera, GPS Location, Network permissions
│   │   ├── src/main/res/drawable/         # Splash screens & branding
│   │   └── build.gradle                   # Target SDK 34+, release build configs
│   └── build.gradle
├── ios/                             # Complete Native Apple Xcode Project
│   ├── App/
│   │   ├── App/Info.plist                 # iOS Privacy usage strings (Camera, Photos, GPS)
│   │   ├── App/Assets.xcassets/           # AppIcon & Splash image sets
│   │   └── App.xcodeproj & xcworkspace    # Xcode workspace for building .ipa
├── src/
│   ├── components/
│   │   ├── MobileBottomNav.tsx            # Thumb-friendly mobile tab navigation bar
│   │   ├── MobileDrawerMenu.tsx           # Responsive slide-out navigation sheet
│   │   └── ...
│   └── lib/mobile/
│       └── native.ts                      # Capacitor GPS, Camera, Haptics & hardware back button
├── capacitor.config.ts              # Mobile configuration (App ID: com.dustbustars.app)
└── package.json                     # Native scripts (mobile:sync, mobile:android, mobile:ios)
```

---

## 2. Quick Start: Running on Emulators & Physical Devices

### Pre-requisites
- **For Android**: [Android Studio](https://developer.android.com/studio) (includes Android SDK, ADB, and Android Virtual Device emulator).
- **For iOS**: macOS with [Xcode](https://developer.apple.com/xcode/) installed and CocoaPods (`sudo gem install cocoapods`).

### A. Run on Android Emulator or Physical Device

1. **Open the project in Android Studio**:
   ```bash
   npm run mobile:android
   ```
   *Alternatively: Open the `android/` directory directly in Android Studio.*

2. **Sync Gradle**:
   Android Studio will prompt you to sync Gradle. Allow dependencies to download.

3. **Start an Emulator or Plug in a Physical Android Phone**:
   - **Emulator**: Tools > Device Manager > Create / Start an Android Virtual Device (e.g., Pixel 8 with Android 14/15).
   - **Physical Phone**: Enable **Developer Options** and **USB Debugging** on your phone, then connect via USB.

4. **Click the Run ▶ Button**:
   Select your device from the dropdown and click Run. The app will install and open immediately.

---

### B. Run on iOS Simulator or Physical iPhone (macOS)

1. **Open the project in Xcode**:
   ```bash
   npm run mobile:ios
   ```
   *Alternatively: Open `ios/App/App.xcworkspace` in Xcode.*

2. **Select Target & Simulator**:
   Select **App** target and choose any iPhone simulator (e.g., iPhone 15 Pro / iPhone 16).

3. **Click Run ▶ (Cmd + R)**:
   Xcode will compile the app and launch it inside the iOS Simulator with complete safe-area and notch support.

---

## 3. Development Live-Reload Workflow

During active development, you can test your changes live on your mobile device without rebuilding native binaries every time:

1. Find your computer's local Wi-Fi IP address (e.g. `192.168.1.50`).
2. In `capacitor.config.ts`, temporarily update `server.url`:
   ```typescript
   server: {
     url: 'http://192.168.1.50:3000', // Or http://10.0.2.2:3000 for standard Android emulator
     cleartext: true,
   }
   ```
3. Run `npm run dev` in your terminal.
4. Run `npm run mobile:sync` to push config to Android/iOS.
5. Any change you save in Next.js will instantly hot-reload directly on your phone or emulator!

---

## 4. Google Play Store Release Guide

### Step 1: Set App Version and Version Code
In `android/app/build.gradle`:
```groovy
defaultConfig {
    applicationId "com.dustbustars.app"
    minSdkVersion 23
    targetSdkVersion 34
    versionCode 1          // Increment for each update (1, 2, 3...)
    versionName "1.0.0"    // User-facing version string
}
```

### Step 2: Generate a Release Keystore
Generate a cryptographically signed key for your app:
```bash
keytool -genkey -v -keystore dustbustars-release.keystore -alias dustbustars -keyalg RSA -keysize 2048 -validity 10000
```
Store this keystore file securely in a backup location.

### Step 3: Build the Android App Bundle (`.aab`)
In Android Studio:
1. Go to **Build** > **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** (`.aab`).
3. Select your `dustbustars-release.keystore` file, enter your password and alias.
4. Select build variant: **release**.
5. Click **Finish**.
6. Your `.aab` file will be generated in `android/app/release/app-release.aab`.

### Step 4: Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Create your application with name **DustBustars**.
3. Complete the **Store Listing**:
   - Short description & full description.
   - High-res icon (512x512 PNG).
   - Feature graphic (1024x500 PNG).
   - Phone and tablet screenshots.
4. Complete the **Content Rating** and **App Content** declarations:
   - Privacy Policy URL.
   - Target audience (18+ for marketplace).
   - Permissions disclosure: Camera (cleaner photos), Location (local cleaner proximity).
5. Create a release under **Testing** > **Internal Testing** or **Production** and upload `app-release.aab`.

---

## 5. Apple App Store Release Guide

### Step 1: Enroll in Apple Developer Program
Ensure you have an active [Apple Developer Account](https://developer.apple.com).

### Step 2: Configure Signing & Capabilities in Xcode
1. Open `ios/App/App.xcworkspace` in Xcode.
2. In the project navigator, click **App**.
3. Under **Signing & Capabilities**:
   - Check **Automatically manage signing**.
   - Select your **Team** from the dropdown.
   - Bundle Identifier is `com.dustbustars.app`.

### Step 3: Verify Privacy Permissions in `Info.plist`
The required keys are already configured in `ios/App/App/Info.plist`:
- `NSCameraUsageDescription`: Cleaner before/after inspection photos and ID verification.
- `NSLocationWhenInUseUsageDescription`: Proximity search for DBS-checked local cleaners.
- `NSPhotoLibraryUsageDescription`: Property and job completion photo uploads.

### Step 4: Archive and Upload to App Store Connect
1. In Xcode, set the destination device to **Any iOS Device (arm64)**.
2. Select **Product** > **Archive**.
3. Once the archive builds, the **Organizer** window will open.
4. Click **Distribute App** > **App Store Connect** > **Upload**.
5. Xcode will sign your binary and transmit it directly to TestFlight and App Store Connect.

### Step 5: Submit for App Store Review
1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Go to **My Apps** > **DustBustars**.
3. Fill out App Information, Pricing, Category (**Lifestyle / Utilities**), and Screenshots for 6.7" and 6.5" iPhones.
4. Select the build uploaded via Xcode.
5. Provide demo login credentials for App Review:
   - Email: `james.homeowner@gmail.com`
   - Password: `password123`
6. Click **Submit for Review**.

---

## 6. Maintenance & Ongoing Synchronization

Whenever you modify any React components, CSS, or assets:
```bash
# 1. Synchronize changes to native platforms
npm run mobile:sync

# 2. Test in Android Studio or Xcode
npm run mobile:android
npm run mobile:ios
```

Both the web application (`npm run dev`, `npm run build`) and mobile applications operate seamlessly from this unified codebase.
