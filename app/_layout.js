import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// 🛠️ THE MASTER SWITCH
// true  = Always show Welcome (Design Mode)
// false = Follow memory (Production Mode)
const DEV_MODE = true; // Set to true to always show the welcome screen for design/testing purposes  

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkNavigationState = async () => {
      try {
        // 1. If we are designing, bypass everything and go to index
        if (DEV_MODE) {
          console.log("🛠️ [LAYOUT]: DEV_MODE is ON. Forcing index.");
          setInitialRoute("index");
          return;
        }

        // 2. Otherwise, check memory (controlled by index.js)
        const firstTime = await AsyncStorage.getItem("firstTime");
        const userData = await AsyncStorage.getItem("userData");

        console.log("📂 [LAYOUT]: Memory Check -> firstTime:", firstTime);

        if (firstTime === null || firstTime === undefined) {
          setInitialRoute("index");
        } else if (userData) {
          setInitialRoute("(tabs)");
        } else {
          setInitialRoute("(auth)/login");
        }
      } catch (err) {
        setInitialRoute("index");
      } finally {
        // Short delay to ensure the UI is ready
        await SplashScreen.hideAsync();
      }
    };

    checkNavigationState();
  }, []);

  if (!initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f5a623" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}