import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// 🛠️ DEV_MODE must be false for production memory to work
const DEV_MODE = false; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkNavigationState = async () => {
      try {
        if (DEV_MODE) {
          setInitialRoute("index");
          return;
        }

        // Fetch user state from persistent memory
        const [firstTime, userData] = await Promise.all([
          AsyncStorage.getItem("firstTime"),
          AsyncStorage.getItem("userData")
        ]);

        console.log("🛠️ [SYSTEM]: Checking Onboarding Status:", firstTime);

        // LOGIC: If firstTime is explicitly "false", they are an "Old User"
        if (firstTime === "false") {
          if (userData) {
            setInitialRoute("(tabs)"); // Go straight to Dashboard
          } else {
            setInitialRoute("(auth)/login"); // Go straight to Login
          }
        } else {
          // If firstTime is null or anything else, show Welcome
          setInitialRoute("index");
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
        {/* We keep index in the stack, but the initialRoute logic above bypasses it */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}