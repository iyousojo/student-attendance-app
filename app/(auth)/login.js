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
  ScrollView,
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

  useEffect(() => {
    const fetchId = async () => {
      const id = Platform.OS === 'android' ? Application.androidId : await Application.getIosIdForVendorAsync();
      setDeviceId(`MOB-${id.toUpperCase()}`);
    };
    fetchId();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Access Denied", "Authorized credentials required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://studentattendanceapi-v4hq.onrender.com/api/auth/login", {
        email: email.toLowerCase().trim(),
        password,
        deviceId, 
      });

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.multiSet([
          ["userToken", token],
          ["userData", JSON.stringify(user)]
        ]);
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Portal connection failure.";
      Alert.alert("Security Violation", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#F5F2F0", "#E7E5E4"]} style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
            
            {/* Faculty Terminal Branding */}
            <View className="mb-10 items-center">
              <View className="bg-white p-6 rounded-[32px] mb-6 shadow-xl border border-stone-100">
                <Feather name="shield" size={48} color={accentAmber} />
              </View>
              <Text className="text-4xl font-black text-stone-900 text-center tracking-tighter uppercase italic leading-none">
                Faculty<Text className="text-amber-600 font-black"> Terminal</Text>
              </Text>
              <Text className="text-stone-400 text-center mt-2 font-black text-[10px] uppercase tracking-[2px]">
                Authorized Personnel Only
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Academic Email</Text>
                <View className="bg-white rounded-2xl p-4 border border-stone-200">
                  <TextInput
                    placeholder="name@university.edu"
                    placeholderTextColor="#A8A29E"
                    autoCapitalize="none"
                    className="text-stone-900 font-bold"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View>
                <Text className="text-stone-400 font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">Security Cipher</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-stone-200">
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

            <TouchableOpacity onPress={handleLogin} disabled={loading} className={`rounded-2xl py-5 mt-10 shadow-2xl flex-row justify-center items-center ${loading ? "bg-stone-300" : "bg-stone-900"}`}>
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white text-xs font-black uppercase tracking-[3px] mr-2">Initialize Node</Text>
                  <Feather name="chevron-right" size={18} color="white" />
                </>
              )}
            </TouchableOpacity>

            {/* Terminal Status Footer */}
            <View className="mt-12 p-5 bg-stone-900 rounded-[24px]">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="terminal" size={12} color={accentAmber} />
                <Text className="text-amber-500 font-black text-[9px] uppercase tracking-widest">Protocol v1.2.4 Active</Text>
              </View>
              <Text className="text-stone-500 text-[9px] font-bold leading-relaxed uppercase">
                Terminal ID: <Text className="text-stone-300">{deviceId || "Syncing..."}</Text>
              </Text>
            </View>

            <View className="flex-row justify-center mt-8 mb-10">
              <Text className="text-stone-400 font-medium">New Hardware? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={{ color: accentAmber }} className="font-bold">Register Identity</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}