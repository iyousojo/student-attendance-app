import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// 🛠️ THE MASTER SWITCH
const DEV_MODE = false; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkNavigationState = async () => {
      try {
        // 1. Dev Bypass
        if (DEV_MODE) {
          setInitialRoute("index");
          return;
        }

        // 2. Production Memory Logic
        const firstTime = await AsyncStorage.getItem("firstTime");
        const userData = await AsyncStorage.getItem("userData");

        // We check specifically for the string "false" set by the Welcome screen
        if (firstTime !== "false") {
          setInitialRoute("index"); // Show Welcome Screen
        } else if (userData) {
          setInitialRoute("(tabs)"); // User is logged in
        } else {
          setInitialRoute("(auth)/login"); // User is on-boarded but not logged in
        }
      } catch (err) {
        setInitialRoute("index");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    checkNavigationState();
  }, []);

  if (!initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F2F0]">
        <ActivityIndicator size="large" color="#D97706" />
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