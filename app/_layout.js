// app/_layout.js
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator } from "react-native";
import "../global.css"; // Tailwind must load before router

// Keep splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {

      // -------------------------------
      // MANUAL RESET (for development)
      // -------------------------------
      // Uncomment the line below to force the Welcome screen to show again
      await AsyncStorage.removeItem("firstTime");
      // -------------------------------

      try {
        const firstTime = await AsyncStorage.getItem("firstTime");

        if (firstTime === null) {
          await AsyncStorage.setItem("firstTime", "false");
          setInitialRoute("index"); // go to Welcome screen
        } else {
          setInitialRoute("login"); // go directly to Login
        }
      } catch (err) {
        console.error("Error checking AsyncStorage:", err);
        setInitialRoute("login");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    checkFirstLaunch();
  }, []);

  // Still loading? keep splash
  if (!initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f5a623" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      />
    </>
  );
}
