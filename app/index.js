import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Image, Linking, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from "react-native-safe-area-context";

const BYPASS_PERMISSIONS = false; 

export default function WelcomeScreen() {
  const router = useRouter();
  const [locStatus, setLocStatus] = useState(null);
  const [camStatus, setCamStatus] = useState(null);

  // THEME COLORS
  const accentAmber = "#D97706";

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status: lStatus } = await Location.getForegroundPermissionsAsync();
    const { status: cStatus } = await Camera.getCameraPermissionsAsync();
    setLocStatus(lStatus);
    setCamStatus(cStatus);
  };

  const handleStart = async () => {
    const finishOnboarding = async () => {
      await AsyncStorage.setItem("firstTime", "false"); 
      router.push("/(auth)/login"); 
    };

    if (BYPASS_PERMISSIONS) {
      await finishOnboarding();
      return;
    }

    const { status: lRequest } = await Location.requestForegroundPermissionsAsync();
    const { status: cRequest } = await Camera.requestCameraPermissionsAsync();
    
    if (lRequest === 'granted' && cRequest === 'granted') {
      await finishOnboarding();
    } else {
      Alert.alert(
        "Security Permissions",
        "Camera and Location access are required to verify identity and geofencing.",
        [{ text: "Open Settings", onPress: () => Linking.openSettings() }, { text: "Cancel" }]
      );
    }
  };

  const realGranted = locStatus === 'granted' && camStatus === 'granted';

  return (
    <LinearGradient colors={["#FFFFFF", "#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-8 justify-between py-12">
        
        {/* Visual Header */}
        <Animatable.View animation="fadeInDown" duration={1000} className="items-center mt-4">
          <View className="bg-white p-6 rounded-[48px] shadow-2xl shadow-stone-300 border border-stone-100">
            <Image
              source={require("../assets/images/qr-code-scanning-concept (1).png")}
              className="w-64 h-64"
              resizeMode="contain"
            />
          </View>
        </Animatable.View>

        {/* Content */}
        <View>
          <Text className="text-5xl font-black text-stone-900 mb-2 tracking-tighter">
            Smart{"\n"}
            <Text style={{ color: accentAmber }}>Attendance</Text>
          </Text>
          <View style={{ backgroundColor: accentAmber }} className="w-16 h-2 rounded-full mb-8 shadow-sm" />
          
          <Text className="text-xl text-stone-600 leading-8 font-medium">
            Secure, location-based verification for the modern classroom environment.
          </Text>
          
          <View className="flex-row items-center mt-6 space-x-4">
             <View className="flex-row items-center bg-stone-200/50 px-3 py-1.5 rounded-full">
                <Feather name="map-pin" size={12} color="#78716C" />
                <Text className="text-[10px] font-black text-stone-500 uppercase ml-2 tracking-widest">GPS Locked</Text>
             </View>
             <View className="flex-row items-center bg-stone-200/50 px-3 py-1.5 rounded-full">
                <Feather name="camera" size={12} color="#78716C" />
                <Text className="text-[10px] font-black text-stone-500 uppercase ml-2 tracking-widest">QR Ready</Text>
             </View>
          </View>
        </View>

        {/* Footer Action */}
        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.9}
            className="w-full py-6 rounded-[24px] flex-row items-center justify-center shadow-2xl shadow-stone-400 bg-stone-900"
          >
            <Text className="text-white text-sm font-black uppercase tracking-[4px] mr-3">
              {realGranted ? "Initialize" : "Authorize Portal"}
            </Text>
            <View className="bg-white/10 p-1.5 rounded-full">
                <Feather name="shield" size={18} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-6">
            v1.0.4 • Triple-Lock Secured
          </Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}