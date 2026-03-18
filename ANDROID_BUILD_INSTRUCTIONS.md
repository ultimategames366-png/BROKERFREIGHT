# 🚚 Freight Broker Management App

## How to Install on Your Phone (PWA)

### Method 1: Install as Progressive Web App (PWA)

1. **Open the app** in your phone's browser (Chrome recommended)
2. **Tap the menu** (three dots in top right)
3. **Tap "Add to Home screen"** or "Install app"
4. **Name it** "Freight Broker" and tap Add
5. **Done!** The app will appear on your home screen like a native app

### Benefits of PWA:
- ✅ Works offline
- ✅ Fast loading
- ✅ No app store needed
- ✅ Auto-updates
- ✅ Works on Android AND iPhone

---

## How to Build Native Android APK

To build a native Android APK, you need to set up a development environment. Here are the steps:

### Prerequisites

1. **Install Android Studio** from: https://developer.android.com/studio
2. **Install Node.js** from: https://nodejs.org
3. **Install Java JDK 17** (comes with Android Studio)

### Option A: Using Capacitor (Recommended - Easiest)

Capacitor converts web apps to native Android apps.

#### Step 1: Initialize Capacitor

```bash
# In your project directory
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Freight Broker" "com.freightbroker.app"
```

#### Step 2: Add Android Platform

```bash
npx cap add android
```

#### Step 3: Build and Sync

```bash
# Build your Next.js app
npm run build

# Sync to Android
npx cap sync android
```

#### Step 4: Open in Android Studio

```bash
npx cap open android
```

#### Step 5: Build APK in Android Studio

1. In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for build to complete
3. Click **locate** to find your APK file
4. Transfer APK to your phone and install

### Option B: Using React Native (Full Native Rewrite)

For a completely native experience, you'd rewrite the app in React Native:

```bash
# Create React Native project
npx react-native init FreightBroker --template typescript

# Navigate to project
cd FreightBroker

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons

# For Android
npm install react-native-document-picker
npm install react-native-image-picker
npm install react-native-contacts
npm install react-native-call-log

# Run on Android
npx react-native run-android
```

### Option C: Using Expo (Easier React Native)

```bash
# Create Expo project
npx create-expo-app FreightBroker

# Navigate to project
cd FreightBroker

# Install Expo packages
npx expo install expo-contacts expo-image-picker
npx expo install @react-navigation/native @react-navigation/bottom-tabs

# Build APK
npx expo build:android
```

---

## Quick Start: Build APK with Expo (Recommended for Beginners)

### Step-by-Step:

1. **Install Expo CLI:**
```bash
npm install -g expo-cli
```

2. **Create new project:**
```bash
npx create-expo-app FreightBroker --template blank-typescript
cd FreightBroker
```

3. **Install required packages:**
```bash
npx expo install expo-sqlite expo-contacts expo-image-picker
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler react-native-reanimated
```

4. **Configure app.json:**
```json
{
  "expo": {
    "name": "Freight Broker",
    "slug": "freight-broker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0B0B0B"
    },
    "android": {
      "package": "com.freightbroker.app",
      "versionCode": 1,
      "permissions": [
        "android.permission.CALL_PHONE",
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

5. **Build APK:**
```bash
# For local build (requires Android Studio)
npx expo run:android

# For cloud build (requires Expo account)
npx expo build:android -t apk

# Or using EAS (newer method)
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

6. **Download APK:**
   - After build completes, download the APK from Expo dashboard
   - Transfer to your phone and install

---

## Building with TWA (Trusted Web Activity)

The simplest way to convert your web app to an Android APK:

### Using Bubblewrap

```bash
# Install Bubblewrap
npm install -g @anthropic/anthropic-vertexai @anthropic/sdk-types

# Initialize TWA
npx @anthropic-vertexai/init

# Build APK
npx @anthropic-vertexai/build
```

### Or use PWA Builder

1. Go to https://www.pwabuilder.com/
2. Enter your deployed app URL
3. Click "Generate APK"
4. Download and install

---

## Important Permissions for Android

Add these to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />

<queries>
    <package android:name="com.whatsapp" />
    <package android:name="com.phonepe.app" />
    <package android:name="com.google.android.apps.nbu.paisa.user" />
</queries>
```

---

## Deploying Your Web App

Before building APK, deploy your web app:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Your own server
```bash
npm run build
# Upload .next folder to your server
```

---

## Testing on Your Phone

### Using ADB (Android Debug Bridge)

1. Enable Developer Options on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   
2. Enable USB Debugging:
   - Go to Settings > Developer Options
   - Enable USB Debugging

3. Connect phone to computer

4. Run your app:
```bash
# For React Native
npx react-native run-android

# For Expo
npx expo start --android

# For Capacitor
npx cap run android
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Install PWA | Chrome Menu > Add to Home Screen |
| Build Expo APK | `eas build --platform android` |
| Build React Native APK | `cd android && ./gradlew assembleRelease` |
| Run on Device | `npx react-native run-android` |
| Open Android Studio | `npx cap open android` |

---

## Need Help?

- **Android Development**: https://developer.android.com
- **Expo Documentation**: https://docs.expo.dev
- **Capacitor Documentation**: https://capacitorjs.com/docs
- **React Native**: https://reactnative.dev

---

## Your App is Ready! 🎉

The web app is already running and you can:

1. **Use it now** - Open in your phone browser and install as PWA
2. **Build native APK** - Follow the steps above
3. **Deploy to production** - Use Vercel or Netlify

The PWA method is the fastest - just open the app on your phone and add it to your home screen!
