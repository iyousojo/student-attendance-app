import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Application from 'expo-application';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  const accentAmber = "#D97706";

  // Initialize Hardware Identity on mount
  useEffect(() => {
    (async () => {
      const id = Platform.OS === 'android' 
        ? Application.androidId 
        : await Application.getIosIdForVendorAsync();
      setDeviceId(id);
    })();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Authentication Required", "Please provide authorized credentials.");
      return;
    }

    if (!deviceId) {
      Alert.alert("Terminal Error", "Could not verify hardware integrity. Restart the app.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://studentattendanceapi-v4hq.onrender.com/api/auth/login",
        {
          email: email.toLowerCase().trim(),
          password: password, 
          deviceId: deviceId, 
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Clear previous session state
        await AsyncStorage.multiRemove(["userToken", "userData"]);
        
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Connection to secure portal failed.";

      // OBFUSCATED BINDING ERROR
      if (status === 403 && (msg.toLowerCase().includes("bound") || msg.toLowerCase().includes("mismatch"))) {
        Alert.alert(
          "Security Violation",
          "This identity is locked to a different physical terminal. Authorized hardware only.",
          [
            { text: "Dismiss", style: "cancel" },
            { 
              text: "Request Access", 
              onPress: () => Alert.alert(
                "Manual Override", 
                "To re-bind this terminal, append the administrative reset prefix to your access key."
              ) 
            }
          ]
        );
      } else {
        Alert.alert("Access Denied", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, paddingHorizontal: 32, justifyContent: "center" }}
        >
          {/* Brand Header */}
          <View className="mb-10 items-center">
            <View className="bg-white p-6 rounded-[32px] mb-6 shadow-xl shadow-stone-200 border border-stone-100">
              <Feather name="shield" size={48} color={accentAmber} />
            </View>
            <Text className="text-4xl font-black text-stone-900 text-center tracking-tight">
              Portal Access
            </Text>
            <Text className="text-stone-500 text-center mt-2 font-medium tracking-wide">
              Secure Attendance Protocol v1.2
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                Authorized Email
              </Text>
              <View className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm shadow-stone-100">
                <TextInput
                  placeholder="name@university.edu"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="text-stone-900 font-bold"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                Access Key
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-stone-200 shadow-sm shadow-stone-100">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#A8A29E"
                  secureTextEntry={!showPassword}
                  className="flex-1 p-4 text-stone-900 font-bold"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4">
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#78716C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            className={`rounded-2xl py-5 mt-10 shadow-2xl shadow-stone-400 flex-row justify-center items-center ${
              loading ? "bg-stone-300" : "bg-stone-900"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-sm font-black uppercase tracking-[3px] mr-2">Initialize</Text>
                <Feather name="chevron-right" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Footer Info */}
          <View className="mt-12 items-center">
            <View className="bg-amber-50 border border-amber-100 p-4 rounded-2xl w-full mb-6">
               <Text className="text-amber-800 text-[11px] font-bold text-center uppercase tracking-wider mb-1">
                 Management Notice
               </Text>
               <Text className="text-amber-700 text-xs text-center leading-relaxed">
                 Terminal binding is active. Contact IT for <Text className="font-black">Hardware Re-sync</Text> if you have changed devices.
               </Text>
            </View>

            <View className="flex-row justify-center">
              <Text className="text-stone-400 font-medium">New terminal? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={{ color: accentAmber }} className="font-bold">Register Hardware</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}