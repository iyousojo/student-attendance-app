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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
  // Inside RootLayout useEffect
const checkNavigationState = async () => {
  try {
    const firstTime = await AsyncStorage.getItem("firstTime");
    const userData = await AsyncStorage.getItem("userData");

    // This log will tell you exactly what the phone thinks
    console.log("🔍 MEMORY SCAN:", { firstTime, userData: !!userData });

    // Ensure we treat 'false' as a string correctly
    if (firstTime === "false") {
       console.log("✅ Old User detected. Bypassing Welcome.");
       setInitialRoute(userData ? "(tabs)" : "(auth)/login");
    } else {
       console.log("🆕 New User detected. Showing Welcome.");
       setInitialRoute("index");
    }
  } catch (err) {
    setInitialRoute("index");
  } finally {
    setIsReady(true);
  }
};

    checkNavigationState();
  }, []);

  // Wait until route is determined AND layout is ready before hiding splash
  useEffect(() => {
    if (isReady && initialRoute) {
      SplashScreen.hideAsync();
    }
  }, [isReady, initialRoute]);

  if (!isReady || !initialRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F2F0]">
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack 
        initialRouteName={initialRoute} 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade' // Smoother transition for production
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}